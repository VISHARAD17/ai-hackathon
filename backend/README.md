# Insurance Claim Copilot — Backend

Python FastAPI backend powering the Insurance Claim Copilot.  The agent uses
Claude (Anthropic) via LangGraph and streams AG-UI events to the Next.js
frontend through the CopilotKit SDK.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Copy `.env` and fill in your Anthropic key:

```bash
cp .env .env.local          # optional — .env is already gitignored
# edit ANTHROPIC_API_KEY in .env
```

## Run

```bash
cd backend && source .venv/bin/activate && uvicorn main:app --port 8000 --reload
```

The AG-UI SSE endpoint is available at `http://localhost:8000/copilotkit`.
The health probe is at `http://localhost:8000/health`.
