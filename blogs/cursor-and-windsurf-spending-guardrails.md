# How to Add Hard Spending Guardrails to Cursor and Windsurf

*Love coding with AI agents, but terrified of surprise bills? Here is how to lock down your daily AI editor spend in under 2 minutes.*

---

AI code editors like **Cursor** and **Windsurf** feel like magic. You describe a feature, and the agent scans your codebase, creates new files, runs terminal tests, and fixes syntax errors.

But that power comes at a cost. When an agent gets confused or attempts to fix a test across 20 files, it can burn through hundreds of thousands of tokens before you even realize what happened.

If you bring your own API keys (OpenAI, Anthropic, or DeepSeek), there is no native "Stop me if I spend more than $5 today" button inside the editor.

Here is how to add one using a free local proxy.

---

## What We Are Setting Up

Instead of Cursor talking straight to OpenAI or Anthropic, we will route its requests through a lightweight local controller running on your machine:

```
[ Cursor / Windsurf Editor ]
            │
            ▼  (localhost:8080)
┌────────────────────────────────────────┐
│           OstraOps Local Guard         │
│  - Tracks token spend in real-time     │
│  - Stops requests when limit is hit    │
│  - Prompts & code stay 100% private    │
└──────────────────┬─────────────────────┘
                   │
                   ▼
         [ Claude / GPT-4o / DeepSeek ]
```

---

## Step 1: Start Your Local Guard

Open your terminal (macOS, Windows, or Linux) and run:

```bash
npx ostraops-guard
```

You'll see a terminal message showing that your guard is running on:
`http://127.0.0.1:8080`

> **Note:** You don't need to create an account, log in, or enter a credit card. It runs entirely on your own computer.

---

## Step 2: Configure Cursor

1. Open **Cursor**.
2. Press `Cmd + ,` (on Mac) or `Ctrl + ,` (on Windows/Linux) to open **Settings**.
3. In the left sidebar, click on **Models** (or **AI Settings**).
4. Look for the **OpenAI API Key** or **Base URL** override field.
5. Set the **Base URL** to:
   ```
   http://127.0.0.1:8080/v1
   ```
6. Keep your normal API key in the API Key box.
7. Click **Save** or verify the connection.

---

## Step 3: Configure Windsurf

1. Open **Windsurf**.
2. Click the **Gear Icon** in the bottom left corner and select **Cascade Settings**.
3. Under **Model Provider Settings**, select **OpenAI Compatible**.
4. Set the **Endpoint URL** to:
   ```
   http://127.0.0.1:8080/v1
   ```
5. Enter your API key.
6. Done!

---

## Step 4: Configure VS Code (Cline or Continue Extension)

If you use the popular **Cline** or **Continue.dev** extension inside VS Code:

1. Open the extension panel.
2. Click the **Settings** icon.
3. Choose **OpenAI Compatible** or **Custom Provider**.
4. Set **Base URL** to `http://127.0.0.1:8080/v1`.
5. Enter your key.

---

## How It Works in Practice

Now, use your editor just like you always do:
- Ask Cursor to refactor a component.
- Let Cascade build a backend endpoint.
- Watch completions stream in with **zero noticeable latency** (under 1.5ms overhead).

Behind the scenes:
- Every token is calculated against the provider's exact rate card.
- If an agent gets stuck in a loop and your daily spending reaches your threshold (for example, $5.00), OstraOps intercepts the next request and sends a standard `HTTP 429: Daily Budget Exceeded` error.
- The editor stops cleanly. Your bank account is safe.

---

## What About Privacy?

This is the best part: **your code, file contents, and prompts never touch any third-party server.**

The local guard only inspects the token count returned in the response stream. It stores simple numbers in a local database on your machine. Nothing is logged, stored, or sent to the cloud.

---

## Pro-Tips for AI Editor Users

1. **Pick the right model for the job:**
   - For quick code explanations and simple edits, use fast, affordable models like `gpt-4o-mini` or `deepseek-chat`.
   - Save reasoning heavyweights like `claude-3-7-sonnet` or `o3-mini` for complex architecture and deep debugging.
2. **Close inactive chat threads:**
   - In Cursor and Windsurf, long chat threads send the entire conversation history with every new message. Starting a fresh thread when changing tasks can cut your token usage in half!
3. **Keep `npx ostraops-guard` in your startup terminal:**
   - Run it whenever you sit down to code, and enjoy AI superpowers with zero financial anxiety.
