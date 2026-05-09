# NDA Copilot — Hackathon Build Guide

**Event:** Generative UI Global Hackathon (May 9, 2026)
**Time budget:** 6 hours
**Stack:** CopilotKit + AG-UI + Python

---

## What We're Building

An AI agent that analyzes contracts/NDAs and **renders interactive UI components that trigger more UI components**. Upload a PDF. The agent generates a risk dashboard. Click a risky clause — the agent generates a deep-dive analysis. Click "Suggest fix" — the agent generates a redline editor. Click "Compare" — a comparison table appears. Every interaction spawns new generative UI.

The user never types a message. The entire contract review happens through clicking AI-generated interfaces.

### Why It Wins

- **Not a chatbot** — the agent's output IS the interface
- **Not one-way** — every generated component has actions that trigger more generative UI, creating a continuous loop
- **Uses the hackathon's featured stack** — CopilotKit + AG-UI
- **Solves a real problem** — nobody reads NDAs; this makes contracts navigable
- **Visually striking** — dashboard builds piece by piece, then responds to clicks
- **Zero typing required** — the demo is entirely click-driven

### The Interaction Loop

This is what separates this from a chatbot:

```
Upload PDF
  → Agent renders Risk Dashboard
    → Click a HIGH risk clause
      → Agent renders Clause Deep Dive card
        → Click "Suggest Fix"
          → Agent renders Redline Editor
            → Click "Accept suggestion"
              → Agent renders Updated Risk Score
        → Click "Compare to Standard"
          → Agent renders Comparison Table
    → Click "View Obligations"
      → Agent renders Obligation Timeline
        → Click an obligation
          → Agent renders Consequence Breakdown
  → Click "Ready to Decide"
    → Agent renders Approval Flow (Sign / Negotiate / Reject)
      → Click "Negotiate"
        → Agent renders Negotiation Form with all flagged clauses
          → Submit
            → Agent renders Negotiation Summary
```

Every leaf is a new generative UI component. The agent decides what to render based on what the user clicks.

---

## System Architecture

