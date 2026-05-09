"""
Insurance Claim Copilot — FastAPI entry point.

Wires the CopilotKit Python SDK to the LangGraph agent and mounts the
AG-UI SSE endpoint that the Next.js CopilotKit runtime proxies to.
"""

from __future__ import annotations

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load .env before any module that reads ANTHROPIC_API_KEY is imported.
load_dotenv()

from copilotkit import CopilotKitRemoteEndpoint, LangGraphAGUIAgent  # noqa: E402
from copilotkit.integrations.fastapi import add_fastapi_endpoint  # noqa: E402

from agent import graph  # noqa: E402

# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Insurance Claim Copilot",
    description="AI-powered insurance claim filing and management backend.",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS — allow the Next.js dev server to reach this API.
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# CopilotKit SDK
# ---------------------------------------------------------------------------

sdk = CopilotKitRemoteEndpoint(
    agents=[
        LangGraphAGUIAgent(
            name="insurance_copilot",
            description=(
                "Insurance claim copilot that renders interactive UI components "
                "for filing, tracking, and understanding insurance claims."
            ),
            graph=graph,
        )
    ]
)

add_fastapi_endpoint(app, sdk, "/copilotkit")

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@app.get("/health")
async def health() -> dict[str, str]:
    """Simple liveness probe."""
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Dev runner
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
