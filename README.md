# OstraOps 2.0

> An open AI cost governance gateway and real-time FinOps platform.

OstraOps sits between your applications and AI providers (such as OpenAI, Anthropic, Google Gemini, and Moonshot Kimi). It tracks token usage and dollar costs in real time and automatically stops requests before your budgets are exceeded.

---

## Table of Contents

1. [What is OstraOps?](#1-what-is-ostraops)
2. [What Problem Does It Solve?](#2-what-problem-does-it-solve)
3. [How It Works (Step-by-Step)](#3-how-it-works-step-by-step)
4. [Main Features](#4-main-features)
5. [Feature Status Matrix](#5-feature-status-matrix)
6. [Technology Stack](#6-technology-stack)
7. [How to Install and Run](#7-how-to-install-and-run)
8. [Environment Variables](#8-environment-variables)
9. [How to Run Tests](#9-how-to-run-tests)
10. [How Budgets and Spending Limits Work](#10-how-budgets-and-spending-limits-work)
11. [How User Data and API Keys Are Protected](#11-how-user-data-and-api-keys-are-protected)
12. [Known Limitations and Future Improvements](#12-known-limitations-and-future-improvements)

---

## Demo Video & Showcase

Experience OstraOps in action:

<div align="center">
  <img src="public/demo.gif" alt="OstraOps Demo" width="100%" />
</div>

### 🎬 Available Videos & How to Watch

| Video | Description | Format / Path | Direct Link / Local Access |
| :--- | :--- | :---: | :--- |
| **Full Platform Walkthrough** | Complete walkthrough of real-time token tracking, virtual key provisioning, hard budget limits, and failover routing. | MP4 (1080p, ~17MB) | [▶ Watch `public/demo.mp4`](public/demo.mp4) |
| **Cinematic Launch Showcase** | Fast-paced 22-second launch trailer highlighting the spend curve, copilot reroutes, and model protection matrix. | MP4 (1080p, ~700KB) | [▶ Watch `public/launch.mp4`](public/launch.mp4) |
| **Animated GIF Demo** | Lightweight looping demo for quick preview in README. | GIF (600px, ~2.8MB, 15s loop) | [`public/demo.gif`](public/demo.gif) |

#### How to Watch the Demo:
- **In Browser (Local Dev Server)**: With `npm run dev` running, open:
  - Walkthrough: [`http://localhost:5173/demo.mp4`](http://localhost:5173/demo.mp4)
  - Launch Video: [`http://localhost:5173/launch.mp4`](http://localhost:5173/launch.mp4)
- **In GitHub / Git Web**: Click [`public/demo.mp4`](public/demo.mp4) or [`public/launch.mp4`](public/launch.mp4) to play directly inside GitHub's native video player. The GIF [`public/demo.gif`](public/demo.gif) will render inline.
- **In Desktop Media Player**: Open the files directly with VLC, Windows Media Player, QuickTime, or drag & drop into Chrome/Edge.

---

## 1. What is OstraOps?

**OstraOps** is a reverse proxy (gateway) and dashboard for managing AI costs. 

When you build applications or autonomous agents with AI models, you typically send requests directly to companies like OpenAI or Anthropic. 

With OstraOps, you change one URL in your client code. Your requests go through the OstraOps gateway first. The gateway checks your spending limits, forwards the request to the AI provider, streams the answer back to your user, and updates your spending records immediately.

```
[Your App / Agent]
        │
        ▼ (OpenAI-compatible request)
[OstraOps Gateway] ─── (Pre-flight check: budget & rate limit)
        │
        ▼
[AI Provider: OpenAI / Anthropic / Gemini / Kimi]
        │
        ▼ (Streaming response)
[OstraOps Gateway] ─── (Count tokens, calculate cost, save audit log)
        │
        ▼
[Your User / Frontend]
```

---

## 2. What Problem Does It Solve?

1. **Unexpected Bills from Runaway Agents**: Autonomous AI agents can get stuck in infinite retry loops or send huge prompts hundreds of times. This can spend hundreds or thousands of dollars in minutes.
2. **Provider Dashboards Lag Behind**: Official billing dashboards (like OpenAI or Anthropic) often take **2 to 8 hours** to update your account balance. By the time you receive a warning email, your credit limit is already breached.
3. **Multi-Tenant Sharing**: If you have multiple developers, projects, or customers using the same API key, it is difficult to know who spent what. OstraOps lets you issue separate **Virtual Keys** with individual limits for each team or environment.

---

## 3. How It Works (Step-by-Step)

Here is what happens during a single request:

1. **Incoming Request**: Your application makes an API call using an OstraOps Virtual Key (`ost_live_...`).
2. **Key Authentication**: The gateway checks the key hash in its fast in-memory cache.
3. **Pre-Flight Budget Reservation**: 
   - The gateway estimates the upper-bound cost based on prompt length and model rate cards.
   - It places a temporary hold (reservation) on the key's budget.
   - If the key is out of budget, the request is immediately rejected with HTTP status `402 Payment Required` or `429 Budget Exceeded`. No request is sent upstream.
4. **Forwarding to AI Provider**: The request is dispatched to the chosen model provider.
5. **Streaming & Accounting**: As tokens stream back, the gateway reads token counts directly from the stream chunks.
6. **Settlement**: 
   - The exact cost is calculated down to fractions of a cent.
   - The actual cost is recorded.
   - The temporary hold from Step 3 is released.
7. **Audit Telemetry**: The log (latency, model, tokens, dollar cost) is added to a micro-batch queue and saved to PostgreSQL.

---

## 4. Main Features

- **Real-Time Cost Tracking**: See usage and cost the second a request completes instead of waiting hours for provider dashboards.
- **Hard Budget Limits**: Set monthly or project-level spend limits. When reached, further calls are blocked.
- **Virtual Keys**: Issue separate API keys with individual caps, allowed models, and rate limits without exposing your real upstream provider secrets.
- **Provider Failover**: If a provider returns a 429 (rate limited) or 503 (outage) before streaming starts, the gateway can automatically switch to a fallback model.
- **Prompt Caching**: Exact-match prompt caching avoids paying twice for identical queries.
- **Zero Prompt Retention**: OstraOps records token counts, model names, and dollar costs. It never saves prompt text or AI response text to permanent storage.
- **Interactive Dashboard**: A responsive web console for inspecting spending charts, managing keys, and tracking models.

---

## 5. Feature Status Matrix

| Feature | Status | Where It Lives in the Code |
| :--- | :---: | :--- |
| **Edge Reverse Gateway** | 🟢 **Implemented** | `apps/gateway/src/server.ts` |
| **Real-Time Token & Cost Engine** | 🟢 **Implemented** | `apps/gateway/src/accounting/cost.ts`, `extractor.ts` |
| **Atomic In-Flight Budget Reservations** | 🟢 **Implemented** | `apps/gateway/src/middleware/gatekeeper.ts` |
| **Concurrency & Overspend Protection** | 🟢 **Implemented** | Verified via `apps/gateway/src/test/concurrency-check.ts` |
| **Fail-Closed / Fail-Open Policy** | 🟢 **Implemented** | Server-enforced in `apps/gateway/src/server.ts` |
| **Multi-Tenant Postgres Schema & RLS** | 🟢 **Implemented** | `supabase/schema.sql` |
| **Virtual Key SHA-256 Hashing** | 🟢 **Implemented** | `apps/gateway/src/middleware/cache.ts` |
| **Zero Prompt Body Retention** | 🟢 **Implemented** | `apps/gateway/src/accounting/queue.ts` |
| **Model Registry (40+ Models across 8 Providers)** | 🟢 **Implemented** | `apps/gateway/src/registry/catalog.ts` |
| **Web Console & Code-Split Dashboard** | 🟢 **Implemented** | `src/App.tsx`, `src/pages/DashboardPage.tsx` |
| **Model Failover State Machine** | 🟡 **Beta** | `apps/gateway/src/streaming/pipeline.ts` |
| **Exact-Match Prompt Cache** | 🟡 **Beta** | `apps/gateway/src/cache/prompt-cache.ts` |
| **Distributed Multi-Region Redis Reservations** | 🔵 **Planned** | Roadmap item for multi-node deployments |
| **Semantic Vector Cache** | 🔵 **Planned** | Roadmap item for fuzzy prompt matching |

---

## 6. Technology Stack

- **Backend & Gateway**: Node.js, TypeScript, Native HTTP streaming, `@supabase/supabase-js`.
- **Frontend Console**: React 19, Vite, Tailwind CSS, Lucide Icons, Framer Motion.
- **Database**: PostgreSQL (via Supabase) with Row-Level Security (RLS) and monthly partitioned logs.
- **Authentication**: Firebase Authentication / Supabase Auth.
- **Quality & Linting**: TypeScript Compiler (`tsc`), Oxlint.

---

## 7. How to Install and Run

### Prerequisites

- **Node.js** version 18.0.0 or higher.
- **npm** version 9 or higher.

### Step 1: Clone the repository

```bash
git clone https://github.com/stoppingarc01-ai/Ostra-FinOps.git
cd "Ostra-FinOps"
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Configure your environment file

Copy the example configuration to `.env.local`:

```bash
cp .env.example .env.local
```

Open `.env.local` in your editor and enter your Supabase credentials (and Firebase credentials if using user login).

### Step 4: Run the project

You can run the web dashboard and the API gateway simultaneously:

**Terminal 1 — Run the Web Dashboard:**
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

**Terminal 2 — Run the Gateway Server:**
```bash
npm run gateway
```
The gateway will start on `http://127.0.0.1:8080`.

---

## 8. Environment Variables

All settings are configured through environment variables. Here are the core variables:

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `GATEWAY_PORT` | No | Port for the reverse gateway proxy (default: 8080) | `8080` |
| `GATEWAY_HOST` | No | Host address for gateway (default: 0.0.0.0) | `0.0.0.0` |
| `OSTRAOPS_FAIL_POLICY` | No | Gateway behavior if accounting ledger is down (`fail_closed` or `fail_open`) | `fail_closed` |
| `VITE_SUPABASE_URL` | Yes | URL of your Supabase project | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase public anonymous key for client requests | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Supabase secret key for server-side telemetry writing | `eyJhbGci...` |
| `VITE_FIREBASE_API_KEY` | Optional | Firebase API Key for web authentication | `AIzaSy...` |
| `VITE_FIREBASE_PROJECT_ID` | Optional | Firebase project ID | `ostraops` |

---

## 9. How to Run Tests

OstraOps provides multiple ways to test and verify every component of the system — from automated test suites to interactive live terminal calls and UI validation.

### 🧪 Overview of Testing Methods

| Testing Method | Command / Action | What It Tests |
| :--- | :--- | :--- |
| **1. Automated Suite** | `npm test` | Edge rate limiting, 40-model matrix, failover, token cost accounting, and 50-request concurrency safety |
| **2. Live Terminal Tester** | `node test-api.mjs <API_KEY>` | Live model request through proxy logic, exact token extraction, cost calculation, and dashboard telemetry sync |
| **3. Manual Gateway cURL** | `npm run gateway` + `curl` | Raw HTTP endpoint validation, streaming chunks, and budget cap enforcement |
| **4. Web Console & Playground** | `npm run dev` (`http://localhost:5173`) | UI key creation, budget sliders, live analytics, copilot suggestions, and sandbox playground |
| **5. Build & Lint Check** | `npm run lint` && `npm run build` | Oxlint rules validation and TypeScript compiler verification |

---

### Method 1: Run the Automated Test Suite

Run all automated verification suites with one command:

```bash
npm test
```

This single command executes 5 dedicated verification suites:
1. `self-check.ts`: Edge rate-limiting, concurrency slot tracking, and correlation IDs.
2. `phase3-check.ts`: 40-model registry matrix across 8 providers, context window overflow clamping, and ephemeral secret resolution.
3. `phase4-check.ts`: Failover state machine, 429/503 interceptors, streaming resiliency, and abort signal propagation.
4. `phase5-check.ts`: Post-stream token extraction, dynamic sub-cent cost engine, and telemetry queues.
5. `concurrency-check.ts`: 50 simultaneous parallel requests on a tight budget limit, in-flight reservation safety, and multi-tenant isolation.

---

### Method 2: Live Interactive Terminal Tester (`test-api.mjs`)

You can test real LLM execution, token extraction, and live cost calculation directly from your terminal:

```bash
# Provide key as argument:
node test-api.mjs YOUR_GEMINI_API_KEY

# Or run interactively (it will securely prompt you):
node test-api.mjs
```

**What this script does:**
1. Connects to the model provider with your masked API key.
2. Dispatches a live test prompt and measures latency to the millisecond.
3. Extracts total token usage (`promptTokenCount` and `candidatesTokenCount`).
4. Computes exact sub-cent cost based on active rate cards.
5. **Syncs live telemetry to `public/live-telemetry.json`**, so the request immediately appears on your local Web Dashboard Overview!

---

### Method 3: Manual Testing with the Gateway Proxy

Start the gateway in your terminal:

```bash
npm run gateway
```
*(Runs on `http://127.0.0.1:8080`)*

#### A. Health Check
```bash
curl http://127.0.0.1:8080/health
```
*Expected response: `{"status":"healthy","uptime":...}`*

#### B. Test a Chat Completion
```bash
curl -X POST http://127.0.0.1:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ost_live_your_key_here" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello, world!"}],
    "stream": false
  }'
```

#### C. Test Streaming Response
```bash
curl -X POST http://127.0.0.1:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ost_live_your_key_here" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Count from 1 to 5"}],
    "stream": true
  }'
```

#### D. Test Budget Overspend Enforcement
1. In the web dashboard, create a Virtual Key with a **$0.01** monthly limit.
2. Send 2-3 requests using that key.
3. Observe that once the hold or actual cost crosses $0.01, the gateway immediately returns `429 Budget Exceeded` without forwarding the call upstream.

#### E. Test Provider Failover
1. Point requests to a model with an active failover configured in `catalog.ts`.
2. Simulate upstream failure or 429 rate limit.
3. Observe in terminal logs that the gateway seamlessly retries with the fallback candidate before streaming begins.

---

### Method 4: Interactive Dashboard & Playground Testing

Start the frontend development server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser to test:
- **Authentication**: Sign in with Supabase Auth or continue with demo mode.
- **Virtual Keys Management**: Create new keys, set model access lists, and assign spend limits.
- **Interactive Playground**: Send test queries and watch real-time token/cost meters increment.
- **Analytics & Graphs**: View the diverging managed vs unmanaged spend curves, provider distribution, and model breakdown.
- **Copilot Recommendations**: Inspect smart model routing suggestions to reduce bills by 40-70%.

---

### Method 5: Code Quality & Production Build

Verify that TypeScript types and Oxlint rules pass with zero errors:

```bash
# Run the Oxlint linter
npm run lint

# Run TypeScript check and production build
npm run build
```

---

## 10. How Budgets and Spending Limits Work

### Why Concurrent Requests Need Special Protection

If you have $0.20 remaining on a budget, and 50 requests arrive at the same time:
- In a naive system, all 50 requests check the database, see that $0.20 remains, and all 50 proceed. Your budget is exceeded by up to 50x.
- In OstraOps, each request must first **reserve** its estimated cost in memory before being sent upstream.
- Requests 1 through 4 reserve $0.05 each ($0.20 total).
- Requests 5 through 50 are immediately rejected with `429 Budget Exceeded`.
- When requests 1 through 4 finish, their real costs are recorded and the temporary reservations are safely released.

### What Happens on Failure or Stream Abort?

If a request fails, is canceled by the user, or encounters a network error before consuming tokens:
- The temporary reservation is automatically released inside a `finally` block.
- Your budget is not locked or permanently lost.

### Fail-Closed vs. Fail-Open

You can choose what happens if your database or accounting service goes offline:

- **Fail-Closed (`fail_closed`)** (Default & Recommended): If the gateway cannot reach the accounting database to verify a budget, it blocks the request (`503 Service Unavailable`). This guarantees you never overspend, even during database outages.
- **Fail-Open (`fail_open`)**: If the gateway cannot reach the accounting database, it permits the request to continue and adds warning headers. This prioritizes application uptime, but spending limits cannot be strictly guaranteed during an outage.

*Note: For security, clients cannot override this policy using request headers. It is strictly enforced server-side.*

---

## 11. How User Data and API Keys Are Protected

- **No Prompt Retention**: The gateway only extracts token numbers, latency, and model names. It never saves your prompts, system messages, or model completions to the database.
- **SHA-256 Key Hashing**: Virtual keys are hashed with SHA-256 before storage. The plain secret key is only shown to you once upon creation. Even if the database is exposed, secret keys cannot be read.
- **Multi-Tenant Isolation (RLS)**: Every database table uses PostgreSQL Row Level Security policies. Users can only read and write data belonging to organizations they are an active member of.
- **Upstream Provider Secrets**: Your master OpenAI, Anthropic, or Gemini API keys are never sent to the browser. They remain securely on the server or in your secrets vault.

---

## 12. Known Limitations and Future Improvements

We believe in complete honesty about what the platform can and cannot do today:

1. **Single-Node In-Memory Reservation**: The current atomic budget reservation store runs in Node.js process memory. This guarantees zero race-condition overspending on a single gateway instance. In a future update, we plan to add a Redis-backed distributed store for deployments running across multiple load-balanced gateway containers.
2. **Exact-Match Caching**: The current cache checks for exact string matches of the prompt payload. A future release will introduce semantic embedding search for fuzzy caching.
3. **Upstream Disconnections**: If an upstream AI provider suddenly drops an active connection halfway through a streaming response, tokens that were already emitted by the provider may still be billed by them. OstraOps uses tokenizer estimation heuristics to approximate the cost of truncated streams.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
