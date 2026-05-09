# Insurance Claim Copilot — Hackathon Build Guide

**Event:** Generative UI Global Hackathon (May 9, 2026)
**Time budget:** 6 hours
**Stack:** CopilotKit + AG-UI + Python

---

## What We're Building

An AI copilot for filing and managing insurance claims. The user describes what happened in natural language. The agent **responds with interactive UI** — not text. Claim forms, damage assessment cards, coverage analysis dashboards, document upload widgets, settlement calculators, and approval flows — all rendered dynamically by the agent based on the conversation.

### The Interaction Model

```
User: "I was in a car accident yesterday on Highway 101. The other driver ran a red light."

Agent renders:
  ┌─────────────────────────────────────────┐
  │  🚗 Auto Claim Form                    │
  │                                          │
  │  Incident Type:  [Vehicle Collision ▼]  │
  │  Date:           [2026-05-08       ]    │
  │  Location:       [Highway 101      ]    │
  │  Fault:          [Other Party      ▼]   │
  │  Police Report:  [○ Yes  ● No      ]   │
  │                                          │
  │  [Upload Photos]  [Continue →]          │
  └─────────────────────────────────────────┘

User: "Here are the photos of the damage" [uploads 3 images]

Agent renders:
  ┌─────────────────────────────────────────┐
  │  📋 Damage Assessment                   │
  │                                          │
  │  Front bumper   ████████░░  Severe      │
  │  Hood           ██████░░░░  Moderate    │
  │  Headlight (L)  █████████░  Severe      │
  │  Frame          ██░░░░░░░░  Minor       │
  │                                          │
  │  Estimated Repair: $4,200 - $5,800      │
  │  Recommendation:  Repairable            │
  │                                          │
  │  [View Coverage] [Get Estimates] [Next] │
  └─────────────────────────────────────────┘

User: "Am I covered for this?"

Agent renders:
  ┌─────────────────────────────────────────┐
  │  🛡️ Coverage Analysis                  │
  │                                          │
  │  Policy: AUTO-2024-7829                  │
  │                                          │
  │  Collision        ✅ Covered  $500 ded.  │
  │  Rental car       ✅ Covered  30 days    │
  │  Medical (you)    ✅ Covered  $50k max   │
  │  Medical (other)  ✅ Covered  liability  │
  │  Diminished value ❌ Not covered         │
  │                                          │
  │  Your out-of-pocket: ~$500 (deductible)  │
  │                                          │
  │  [File Claim Now]  [Estimate Breakdown]  │
  └─────────────────────────────────────────┘
```

The chat IS the interface. Every message from the agent is a rendered component.

### Why It Wins

- **Generative UI, not a chatbot** — the agent renders forms, dashboards, and calculators, not paragraphs
- **Natural conversation drives UI generation** — user describes their situation, agent builds the right interface
- **Real-world problem** — insurance claims are confusing, slow, and paper-heavy
- **Variety of UI types** — forms, tables, progress trackers, photo galleries, calculators, approval flows
- **Complete workflow** — incident → assessment → coverage → filing → tracking
- **Uses the featured stack** — CopilotKit + AG-UI

---

## System Architecture