```
┌──────────────────────────────────────────────────────┐
│                  Frontend (Next.js)                   │
│                                                       │
│  ┌──────────┐  ┌─────────────────────────────────┐   │
│  │PDF Upload │  │       CopilotKit                │   │
│  │drag+drop  │  │  Generative UI Renderer         │   │
│  │           │  │                                  │   │
│  │           │  │  Each rendered component has     │   │
│  │           │  │  onClick handlers that send      │   │
│  │           │  │  messages back to the agent      │   │
│  │           │  │  → agent renders NEW components  │   │
│  └─────┬─────┘  └────────────┬────────────────────┘   │
│        │                     │                        │
│        └─────────┬───────────┘                        │
│                  ▼                                     │
│  ┌───────────────────────────────────────────────┐    │
│  │         CopilotKit Runtime (API route)         │    │
│  │         /api/copilotkit → Python backend       │    │
│  └───────────────────────┬───────────────────────┘    │
└──────────────────────────┼────────────────────────────┘
                           │ AG-UI SSE stream
                           ▼
┌──────────────────────────────────────────────────────┐
│                Backend (Python FastAPI)                │
│                                                       │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │PDF Parser │  │  LLM Client  │  │ 10+ Tool/      │  │
│  │PyMuPDF    │  │  Claude API  │  │ Action Defs    │  │
│  └──────────┘  └──────────────┘  └────────────────┘  │
│                                                       │
│  ┌────────────────────────────────────────────────┐   │
│  │  CopilotKit Python SDK (AG-UI event emission)  │   │
│  └────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Tech | Package |
|-------|------|---------|
| Frontend framework | Next.js 14+ (App Router) | `create-next-app` |
| Styling | Tailwind CSS | included with Next.js |
| Agent UI provider | CopilotKit | `@copilotkit/react-core` |
| Chat/sidebar UI | CopilotKit | `@copilotkit/react-ui` |
| Node runtime | CopilotKit | `@copilotkit/runtime` |
| Backend framework | FastAPI | `fastapi`, `uvicorn` |
| Agent SDK | CopilotKit Python | `copilotkit` |
| PDF parsing | PyMuPDF | `pymupdf` |
| LLM | Claude (Anthropic) | `anthropic` |

---

## Project Structure

```
nda-copilot/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx              # CopilotKit provider wrapper
│   │   │   ├── page.tsx                # Main page with PDF upload
│   │   │   └── api/
│   │   │       └── copilotkit/
│   │   │           └── route.ts        # CopilotRuntime → Python backend
│   │   ├── components/
│   │   │   ├── pdf-upload.tsx          # Drag-and-drop PDF upload
│   │   │   └── generative-ui/         # Components rendered by the agent
│   │   │       ├── contract-summary.tsx
│   │   │       ├── risk-scorecard.tsx
│   │   │       ├── key-terms-table.tsx
│   │   │       ├── clause-deep-dive.tsx
│   │   │       ├── red-flag-alert.tsx
│   │   │       ├── redline-editor.tsx
│   │   │       ├── obligation-timeline.tsx
│   │   │       ├── comparison-table.tsx
│   │   │       ├── consequence-card.tsx
│   │   │       └── approval-flow.tsx
│   │   └── hooks/
│   │       └── use-copilot-actions.tsx  # All useCopilotAction registrations
│   ├── package.json
│   └── tailwind.config.ts
├── backend/
│   ├── main.py                         # FastAPI app + CopilotKit endpoint
│   ├── agent.py                        # Agent logic + tool definitions
│   ├── pdf_parser.py                   # PDF extraction and clause splitting
│   ├── prompts.py                      # System prompts for the LLM
│   └── requirements.txt
└── sample-nda.pdf                      # Demo NDA for instant testing
```

---

## Data Flow

### 1. PDF Upload → Initial Dashboard

```
User drops PDF onto upload zone
  → POST /api/upload (Next.js route)
  → Forward to Python backend /parse-pdf
  → PyMuPDF extracts: parties, date, sections, clauses, full text
  → Parsed contract stored in CopilotKit readable state
  → Agent auto-triggers, emits ToolCalls in sequence:
     1. showContractSummary  → metadata card (parties, date, page count)
     2. showRiskScorecard    → overall + per-clause risk bars
     3. showKeyTermsTable    → obligations, deadlines, penalties
     4. showRedFlagAlerts    → dangerous clauses with action buttons
  → User sees interactive dashboard build up in the sidebar
```

### 2. Click-Driven Interaction Loop

```
User clicks [a risk bar] on the Risk Scorecard
  → onClick sends message to agent: "User wants details on clause: Non-Compete"
  → Agent emits showClauseDeepDive tool call
  → Frontend renders Clause Deep Dive card with buttons:
     [Suggest Fix]  [Compare to Standard]  [Show Consequences]

User clicks [Suggest Fix]
  → onClick sends: "User wants a fix suggestion for: Non-Compete"
  → Agent emits showRedlineEditor tool call
  → Frontend renders Redline Editor with:
     - Current text (readonly)
     - Suggested text (editable)
     - [Accept] [Modify] [Skip] buttons

User clicks [Accept]
  → onClick sends: "User accepted redline for: Non-Compete"
  → Agent emits showRiskScorecard (updated scores reflecting the fix)
```

### 3. Approval Flow

```
User clicks [Ready to Decide] (shown after reviewing flags)
  → Agent emits showApprovalFlow
  → Three buttons: [Sign As-Is]  [Negotiate]  [Walk Away]

User clicks [Negotiate]
  → Agent emits showNegotiationForm with all flagged clauses
  → Each clause shows: current text, suggested change, priority
  → User checks/unchecks which suggestions to include
  → User clicks [Generate Negotiation Letter]
  → Agent emits showNegotiationSummary with formatted letter
