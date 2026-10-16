# OstraOps 2.0

> An open-source AI cost gateway and real-time dashboard. Track every token, stay on budget, and stop runaway LLM bills before they happen.

OstraOps sits between your app and AI providers (like OpenAI, Anthropic, and Google Gemini). You just swap the base URL in your code. OstraOps then checks budgets in real time, routes your requests, streams back responses, and records the exact cost down to a fraction of a cent.

---

## Quick Links

- [What is OstraOps?](#what-is-ostraops)
- [How It Works](#how-it-works)
- [Quick Start (Get Running in 2 Minutes)](#quick-start)
- [How to Test It](#how-to-test-it)
- [How Budgets Work](#how-budgets-work)
- [Contributing (We'd Love Your Help!)](#contributing)
  - [Code of Conduct & Guidelines](#guidelines-for-contributing)
  - [Step-by-Step Pull Request Guide](#step-by-step-pull-request-guide)
  - [Ideas on What to Work On](#good-first-issues--ideas-to-work-on)
- [License](#license)

---

## Demo & Showcase

<div align="center">
  <img src="public/demo.gif" alt="OstraOps Demo" width="100%" />
</div>

- **Walkthrough Video**: [Watch `public/demo.mp4`](public/demo.mp4) (Full tour of live tokens, key creation, budget caps, and failover)
- **Launch Teaser**: [Watch `public/launch.mp4`](public/launch.mp4) (Short 22s trailer)

---

## What is OstraOps?

When your apps or AI agents talk directly to OpenAI or Anthropic, two big problems happen:
1. **Billing lag**: Official provider dashboards lag by 2 to 8 hours. By the time you notice an infinite loop or runaway agent, you might already have a huge bill.
2. **Shared API keys**: When everyone shares the same master API key, you cannot tell which developer, feature, or customer spent the money.

**OstraOps fixes this:**
- **Instant tracking**: See your token usage and costs the exact second a request finishes.
- **Hard budget limits**: Set a dollar limit (e.g. $5/month) on a key. Once reached, requests are blocked immediately — before you get charged.
- **Virtual keys**: Create separate API keys (`ost_live_...`) for different apps, devs, or teams with their own limits.
- **Provider failover**: If OpenAI returns a 503 outage or 429 rate limit, OstraOps can automatically fall back to another model.
- **Zero prompt storage**: We only log numbers (tokens, latency, cost). Your actual prompt text and AI answers are never saved.

---

## How It Works

```
[ Your App / Agent ]
        │
        ▼ (OpenAI-compatible format)
[ OstraOps Gateway ] ─── 1. Checks budget & rate limits
        │
        ▼
[ AI Provider (OpenAI, Anthropic, Gemini, etc.) ]
        │
        ▼ (Streaming response)
[ OstraOps Gateway ] ─── 2. Counts tokens & exact cost
        │
        ▼
[ Your App / User ]
```

---

## Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (version 9 or higher)
- Git

### 2. Clone the Repository
```bash
git clone https://github.com/stoppingarc01-ai/Ostra-FinOps.git
cd Ostra-FinOps
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Set Up Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(On Windows PowerShell, use `copy .env.example .env.local`)*

Open `.env.local` to verify or add your Supabase / Firebase project keys.

### 5. Start the Servers
Open two terminal tabs:

**Terminal 1 — Gateway Server (port 8080):**
```bash
npm run gateway
```

**Terminal 2 — Web Dashboard (port 5173):**
```bash
npm run dev
```

Open `http://localhost:5173` in your browser. You're up and running!

---

## How to Test It

### 1. Run Automated Tests
```bash
npm test
```
This runs 5 automated checks testing rate limits, model catalogs, failover, token accounting, and 50 concurrent requests.

### 2. Quick Health Check
```bash
curl http://localhost:8080/health
```
You should get back: `{"status":"ok", ...}`

### 3. Send a Test Request
You can send normal OpenAI-format requests straight to your local gateway:
```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ost_live_your_key" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Say hello!"}],
    "stream": false
  }'
```

### 4. Interactive Terminal Tester
```bash
node test-api.mjs
```
Follow the terminal prompt to send a real prompt to Gemini, calculate the cost, and immediately see it appear in your local dashboard.

---

## How Budgets Work

- **In-flight holds**: When a request comes in, OstraOps holds an estimate in memory before calling the provider.
- **Overspend protection**: If you only have $0.10 left and 20 requests hit at the same moment, only the first 2 get approved. The other 18 are rejected with `429 Budget Exceeded`. No surprise bills.
- **Refund on failure**: If the request fails or the user cancels, the hold is released immediately.

---

## Contributing

We love contributions! Whether you are fixing a typo in the docs, adding support for a new AI model, improving the UI, or fixing a bug, you are welcome here.

### Guidelines for Contributing
- **Keep it simple**: We prefer clean, readable, minimal code over complex abstractions.
- **Test your changes**: Run `npm test` and `npm run lint` before opening a pull request.
- **Be respectful and friendly**: We are all building together.

---

### Step-by-Step Pull Request Guide

If you're new to GitHub or open-source pull requests, follow this step-by-step guide:

#### Step 1: Fork the Repository
Click the **Fork** button at the top right of this GitHub repo to create your own copy on your GitHub account.

#### Step 2: Clone Your Fork Locally
```bash
git clone https://github.com/YOUR-USERNAME/Ostra-FinOps.git
cd Ostra-FinOps
```

#### Step 3: Create a New Branch
Pick a clear branch name describing what you are doing:
```bash
# For a bug fix:
git checkout -b fix/dashboard-chart-tooltip

# For a new feature:
git checkout -b feat/add-groq-provider

# For documentation:
git checkout -b docs/clarify-env-setup
```

#### Step 4: Make Your Changes & Test
Make your code changes, then run:
```bash
# Check code style and linter
npm run lint

# Run automated tests
npm test

# Test building the app
npm run build
```
Make sure all checks pass without errors.

#### Step 5: Commit Your Changes
Write a clear, simple commit message:
```bash
git add .
git commit -m "fix: resolve budget calculation on aborted streams"
```

#### Step 6: Push to Your Fork
```bash
git push origin your-branch-name
```

#### Step 7: Open a Pull Request (PR)
1. Go to the original repo: `https://github.com/stoppingarc01-ai/Ostra-FinOps`
2. You will see a banner saying **"Compare & pull request"**. Click it!
3. Fill out the PR form:
   - **Title**: A short summary of your change (e.g. `feat: add Mistral Small model to catalog`).
   - **Description**: Explain what you changed and why. If you solved an existing issue, write `Closes #123`.
   - **Screenshots**: If you changed the UI, attach a quick screenshot or GIF.
4. Click **Create pull request**.
5. Wait for review! We will review your PR, give friendly feedback, and merge it when ready.

---

### Good First Issues & Ideas to Work On

Looking for something fun to contribute? Here are great starting points:

- **Add New Models**: Add new model pricing or specs in `apps/gateway/src/registry/catalog.ts`.
- **UI Improvements**: Polish dark mode styling, improve chart tooltips, or make the mobile layout smoother.
- **Provider Adapters**: Help expand support for providers like Groq, Cohere, or local Ollama instances.
- **Documentation & Examples**: Add example code in Python, Go, or cURL showing how to connect LangChain, LlamaIndex, or AutoGen to OstraOps.
- **Bug Fixes**: Check open GitHub Issues tagged with `good first issue` or `help wanted`.

---

## Tech Stack

- **Backend & Gateway**: Node.js, TypeScript, Native HTTP streaming
- **Frontend Dashboard**: React 19, Vite, Tailwind CSS, Lucide Icons, Framer Motion
- **Database**: PostgreSQL (Supabase) with Row-Level Security (RLS)
- **Auth**: Supabase Auth / Firebase Authentication

---

## License

This project is licensed under the [MIT License](LICENSE). Free for personal and commercial use.