```
┌──────────────────────────────────────────────────────┐
│                  Frontend (Next.js)                   │
│                                                       │
│  ┌───────────────────────────────────────────────┐   │
│  │             CopilotKit Sidebar                 │   │
│  │                                                │   │
│  │  User message → agent renders UI component     │   │
│  │  Component has inputs/buttons                  │   │
│  │  User fills/clicks → next message to agent     │   │
│  │  Agent renders next component                  │   │
│  │                                                │   │
│  │  Components: forms, cards, tables, charts,     │   │
│  │  progress bars, photo grids, calculators       │   │
│  └───────────────────────┬───────────────────────┘   │
│                          │                            │
│  ┌───────────────────────┴───────────────────────┐   │
│  │         CopilotKit Runtime (API route)         │   │
│  └───────────────────────┬───────────────────────┘   │
└──────────────────────────┼────────────────────────────┘
                           │ AG-UI SSE stream
                           ▼
┌──────────────────────────────────────────────────────┐
│                Backend (Python FastAPI)                │
│                                                       │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  Claim    │  │  LLM Client  │  │ Tool/Action    │  │
│  │  Logic    │  │  Claude API  │  │ Definitions    │  │
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
| Frontend | Next.js 14+ (App Router) | `create-next-app` |
| Styling | Tailwind CSS | included |
| Agent UI | CopilotKit | `@copilotkit/react-core`, `@copilotkit/react-ui` |
| Runtime | CopilotKit | `@copilotkit/runtime` |
| Backend | FastAPI | `fastapi`, `uvicorn` |
| Agent SDK | CopilotKit Python | `copilotkit` |
| LLM | Claude (Anthropic) | `anthropic` |

---

## Project Structure

```
insurance-copilot/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx              # CopilotKit provider
│   │   │   ├── page.tsx                # Landing + claim start
│   │   │   └── api/copilotkit/
│   │   │       └── route.ts            # Runtime → Python
│   │   ├── components/generative-ui/
│   │   │   ├── claim-form.tsx          # Dynamic claim intake form
│   │   │   ├── damage-assessment.tsx   # Visual damage breakdown
│   │   │   ├── coverage-analysis.tsx   # Policy coverage table
│   │   │   ├── cost-calculator.tsx     # Repair/medical cost estimate
│   │   │   ├── document-checklist.tsx  # Required docs with status
│   │   │   ├── claim-timeline.tsx      # Claim progress tracker
│   │   │   ├── settlement-offer.tsx    # Settlement with accept/counter
│   │   │   ├── provider-finder.tsx     # Nearby repair shops/doctors
│   │   │   └── claim-summary.tsx       # Final review before submit
│   │   └── hooks/
│   │       └── use-copilot-actions.tsx  # All action registrations
│   └── package.json
├── backend/
│   ├── main.py
│   ├── agent.py
│   ├── prompts.py
│   └── requirements.txt
└── README.md
```

---

## Generative UI Components (9 total)

### 1. Claim Intake Form

The agent generates this when the user describes an incident. Fields are pre-filled from the conversation.

```
┌─────────────────────────────────────────────┐
│  📝 New Claim                               │
│                                              │
│  Claim Type     [Auto Collision         ▼]  │
│  Date           [May 8, 2026            ]   │
│  Time           [3:45 PM                ]   │
│  Location       [Highway 101, San Jose  ]   │
│                                              │
│  Description (pre-filled from your message): │
│  ┌──────────────────────────────────────┐   │
│  │ Other driver ran red light at Hwy    │   │
│  │ 101 intersection. Impact to front    │   │
│  │ driver side. No injuries.            │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  Fault           [Other Party           ▼]  │
│  Injuries?       ○ Yes  ● No               │
│  Police report?  ● Yes  ○ No               │
│  Report #        [SJ-2026-04821         ]   │
│                                              │
│  [Save & Continue →]                        │
└─────────────────────────────────────────────┘
```

**Why it's generative:** The form fields, layout, and pre-filled values change based on the claim type. A water damage claim generates different fields than an auto collision. The agent decides what to show.

### 2. Damage Assessment

Rendered after the user describes or uploads photos of damage.

```
┌─────────────────────────────────────────────┐
│  🔍 Damage Assessment                       │
│                                              │
│  Component        Severity     Est. Cost    │
│  ───────────────  ──────────   ──────────   │
│  Front bumper     ████████░░   $1,200       │
│  Hood             ██████░░░░   $800         │
│  Left headlight   █████████░   $650         │
│  Radiator         ███░░░░░░░   $400         │
│  Frame check      ██░░░░░░░░   $200 (diag) │
│                                              │
│  ─────────────────────────────────────       │
│  Total Estimate:        $3,250 - $4,400     │
│  Verdict:               Repairable          │
│  vs. Vehicle Value:     $18,500             │
│                                              │
│  [Check My Coverage]  [Find Repair Shops]   │
└─────────────────────────────────────────────┘
```

### 3. Coverage Analysis

Rendered when the user asks about coverage or after damage assessment.

```
┌─────────────────────────────────────────────┐
│  🛡️ Your Coverage — Policy AUTO-7829       │
│                                              │
│  Coverage          Status    Limit    Ded.  │
│  ────────────────  ────────  ───────  ────  │
│  Collision         ✅ Yes    $50,000  $500  │
│  Comprehensive     ✅ Yes    $50,000  $250  │
│  Rental reimburse  ✅ Yes    $40/day  —     │
│  Medical (PIP)     ✅ Yes    $10,000  —     │
│  Uninsured motor.  ✅ Yes    $50,000  —     │
│  Diminished value  ❌ No     —        —     │
│                                              │
│  For this claim:                             │
│  ┌──────────────────────────────────────┐   │
│  │ Damage estimate:     $3,250 - $4,400│   │
│  │ Your deductible:     -$500          │   │
│  │ You pay:             $500           │   │
│  │ Insurance covers:    $2,750 - $3,900│   │
│  └──────────────────────────────────────┘   │
│                                              │
│  [File This Claim]  [Estimate Breakdown]    │
└─────────────────────────────────────────────┘
```

### 4. Cost Calculator

Interactive calculator that adjusts in real-time.

```
┌─────────────────────────────────────────────┐
│  💰 Settlement Calculator                   │
│                                              │
│  Repair costs         $3,800                │
│  Rental car (12 days) $480                  │
│  Medical expenses     $0                    │
│  Lost wages           $0                    │
│  ──────────────────── ──────                │
│  Total claim value    $4,280                │
│  Your deductible      -$500                 │
│  ──────────────────── ──────                │
│  Expected payout      $3,780                │
│                                              │
│  Deductible recovery: Since the other       │
│  party is at fault, your insurer may        │
│  pursue subrogation to recover your $500.   │
│                                              │
│  [Proceed to Filing]                        │
└─────────────────────────────────────────────┘
```

### 5. Document Checklist

Shows what documents are needed and their upload status.

```
┌─────────────────────────────────────────────┐
│  📎 Required Documents                      │
│                                              │
│  ✅ Incident description     (from chat)    │
│  ✅ Date and location         (from chat)    │
│  ☐  Photos of damage         [Upload]       │
│  ☐  Police report #          [Enter]        │
│  ☐  Other driver's info      [Enter]        │
│  ✅ Your policy number       (on file)      │
│  ☐  Repair estimate          [Upload]       │
│                                              │
│  Progress: ███████░░░░░ 3/7                 │
│                                              │
│  You can provide these now or add them      │
│  later. Claims process faster with more     │
│  documentation upfront.                      │
│                                              │
│  [Submit What I Have]  [Add More]           │
└─────────────────────────────────────────────┘
```

**Why it's generative:** Items auto-check as the user provides info through conversation. "The police report number is SJ-2026-04821" → agent re-renders checklist with that item checked.

### 6. Claim Timeline / Progress Tracker

```
┌─────────────────────────────────────────────┐
│  📊 Claim #INS-2026-04821 Status            │
│                                              │
│  ● Filed              May 9, 2026    ✅     │
│  │                                           │
│  ● Under Review       May 9, 2026    🔄     │
│  │  Assigned to: Claims Adj. Team B          │
│  │  Est. review time: 2-3 business days      │
│  │                                           │
│  ○ Adjuster Assigned   Pending              │
│  │                                           │
│  ○ Inspection          Pending              │
│  │                                           │
│  ○ Settlement Offer    Pending              │
│  │                                           │
│  ○ Resolution          Pending              │
│                                              │
│  Estimated resolution: May 20 - May 27      │
│                                              │
│  [Check for Updates]  [Contact Adjuster]    │
└─────────────────────────────────────────────┘
```

### 7. Settlement Offer

```
┌─────────────────────────────────────────────┐
│  💵 Settlement Offer                        │
│                                              │
│  Claim #INS-2026-04821                      │
│                                              │
│  Offered amount:        $3,650              │
│  Your claim value:      $4,280              │
│  Difference:            -$630               │
│                                              │
│  Breakdown:                                  │
│  Repair (approved)      $3,400  (vs $3,800) │
│  Rental                 $480   (full)       │
│  Deductible             -$500               │
│  Depreciation adj.      +$270               │
│                                              │
│  ⚠ The repair estimate was reduced by $400 │
│    because the adjuster used aftermarket    │
│    parts pricing.                            │
│                                              │
│  [Accept Offer]  [Counter]  [Explain More]  │
└─────────────────────────────────────────────┘
```

**Why it's generative:** If the user says "I want to counter," the agent renders a counter-offer form with pre-filled justification. If they say "Explain more," the agent renders a detailed breakdown card.

### 8. Provider Finder

```
┌─────────────────────────────────────────────┐
│  🔧 Recommended Repair Shops               │
│                                              │
│  1. Bay Area Auto Body        ⭐ 4.8        │
│     0.8 mi — In-network — Est. 5 days      │
│     [Select]                                │
│                                              │
│  2. Premium Collision Center  ⭐ 4.6        │
│     1.2 mi — In-network — Est. 7 days      │
│     [Select]                                │
│                                              │
│  3. Joe's Auto Repair        ⭐ 4.9        │
│     2.1 mi — Out-of-network — Est. 4 days  │
│     ⚠ Out-of-network may increase costs    │
│     [Select]                                │
│                                              │
│  [Show More]  [Skip for Now]                │
└─────────────────────────────────────────────┘
```

### 9. Claim Summary (Final Review)

```
┌─────────────────────────────────────────────┐
│  📋 Claim Summary — Ready to Submit         │
│                                              │
│  Type:        Auto Collision                 │
│  Date:        May 8, 2026                    │
│  Location:    Highway 101, San Jose          │
│  Policy:      AUTO-2024-7829                 │
│  Fault:       Other party                    │
│                                              │
│  Damages:                                    │
│    Front bumper, hood, left headlight        │
│    Estimated: $3,250 - $4,400               │
│                                              │
│  Coverage:                                   │
│    Collision — $500 deductible               │
│    Expected payout: $2,750 - $3,900         │
│                                              │
│  Documents: 5/7 provided                     │
│  Missing: repair estimate, other driver info │
│                                              │
│  [Submit Claim]  [Edit Details]  [Add Docs] │
└─────────────────────────────────────────────┘
```

---

## Conversation Flow Examples

The beauty of this approach: the user just talks naturally, and the agent picks the right component.

### Flow 1: New Claim Filing

```
User: "My basement flooded last night from a burst pipe"

