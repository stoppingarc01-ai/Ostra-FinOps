# How to Track "Cost Per User" in Your AI App (So You Don't Lose Money)

*Why most AI SaaS startups accidentally lose money on power users, and how to track your unit economics down to the cent.*

---

Here is a common trap that catches AI founders by surprise:

You launch a SaaS tool for **$29 per month**. You get your first 100 paying customers and celebrate making $2,900 in Monthly Recurring Revenue (MRR).

Then your OpenAI or Anthropic invoice arrives at the end of the month: **$3,400.**

You actually *lost* $500! How did that happen?

When you dig into your database, you discover the culprit: 
- 95 of your customers barely used the tool, costing you $2 each ($190 total).
- 5 "power users" automated their workflows and ran thousands of prompts, costing you **$640 each ($3,200 total)**!

Without **per-user cost tracking**, you have no idea which customers are profitable and which ones are quietly bankrupting your business.

---

## The Solution: Tag Every Request with a User ID

When making LLM API calls, you must attach metadata identifying the user or team making the request.

Most modern SDKs and gateways allow you to pass custom headers or metadata properties:

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:8080/v1",  # OstraOps Gateway
    api_key=os.getenv("OPENAI_API_KEY")
)

def run_ai_feature(user_id: str, prompt: str):
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        extra_headers={
            # Tag the request with the specific customer ID!
            "X-User-Id": user_id,
            "X-Tier": "starter-plan"
        }
    )
    return response.choices[0].message.content
```

---

## 3 Critical Metrics Every AI Founder Must Watch

Once you tag your requests, you can calculate your **true unit economics**:

### 1. Cost to Serve (CTS) Per User
```
CTS = Total Model Spend for User / Monthly Subscription Paid
```
- If a user pays you $29/mo and costs $3 in API fees, your gross margin is a healthy **89%**.
- If a user pays you $29/mo and costs $42 in API fees, you are subsidizing their company!

### 2. Prompt Heavy vs Lightweight Features
Track which specific features in your app burn the most tokens. Often, a single unoptimized summary button accounts for 70% of your total OpenAI invoice.

### 3. Free-Tier Abuse Velocity
Set hard monthly ceilings on free-tier users (e.g. max $0.50 per month). If a user crosses that threshold, gracefully prompt them to upgrade to a paid plan rather than absorbing infinite losses.

---

## How OstraOps Solves This Out of the Box

Tracking unit economics manually requires building custom event queues, database bridges, and rate calculators.

With **OstraOps Gateway**:
- Every virtual key or request header can be mapped directly to a project, team, or user ID.
- The dashboard groups your spend automatically by user, model, and endpoint.
- You can set hard budget limits per user or per team so no single customer can ever run up an unbounded bill.

---

## Summary Checklist for AI Builders

1. **Never offer unlimited high-reasoning models on flat-rate pricing:** Cap high-cost models (like Claude 3.7 or o3-mini) with monthly credit allocations.
2. **Tag every API call with user identifiers:** Pass `X-User-Id` in request headers.
3. **Set automated circuit breakers:** Stop runaway calls automatically with real-time budget cutoffs.
4. **Regularly review unit margins:** Find your power users and move them to fair, tier-based pricing plans.

Build fast, but build profitably!
