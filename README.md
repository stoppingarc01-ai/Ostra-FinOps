<div align="center">

# Ostra FinOps (OsterdOps 2.0)

### *The Deterministic Financial Firewall & Telemetry Proxy for Autonomous AI Agents*

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Latency](https://img.shields.io/badge/Proxy%20Overhead-%3C0.42ms-emerald.svg?style=flat-square)](http://127.0.0.1:8080)
[![Zero Egress](https://img.shields.io/badge/Cloud%20Retention-0%20Bytes%20(Local%20First)-blue.svg?style=flat-square)](https://github.com/stoppingarc01-ai/Ostra-FinOps)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-purple.svg?style=flat-square&logo=vite)](https://vitejs.dev/)

<p align="center">
  Stop runaway token loops, four-figure monthly API surprises, and corrupted tool-call schemas.<br />
  One-line drop-in loopback proxy running 100% on your machine.
</p>

```bash
npx osterdops-guard
```

[Live Console (localhost:4040)](http://127.0.0.1:4040) • [Architecture](#-architecture) • [Agent Setup](#-agent-setup) • [Model Catalog](#-40-model-catalog) • [License](#-license)

</div>

---

## ⚡ Why Ostra-FinOps?

Autonomous coding agents (such as **Cursor Composer, Cline / Roo-Code, Windsurf Cascade, and Aider**) execute multi-file edits through iterative LLM tool-calling loops. When an agent gets stuck in a syntax error or test regression, it can burn through hundreds of thousands of tokens within minutes.

Traditional cost monitors only send an email **after** your provider billing threshold has been breached.

**Ostra-FinOps intercepts requests before they leave your computer:**
- **Microsecond Financial Circuit Breaker:** Injects an instant HTTP 429 locally when rolling token velocity ($/min) or your daily hard cap ($15.00/day) is crossed.
- **Deterministic Intra-Family Failover:** Prevents cross-vendor tool crashes by cascading strictly within sibling models (e.g. Claude 3.7 Sonnet → Claude 3.5 Haiku) with 100% schema fidelity.
- **0.42ms In-Memory Proxy Overhead:** Zero perceptible buffering delay on streaming Server-Sent Events (SSE).
- **100% Local-First & Zero Egress:** Traces, metrics, and prompt histories reside encrypted in on-device SQLite (`~/.osterdops/traces.db`). Zero cloud data retention.

---

## 🏛 Architecture

```
[ Cursor / Cline / Windsurf ]
             │
             ▼ (Port 8080)
┌──────────────────────────────────────────────────────────┐
│              OSTRA LOCAL LOOPBACK DAEMON                 │
│                                                          │
│  [1] Pre-Flight Circuit Gate   ───> Hard Limit / Velocity│
│  [2] High-Entropy Secret Mask  ───> API Keys, JWTs & IPs │
│  [3] In-Memory SSE Streamer    ───> Zero Buffering Delay │
│  [4] Intra-Family Cascader     ───> Sonnet -> Haiku      │
│  [5] Encrypted SQLite Buffer   ───> ~/.osterdops/traces  │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼ (Encrypted TLS)
   [ Anthropic / OpenAI / Google Gemini / DeepSeek APIs ]
```

---

## 🚀 Quickstart

### 1. Launch the Local Loopback Daemon

No signup or cloud API keys required to use the local guard daemon:

```bash
npx osterdops-guard
```

The daemon will bind to:
- **Proxy Gateway:** `http://127.0.0.1:8080/v1`
- **Telemetry UI:** `http://127.0.0.1:4040`
- **Local SQLite DB:** `~/.osterdops/traces.db`

### 2. Connect Your Agent

#### **Cursor IDE**
1. Open **Cursor Settings** > **Models**
2. Under **OpenAI API Key**, enter your API key or a dummy string
3. Set **OpenAI Base URL** to:
   ```text
   http://127.0.0.1:8080/v1
   ```

#### **Cline (VSCode Extension)**
1. Open **Cline Settings** > **API Provider**
2. Select **Custom / Compatible Endpoint**
3. Set **Base URL** to:
   ```text
   http://127.0.0.1:8080/v1
   ```

#### **Aider CLI**
```bash
aider --openai-api-base http://127.0.0.1:8080/v1 --model openai/gpt-4o
```

#### **Python SDK (OpenAI / LangChain)**
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:8080/v1",
    api_key="your-actual-provider-key"
)
```

---

## 🎯 Key Features

| Feature | Generic AI Proxies | Ostra-FinOps |
| :--- | :--- | :--- |
| **Proxy Latency** | +60ms – 180ms (Cloud Roundtrip) | **< 0.42ms (In-Memory Loopback)** |
| **Data Privacy** | Logged on 3rd-party servers | **100% On-Device (0 Cloud Storage)** |
| **Circuit Breakers** | Delayed webhooks / emails | **Real-Time Sliding Window Killswitch** |
| **Failover Safety** | Swaps vendors (corrupts XML/JSON tools) | **Deterministic Intra-Family Isolation** |
| **Secret Scrubbing** | None or Cloud Regex | **0.18ms On-Device High-Entropy Masking** |
| **Deployment** | DNS CNAMEs & Cloud Config | **Single Command (`npx osterdops-guard`)** |

---

## 🌐 40+ Model Catalog & Specifications

Ostra-FinOps maintains full spec intelligence and token cost telemetry across 40 enterprise foundation models:

- **Anthropic:** Claude 3.7 Sonnet, Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus
- **OpenAI:** GPT-4o, o3-mini, o1-preview, GPT-4o-mini
- **Google DeepMind:** Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 1.5 Pro
- **DeepSeek:** DeepSeek-R1, DeepSeek-V3
- **Meta:** Llama 3.3 70B, Llama 3.1 405B (via vLLM / Ollama)
- **Mistral AI:** Mistral Large 2, Codestral 25B
- **Cohere & xAI:** Command R+, Grok 2, Grok 2 Vision

---

## 🛠 Local Web UI & Dashboard Development

Run the web frontend and analytics console locally:

```bash
# Clone your repository
git clone https://github.com/stoppingarc01-ai/Ostra-FinOps.git
cd Ostra-FinOps

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Visit **http://localhost:5173/** to explore the interactive 3D dashboard, live telemetry odometer, model catalog, and architectural specifications.

---

## 🔒 Security & Privacy

- **Zero Cloud Data Egress:** Codebases, prompts, and tokens never touch remote servers.
- **AES-256 Storage:** All traces in SQLite use local cryptographic encryption.
- **RFC1918 & PII Redaction:** High-entropy detector masks private IPs, credentials, and bearer tokens before transmission.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