```

---

## Generative UI Components (10 total)

Each component is registered via `useCopilotAction` with a `render` function. The agent calls them as tools. **Every component has clickable actions that send messages back to the agent**, creating the interaction loop.

### 1. Contract Summary

```
┌─────────────────────────────────────────────┐
│  📄 Contract Loaded                         │
│                                              │
│  Parties:  Acme Corp ↔ Jane Doe             │
│  Type:     Non-Disclosure Agreement          │
│  Date:     March 15, 2026                    │
│  Pages:    8                                 │
│  Sections: 12                                │
│                                              │
│  [Analyze Now]  ← triggers full analysis     │
└─────────────────────────────────────────────┘
```

**Actions:** [Analyze Now] → triggers agent to emit scorecard + terms + flags

### 2. Risk Scorecard

```
┌─────────────────────────────────────────────┐
│  Overall Risk: ██████████░░ HIGH (7/10)     │
│                                              │
│  ▸ Confidentiality  ████░░░░░░  LOW    [→]  │
│  ▸ Non-compete      █████████░  HIGH   [→]  │
│  ▸ IP Assignment    ████████░░  HIGH   [→]  │
│  ▸ Liability        ██████░░░░  MEDIUM [→]  │
│  ▸ Termination      ███░░░░░░░  LOW    [→]  │
│                                              │
│  Click any clause to dive deeper             │
└─────────────────────────────────────────────┘
```

**Actions:** Click any row [→] → sends "User wants details on clause: {name}" → agent renders Clause Deep Dive

### 3. Key Terms Table

```
┌────────────────┬───────────────┬──────────┬──────────┐
│ Obligation     │ Deadline      │ Penalty  │ Risk     │
├────────────────┼───────────────┼──────────┼──────────┤
│ Non-disclosure │ 3 years       │ $50,000  │ ● MED    │
│ Non-compete    │ 2 years       │ Damages  │ ● HIGH   │
│ IP transfer    │ Immediate     │ —        │ ● HIGH   │
│ Return docs    │ 30 days       │ —        │ ● LOW    │
├────────────────┴───────────────┴──────────┴──────────┤
│         [View Timeline]  [Compare All]               │
└──────────────────────────────────────────────────────┘
```

**Actions:**
- Click any row → agent renders Clause Deep Dive for that term
- [View Timeline] → agent renders Obligation Timeline
- [Compare All] → agent renders Comparison Table

### 4. Red Flag Alerts

```
┌─────────────────────────────────────────────┐
│  🔴 CRITICAL: Unlimited liability           │
│     Section 8.2 — no cap on damages         │
│     [Deep Dive]  [Suggest Fix]              │
│                                              │
│  🟡 WARNING: Broad IP assignment            │
│     Section 5.1 — includes pre-existing IP  │
│     [Deep Dive]  [Suggest Fix]              │
│                                              │
│  🟡 WARNING: Non-compete scope              │
│     Section 4.1 — 50 mile radius, 2 years   │
│     [Deep Dive]  [Suggest Fix]              │
│                                              │
│  ────────────────────────────────────────    │
│  [Fix All Critical]  [Ready to Decide]      │
└─────────────────────────────────────────────┘
```

**Actions:**
- [Deep Dive] → agent renders Clause Deep Dive
- [Suggest Fix] → agent renders Redline Editor for that clause
- [Fix All Critical] → agent renders Redline Editor with all critical clauses batched
- [Ready to Decide] → agent renders Approval Flow

### 5. Clause Deep Dive

```
┌─────────────────────────────────────────────┐
│  Section 4: Non-Compete Clause    ● HIGH    │
│                                              │
│  ┌─ Original Text ─────────────────────┐    │
│  │ "Employee shall not engage in any    │    │
│  │  competing business within a radius  │    │
│  │  of 50 miles for a period of two     │    │
│  │  years following termination..."     │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌─ Plain English ─────────────────────┐    │
│  │ You can't work for a competitor     │    │
│  │ within 50 miles for 2 years after   │    │
│  │ leaving. This is aggressive — most  │    │
│  │ NDAs use 1 year and 25 miles.       │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ⚠ Why it's risky: Geographic scope is     │
│    2x industry standard. Duration is at     │
│    the upper end of enforceable range.      │
│                                              │
│  [Suggest Fix]  [Compare to Standard]       │
│  [Show Consequences]  [Back to Dashboard]   │
└─────────────────────────────────────────────┘
```

**Actions:**
- [Suggest Fix] → agent renders Redline Editor
- [Compare to Standard] → agent renders Comparison Table (this clause vs standard)
- [Show Consequences] → agent renders Consequence Card
- [Back to Dashboard] → agent re-renders Risk Scorecard

### 6. Redline Editor

```
┌─────────────────────────────────────────────┐
│  ✏️ Suggested Redline: Non-Compete          │
│                                              │
│  ┌─ Current ───────────────────────────┐    │
│  │ "...within a radius of 50 miles     │    │
│  │  for a period of two years..."      │    │
│  └──────────────────────────────────────┘    │
│           ↓                                  │
│  ┌─ Suggested ─────────────────────────┐    │
│  │ "...within a radius of 25 miles     │    │
│  │  for a period of one year..."       │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  Rationale: Reduces geographic scope to     │
│  industry standard and halves duration.     │
│  Maintains employer protection while being  │
│  more likely to be enforceable in court.    │
│                                              │
│  [Accept] [Modify Suggestion] [Skip]        │
└─────────────────────────────────────────────┘
```

**Actions:**
- [Accept] → agent re-renders Risk Scorecard with updated score
- [Modify Suggestion] → input field appears, user edits, submit triggers agent to re-evaluate
- [Skip] → returns to Red Flag Alerts

### 7. Obligation Timeline

```
┌─────────────────────────────────────────────┐
│  📅 Your Obligations Over Time              │
│                                              │
│  Signing    30d      6mo      2yr      3yr  │
│  ──┼────────┼────────┼────────┼────────┼──  │
│    │        │        │        │        │    │
│    ◆        ◆        ◆        ◆        ◆    │
│    IP       Return   Review   Non-     NDA  │
│    transfer docs     period   compete  ends │
│    ● HIGH   ● LOW    ● LOW    ● HIGH   ● —  │
│                                              │
│  Click any event for details                 │
└─────────────────────────────────────────────┘
```

**Actions:** Click any event node → agent renders Clause Deep Dive for that obligation

### 8. Comparison Table

```
┌─────────────────────────────────────────────┐
│  📊 This NDA vs Industry Standard           │
│                                              │
│  Clause       │ This NDA      │ Standard    │
│  ─────────────┼───────────────┼─────────────│
│  Non-compete  │ 2yr / 50mi  🔴│ 1yr / 25mi │
│  NDA term     │ 3 years     🟡│ 2 years    │
│  Liability    │ Unlimited   🔴│ Capped 2x  │
│  IP scope     │ All work    🟡│ Work product│
│  Conf. period │ 5 years     🟢│ 5 years    │
│                                              │
│  🔴 Unfavorable  🟡 Caution  🟢 Standard   │
│                                              │
│  [Fix Unfavorable Clauses]                   │
└─────────────────────────────────────────────┘
```

**Actions:** [Fix Unfavorable Clauses] → agent renders batched Redline Editor for all red items

### 9. Consequence Card

```
┌─────────────────────────────────────────────┐
│  ⚡ What happens if you breach: Non-Compete │
│                                              │
│  Immediate:                                  │
│    → Injunctive relief (court order to stop) │
│    → Employer can seek damages               │
│                                              │
│  Financial exposure:                         │
│    → Lost profits claim (uncapped)           │
│    → Legal fees (both sides)                 │
│    → Potential liquidated damages             │
│                                              │
│  Enforceability:                             │
│    → 50-mile radius: likely enforceable      │
│    → 2-year term: at the edge, varies by     │
│      state. California: unenforceable.       │
│                                              │
│  [Suggest Fix]  [Back to Clause]             │
└─────────────────────────────────────────────┘
```

**Actions:** [Suggest Fix] → Redline Editor, [Back to Clause] → Clause Deep Dive

### 10. Approval Flow + Negotiation

```
┌─────────────────────────────────────────────┐
│  ✅ Ready to Decide                         │
│                                              │
│  Risk Summary:                               │
│    2 critical issues (fixed 1 of 2)          │
│    3 warnings (addressed 2 of 3)            │
│    Score improved: 7/10 → 4/10              │
│                                              │
│  [Sign As-Is]  [Negotiate]  [Walk Away]     │
│                                              │
│ ─── [Negotiate pressed] ────────────────     │
│                                              │
│  ☐ Non-compete: 50mi → 25mi, 2yr → 1yr     │
│  ☑ Liability: Unlimited → Capped at 2x     │
│  ☐ IP scope: All work → Work product only   │
│                                              │
│  [Generate Negotiation Letter]               │
│                                              │
│ ─── [Generated] ────────────────────────     │
│                                              │
│  "Dear Acme Corp,                            │
│   After reviewing the NDA dated March 15,   │
│   we propose the following amendments..."   │
│                                              │
│  [Copy to Clipboard]  [Start Over]          │
└─────────────────────────────────────────────┘
```

**Actions:** Full multi-step flow — each button triggers the next stage of generative UI.

---

## Implementation — Phase by Phase

### Phase 0: Scaffolding (30 min)

**Frontend:**

```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --use-pnpm
cd frontend
pnpm add @copilotkit/react-core @copilotkit/react-ui @copilotkit/runtime
```

**Backend:**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install copilotkit fastapi uvicorn pymupdf anthropic
```

