"""
Insurance Claim Copilot — LangGraph agent.

The agent uses Claude as the LLM and exposes nine generative-UI tools.
Each tool corresponds to a frontend component registered via
``useCopilotAction``.  The CopilotKit SDK injects the frontend action
schemas into state under ``copilotkit.actions``; the agent calls them
exactly as it would any other LangChain tool, and the AG-UI stream
carries the tool-call events back to the browser where the matching
component renders.
"""

from __future__ import annotations

import os
from typing import Annotated, Any

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from typing_extensions import TypedDict

from prompts import SYSTEM_PROMPT

# ---------------------------------------------------------------------------
# State
# ---------------------------------------------------------------------------


class AgentState(TypedDict):
    """Minimal graph state — messages plus CopilotKit plumbing."""

    messages: Annotated[list[Any], add_messages]
    # CopilotKit injects frontend actions here at runtime.
    copilotkit: dict[str, Any]


# ---------------------------------------------------------------------------
# Tool definitions
#
# These are *backend stubs*.  Their signatures declare the parameter schema
# that the LLM must satisfy when it decides to render a UI component.
# The actual rendering happens in the browser via the matching
# ``useCopilotAction`` handler; the backend tools just return a success
# acknowledgement so LangGraph can continue the loop.
# ---------------------------------------------------------------------------


@tool("showClaimForm")
def show_claim_form(
    claimType: str,
    date: str,
    location: str,
    description: str,
    fields: list[dict[str, Any]],
) -> str:
    """Render a claim intake form pre-filled from the conversation.

    Args:
        claimType: Type of claim (e.g. "Auto Collision", "Water Damage",
            "Theft", "Medical").
        date: Incident date as a human-readable string (e.g. "May 8, 2026").
        location: Incident location extracted from the conversation.
        description: Narrative description of the incident, pre-filled from
            the user's message.
        fields: Dynamic form fields tailored to the claim type.  Each item
            must have ``name`` (str), ``type`` (str: "text" | "select" |
            "radio" | "date" | "textarea"), ``value`` (str), and optionally
            ``options`` (list[str]) for select/radio fields.
    """
    return "Claim form rendered successfully."


@tool("showDamageAssessment")
def show_damage_assessment(
    components: list[dict[str, Any]],
    totalEstimateMin: float,
    totalEstimateMax: float,
    verdict: str,
    vehicleValue: float | None = None,
) -> str:
    """Render a visual damage breakdown with severity bars and cost estimates.

    Args:
        components: List of damaged components.  Each item must have
            ``name`` (str), ``severity`` (str: "Minor" | "Moderate" |
            "Severe"), and ``estimatedCost`` (number).
        totalEstimateMin: Lower bound of the total repair estimate in USD.
        totalEstimateMax: Upper bound of the total repair estimate in USD.
        verdict: Assessment verdict (e.g. "Repairable", "Total Loss").
        vehicleValue: Current market value of the vehicle in USD, if
            applicable (omit for non-auto claims).
    """
    return "Damage assessment rendered successfully."


@tool("showCoverageAnalysis")
def show_coverage_analysis(
    policyNumber: str,
    coverages: list[dict[str, Any]],
    claimEstimate: float | None = None,
    deductible: float | None = None,
) -> str:
    """Render a policy coverage table matched against the current claim.

    Args:
        policyNumber: The user's policy identifier (e.g. "AUTO-2024-7829").
        coverages: List of coverage line items.  Each item must have
            ``name`` (str), ``covered`` (bool), ``limit`` (str), and
            ``deductible`` (str).
        claimEstimate: Mid-point damage estimate used to calculate the
            expected payout (optional).
        deductible: Dollar value of the applicable deductible (optional).
    """
    return "Coverage analysis rendered successfully."


@tool("showCostCalculator")
def show_cost_calculator(
    items: list[dict[str, Any]],
    deductible: float,
    notes: str | None = None,
) -> str:
    """Render an itemized cost and settlement calculator.

    Args:
        items: Line items for the cost breakdown.  Each item must have
            ``label`` (str) and ``amount`` (number, may be negative for
            deductions).
        deductible: The applicable deductible amount in USD.
        notes: Optional explanatory note displayed beneath the calculator
            (e.g. subrogation or depreciation explanation).
    """
    return "Cost calculator rendered successfully."


@tool("showDocumentChecklist")
def show_document_checklist(
    items: list[dict[str, Any]],
    progress: dict[str, Any],
) -> str:
    """Render the required-document checklist with completion status.

    Args:
        items: Required documents.  Each item must have ``name`` (str),
            ``status`` (str: "complete" | "pending"), ``source`` (str,
            e.g. "from chat" | "on file" | ""), and ``action`` (str,
            e.g. "Upload" | "Enter" | "").
        progress: Completion counters with ``completed`` (int) and
            ``total`` (int).
    """
    return "Document checklist rendered successfully."


