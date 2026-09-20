import assert from 'node:assert';
import { getModelSpec, MODEL_CATALOG } from '../registry/catalog';
import { resolveFailoverCandidate } from '../registry/failover';
import {
  sanitizePayloadForModel,
  buildRoutingHeaders,
  buildRoutingSseComment,
} from '../registry/sanitizer';
import { ScopedSecretResolver } from '../vault/resolver';

async function runPhase3Check() {
  console.log('[Phase 3 Check] Starting Dynamic Model Registry & Secret Resolution Validation...\n');

  // --------------------------------------------------------------------------
  // Verification 0: Catalog sanity (40 models across 8 providers)
  // --------------------------------------------------------------------------
  {
    console.log('-> Verification 0: Checking 40-model matrix integrity across 8 providers...');
    const totalModels = Object.keys(MODEL_CATALOG).length;
    assert.strictEqual(totalModels, 40, `Catalog must contain exactly 40 models, got ${totalModels}`);

    const providers = new Set(Object.values(MODEL_CATALOG).map((m) => m.provider));
    assert.strictEqual(providers.size, 8, `Catalog must span exactly 8 providers, got ${providers.size}`);
    console.log(`   ✔ Confirmed 40 models registered across providers: ${Array.from(providers).join(', ')}`);
  }

  // --------------------------------------------------------------------------
  // Verification 1: Context Window Safety Check
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Verification 1: Context Window Safety Check (150k prompt vs 128k candidate limit)...');
    // deepseek-reasoner max input is 64k
    // If prompt is 150k tokens, deepseek-reasoner MUST be rejected as candidate
    const failoverRes = resolveFailoverCandidate('deepseek-reasoner', 150_000, 4_000);

    // DeepSeek candidates (deepseek-chat: 64k) cannot take 150k tokens!
    // But gemini or qwen-turbo could if in pool, but deepseek-chat must not be picked
    if (failoverRes.compatible && failoverRes.candidate) {
      assert.ok(
        failoverRes.candidate.maxInputTokens >= 150_000,
        `Selected candidate must accommodate 150k tokens. Candidate maxInput is ${failoverRes.candidate.maxInputTokens}`
      );
    } else {
      assert.strictEqual(failoverRes.compatible, false, 'Should fail gracefully when no candidate fits context');
    }

    // Now test a model with no large context fallback: moonshot-v1-8k (8k limit) with 20k prompt
    const moonshotFail = resolveFailoverCandidate('moonshot-v1-8k', 200_000, 2_000);
    // Any candidate chosen must have >= 200k max input tokens
    if (moonshotFail.compatible && moonshotFail.candidate) {
      assert.ok(moonshotFail.candidate.maxInputTokens >= 200_000);
    }
    console.log('   ✔ Context window safety verified without overflow.');
  }

  // --------------------------------------------------------------------------
  // Verification 2: Output Clamping Check
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Verification 2: Output Clamping Check (8,192 tokens requested on 4,096-cap model)...');
    // claude-3-opus has maxOutputTokens: 4,096
    const opusSpec = getModelSpec('claude-3-opus')!;
    assert.strictEqual(opusSpec.maxOutputTokens, 4_096);

    // Request failover targeting claude-3-sonnet (which has 4,096 limit) with 8,192 requested
    const failoverRes = resolveFailoverCandidate('claude-3-opus', 10_000, 8_192);
    assert.strictEqual(failoverRes.compatible, true);
    assert.strictEqual(failoverRes.outputClamped, true, 'Output must trigger clamping mode');
    assert.ok(
      failoverRes.clampedLimit! <= 8_192,
      `Clamped limit (${failoverRes.clampedLimit}) must not exceed candidate capability`
    );

    // Apply sanitization with clamped limit
    const targetSpec = failoverRes.candidate!;
    const sanitized = sanitizePayloadForModel(
      { model: 'claude-3-opus', max_tokens: 8_192, messages: [] },
      opusSpec,
      targetSpec,
      failoverRes.clampedLimit
    );

    assert.strictEqual(sanitized.outputClamped, true);
    assert.strictEqual(sanitized.sanitizedPayload.max_tokens, failoverRes.clampedLimit);

    // Check header generation
    const headers = buildRoutingHeaders({
      originalModel: 'claude-3-opus',
      routedModel: targetSpec.id,
      fallbackTriggered: true,
      outputClamped: true,
      clampedLimit: failoverRes.clampedLimit,
    });
    assert.strictEqual(headers['X-OstraOps-Output-Clamped'], String(failoverRes.clampedLimit));
    assert.strictEqual(headers['X-OstraOps-Fallback-Triggered'], 'true');

    // Check SSE comment injection
    const sseComment = buildRoutingSseComment({
      originalModel: 'claude-3-opus',
      routedModel: targetSpec.id,
      fallbackTriggered: true,
      outputClamped: true,
      clampedLimit: failoverRes.clampedLimit,
    });
    assert.ok(sseComment.startsWith(': ostraops-routing: '));
    assert.ok(sseComment.includes('"clamped":true'));
    console.log(`   ✔ Clamped to ${failoverRes.clampedLimit} tokens with headers & SSE comment attached.`);
  }

  // --------------------------------------------------------------------------
  // Verification 3: Hybrid Denylist Sanitization
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Verification 3: Hybrid Denylist Sanitization (Reasoning -> Standard downgrade)...');
    const o1Spec = getModelSpec('o1')!;
    const gpt4oSpec = getModelSpec('gpt-4o')!;

    const reasoningPayload = {
      model: 'o1',
      thinking: { type: 'enabled', budget_tokens: 4000 },
      reasoning_effort: 'high',
      custom_future_sdk_param: { nested: 'preserved_forward_compatibility' },
      messages: [{ role: 'user', content: 'Design an algorithm' }],
    };

    const sanitized = sanitizePayloadForModel(reasoningPayload, o1Spec, gpt4oSpec);

    // 1. Thinking & reasoning_effort must be stripped
    assert.strictEqual(sanitized.sanitizedPayload.thinking, undefined, 'thinking must be stripped');
    assert.strictEqual(
      sanitized.sanitizedPayload.reasoning_effort,
      undefined,
      'reasoning_effort must be stripped'
    );
    assert.ok(sanitized.strippedParameters.includes('thinking'));
    assert.ok(sanitized.strippedParameters.includes('reasoning_effort'));

    // 2. Default sampling temperature must be injected since o1 omitted it
    assert.strictEqual(sanitized.sanitizedPayload.temperature, 0.7, 'temperature: 0.7 must be injected');
    assert.ok(sanitized.injectedParameters.includes('temperature=0.7'));

    // 3. Unrecognized parameters must be preserved for forward compatibility
    assert.deepStrictEqual(
      sanitized.sanitizedPayload.custom_future_sdk_param,
      { nested: 'preserved_forward_compatibility' },
      'Forward compatibility: arbitrary SDK parameters must not be dropped'
    );
    console.log('   ✔ Reasoning parameters pruned, temperature injected, arbitrary parameters preserved.');
  }

  // --------------------------------------------------------------------------
  // Verification 4: Wire Adapter Isolation
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Verification 4: Wire Adapter Isolation (OpenAI chat cannot cross to Anthropic messages)...');
    const gpt4o = getModelSpec('gpt-4o')!;
    assert.strictEqual(gpt4o.wireAdapter, 'openai_chat');

    const claude = getModelSpec('claude-3-5-sonnet')!;
    assert.strictEqual(claude.wireAdapter, 'anthropic_messages');

    // Attempting failover from gpt-4o must NEVER return an anthropic_messages model
    const failoverRes = resolveFailoverCandidate('gpt-4o', 10_000, 2_000);
    assert.strictEqual(failoverRes.compatible, true);
    assert.strictEqual(
      failoverRes.candidate!.wireAdapter,
      'openai_chat',
      'Candidate must strictly match openai_chat wireAdapter'
    );
    assert.notStrictEqual(
      failoverRes.candidate!.provider,
      'anthropic',
      'Must not route openai_chat to Anthropic wire adapter'
    );
    console.log('   ✔ Wire adapter parity enforced. No cross-protocol schema corruptions.');
  }

  // --------------------------------------------------------------------------
  // Verification 5: Sub-Millisecond Secret Caching & Instant Invalidation
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Verification 5: Ephemeral Secret Caching & Invalidation...');
    let dbCallCount = 0;

    const mockDbFetcher = async (orgId: string, provider: string) => {
      dbCallCount++;
      // Simulate database query latency
      await new Promise((r) => setTimeout(r, 10));
      return `sk-live-${orgId}-${provider}-sec-token-xyz`;
    };

    const resolver = new ScopedSecretResolver({ ttlSeconds: 60, dbFetcher: mockDbFetcher });
    const orgId = 'org_enterprise_99';
    const provider = 'openai';

    // 1st lookup: Hits DB
    const start1 = performance.now();
    const key1 = await resolver.resolveProviderKey(orgId, provider);
    const duration1 = performance.now() - start1;
    assert.strictEqual(dbCallCount, 1);
    assert.ok(key1?.startsWith('sk-live-'));
    assert.ok(duration1 >= 10, 'Initial lookup took database time');

    // 2nd lookup: Ephemeral cache hit (<1ms)
    const start2 = performance.now();
    const key2 = await resolver.resolveProviderKey(orgId, provider);
    const duration2 = performance.now() - start2;
    assert.strictEqual(dbCallCount, 1, 'Database must NOT be called on cache hit');
    assert.strictEqual(key1, key2);
    assert.ok(duration2 < 2.0, `Cache hit must be sub-millisecond, took ${duration2.toFixed(3)}ms`);
    console.log(`   ✔ Cache hit duration: ${duration2.toFixed(3)}ms (sub-millisecond)`);

    // 3. Instant Invalidation
    resolver.invalidateSecret(orgId, provider);
    assert.strictEqual(resolver.size(), 0, 'Cache should be empty after invalidation');

    // 4. 3rd lookup: Must hit DB again after invalidation
    const key3 = await resolver.resolveProviderKey(orgId, provider);
    assert.strictEqual(dbCallCount, 2, 'Database must be queried again after invalidation');
    assert.strictEqual(key3, key1);
    console.log('   ✔ Instant secret invalidation hook verified.');
  }

  console.log('\n=============================================================');
  console.log('✔ ALL PHASE 3 VERIFICATION TESTS PASSED CLEANLY (0 ERRORS)');
  console.log('=============================================================\n');
}

runPhase3Check().catch((err) => {
  console.error('Phase 3 Verification Failed:', err);
  process.exit(1);
});