**Wire the connection:**

`frontend/src/app/api/copilotkit/route.ts`:
```typescript
import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterHandler,
} from "@copilotkit/runtime";

const runtime = new CopilotRuntime({
  remoteEndpoints: [
    { url: process.env.AGENT_URL || "http://localhost:8000/copilotkit" },
  ],
});

export const POST = copilotRuntimeNextJSAppRouterHandler({ runtime });
```

`frontend/src/app/layout.tsx`:
```tsx
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CopilotKit runtimeUrl="/api/copilotkit">
          <CopilotSidebar
            defaultOpen={true}
            labels={{
              title: "NDA Copilot",
              placeholder: "Ask about your contract...",
            }}
          >
            {children}
          </CopilotSidebar>
        </CopilotKit>
      </body>
    </html>
  );
}
```

`backend/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from copilotkit import CopilotKitSDK, LangGraphAgent
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from agent import graph

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sdk = CopilotKitSDK(
    agents=[
        LangGraphAgent(
            name="nda_copilot",
            description="Analyzes contracts and renders interactive UI",
            graph=graph,
        )
    ]
)

add_fastapi_endpoint(app, sdk, "/copilotkit")
```

**Verify:** Start both servers, send a test message, confirm connection works.

---

### Phase 1: PDF Ingestion (45 min)

