# How a Simple While Loop Cost Me $400 in 20 Minutes (And How to Prevent It)

*A true story every AI developer fears, and the simple one-line fix to make sure it never happens to you.*

---

## It Starts With a Completely Normal Task

It was a Tuesday afternoon. I was building a small script to read a list of error logs, feed them into an LLM, and generate bug reports.

To make it autonomous, I wrote a simple retry loop:

```python
# A seemingly innocent loop...
while not task_completed:
    response = call_llm(prompt)
    if verify_solution(response):
        task_completed = True
    else:
        # Retry with feedback
        prompt = f"That failed. Try again with this context: {response}"
```

I hit run, watched the first two logs succeed, and stepped into the kitchen to make a fresh cup of coffee.

I came back 20 minutes later. 

My terminal was still spinning. Hundreds of API calls had fired. The script was stuck in an infinite loop because a test file was slightly malformed, causing `verify_solution()` to return `False` every single time.

With each retry, the prompt grew larger because it appended the previous failed attempt. By minute 18, it was sending 40,000 tokens per call, twice a second.

Total cost of that cup of coffee? **$384.60.**

---

## Why Official Provider Dashboards Won't Save You

You might ask: *"Don't OpenAI and Anthropic have usage limits?"*

Yes, but here is the dirty secret that most developers learn the hard way:

> **Official provider billing dashboards lag behind by 2 to 8 hours.**

When you make an API call:
1. The request runs instantly.
2. The tokens stream back to your machine.
3. The internal billing telemetry is batched and queued on provider servers.
4. The usage number on your web dashboard updates hours later.

By the time you receive that friendly email saying *"You've used 80% of your usage limit"*, the loop has already finished draining your balance three hours ago.

---

## The Real Problem: Passive Loggers vs Hard Cutoffs

Many teams install logging tools like Langfuse or Helicone. These tools are fantastic for tracing and analytics, but they are **passive**.

A passive logger is like a security camera watching someone rob your house. It records the theft in beautiful 4K high definition and shows you a pretty graph of how much was stolen—**after the money is already gone.**

What you actually need is a **circuit breaker**: a physical lock on the door that trips the second a threshold is reached.

---

## The Fix: Run a Local Circuit Breaker

Instead of letting scripts talk directly to remote APIs without protection, put a lightweight local controller in between:

```
[ Your Python Script / Agent ]
              │
              ▼  (localhost:8080)
┌────────────────────────────────────────┐
│           OstraOps Guard               │
│  Current spend today: $4.95            │
│  Daily hard cap:     $5.00            │
│                                        │
│  Next call would exceed $5.00?         │
│  ──► RETURN HTTP 429 (STOPPED LOCALLY) │
└──────────────────┬─────────────────────┘
                   │
                   ▼ (Only allowed if under budget)
         [ OpenAI / Anthropic ]
```

### How to set it up in 30 seconds:

**1. Run the local guard in your terminal:**

```bash
npx ostraops-guard
```

That's it. No credit card, no account, no cloud setup. It runs locally on `http://127.0.0.1:8080`.

**2. Point your code's `base_url` to it:**

In Python:
```python
from openai import OpenAI

# Just point the base_url to your local guard
client = OpenAI(
    base_url="http://127.0.0.1:8080/v1",
    api_key=os.getenv("OPENAI_API_KEY")
)
```

In Node.js / TypeScript:
```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://127.0.0.1:8080/v1',
  apiKey: process.env.OPENAI_API_KEY,
});
```

---

## What Happens When a Loop Goes Rogue Now?

If your script goes into an infinite loop again:
1. Calls 1 through 20 succeed normally.
2. The guard tallies input and output tokens down to the fractional cent in real time.
3. The moment your spend reaches your daily cap (say, $5.00), the 21st call **instantly receives an HTTP 429 status code**.
4. The loop stops immediately on your machine.
5. Your credit card is safe.

Best of all, your code and prompts never leave your laptop. The guard only counts token numbers locally.

---

## 3 Practical Rules to Prevent Runaway Bills Today

Even before using a guard, adopt these three habits:

1. **Always set a hard `max_retries` counter:**
   Never write `while True` or `while not completed`. Always do:
   ```python
   MAX_RETRIES = 5
   for attempt in range(MAX_RETRIES):
       ...
   ```
2. **Cap your `max_tokens` per request:**
   If you only expect a 2-paragraph answer, specify `max_tokens=400`. Don't let an open completion generate 4,000 tokens of gibberish.
3. **Use a local proxy with hard limits:**
   Set your comfort ceiling ($2/day for solo hacking, $20/day for heavy agent development) and never build without a safety net again.

Happy building, and keep your coffee breaks stress-free!
