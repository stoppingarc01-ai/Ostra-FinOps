# Automatic Model Fallback: Never Let an OpenAI Outage Break Your App

*What happens when your primary AI provider goes down? Here is how to build seamless, zero-downtime failover in your application.*

---

If your app relies on an AI model for critical features—like search, customer support, or code generation—you have likely experienced the dreaded **"HTTP 500: Internal Server Error"** or **"HTTP 503: Service Unavailable"**.

No matter how big OpenAI, Anthropic, or Google are, their APIs experience outages, rate limit surges, and intermittent downtime.

If your code is hardcoded to talk only to a single provider endpoint, your application crashes when they have an outage.

Here is how modern AI systems build **automatic model fallback** so users never notice a hiccup.

---

## What Is Model Fallback?

Model fallback is like having a backup generator for your electricity. 

If your primary model fails or times out, your gateway automatically reroutes the exact same request to a backup model within milliseconds:

```
[ User Sends Request ]
          │
          ▼
┌────────────────────────────────────────┐
│           OstraOps Gateway             │
│  1. Try Primary: OpenAI GPT-4o         │
│     ❌ Returns HTTP 500 or times out   │
│                                        │
│  2. Automatic Failover:                │
│     ✅ Retry instantly with Claude 3.7 │
│        or DeepSeek V3                  │
└──────────────────┬─────────────────────┘
                   │
                   ▼
[ User Receives Smooth Response in < 800ms ]
```

---

## Two Types of Failover

### 1. Intra-Family Failover (Same Provider, Backup Tier)
If `gpt-4o` is experiencing heavy load or rate-limiting, you can automatically fall back to `gpt-4o-mini` or `o3-mini`.
- **Advantage:** Uses the exact same API key and OpenAI credentials.
- **Disadvantage:** If the entire OpenAI platform is down, both models fail together.

### 2. Cross-Provider Failover (Different Provider)
If OpenAI is down, fall back to Anthropic's `claude-3-7-sonnet` or Google's `gemini-1.5-pro`.
- **Advantage:** True high availability. An outage at OpenAI will not affect Anthropic or Google.
- **Challenge:** Different providers historically used different request formats—unless you use a unified gateway.

---

## How to Implement Fallback in Code

You can implement fallback yourself with a simple wrapper function:

```python
import os
from openai import OpenAI

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
deepseek_client = OpenAI(
    base_url="https://api.deepseek.com/v1",
    api_key=os.getenv("DEEPSEEK_API_KEY")
)

def robust_completion(prompt):
    # Attempt 1: Try Primary (GPT-4o)
    try:
        return openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            timeout=8.0  # Don't wait forever
        )
    except Exception as e:
        print(f"⚠️ Primary provider failed ({e}). Switching to backup...")
        
    # Attempt 2: Fallback (DeepSeek V3 or Claude)
    try:
        return deepseek_client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            timeout=10.0
        )
    except Exception as e2:
        print(f"❌ Both primary and secondary models failed: {e2}")
        raise
```

---

## How OstraOps Handles Fallback Automatically

Instead of writing custom `try/catch` fallback boilerplate for every script or editor, **OstraOps Gateway** has automatic routing built directly into its core proxy.

When you send a request to `http://127.0.0.1:8080/v1`:
- If an upstream call times out or returns a `5xx` error, OstraOps catches it instantly.
- It consults your model catalog and transparently dispatches the request to your configured secondary provider.
- Your application receives a standard `200 OK` response without writing a single line of fallback logic.

---

## Best Practices for High-Reliability AI Apps

1. **Always set aggressive client timeouts:**
   Never leave your request timeout open. If an LLM doesn't start streaming within 8 seconds, fail over.
2. **Log your fallback events:**
   Track how often failover occurs. If primary outages happen frequently, you might want to promote your backup model to primary.
3. **Keep budget caps active on backup models:**
   Make sure your fallback model also has spend limits so that sudden traffic spikes don't trigger unexpected charges on your secondary account.

With a proper fallback system in place, you can sleep soundly knowing your AI features stay online 24/7.