**`backend/pdf_parser.py`:**
```python
import fitz  # PyMuPDF

def parse_pdf(pdf_bytes: bytes) -> dict:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    doc.close()

    return {
        "full_text": full_text,
        "page_count": len(doc),
        "char_count": len(full_text),
    }
```

**Frontend:** Drag-and-drop upload component. On drop, POST the file to `/api/upload`, which forwards to Python backend `/parse-pdf`. Result stored in CopilotKit readable state via `useCopilotReadable`. Agent auto-triggers and emits `showContractSummary`.

**The Contract Summary card includes an [Analyze Now] button** — this is the first interaction. Clicking it triggers the agent to emit the full dashboard (scorecard + terms + flags).

---

### Phase 2: Interactive Dashboard (90 min) — THE KEY PHASE

This phase builds the core interaction loop. Every component has clickable actions.

**How the click-to-agent loop works:**

```tsx
// Inside a generative UI component's render function
function RiskScorecard({ clauses, onAction }) {
  const { append } = useCopilotChat();

  const handleClauseClick = (clauseName: string) => {
    // Send a message to the agent as if the user typed it
    append({ role: "user", content: `Show me details for clause: ${clauseName}` });
  };

  return (
    <div>
      {clauses.map(clause => (
        <div key={clause.name} onClick={() => handleClauseClick(clause.name)}>
          {clause.name} — {clause.riskLevel}
          <button>→</button>
        </div>
      ))}
    </div>
  );
}
```

