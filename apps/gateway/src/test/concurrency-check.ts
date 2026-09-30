import assert from 'node:assert';
import { BudgetGatekeeper, InMemoryBudgetReservationStore } from '../middleware/gatekeeper';
import { hashApiKey, type CachedVirtualKey } from '../middleware/cache';

async function runConcurrencyCheck() {
  console.log('================================================================');
  console.log('[OstraOps Concurrency & Budget Enforcement Verification Suite]');
  console.log('================================================================\n');

  const reservationStore = new InMemoryBudgetReservationStore();
  const gatekeeper = new BudgetGatekeeper(reservationStore);

  // --------------------------------------------------------------------------
  // Test 1: 50 Simultaneous Parallel Requests on $0.20 Remaining Budget
  // --------------------------------------------------------------------------
  {
    console.log('-> Test 1: 50 Simultaneous Parallel Requests on Tight Budget Limit...');

    const rawKey = 'ost_live_concurrency_test_secret_key_123';
    const keyHash = hashApiKey(rawKey);

    const testKey: CachedVirtualKey = {
      id: 'vk_concurrency_01',
      organizationId: 'org_concurrency_01',
      projectId: 'proj_concurrency_01',
      environmentId: 'env_production',
      keyHash,
      keyPrefix: 'ost_live_concu',
      status: 'active',
      allowedModels: ['gpt-4o-mini', 'claude-3-5-sonnet'],
      rateLimitRpm: 1000,
      monthlyLimitUsd: 1.00,
      currentSpendUsd: 0.80, // Remaining: $0.20
      cachedAt: Date.now(),
    };

    // We simulate 50 incoming requests hitting gatekeeper concurrently
    // Each request payload is sized such that estimated cost is around $0.05
    // Or we test atomic reservation store directly for exact dollar limits:
    const costPerReq = 0.05;
    const totalRequests = 50;

    let acceptedCount = 0;
    let rejectedCount = 0;

    const promises = Array.from({ length: totalRequests }).map(async (_, idx) => {
      // Simulate real-world micro-jitter
      await new Promise((r) => setImmediate(r));
      const reserved = reservationStore.reserve(
        testKey.id,
        costPerReq,
        testKey.monthlyLimitUsd,
        testKey.currentSpendUsd
      );

      if (reserved) {
        acceptedCount++;
        return { id: idx, allowed: true, reservedAmount: costPerReq };
      } else {
        rejectedCount++;
        return { id: idx, allowed: false };
      }
    });

    const results = await Promise.all(promises);
    assert.strictEqual(results.length, totalRequests, 'All concurrent promises must resolve');

    console.log(`   Requests dispatched: ${totalRequests}`);
    console.log(`   Accepted: ${acceptedCount}`);
    console.log(`   Rejected (Budget Exceeded): ${rejectedCount}`);

    assert.strictEqual(
      acceptedCount,
      4,
      `Expected exactly 4 requests to be admitted ($0.20 budget / $0.05 cost), but got ${acceptedCount}`
    );
    assert.strictEqual(
      rejectedCount,
      46,
      `Expected exactly 46 requests to be blocked, but got ${rejectedCount}`
    );

    // Verify in-flight reservations accurately equal 4 * 0.05 = 0.20
    const activeReserved = reservationStore.getReserved(testKey.id);
    assert.strictEqual(
      Math.round(activeReserved * 100) / 100,
      0.20,
      'Total in-flight reservations must equal 0.20'
    );

    console.log('   ✔ Zero overspend under 50 simultaneous concurrent requests verified.');
  }

  // --------------------------------------------------------------------------
  // Test 2: In-Flight Reservation Release on Stream Abort / Request Failure
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Test 2: In-Flight Reservation Release upon Failure/Abort...');

    const rawKey = 'ost_live_abort_test_secret_key_456';
    const keyHash = hashApiKey(rawKey);

    const testKey: CachedVirtualKey = {
      id: 'vk_abort_01',
      organizationId: 'org_abort_01',
      projectId: 'proj_abort_01',
      environmentId: 'env_production',
      keyHash,
      keyPrefix: 'ost_live_abor',
      status: 'active',
      allowedModels: ['gpt-4o-mini'],
      rateLimitRpm: 1000,
      monthlyLimitUsd: 0.10,
      currentSpendUsd: 0.00, // Remaining: $0.10
      cachedAt: Date.now(),
    };

    // 1st request arrives: 3000 bytes for gpt-4o-mini
    const check1 = gatekeeper.checkBudget(testKey, 3000, 'gpt-4o-mini');
    assert.strictEqual(check1.allowed, true, 'First request should be allowed');
    const reservedAmt = check1.reservedAmountUsd || 0;
    assert(reservedAmt > 0, 'Must have reserved an estimated amount');

    // Key now has active in-flight lease
    assert.strictEqual(gatekeeper.getActiveReservation(testKey.id), reservedAmt);

    // 1st request fails/aborts -> release reservation
    gatekeeper.releaseReservation(testKey.id, reservedAmt);

    // After release, active reservation must return to 0
    assert.strictEqual(gatekeeper.getActiveReservation(testKey.id), 0);

    // Subsequent request now succeeds cleanly
    const check2 = gatekeeper.checkBudget(testKey, 3000, 'gpt-4o-mini');
    assert.strictEqual(check2.allowed, true, 'Request after reservation release must be permitted');

    gatekeeper.releaseReservation(testKey.id, check2.reservedAmountUsd || 0);
    console.log('   ✔ In-flight reservation safely released without budget leakage.');
  }

  // --------------------------------------------------------------------------
  // Test 3: Gatekeeper Direct Budget Exceeded (HTTP 402 / OSTRAOPS_BUDGET_EXCEEDED)
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Test 3: Gatekeeper Direct Budget Exceeded Response Format...');

    const testKey: CachedVirtualKey = {
      id: 'vk_exhausted_01',
      organizationId: 'org_ex_01',
      projectId: 'proj_ex_01',
      environmentId: 'env_production',
      keyHash: hashApiKey('key_ex_01'),
      keyPrefix: 'ost_live_exha',
      status: 'active',
      allowedModels: ['gpt-4o-mini'],
      rateLimitRpm: 1000,
      monthlyLimitUsd: 5.00,
      currentSpendUsd: 5.00, // Budget 100% used
      cachedAt: Date.now(),
    };

    const result = gatekeeper.checkBudget(testKey, 500, 'gpt-4o-mini');
    assert.strictEqual(result.allowed, false, 'Exhausted key must be blocked');
    assert.strictEqual(result.status, 402, 'HTTP Status must be 402 Payment Required');
    assert.strictEqual(
      result.errorPayload?.error?.code,
      'OSTRAOPS_BUDGET_EXCEEDED',
      'Error code must be OSTRAOPS_BUDGET_EXCEEDED'
    );
    console.log('   ✔ Proper 402 Payment Required returned when budget cap reached.');
  }

  // --------------------------------------------------------------------------
  // Test 4: Multi-Tenant Budget Isolation
  // --------------------------------------------------------------------------
  {
    console.log('\n-> Test 4: Multi-Tenant Budget Isolation...');

    const keyA: CachedVirtualKey = {
      id: 'vk_tenant_A',
      organizationId: 'org_tenant_A',
      projectId: 'proj_A',
      environmentId: 'env_prod',
      keyHash: hashApiKey('key_org_a'),
      keyPrefix: 'ost_live_org_a',
      status: 'active',
      allowedModels: ['gpt-4o-mini'],
      rateLimitRpm: 100,
      monthlyLimitUsd: 0.50,
      currentSpendUsd: 0.50, // Org A exhausted!
      cachedAt: Date.now(),
    };

    const keyB: CachedVirtualKey = {
      id: 'vk_tenant_B',
      organizationId: 'org_tenant_B',
      projectId: 'proj_B',
      environmentId: 'env_prod',
      keyHash: hashApiKey('key_org_b'),
      keyPrefix: 'ost_live_org_b',
      status: 'active',
      allowedModels: ['gpt-4o-mini'],
      rateLimitRpm: 100,
      monthlyLimitUsd: 10.00,
      currentSpendUsd: 0.00, // Org B fresh!
      cachedAt: Date.now(),
    };

    const checkA = gatekeeper.checkBudget(keyA, 100, 'gpt-4o-mini');
    const checkB = gatekeeper.checkBudget(keyB, 100, 'gpt-4o-mini');

    assert.strictEqual(checkA.allowed, false, 'Org A must be blocked (budget exhausted)');
    assert.strictEqual(checkB.allowed, true, 'Org B must be admitted (independent budget pool)');

    if (checkB.reservedAmountUsd) {
      gatekeeper.releaseReservation(keyB.id, checkB.reservedAmountUsd);
    }
    console.log('   ✔ Tenant budget isolation verified: exhaustion of Org A does not block Org B.');
  }

  console.log('\n================================================================');
  console.log(' All Concurrency & Budget Enforcement Checks PASSED cleanly! ✔');
  console.log('================================================================\n');
}

runConcurrencyCheck().catch((err) => {
  console.error('[Concurrency Check] FAILED:', err);
  process.exit(1);
});
