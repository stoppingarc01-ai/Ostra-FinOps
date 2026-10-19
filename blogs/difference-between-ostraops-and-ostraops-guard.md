# OstraOps vs OstraOps Guard: What’s the Difference and Which One Do You Need?

*The local seatbelt on your laptop vs the full control tower for engineering teams. A simple, honest breakdown.*

---

If you are exploring OstraOps, you will notice two ways people talk about it:
1. **OstraOps Guard** (the terminal command: `npx ostraops-guard`)
2. **OstraOps Platform & Gateway** (the web dashboard and centralized team proxy)

Are they two completely different products? Do you need an account? Which one should you use for your project?

Here is the simple, honest answer without any confusing marketing jargon.

---

## The Big Picture in One Analogy

Think of it like driving a car:

- **OstraOps Guard** is the **seatbelt and airbag right inside your car**. It protects you personally, works immediately with zero setup, and doesn’t need permission from anyone to keep you safe.
- **OstraOps Platform** is the **fleet management system for a company of 20 drivers**. It lets the company manager set fuel budgets per driver, track vehicle maintenance, and view fleet analytics on a central dashboard.

---

## 1. OstraOps Guard: For Solo Developers & Tinkerers

OstraOps Guard was built for the individual developer hacking away on a laptop.

### How You Run It:
```bash
npx ostraops-guard
```

### Key Highlights:
- **Zero Friction:** No signup, no email, no password, and **no credit card**.
- **100% Local:** Runs on `http://127.0.0.1:8080` right on your machine.
- **The Core Mission:** It sits between your editor (Cursor, Windsurf, Cline) or your terminal scripts and the AI provider. It counts tokens as they stream and triggers an instant `HTTP 429` pause the second you reach your daily comfort limit (e.g. $5.00/day).
- **Absolute Privacy:** Your code, file contents, and prompts never leave your laptop. The guard only tallies token numbers locally.

👉 **Pick OstraOps Guard if:** You are coding alone in Cursor, writing agent scripts in Python/Node, and simply want to ensure an infinite retry loop doesn't burn through $300 while you're away from your desk.

---

## 2. OstraOps Platform & Gateway: For Teams & Production Apps

OstraOps Platform is designed for startups, companies, and teams running AI features in production.

### How It Works:
You deploy the gateway on a server or cloud container (via Docker or Node.js) and access the interactive web dashboard.

### Key Highlights:
- **Centralized Team Keys:** Instead of sharing one dangerous master OpenAI key across 15 engineers, you issue virtual keys with custom spending caps per teammate.
- **Visual Analytics Dashboard:** Interactive charts showing your burn rate, costs broken down by model (GPT-4o vs Claude vs DeepSeek), and latency percentiles.
- **Cost-Per-User Attribution:** Tag incoming requests with customer IDs (`X-User-Id`) to track which SaaS users are profitable and which ones are burning too many tokens.
- **Automatic Model Fallback:** If OpenAI has an outage or returns a 503 error, the gateway automatically reroutes the request to Claude 3.7 or DeepSeek in milliseconds without crashing your app.

👉 **Pick OstraOps Platform if:** You manage an engineering team, run an AI SaaS, or need centralized billing limits, audit logs, and high-availability model fallback.

---

## Side-by-Side Comparison

| Feature | OstraOps Guard (`npx ostraops-guard`) | OstraOps Platform & Gateway |
| :--- | :--- | :--- |
| **Who is it for?** | Solo developers on laptops | Teams, startups, & production apps |
| **Setup Time** | 30 seconds (1 command) | 2–5 minutes |
| **Requires an Account?** | ❌ **No (Zero signup / No card)** | ✅ Yes (To manage team members) |
| **Where does it run?** | 100% local on your machine | Your server or team cloud |
| **Real-time Budget Cutoffs?** | ✅ Yes (Local HTTP 429) | ✅ Yes (Per-team & per-project) |
| **Visual Web Dashboard?** | Terminal odometer | Full interactive web UI |
| **Team Quotas & Virtual Keys?** | ❌ Single machine only | ✅ Yes (Per-engineer spending caps) |
| **Cross-Provider Failover?** | ❌ Manual | ✅ Automated zero-downtime routing |
| **Cost** | 100% Free & Open Source | 100% Open Source (Self-hostable) |

---

## The Decision Rule: Which One Should You Pick Today?

- **If you're sitting at your desk coding right now:** Open your terminal and run `npx ostraops-guard`. Point Cursor or your Python script to `http://127.0.0.1:8080/v1` and you are protected immediately.
- **If you're building a startup or managing other developers:** Check out the [OstraOps Gateway Documentation](https://github.com/stoppingarc01-ai/Ostra-FinOps) to set up centralized company keys, pooled budgets, and live spend tracking.

Both tools share the same core promise: **honest spend visibility, zero prompt storage, and hard budget limits.**