The pattern: **onClick → append message to chat → agent processes → agent emits new ToolCall → new component renders**.

The chat sidebar becomes a living document of generated UI components, each one interactive.

**Register all 10 actions in `use-copilot-actions.tsx`:**

```tsx
// 1. Contract Summary
useCopilotAction({
  name: "showContractSummary",
  description: "Show contract metadata after PDF upload",
  parameters: [
    { name: "parties", type: "string[]" },
    { name: "contractType", type: "string" },
    { name: "date", type: "string" },
    { name: "pageCount", type: "number" },
    { name: "sectionCount", type: "number" },
  ],
  render({ args, status }) {
    return <ContractSummary {...args} loading={status === "inProgress"} />;
  },
});

// 2. Risk Scorecard (clickable rows)
useCopilotAction({
  name: "showRiskScorecard",
  description: "Show overall and per-clause risk with clickable drill-down",
  parameters: [
    { name: "overallScore", type: "number" },
    { name: "overallRisk", type: "string" },
    { name: "clauses", type: "object[]" },
  ],
  render({ args, status }) {
    return <RiskScorecard {...args} loading={status === "inProgress"} />;
  },
});

// 3. Key Terms Table (clickable rows + action buttons)
useCopilotAction({
  name: "showKeyTermsTable",
  description: "Show obligations, deadlines, penalties in sortable table",
  parameters: [
    { name: "terms", type: "object[]" },
  ],
  render({ args, status }) {
    return <KeyTermsTable terms={args.terms} loading={status === "inProgress"} />;
  },
});

// 4. Red Flag Alerts (with Deep Dive + Suggest Fix buttons)
useCopilotAction({
  name: "showRedFlagAlerts",
  description: "Show dangerous clauses with action buttons",
  parameters: [
    { name: "flags", type: "object[]" },
  ],
  render({ args, status }) {
    return <RedFlagAlerts flags={args.flags} loading={status === "inProgress"} />;
  },
});

// 5. Clause Deep Dive (triggered by clicking a clause anywhere)
useCopilotAction({
  name: "showClauseDeepDive",
  description: "Show detailed analysis of a specific clause",
  parameters: [
    { name: "sectionNumber", type: "string" },
    { name: "title", type: "string" },
    { name: "originalText", type: "string" },
    { name: "plainEnglish", type: "string" },
    { name: "riskExplanation", type: "string" },
    { name: "riskLevel", type: "string" },
  ],
  render({ args, status }) {
    return <ClauseDeepDive {...args} loading={status === "inProgress"} />;
  },
});

// 6. Redline Editor (triggered by "Suggest Fix")
useCopilotAction({
  name: "showRedlineEditor",
  description: "Show current vs suggested text with accept/modify/skip",
  parameters: [
    { name: "clauseTitle", type: "string" },
    { name: "currentText", type: "string" },
    { name: "suggestedText", type: "string" },
    { name: "rationale", type: "string" },
  ],
  render({ args, status }) {
    return <RedlineEditor {...args} loading={status === "inProgress"} />;
  },
});

// 7. Obligation Timeline (clickable events)
useCopilotAction({
  name: "showObligationTimeline",
  description: "Show obligations on a timeline with clickable events",
  parameters: [
    { name: "events", type: "object[]" },
  ],
  render({ args, status }) {
    return <ObligationTimeline events={args.events} loading={status === "inProgress"} />;
  },
});

// 8. Comparison Table (with Fix Unfavorable button)
useCopilotAction({
  name: "showComparisonTable",
  description: "Compare this NDA clauses against industry standard",
  parameters: [
    { name: "rows", type: "object[]" },
  ],
  render({ args, status }) {
    return <ComparisonTable rows={args.rows} loading={status === "inProgress"} />;
  },
});

// 9. Consequence Card
useCopilotAction({
  name: "showConsequenceCard",
  description: "Show what happens if a specific clause is breached",
  parameters: [
    { name: "clauseTitle", type: "string" },
    { name: "immediate", type: "string[]" },
    { name: "financial", type: "string[]" },
    { name: "enforceability", type: "string" },
  ],
  render({ args, status }) {
    return <ConsequenceCard {...args} loading={status === "inProgress"} />;
  },
});

// 10. Approval Flow
useCopilotAction({
  name: "showApprovalFlow",
  description: "Show sign/negotiate/reject decision with negotiation form",
  parameters: [
    { name: "riskSummary", type: "string" },
    { name: "originalScore", type: "number" },
    { name: "currentScore", type: "number" },
    { name: "pendingRedlines", type: "object[]" },
  ],
  render({ args, status }) {
    return <ApprovalFlow {...args} loading={status === "inProgress"} />;
  },
});
```