@tool("showClaimTimeline")
def show_claim_timeline(
    claimNumber: str,
    stages: list[dict[str, Any]],
    estimatedResolution: str,
) -> str:
    """Render a claim progress tracker showing current stage and dates.

    Args:
        claimNumber: The claim reference number (e.g. "INS-2026-04821").
        stages: Ordered list of claim stages.  Each item must have
            ``name`` (str), ``date`` (str), ``status`` (str: "complete" |
            "in_progress" | "pending"), and ``details`` (str).
        estimatedResolution: Human-readable estimated resolution date range
            (e.g. "May 20 - May 27, 2026").
    """
    return "Claim timeline rendered successfully."


@tool("showSettlementOffer")
def show_settlement_offer(
    claimNumber: str,
    offeredAmount: float,
    claimValue: float,
    breakdown: list[dict[str, Any]],
    notes: str | None = None,
) -> str:
    """Render a settlement offer card with accept/counter options.

    Args:
        claimNumber: The claim reference number.
        offeredAmount: The insurer's offered settlement in USD.
        claimValue: The user's total claimed value in USD.
        breakdown: Line-item comparison.  Each item must have ``label``
            (str), ``offered`` (number), and ``claimed`` (number).
        notes: Optional warning or explanatory note (e.g. why the offer
            differs from the claimed amount).
    """
    return "Settlement offer rendered successfully."


@tool("showProviderFinder")
def show_provider_finder(
    providers: list[dict[str, Any]],
    claimType: str,
) -> str:
    """Render a list of nearby in-network repair shops or medical providers.

    Args:
        providers: List of recommended providers.  Each item must have
            ``name`` (str), ``rating`` (number), ``distance`` (str),
            ``inNetwork`` (bool), and ``estimatedDays`` (int).
        claimType: Category of providers to show (e.g. "auto", "medical",
            "home").
    """
    return "Provider finder rendered successfully."


@tool("showClaimSummary")
def show_claim_summary(
    claimType: str,
    date: str,
    location: str,
    policyNumber: str,
    faultParty: str,
    damages: str,
    estimatedRange: str,
    coverageType: str,
    deductible: float,
    expectedPayout: str,
    documentsProvided: int,
    documentsTotal: int,
    missingDocuments: list[str],
) -> str:
    """Render the final claim summary for review before submission.

    Args:
        claimType: Type of claim (e.g. "Auto Collision").
        date: Incident date.
        location: Incident location.
        policyNumber: The user's policy identifier.
        faultParty: Who is at fault (e.g. "Other party", "Self", "Unknown").
        damages: Short textual description of damages.
        estimatedRange: Human-readable estimate range (e.g. "$3,250 - $4,400").
        coverageType: Applicable coverage line (e.g. "Collision — $500 deductible").
        deductible: Applicable deductible in USD.
        expectedPayout: Human-readable expected payout range.
        documentsProvided: Number of documents already provided.
        documentsTotal: Total number of required documents.
        missingDocuments: List of document names still outstanding.
    """
    return "Claim summary rendered successfully."


# ---------------------------------------------------------------------------
# Tool registry
# ---------------------------------------------------------------------------

TOOLS: list[Any] = [
    show_claim_form,
    show_damage_assessment,
    show_coverage_analysis,
    show_cost_calculator,
    show_document_checklist,
    show_claim_timeline,
    show_settlement_offer,
    show_provider_finder,
    show_claim_summary,
]

# ---------------------------------------------------------------------------
# LLM
# ---------------------------------------------------------------------------


def _build_llm() -> ChatGoogleGenerativeAI:
    """Instantiate the Gemini model bound to the UI tools."""
    model = ChatGoogleGenerativeAI(
        model="gemini-1.5-pro",
        google_api_key=os.environ.get("GOOGLE_API_KEY", ""),
        max_tokens=4096,
    )
    return model.bind_tools(TOOLS)


# ---------------------------------------------------------------------------
# Graph nodes
# ---------------------------------------------------------------------------


def call_model(state: AgentState) -> dict[str, Any]:
    """Invoke Claude with the system prompt and the current message history.

    CopilotKit may inject additional frontend-registered actions into
    ``state["copilotkit"]["actions"]`` at runtime.  Those are already
    merged into the tool list by the AG-UI framework before this node
    runs, so we only need to prepend the system prompt and call the LLM.
    """
    llm = _build_llm()
    system = SystemMessage(content=SYSTEM_PROMPT)
    response = llm.invoke([system, *state["messages"]])
    return {"messages": [response]}


# ---------------------------------------------------------------------------
# Graph assembly
# ---------------------------------------------------------------------------


def _build_graph() -> Any:
    """Compile the LangGraph state machine."""
    builder: StateGraph = StateGraph(AgentState)

    builder.add_node("agent", call_model)
    builder.add_node("tools", ToolNode(TOOLS))

    builder.add_edge(START, "agent")
    builder.add_conditional_edges("agent", tools_condition)
    builder.add_edge("tools", "agent")

    return builder.compile()


graph = _build_graph()
