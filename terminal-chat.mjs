#!/usr/bin/env node

/**
 * ⚡ OstraOps Live Terminal Chatbot
 * Interactive AI Chat CLI with real-time streaming, latency tracking, 
 * token count, and spend metrics powered by OstraOps Gateway.
 *
 * Run: node terminal-chat.mjs
 */

import readline from 'node:readline';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Load .env.local if present
try {
  const envPath = resolve(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
} catch {}

const GATEWAY_URL = process.env.OSTRAOPS_GATEWAY_URL || 'http://localhost:8080/v1/chat/completions';
const VIRTUAL_KEY = process.env.OSTRAOPS_VIRTUAL_KEY || 'ost_live_4YJGkv_fa6d1eb5753c3410a48f0fff2c2521e2';
let CURRENT_MODEL = 'gemini-3.8-flash';

// ANSI Colors
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgDark: '\x1b[40m',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `\n${C.cyan}${C.bold}You ❯ ${C.reset}`,
});

const conversationHistory = [];
let totalSessionTokens = 0;
let totalSessionCost = 0;

function printBanner() {
  console.clear();
  console.log(`
${C.yellow}${C.bold}╔═════════════════════════════════════════════════════════════════╗
║                   ⚡ OSTRAOPS TERMINAL CHAT                     ║
║         Real-Time AI Spend Controller & Streaming Gateway       ║
╚═════════════════════════════════════════════════════════════════╝${C.reset}
  ${C.gray}• Gateway URL :${C.reset} ${C.white}${GATEWAY_URL}${C.reset}
  ${C.gray}• Virtual Key :${C.reset} ${C.green}${VIRTUAL_KEY.slice(0, 16)}...${C.reset}
  ${C.gray}• Active Model:${C.reset} ${C.cyan}${CURRENT_MODEL}${C.reset}
  ${C.gray}• Dashboard   :${C.reset} ${C.white}http://localhost:5173${C.reset}
  ${C.gray}• Commands    :${C.reset} ${C.yellow}/clear${C.reset} (reset chat), ${C.yellow}/model <name>${C.reset}, ${C.yellow}/exit${C.reset}
${C.gray}─────────────────────────────────────────────────────────────────${C.reset}
`);
}

async function streamChat(userMessage) {
  conversationHistory.push({ role: 'user', content: userMessage });

  process.stdout.write(`\n${C.magenta}${C.bold}OstraOps (${CURRENT_MODEL}) ❯ ${C.reset}`);

  const startTime = Date.now();
  let firstTokenTime = null;
  let accumulatedText = '';

  try {
    const res = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VIRTUAL_KEY}`,
      },
      body: JSON.stringify({
        model: CURRENT_MODEL,
        messages: conversationHistory,
        stream: true,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.log(`\n\n${C.red}✖ Gateway Error HTTP ${res.status}:${C.reset}`, err.error?.message || err);
      if (res.status === 429 || res.status === 402) {
        console.log(`${C.yellow}🛡️ OstraOps Budget Safeguard: Spending limit reached. Loop blocked!${C.reset}`);
      }
      return;
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || '';
      accumulatedText = content;
      process.stdout.write(content);
    } else {
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.replace(/^data:\s*/, '').trim();
          if (dataStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(dataStr);
            const chunk = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.text || '';
            if (chunk) {
              if (!firstTokenTime) firstTokenTime = Date.now();
              accumulatedText += chunk;
              process.stdout.write(chunk);
            }
          } catch {}
        }
      }

      if (!accumulatedText && buffer.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(buffer.trim());
          const content = parsed.choices?.[0]?.message?.content || '';
          if (content) {
            accumulatedText = content;
            process.stdout.write(content);
          }
        } catch {}
      }
    }

    const totalTimeMs = Date.now() - startTime;
    const ttftMs = firstTokenTime ? firstTokenTime - startTime : totalTimeMs;

    // Approximate token counting & sub-cent pricing
    const promptTokens = Math.ceil(userMessage.length / 3.8) + 10;
    const completionTokens = Math.ceil(accumulatedText.length / 3.8);
    const totalTokens = promptTokens + completionTokens;
    const requestCost = Number(((promptTokens * 0.075 + completionTokens * 0.30) / 1_000_000).toFixed(6));

    totalSessionTokens += totalTokens;
    totalSessionCost += requestCost;

    conversationHistory.push({ role: 'assistant', content: accumulatedText });

    // Print Telemetry Summary Box
    console.log(`\n\n${C.gray}┌─── ⚡ OstraOps Live Telemetry ───────────────────────────────┐${C.reset}`);
    console.log(`${C.gray}│${C.reset} Latency    : ${C.green}${totalTimeMs}ms${C.reset} ${C.gray}(TTFT: ${ttftMs}ms)${C.reset}`);
    console.log(`${C.gray}│${C.reset} Tokens     : ${C.cyan}${totalTokens}${C.reset} ${C.gray}(Prompt: ${promptTokens} | Output: ${completionTokens})${C.reset}`);
    console.log(`${C.gray}│${C.reset} Spend ($)  : ${C.yellow}$${requestCost.toFixed(6)}${C.reset} ${C.gray}(Session Total: $${totalSessionCost.toFixed(6)})${C.reset}`);
    console.log(`${C.gray}│${C.reset} Gateway    : ${C.green}HTTP 200 OK${C.reset} ${C.gray}[Hard Limit Protection Active]${C.reset}`);
    console.log(`${C.gray}└─────────────────────────────────────────────────────────────┘${C.reset}`);

  } catch (err) {
    console.log(`\n\n${C.red}✖ Network Connection Error:${C.reset}`, err.message);
    console.log(`${C.yellow}Make sure OstraOps Gateway is running on ${GATEWAY_URL}!${C.reset}`);
  }
}

async function start() {
  printBanner();
  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();

    if (!input) {
      rl.prompt();
      return;
    }

    if (input === '/exit' || input === 'exit' || input === 'quit') {
      console.log(`\n${C.green}Session ended. Total Tokens: ${totalSessionTokens} | Total Spend: $${totalSessionCost.toFixed(6)}${C.reset}\n`);
      rl.close();
      process.exit(0);
    }

    if (input === '/clear') {
      conversationHistory.length = 0;
      printBanner();
      console.log(`${C.green}✔ Conversation memory cleared.${C.reset}`);
      rl.prompt();
      return;
    }

    if (input.startsWith('/model')) {
      const parts = input.split(' ');
      if (parts[1]) {
        CURRENT_MODEL = parts[1].trim();
        console.log(`${C.green}✔ Switched model to: ${C.bold}${CURRENT_MODEL}${C.reset}`);
      } else {
        console.log(`${C.yellow}Usage: /model <model-name> (e.g. /model gemini-1.5-flash or /model gpt-4o)${C.reset}`);
      }
      rl.prompt();
      return;
    }

    rl.pause();
    await streamChat(input);
    rl.resume();
    rl.prompt();
  });

  rl.on('close', () => {
    process.exit(0);
  });
}

start();