**Agent system prompt** (`backend/prompts.py`):
```
You are an NDA analysis agent. You NEVER respond with plain text.
You ALWAYS call a tool to render interactive UI.

## On PDF upload:
Call these tools in sequence:
1. showContractSummary — basic metadata
2. showRiskScorecard — per-clause risk scores
3. showKeyTermsTable — obligations and deadlines
4. showRedFlagAlerts — dangerous clauses with action buttons

## On user interaction (clicks come as messages):
Parse what the user clicked and respond with the right tool:

- "Show me details for clause: X" → showClauseDeepDive
- "Suggest a fix for: X" → showRedlineEditor
- "Compare X to standard" → showComparisonTable
- "Show consequences for: X" → showConsequenceCard
- "Show obligation timeline" → showObligationTimeline
- "User accepted redline for: X" → showRiskScorecard (with updated scores)
- "User wants to decide" → showApprovalFlow
- "User chose to negotiate" → showApprovalFlow (with negotiation form data)
- "Fix all critical clauses" → showRedlineEditor (batch all critical)
- "Fix all unfavorable clauses" → showRedlineEditor (batch all unfavorable)

## Rules:
- NEVER send a text-only response. ALWAYS use a tool.
- When showing updated risk scores after a fix, explain what changed.
- Keep plain English explanations jargon-free.
- Be specific about enforceability by jurisdiction when relevant.
```

---

### Phase 3: Deep Interactions (60 min)

With the dashboard and components built, this phase adds depth:

1. **Batch redline mode** — "Fix All Critical" renders a multi-clause redline editor
2. **Score updates** — After accepting a fix, risk scorecard re-renders with new scores and a delta indicator ("improved from 7/10 to 4/10")
3. **Comparison intelligence** — Comparison table shows not just this NDA vs standard, but explains WHY certain clauses deviate
4. **Consequence chains** — Clicking a consequence can show related clauses that compound the risk
5. **Navigation breadcrumbs** — Each deep-dive component shows where you came from and offers [Back] buttons

---

### Phase 4: Approval + Negotiation Flow (45 min)

The climax of the demo. Build the multi-step negotiation:

1. **Decision gate** — Approval Flow shows a summary of all reviewed/fixed items with overall risk change
2. **Negotiation form** — Checkboxes for each suggested redline, user picks which to include
3. **Letter generation** — Agent generates a professional negotiation letter incorporating selected changes
4. **Copy to clipboard** — One-click export

---

### Phase 5: Polish + Demo Prep (30 min)