→ Agent renders: Claim Form (pre-filled: type=Water Damage, date=yesterday)
   Different fields than auto! Shows: water source, affected rooms, etc.

User: "It affected the living room and basement. About 3 inches of standing water."

→ Agent renders: Damage Assessment (water damage variant)
   Shows: affected areas, estimated damage categories, mitigation steps

User: "Do I need to do anything right now?"

→ Agent renders: Emergency Checklist
   ✅ Stop water source (if possible)
   ✅ Document damage with photos
   ☐  Contact water mitigation company
   ☐  Don't throw anything away yet
   [Find Emergency Services Near You]

User: "What does my policy cover for this?"

→ Agent renders: Coverage Analysis (homeowners policy variant)
```

### Flow 2: Checking Existing Claim

```
User: "What's the status of my claim from last week?"

→ Agent renders: Claim Timeline (progress tracker with current stage)

User: "They offered me $3,650 but my estimate was higher"

→ Agent renders: Settlement Offer (with comparison to user's claim value)

User: "I want to counter"

→ Agent renders: Counter-Offer Form
   Pre-filled with difference justification, user can adjust amount and reasoning
```

### Flow 3: Understanding Coverage

```
User: "I'm about to sign a lease. What does my renter's insurance actually cover?"

→ Agent renders: Coverage Analysis (renter's policy variant)
   Shows all coverage categories with limits, deductibles, and real examples

User: "What if my laptop gets stolen from my car?"

→ Agent renders: Scenario Card
   Shows: covered or not, which policy applies, deductible, filing steps
```

---

## Implementation Phases

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
python3 -m venv .venv && source .venv/bin/activate
pip install copilotkit fastapi uvicorn anthropic
```

**Wire CopilotKit → Python agent** (same pattern as before):

`frontend/src/app/api/copilotkit/route.ts`:
```typescript
import { CopilotRuntime, copilotRuntimeNextJSAppRouterHandler } from "@copilotkit/runtime";

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CopilotKit runtimeUrl="/api/copilotkit">
          <CopilotSidebar
            defaultOpen={true}
            labels={{
              title: "Insurance Copilot",
              placeholder: "Describe what happened...",
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
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"],
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

sdk = CopilotKitSDK(agents=[
    LangGraphAgent(name="insurance_copilot",
                   description="Insurance claim agent that renders interactive UI",
                   graph=graph)
])
add_fastapi_endpoint(app, sdk, "/copilotkit")
```

---

### Phase 1: Claim Form + Damage Assessment (60 min)

Build the first two components and the agent logic to render them from conversation.

**Key pattern — all components follow this:**

```tsx
useCopilotAction({
  name: "showClaimForm",
  description: "Render a claim intake form pre-filled from conversation",
  parameters: [
    { name: "claimType", type: "string" },
    { name: "date", type: "string" },
    { name: "location", type: "string" },
    { name: "description", type: "string" },
    { name: "fields", type: "object[]", description: "Dynamic form fields based on claim type" },
  ],
  render({ args, status }) {
    return <ClaimForm {...args} loading={status === "inProgress"} />;
  },
});
```

**Agent prompt — the agent decides what to render:**

```
You are an insurance claim assistant. You respond ONLY by calling tools
that render UI components. NEVER respond with plain text paragraphs.

When a user describes an incident:
→ Call showClaimForm with fields pre-filled from their description.
  Choose form fields based on claim type:
  - Auto: date, location, fault, injuries, police report
  - Home/Water: date, source, affected areas, standing water depth
  - Theft: date, location, items taken, police report
  - Medical: date, provider, diagnosis, treatment

When damage is described:
→ Call showDamageAssessment with component-level breakdown.

When user asks about coverage:
→ Call showCoverageAnalysis with their policy details.

When user asks about costs:
→ Call showCostCalculator with itemized breakdown.

When user needs documents:
→ Call showDocumentChecklist with required items, auto-checking
  anything already provided in conversation.

When claim is ready:
→ Call showClaimSummary with all collected information.
```

---

### Phase 2: Coverage + Calculator + Checklist (60 min)

Build three more components. These are triggered by natural conversation:

- "Am I covered?" → `showCoverageAnalysis`
- "How much will this cost me?" → `showCostCalculator`
- "What documents do I need?" → `showDocumentChecklist`

The checklist is the most interactive — items auto-check as the user provides info through conversation. "My police report number is SJ-2026-04821" → agent calls `showDocumentChecklist` again with that item marked complete.

---

### Phase 3: Timeline + Settlement + Provider (60 min)

- `showClaimTimeline` — progress tracker for an existing claim
- `showSettlementOffer` — offer comparison with accept/counter options
- `showProviderFinder` — nearby repair shops or medical providers

The settlement flow is the demo climax: user says "I want to counter" → agent renders a counter-offer form.

---

### Phase 4: Claim Summary + Polish (60 min)

- `showClaimSummary` — final review aggregating everything before submit
- Visual polish: consistent color scheme, loading skeletons, animations
- Empty state: landing page with "Tell me what happened" and example prompts
- Multiple claim type demo: show auto AND water damage to prove the UI is truly generative (different forms for different situations)

---

### Phase 5: Demo Prep (30 min)

- Pre-load a demo scenario for instant walkthrough
- Test full flow end-to-end
- Prepare opening line for judges
- Record backup video if live demo fails

---

## Agent System Prompt

```
backend/prompts.py:

SYSTEM_PROMPT = """
You are an insurance claim copilot. Your job is to help users file,
track, and understand insurance claims.

## CRITICAL RULE
You NEVER respond with plain text. You ALWAYS call exactly one tool
to render a UI component. If you need to acknowledge something briefly,
still use a tool — use showClaimTimeline or showDocumentChecklist to
show updated state.

## When to use each tool:

showClaimForm — User describes a new incident. Pre-fill all fields you
can extract from their message. Choose fields based on claim type.

showDamageAssessment — User describes specific damage or uploads photos.
Break down by component with severity and cost estimates.

showCoverageAnalysis — User asks about coverage, policy, or what's
covered. Show their policy details matched against the claim.

showCostCalculator — User asks about costs, deductible, or expected
payout. Show itemized breakdown with deductible math.

showDocumentChecklist — User asks what's needed OR provides a piece
of information (police report #, driver info, etc). Re-render with
updated completion status.

showClaimTimeline — User asks about claim status, progress, or timeline.
Show current stage and estimated dates.

showSettlementOffer — When presenting or discussing a settlement amount.
Show comparison to claim value.

showProviderFinder — User asks for repair shops, doctors, or service
providers. Show nearby in-network options.

showClaimSummary — When the user is ready to review and submit.
Aggregate all information collected so far.

## Behavior:
- Extract as much info as possible from natural language
- Pre-fill forms — don't make users re-enter what they already said
- Be specific about dollar amounts and coverage limits
- When unsure about claim type, ask ONE clarifying question then render
- Use realistic but clearly demo data for coverage limits and estimates
"""
```

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
# Terminal 1
cd backend && source .venv/bin/activate && uvicorn main:app --port 8000 --reload

# Terminal 2
cd frontend && pnpm dev
```

---

## Demo Script (2 minutes)

1. **Open app** — clean landing with "Tell me what happened" prompt suggestions
2. **Type:** "I was rear-ended at a stoplight yesterday. The other driver was texting."
   → Watch: Claim Form renders with fields pre-filled from the message
3. **Type:** "The trunk is caved in and the rear bumper is hanging off"
   → Watch: Damage Assessment card appears with severity bars and cost estimates
4. **Type:** "Am I covered for this?"
   → Watch: Coverage Analysis table renders with policy details and out-of-pocket calculation
5. **Type:** "What documents do I need?"
   → Watch: Document Checklist with some items already checked from conversation
6. **Type:** "The police report number is PD-2026-1234"
   → Watch: Checklist RE-RENDERS with police report now checked off
7. **Type:** "I'm ready to submit"
   → Watch: Claim Summary aggregates everything into a final review card
8. **Closing:** "Every screen you just saw was generated by the AI agent. Different incident, different forms. Different question, different dashboard. That's generative UI."

**Power move for judges:** Start a SECOND conversation: "My basement flooded." Watch completely different form fields generate. Proves it's truly generative, not hardcoded.

---

## Fallback Plans

| Risk | If it happens | Do this |
|------|--------------|---------|
| CopilotKit + Python won't connect | Use CopilotKit JS runtime with OpenAI | Same UI, simpler backend |
| Agent returns text instead of tool calls | Strengthen system prompt, add "NEVER respond with text" examples | Quick prompt fix |
| Components look ugly | Focus on 4 core components instead of 9, polish those | Quality > quantity |
| Running out of time | Claim Form + Coverage Analysis + Claim Summary = minimum viable demo | 3 components still wins |
| LLM is slow | Pre-fill more aggressively, reduce agent reasoning needed | Faster perceived response |

---

## Judging Criteria Alignment

| Criteria | How we hit it |
|----------|--------------|
| Generative UI | 9 distinct interactive components, each rendered contextually |
| Not a chatbot | Every agent response is a UI component — forms, tables, trackers |
| Dynamic | Different claim types generate completely different form fields |
| Featured stack | CopilotKit + AG-UI protocol |
| Innovation | Conversation-driven claim filing — describe what happened, agent builds the paperwork |
| Usefulness | Insurance claims are universally painful. This makes them human. |
| Demo quality | "Same app, two claim types, completely different UI" is a mic-drop moment |
| Completeness | Full flow: incident → assess → coverage → docs → file → track → settle |

---

## Key Insight

The NDA copilot was mostly one output (a dashboard) from one input (a PDF). This is fundamentally different: **every message generates a different component based on context.** That's what "generative UI" actually means — the interface itself is generated, not just the data inside a fixed template.

The demo proves this by filing two different claim types and showing the agent renders completely different forms, assessments, and checklists for each.
