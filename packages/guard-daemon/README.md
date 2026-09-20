# OstraOps Sentinel (`ostraops-guard`)

> Inline financial gateway and telemetry proxy for autonomous AI coding agents (Cursor, Cline, OpenAI SDK, Anthropic).

## Quick Start (No Install Needed)

Run directly with `npx`:

```bash
npx ostraops-guard
```

The daemon will interactively ask for your pairing credentials from your [OstraOps Solo Developer Console](https://ostraops.com/#solo-guard):
1. **Solo Client ID** (`ost_client_solo_...`)
2. **Secret Passkey** (`ost_sec_...`)
3. **Ingress Port** (default: `8080`)

### Non-Interactive Launch

Pass credentials directly via CLI flags:

```bash
npx ostraops-guard --id <CLIENT_ID> --secret <SECRET_PASSKEY> --port 8080
```

---

## SDK Integration

Redirect your local AI tools to route through `127.0.0.1:8080`:

### Cursor / OpenAI SDK
```bash
export OPENAI_BASE_URL="http://127.0.0.1:8080/v1"
```

### Cline / Claude Dev / Anthropic SDK
```bash
export ANTHROPIC_BASE_URL="http://127.0.0.1:8080"
```

---

## Features
- **Zero Latency**: `< 0.5ms` loopback latency on `127.0.0.1`.
- **Zero Network Leaks**: Prompts, API keys, and code never leave your machine.
- **Local Telemetry GUI**: Real-time token speedometer and odometer on `http://127.0.0.1:4040`.
- **Session Circuit Breaker**: Auto-halts runaway loops before bills explode.
- **Local SQLite Store**: Persists metrics safely in `~/.ostraops/telemetry.db`.

---

## Global Install (Optional)

```bash
npm install -g ostraops-guard
ostraops-guard
```

## License
Apache-2.0
