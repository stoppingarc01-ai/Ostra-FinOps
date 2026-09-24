# OstraOps

**Real-Time AI Spend Tracking & Budget Guardrails**

OstraOps helps developers and engineering teams track token consumption, calculate exact costs in real time, and enforce hard budget limits across popular AI models — without storing prompts or adding complicated configurations.

---

## ⚡ What is OstraOps?

Building with modern foundation models is powerful, but API costs can escalate quickly. An autonomous coding agent caught in a recursive loop or an unoptimized batch pipeline can easily trigger thousands of tokens within minutes.

Most cloud dashboards only report spending hours after the fact. **OstraOps provides real-time visibility and budget control:**

- **Live Spend Calculation:** Measures input and output tokens against official provider rate cards as calls happen.
- **Firm Budget Limits:** Define a daily or monthly spend cap (e.g., $10/day). If an agent or test script runs wild, requests pause safely before unexpected charges occur.
- **Zero Prompt Retention:** Your code, queries, and completions never touch external logging servers or training sets. Everything stays private between you and your AI provider.
- **Multi-Model Comparison:** Easily compare pricing per 1M tokens, context capacities, and speeds across 40+ foundation models.

---

## 🚀 Quickstart

Run OstraOps directly in your terminal:

```bash
npx ostraops
```

You can also run the web dashboard locally:

```bash
# Clone the repository
git clone https://github.com/stoppingarc01-ai/Ostra-FinOps.git

# Install dependencies
npm install

# Start local development server
npm run dev
```

---

## 🌐 Supported Model Families

OstraOps maintains accurate, up-to-date token pricing for all major AI providers:

| Provider | Popular Models | Context Window |
|---|---|---|
| **Anthropic** | Claude 3.7 Sonnet, Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus | 200k tokens |
| **OpenAI** | GPT-4o, GPT-4o mini, o3-mini, o1 | 128k – 200k tokens |
| **Google** | Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 1.5 Pro | Up to 4.2M tokens |
| **DeepSeek** | DeepSeek R1, DeepSeek V3 | 64k – 128k tokens |
| **Meta** | Llama 3.3 70B, Llama 3.1 405B | 128k tokens |
| **Mistral** | Mistral Large 2, Codestral 2501, Mistral Small 3 | 32k – 256k tokens |
| **xAI** | Grok 2, Grok 2 Vision | 128k tokens |
| **Cohere** | Command R+, Command R | 128k tokens |

---

## 🔒 Privacy & Data Policy

1. **Zero Retention:** OstraOps does not store, log, or transmit your prompts, completions, or source code.
2. **Direct Communication:** Your application connects directly to your chosen AI provider using your own API credentials.
3. **No Training:** Your intellectual property is never used to train or fine-tune models.

---

## 🛠 Tech Stack

- **Frontend:** React 19, TypeScript, TailwindCSS
- **Build Tool:** Vite
- **Icons:** Lucide React

---

## 📄 License

MIT License. Open and transparent for developers building with AI.
