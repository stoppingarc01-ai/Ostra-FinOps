# OstraOps ⚡

> **Real-Time AI Spend Tracking, Intelligent Gateway & Budget Guardrails**  
> Protect your API balance from runaway agents, loop bugs, and surprise bills — with **Zero Prompt Retention**.

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Supabase: Postgres + Auth](https://img.shields.io/badge/Database-Supabase%20Postgres-3ECF8E?logo=supabase)](https://supabase.com)
[![Gateway Status](https://img.shields.io/badge/Gateway-Port%208080-blue.svg)](apps/gateway)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org)

---

## 📖 Table of Contents
- [What is OstraOps in Simple Words?](#-what-is-ostraops-in-simple-words)
- [How We Work & Core Principles](#-how-we-work--core-principles)
- [Architecture Overview](#-architecture-overview)
- [Authentication & Access Control](#-authentication--access-control)
- [Data Storage & Privacy](#-data-storage--privacy)
- [Subscription Plans & Pricing](#-subscription-plans--pricing)
- [Developer Integration](#-developer-integration)
- [Contributing (For Open-Source Contributors)](#-contributing-for-open-source-contributors)
- [Supported Model Families](#-supported-model-families)
- [License](#-license)

---

## 💡 What is OstraOps in Simple Words?

When you build with AI models like GPT-4o, Claude 3.7, or DeepSeek, API costs can spiral out of control within minutes:
- An autonomous coding agent gets stuck in a recursive error loop.
- A batch pipeline processes 10x more tokens than anticipated.
- Your official provider dashboard takes **hours or days** to update your bill.

**OstraOps is your real-time circuit breaker and observability hub.** It sits between your code and the AI providers, measuring every single token and calculating costs instantly. If your daily or monthly limit is reached (e.g. $10/day), OstraOps safely blocks further requests before your credit card gets charged.

---

## 🛡️ How We Work & Core Principles

We built OstraOps on 4 foundational principles:

### 1. Budget Checks Happen *Before* You Spend
Most FinOps tools read logs after the money is already gone. OstraOps acts as a high-speed reverse proxy (`http://localhost:8080/v1` or cloud gateway). Before forwarding any request to OpenAI or Anthropic, it checks your remaining balance. If you are over budget, the request is cut off with an immediate `429 Budget Exceeded` response.

### 2. Zero Prompt Retention (Absolute Privacy)
We believe your code and business data belong strictly to you:
- **No Prompt Storage:** We inspect only token usage headers, model IDs, and HTTP metadata.
- **No Chat Logs:** Your prompt text, completion messages, files, and embeddings never touch a logging database.
- **No Model Training:** None of your data is ever retained or used for training.

### 3. Edge Caching & Cost Reduction
Identical or repetitive requests (e.g. unit tests, fixed prompt templates) are served directly from an ultra-low latency in-memory cache, saving both time (sub-5ms) and 100% of the token cost for that request.

### 4. Fail-Open Reliability
If monitoring ever experiences a temporary hiccup, your production traffic is never stranded — the proxy gracefully preserves uptime while continuing core routing.

---

## 📐 Architecture Overview

```mermaid
flowchart LR
    A["Your Code / Agent\n(Cursor, LangChain, AutoGen)"] -->|"OpenAI-compatible request"| B["OstraOps Gateway\n(:8080 / Edge Proxy)"]
    
    subgraph OstraOps Security & Control
        B --> C{"Active Budget Cap?"}
        C -- Exceeded --> D["429 Blocked\n(Hard Stop)"]
        C -- Within Limit --> E{"Prompt in Cache?"}
        E -- Cache Hit --> F["Return Cached (<5ms)\n$0.00 Cost"]
        E -- Cache Miss --> G["Forward to Upstream LLM"]
    end
    
    G --> H["Upstream AI Provider\n(OpenAI, Anthropic, Gemini, DeepSeek)"]
    H -->|"Stream tokens + usage"| B
    B -->|"Instant response"| A
    B -.->|"Store metrics only\n(Tokens, Model, Cost)"| I[("Supabase Postgres\n(Row Level Security)")]
```

---

## 🔐 Authentication & Access Control

We take security seriously with enterprise-grade identity management:

1. **User & Organization Authentication:**
   - Powered by **Supabase Auth** with cryptographic JWTs (JSON Web Tokens).
   - Secure password hashing (bcrypt/Argon2) and OAuth capabilities.
   - HttpOnly cookie handling and automatic refresh token rotation.
   - User sessions are verified on every API and dashboard route.

2. **Gateway API Key Verification:**
   - Your agents and applications connect using high-entropy OstraOps API keys (`ostra_live_...`).
   - Keys are hashed with SHA-256 before storage in Postgres, preventing credential leaks even in the event of an internal review.

---

## 🗄️ Data Storage & Privacy

All non-volatile platform data is backed by **Supabase PostgreSQL**:

| Data Type | Stored in Database? | Details |
| :--- | :---: | :--- |
| **User & Team Profiles** | ✅ Yes | Email, organization name, role (Admin/Member). |
| **Spend & Token Aggregates** | ✅ Yes | Input/output token counts, model name, calculated dollar cost, timestamp. |
| **Budget Rules & Alerts** | ✅ Yes | Daily/monthly caps, webhook URLs (Slack, Discord, Email). |
| **Prompts & Completions** | ❌ **NEVER** | Discarded immediately after streaming. Never written to disk or database. |
| **Embeddings & Files** | ❌ **NEVER** | Never stored or cached permanently. |

### Multi-Tenant Isolation (Row Level Security)
Every table in our PostgreSQL database enforces **Postgres Row Level Security (RLS)**. Even if an API query is crafted maliciously, the database engine guarantees that Tenant A cannot read or write Tenant B's data under any circumstances.

---

## 💳 Subscription Plans & Pricing

Transparent, developer-friendly pricing designed to scale from indie hackers to enterprise AI teams:

| Tier | Price | Ideal For | Key Features |
| :--- | :---: | :--- | :--- |
| **Community CLI** | **$0** / forever | Solo hackers & terminal users | • Open-source CLI (`npx ostraops`)<br>• Local terminal spend calculations<br>• Multi-model pricing cheatsheet |
| **Agent Telemetry** | **$20** / month<br>*(or $16/mo billed annually)* | Developers wanting observability only | • No proxy interception needed<br>• Real-time token velocity & health monitoring<br>• Model cost & latency benchmarking<br>• Webhook alerts (Slack, Discord, Email)<br>• Up to 3 active agent trackers |
| **Starter Gateway** | **$35** / month<br>*(or $28/mo billed annually)* | Production apps & startup teams | • Full **OstraOps Gateway** proxy<br>• Automated hard budget caps & kill-switch<br>• In-memory smart caching (up to 1,000 queries)<br>• Multi-provider routing (OpenAI, Anthropic, Gemini, DeepSeek)<br>• Up to 5 concurrent agent connections |
| **Pro Gateway** | **$59** / month<br>*(or $47/mo billed annually)* | Scaling teams & heavy autonomous agents | • **Everything in Starter** +<br>• **Unlimited** concurrent agents & workflows<br>• Semantic & persistent caching<br>• Multi-model automated failover & load balancing<br>• Team role permissions & audit logs<br>• Priority Discord/Slack engineering support |

### 👥 Extra Developer Seats
Need your whole team on the dashboard?
- **$5 per developer seat / month**
- Grants team members their own login, individual spend analytics, and scoped API keys without having to share master admin credentials.

---

## 🚀 Developer Integration

Connecting your application or AI agents to OstraOps takes under 60 seconds. You do not need to rewrite your application logic:

### 1. Instant Terminal Tracking (Community CLI)
Calculate spend and compare model pricing instantly:
```bash
npx ostraops
```

### 2. Route Through OstraOps Gateway
Point your existing OpenAI, LangChain, Vercel AI SDK, or Cursor configuration to your OstraOps gateway endpoint:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://gateway.ostraops.com/v1', // Or your assigned team gateway endpoint
  defaultHeaders: {
    'x-ostraops-key': process.env.OSTRAOPS_API_KEY, // Scoped team or agent token
  },
});

// Requests are automatically budget-checked and token-counted in real time
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Process customer query' }],
});
```

---

## 🤝 Contributing (For Open-Source Contributors)

We welcome community contributions, model rate card updates, and bug fixes! If you want to help make AI spend tracking faster, safer, and more accessible, here is how you can contribute:

### 🎯 What You Can Contribute
- **Model Rate Cards:** Add new foundation models, pricing updates, or context capacity updates in `models/`.
- **SDK Integrations:** Help write adapters or snippets for LangChain, LlamaIndex, AutoGen, CrewAI, and Vercel AI SDK.
- **Documentation:** Improve developer tutorials, API references, or translations.
- **Bug Fixes:** Fix UI rendering bugs, edge-case token calculation drifts, or gateway proxy headers.

### 🛠️ Contributor Workflow

1. **Fork the Repository:**  
   Click the **Fork** button at the top right of this repository to create your personal copy.

2. **Clone your fork locally:**
   ```bash
   git clone https://github.com/<your-username>/Ostra-FinOps.git
   cd Ostra-FinOps
   ```

3. **Create a Feature Branch:**
   ```bash
   git checkout -b fix/model-rate-card-deepseek-r1
   ```

4. **Install Dependencies & Test:**
   ```bash
   npm install
   npm run build # Ensure TypeScript and bundle pass cleanly
   ```

5. **Commit with Conventional Messages:**
   ```bash
   git commit -m "fix(models): update DeepSeek R1 output token pricing"
   ```

6. **Submit a Pull Request (PR):**
   - Push your branch to your GitHub fork: `git push origin <your-branch-name>`
   - Open a PR against `stoppingarc01-ai/Ostra-FinOps:main` with a clear description of your changes and before/after verification.

> [!NOTE]  
> **Notice for Commercial & Production Use:**  
> The core schemas, CLI, and integration adapters are open for community enhancement under MIT. The hosted multi-tenant management backend, enterprise telemetry cluster, and managed billing infrastructure are proprietary services of OstraOps. Self-hosting production enterprise features without an authorized enterprise license is strictly prohibited.

---

## 🌐 Supported Model Families

OstraOps maintains real-time rate cards for 40+ leading foundation models:

| Provider | Supported Models |
| :--- | :--- |
| **OpenAI** | GPT-4o, GPT-4o mini, o1, o3-mini, GPT-4 Turbo |
| **Anthropic** | Claude 3.7 Sonnet, Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus |
| **Google** | Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 1.5 Pro, Flash Lite |
| **DeepSeek** | DeepSeek R1, DeepSeek V3 |
| **Meta** | Llama 3.3 70B, Llama 3.1 405B, Llama 3.1 8B |
| **Mistral** | Mistral Large 2, Codestral 2501, Mistral Small 3 |
| **xAI** | Grok 2, Grok 2 Vision |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free, transparent, and built for developers building the next generation of AI applications.