- **Typography:** Inter for UI, serif for original clause text (to distinguish legal language)
- **Color system:** Risk-based — emerald for low, amber for medium, rose for high, red for critical
- **Animations:** Components fade-in and slide-up as they render (Tailwind `animate-in`)
- **Loading states:** Skeleton shimmer while agent streams tool args
- **Sample NDA:** Include a pre-loaded one for instant demo (no file upload needed)
- **Empty state:** Beautiful landing with "Drop your NDA here" and a [Try Sample] button

---

## Environment Variables

```bash
# frontend/.env.local
AGENT_URL=http://localhost:8000/copilotkit

# backend/.env
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Run Commands

```bash
# Terminal 1: Backend
cd backend
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Frontend
cd frontend
pnpm dev
```

Open http://localhost:3000

---

## Demo Script (2 minutes)

**Key rule: never type a message. Everything is clicks.**

1. **Open** — show the clean landing page with "Drop your NDA here"
2. **Upload** — drag sample NDA → contract summary card appears → click [Analyze Now]
3. **Dashboard builds** — risk scorecard, key terms, red flags appear one by one (3 seconds each)
4. **Click a HIGH risk clause** on the scorecard → Clause Deep Dive renders with plain English + risk explanation
5. **Click [Suggest Fix]** → Redline Editor appears with current vs suggested text
6. **Click [Accept]** → Risk Scorecard re-renders with improved score (7/10 → 5/10)
7. **Click [Compare to Standard]** on another clause → Comparison Table shows this NDA vs industry standard
8. **Click [Ready to Decide]** → Approval Flow with risk summary
9. **Click [Negotiate]** → Negotiation form with checkboxes → click [Generate Letter]
10. **Closing line:** "I never typed a word. The AI built every screen I clicked through."

---

## Fallback Plans

| Risk | If it happens | Cut to |
|------|--------------|--------|
| CopilotKit + Python won't connect | Use CopilotKit's built-in JS runtime with OpenAI | Same generative UI, simpler backend |
| PDF parsing fails on complex NDAs | Use the sample NDA for demo, hardcode parsed output | Still a complete demo |
| Click-to-agent loop is flaky | Pre-define the click messages as buttons that directly trigger tools | Slightly less dynamic, same visual result |
| Running out of time | Phase 2 alone (4 dashboard components) is a strong submission | Skip phases 3-4 |
| LLM rate limits | Pre-cache analysis of the sample NDA | Static demo with one live example |
| Component rendering is slow | Pre-stream — show skeleton, fill progressively | Same UX, better perceived perf |

---

## Key CopilotKit API Reference

| API | What it does |
|-----|-------------|
| `<CopilotKit runtimeUrl="...">` | Provider — wraps app, connects to backend |
| `<CopilotSidebar>` | Chat UI that renders generative components inline |
| `useCopilotAction({ name, parameters, render })` | Register a generative UI component the agent can invoke |
| `useCopilotReadable({ description, value })` | Share app state with the agent (parsed contract) |
| `useCopilotChat()` | Programmatic control — `append()` sends messages from button clicks |
| `CopilotRuntime({ remoteEndpoints })` | Node runtime that proxies to Python agent |
| `copilotkit` (Python) | `CopilotKitSDK`, `LangGraphAgent`, `add_fastapi_endpoint` |

---

## Judging Criteria Alignment

| Criteria | How we hit it |
|----------|--------------|
| Generative UI | 10 distinct interactive components rendered by the agent |
| Not a chatbot | Zero typing required — entire flow is click-driven through generated UI |
| Two-way interaction | Every component has actions → agent → new components → actions → loop |
| Uses featured stack | CopilotKit + AG-UI protocol |
| Innovation | Click-driven contract navigation through AI-generated interfaces |
| Usefulness | Real problem: contract comprehension for non-lawyers |
| Demo quality | Progressive dashboard + drill-down is visually impressive |
| Completeness | Full flow: upload → analyze → drill down → fix → negotiate → export |
