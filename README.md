# Weekly Growth Intelligence Agent

Fully automated AI agent that monitors GA4 channel performance weekly,
detects anomalies, generates a plain-English brief, and updates a live dashboard.
Zero manual work after setup.

## What It Does

Every Monday at 8am it automatically:
- Pulls unsampled GA4 purchase data directly from BigQuery
- Calculates week-over-week change per channel
- Flags anomalies above 20% threshold
- Identifies last complete week vs partial week dynamically
- Sends a structured AI brief via Gmail
- Updates a live Looker Studio dashboard via Google Sheets

## Architecture
Schedule → BigQuery → Code → Split Out → Clear Sheet → Append Row → Looker Studio

↓

HTTP Request (Groq LLM) → Gmail

## Stack

| Tool | Purpose |
|---|---|
| BigQuery | Unsampled GA4 raw event data |
| n8n self-hosted on Docker | Workflow automation |
| Groq API — Llama 3.3 70B | AI brief generation |
| Google Sheets | Structured data storage layer |
| Looker Studio | Live stakeholder dashboard |
| Gmail SMTP | Automated email delivery |

## Key Design Decisions

**run_id on every execution**
Every Sheet row and every email are traceable to the same pipeline run.
No data discrepancy possible between dashboard and email.

**Sheet clears before each write**
Prevents duplicate rows from accumulating across runs.
Dashboard always reflects exactly one execution — never stale or doubled data.

**Dynamic week detection**
The AI identifies the last complete week from the data itself.
No hardcoded dates or week numbers anywhere in the pipeline.

**Temperature 0.3**
Lower temperature means the AI sticks to the data provided.
Never invents or estimates numbers.

**Groq over Gemini**
14,400 free requests per day vs Gemini's 5 per minute free tier limit.
No rate limit failures in production.

## Sample Output
📈 CHANNEL SNAPSHOT · WEEK 4 (2021-01-25)

Other    → 180 purchases  |  +1.1%  ↑
Organic  → 86 purchases   |  -25.9% ↓  ⚠️ ANOMALY
Direct   → 84 purchases   |  +23.5% ↑  ⚠️ ANOMALY
Paid     → 10 purchases   |  -9.1%  ↓

Top Anomaly: Organic -25.9% (116 → 86 purchases)

Week 5 flagged as partial — excluded from decisions

## Files

| File | Purpose |
|---|---|
| `README.md` | This file |
| `code_node.js` | Anomaly detection and week classification logic |
| `groq_prompt.md` | Full AI prompt for brief generation |
| `bigquery_query.sql` | GA4 SQL query running inside BigQuery node |
| `weekly_growth_agent.png` | n8n Agent workflow |
| `weekly_growth_dashboard.png` | Sample Looker Studio dashboard |
