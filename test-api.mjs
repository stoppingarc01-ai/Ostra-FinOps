#!/usr/bin/env node

/**
 * OstraOps - Live API & Gateway Terminal Tester
 * Usage:
 *   node test-api.mjs <YOUR_GEMINI_KEY>
 * or:
 *   node test-api.mjs
 */

import readline from 'node:readline';

const args = process.argv.slice(2);
let apiKey = args[0] || process.env.GEMINI_API_KEY;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askKeyIfNeeded = async () => {
  if (apiKey && apiKey.trim()) return apiKey.trim();
  return new Promise((resolve) => {
    rl.question('\x1b[36mEnter your Google Gemini API key: \x1b[0m', (ans) => {
      resolve(ans.trim());
    });
  });
};

const run = async () => {
  console.log('\n\x1b[1m\x1b[33m⚡ OstraOps Live Terminal API Tester\x1b[0m');
  console.log('\x1b[90m--------------------------------------------------\x1b[0m');

  apiKey = await askKeyIfNeeded();

  if (!apiKey) {
    console.error('\x1b[31mError: No API key provided. Exiting.\x1b[0m');
    rl.close();
    process.exit(1);
  }

  const masked = apiKey.length > 8 ? `${apiKey.slice(0, 4)}••••${apiKey.slice(-4)}` : '••••';
  console.log(`\x1b[32m✔ Key Loaded:\x1b[0m \x1b[37m${masked}\x1b[0m`);

  // Prompt query
  const testPrompt = "Namaste! Confirm in 1 sentence that you are Gemini and live via OstraOps API.";
  console.log(`\x1b[34m→ Sending prompt:\x1b[0m "${testPrompt}"`);
  console.log('\x1b[90mConnecting to Google Generative Language API...\x1b[0m');

  const startTime = Date.now();

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: testPrompt }] }],
        generationConfig: { maxOutputTokens: 150, temperature: 0.7 }
      })
    });

    const latency = Date.now() - startTime;

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      console.log('\n\x1b[31m✖ Request Failed!\x1b[0m');
      console.log(`HTTP Status: \x1b[31m${res.status} ${res.statusText}\x1b[0m`);
      console.log('Error Details:', err?.error?.message || err || 'Unknown upstream error');
      rl.close();
      return;
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '(No text)';
    const usage = data?.usageMetadata;

    console.log('\n\x1b[32m✔ SUCCESS (HTTP 200 OK)\x1b[0m');
    console.log(`\x1b[36mLatency:\x1b[0m \x1b[1m${latency}ms\x1b[0m`);
    if (usage) {
      console.log(`\x1b[36mTokens:\x1b[0m ${usage.totalTokenCount} total (${usage.promptTokenCount} in, ${usage.candidatesTokenCount} out)`);
    }
    console.log('\n\x1b[33m--- Model Response ---\x1b[0m');
    console.log(`\x1b[37m${reply}\x1b[0m`);
    console.log('\x1b[33m----------------------\x1b[0m\n');
    console.log('\x1b[32m✔ Your API Key is 100% verified and operational!\x1b[0m\n');

  } catch (err) {
    console.error('\x1b[31mNetwork Error:\x1b[0m', err.message);
  } finally {
    rl.close();
  }
};

run();
