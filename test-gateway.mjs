/**
 * OstraOps Instant Gateway Tester
 * Run: node test-gateway.mjs
 */

const key = process.argv[2] || 'ost_live_4YJGkv_fa6d1eb5753c3410a48f0fff2c2521e2';
const prompt = process.argv[3] || 'Hello OstraOps, confirm in 1 sentence!';

console.log('\n⚡ Sending request to OstraOps Gateway (http://localhost:8080)...');
console.log(`🔑 Key: ${key.slice(0, 15)}...`);
console.log(`💬 Prompt: "${prompt}"\n`);

try {
  const t0 = Date.now();
  const res = await fetch('http://localhost:8080/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: 'gemini-3.8-flash',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const latency = Date.now() - t0;
  const data = await res.json();

  if (!res.ok) {
    console.error(`❌ Gateway Error (HTTP ${res.status}):`, data);
    process.exit(1);
  }

  const reply = data.choices?.[0]?.message?.content || '(No content)';
  const usage = data.usage || {};

  console.log('✅ SUCCESS (HTTP 200 OK)');
  console.log(`⚡ Latency: ${latency}ms`);
  console.log(`📊 Model: ${data.model}`);
  console.log(`🔢 Tokens: ${usage.total_tokens || 0} (${usage.prompt_tokens || 0} in, ${usage.completion_tokens || 0} out)`);
  console.log('\n🤖 AI Reply:');
  console.log(`"${reply.trim()}"`);
  console.log('\n👉 Check your browser at http://localhost:5173 - telemetry is updated!\n');
} catch (err) {
  console.error('❌ Connection error:', err.message);
}
