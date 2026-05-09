# ClaimShield AI — Detailed Implementation Plan

---

## Problem Statement

ClaimShield AI is a real-time insurance claim fraud detection system. A user submits a claim (name, amount, diagnosis, procedure) through a web form; a Sanic backend runs a rule-based risk engine, stores the result in SQLite, and returns a risk score (0–100) plus human-readable flags explaining the risk.

---

## Requirements

- Single-page form UI: name, claim amount, diagnosis, procedure
- POST /analyze → risk score + flags (synchronous, real-time)
- GET /claims → list of past claims
- Rule-based risk engine (no ML required)
- SQLite persistence
- Results displayed inline on the same page (no page reload)
- Deployable locally in under 2 minutes

---

## Proposed Solution

```
frontend/          ← single index.html + style.css + app.js
backend/
  app.py           ← Sanic app, routes
  risk_engine.py   ← pure rule evaluation, returns score + flags
  database.py      ← SQLite init + CRUD helpers
  requirements.txt
```

Single HTML page with a claim form. On submit, JS POSTs to Sanic, renders the result card inline. A "Past Claims" section fetches GET /claims on load and after each submission.

---

## UI Screens & Components

### Screen 1 — Claim Submission + Results (single page)

```
┌─────────────────────────────────────────────────────┐
│  🛡️  ClaimShield AI          [subtitle tagline]      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─── Submit a Claim ──────────────────────────┐   │
│  │  Name          [_________________________]  │   │
│  │  Claim Amount  [_________________________]  │   │
│  │  Diagnosis     [_________________________]  │   │
│  │  Procedure     [_________________________]  │   │
│  │                                             │   │
│  │              [ Analyze Claim ]              │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─── Risk Analysis Result ────────────────────┐   │  ← hidden until submit
│  │                                             │   │
│  │   Risk Score:  [ 78 / 100 ]  🔴 HIGH        │   │
│  │                                             │   │
│  │   Flags:                                    │   │
│  │   ⚠️  High claim amount (>50,000)            │   │
│  │   ⚠️  Procedure-diagnosis mismatch           │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─── Past Claims ─────────────────────────────┐   │
│  │  Name       Amount   Score   Status         │   │
│  │  John Doe   50,000   78      HIGH           │   │
│  │  Jane Smith  5,000   12      LOW            │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Component hierarchy (vanilla JS):**
```
index.html
├── <header>          — logo + title
├── <section#form>
│   ├── <form#claimForm>
│   │   ├── input#name
│   │   ├── input#amount
│   │   ├── input#diagnosis
│   │   ├── input#procedure
│   │   └── button#submitBtn
│   └── <div#loadingSpinner>  (hidden by default)
├── <section#result>  (hidden by default)
│   ├── <div#scoreDisplay>    — big number + color badge
│   └── <ul#flagsList>        — one <li> per flag
└── <section#history>
    └── <table#claimsTable>   — populated via GET /claims
```

**Risk score color coding:**
- 0–30: green badge "LOW"
- 31–60: yellow badge "MEDIUM"
- 61–100: red badge "HIGH"

---

## Application Flow (step-by-step)

```
1. User opens index.html
   → JS calls GET /claims → populates Past Claims table

2. User fills form fields (name, amount, diagnosis, procedure)

3. User clicks "Analyze Claim"
   → submitBtn disabled, spinner shown
   → JS POSTs { name, amount, diagnosis, procedure } to POST /analyze

4. Sanic receives request
   → validates fields (non-empty, amount is numeric)
   → passes to risk_engine.evaluate(claim)
   → risk_engine returns { risk_score, flags }
   → database.save_claim(claim + result)
   → returns JSON { risk_score, flags, status: "analyzed" }

5. JS receives response
   → hides spinner, re-enables button
   → renders #result section with score + flags
   → score badge color set by risk level
   → calls GET /claims again → refreshes Past Claims table

6. Error path
   → network error or 4xx/5xx → shows inline error message in #result
```

---

## Frontend Architecture

**Files:**
```
frontend/
├── index.html      — structure only, no inline JS/CSS
├── style.css       — layout, form, result card, table, badges
└── app.js          — all interactivity
```

**app.js structure:**
```javascript
const API_BASE = 'http://localhost:8000'

// On page load
loadClaims()

// Form submit handler
claimForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  setLoading(true)
  const payload = buildPayload()
  const result = await postClaim(payload)   // POST /analyze
  renderResult(result)
  await loadClaims()                         // refresh table
  setLoading(false)
})

// Functions
async function postClaim(payload) { ... }   // fetch POST /analyze
async function loadClaims() { ... }         // fetch GET /claims
function renderResult(data) { ... }         // update #result DOM
function buildPayload() { ... }             // read form values
function setLoading(bool) { ... }           // toggle spinner/button
function getRiskLevel(score) { ... }        // LOW/MEDIUM/HIGH + color
```

**State model (no framework needed):**
- Loading state: DOM class toggle on button + spinner div
- Result state: show/hide #result section, update inner HTML
- History state: re-render table rows on each load

---

## Backend Architecture

### File structure
```
backend/
├── app.py           — Sanic app, CORS, route registration
├── risk_engine.py   — pure functions, no I/O
├── database.py      — SQLite init + save/fetch helpers
└── requirements.txt — sanic, aiosqlite
```

### API Endpoints

**POST /analyze**
```
Request:  { name: str, amount: float, diagnosis: str, procedure: str }
Response: { risk_score: int, flags: [str], status: "analyzed" }
Errors:   400 { error: "missing fields" | "invalid amount" }
```

**GET /claims**
```
Response: [ { id, name, amount, diagnosis, procedure, risk_score, flags, created_at }, ... ]
          ordered by created_at DESC, limit 50
```

### Risk Engine Logic (`risk_engine.py`)

```python
def evaluate(name, amount, diagnosis, procedure) -> dict:
    score = 0
    flags = []

    # Rule 1: High amount
    if amount > 100_000:
        score += 40
        flags.append("Extremely high claim amount (>100,000)")
    elif amount > 50_000:
        score += 25
        flags.append("High claim amount (>50,000)")

    # Rule 2: Suspicious procedures
    SUSPICIOUS = {"cosmetic surgery", "experimental treatment", "unverified therapy"}
    if procedure.lower() in SUSPICIOUS:
        score += 30
        flags.append(f"Suspicious procedure: {procedure}")

    # Rule 3: Diagnosis-procedure mismatch
    MISMATCH_MAP = {
        "fracture": {"x-ray", "cast", "surgery"},
        "flu": {"rest", "medication", "antiviral"},
        "diabetes": {"insulin", "medication", "diet counseling"},
    }
    diag_key = diagnosis.lower()
    if diag_key in MISMATCH_MAP:
        if procedure.lower() not in MISMATCH_MAP[diag_key]:
            score += 20
            flags.append("Procedure does not match diagnosis")

    # Rule 4: Missing/generic name
    if len(name.strip()) < 3 or name.lower() in {"test", "unknown", "n/a"}:
        score += 10
        flags.append("Suspicious claimant name")

    return {
        "risk_score": min(score, 100),
        "flags": flags if flags else ["No significant risk factors detected"]
    }
```

### Database Schema (`database.py`)

```sql
CREATE TABLE IF NOT EXISTS claims (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    amount      REAL    NOT NULL,
    diagnosis   TEXT    NOT NULL,
    procedure   TEXT    NOT NULL,
    risk_score  INTEGER NOT NULL,
    flags       TEXT    NOT NULL,   -- JSON array stored as string
    created_at  TEXT    DEFAULT (datetime('now'))
);
```

Helper functions:
- `async init_db(app)` — called on Sanic startup listener
- `async save_claim(conn, claim_data)` — INSERT + return rowid
- `async get_claims(conn, limit=50)` — SELECT DESC

### app.py structure

```python
from sanic import Sanic
from sanic.response import json
from sanic_ext import Extend   # or manual CORS headers

app = Sanic("ClaimShieldAI")

@app.listener('before_server_start')
async def setup_db(app, loop): ...

@app.post("/analyze")
async def analyze_claim(request): ...

@app.get("/claims")
async def get_claims(request): ...
```

CORS: add `Access-Control-Allow-Origin: *` header on all responses (needed since frontend is served from file:// or different port).

---

## Implementation Phases

### Phase 1 — Backend skeleton + DB (30 min)
- `requirements.txt` with `sanic`, `aiosqlite`
- `database.py`: schema + init + save + fetch
- `app.py`: Sanic app, DB listener, stub routes returning hardcoded JSON
- **Demo:** `curl http://localhost:8000/claims` returns `[]`

### Phase 2 — Risk Engine (20 min)
- `risk_engine.py`: all 4 rules implemented as pure functions
- Unit-testable with no imports beyond stdlib
- Wire into POST /analyze route
- **Demo:** `curl -X POST /analyze -d '{"name":"John","amount":75000,"diagnosis":"flu","procedure":"surgery"}'` returns score + flags

### Phase 3 — DB persistence (15 min)
- Save each analyzed claim to SQLite
- GET /claims returns real rows
- **Demo:** Submit 2 claims, GET /claims shows both

### Phase 4 — Frontend form (30 min)
- `index.html` + `style.css`: form layout, result card (hidden), history table
- `app.js`: form submit → POST /analyze → render result
- **Demo:** Fill form in browser, see risk score card appear

### Phase 5 — History table + polish (15 min)
- `loadClaims()` on page load + after each submit
- Risk badge colors (green/yellow/red)
- Loading spinner during API call
- Error message display
- **Demo:** Full end-to-end flow, past claims table updates live

### Phase 6 — Optional enhancements (if time permits)
- More risk rules (repeated claimant name detection via DB lookup)
- Animated score counter (JS)
- Export claims as CSV
- Simple bar chart of risk distribution

---

## Task Breakdown

**Task 1: Project scaffold + DB layer**
- Objective: Create directory structure, requirements.txt, database.py with schema + helpers
- Implementation: `backend/` dir, `aiosqlite` for async SQLite, `init_db` creates table on startup
- Test: Run `python -c "import asyncio; from database import init_db; ..."` — no errors, `claims.db` created
- Demo: DB file exists, table schema verified with `sqlite3 claims.db .schema`

**Task 2: Sanic app with stub routes**
- Objective: Running Sanic server with POST /analyze and GET /claims returning hardcoded responses
- Implementation: `app.py` with CORS headers, JSON responses, DB listener wired
- Test: `curl http://localhost:8000/claims` → `[]`, `curl -X POST http://localhost:8000/analyze -H "Content-Type: application/json" -d '{...}'` → stub JSON
- Demo: Server starts, both endpoints respond

**Task 3: Risk engine implementation**
- Objective: `risk_engine.py` with 4 rules, returns `{risk_score, flags}`
- Implementation: Pure function `evaluate(name, amount, diagnosis, procedure)`, no I/O
- Test: Call `evaluate("test", 75000, "flu", "surgery")` → score > 0, flags non-empty
- Demo: Python REPL shows correct scores for various inputs

**Task 4: Wire risk engine into POST /analyze + DB save**
- Objective: Real analyze endpoint — validates input, calls engine, saves to DB, returns result
- Implementation: Input validation (400 on missing/invalid), call `evaluate()`, `save_claim()`, return JSON
- Test: POST with valid payload → 200 + score; POST with missing field → 400
- Demo: `curl` POST returns real risk score; `sqlite3 claims.db "SELECT * FROM claims"` shows the row

**Task 5: GET /claims returns real data**
- Objective: History endpoint returns all stored claims ordered by recency
- Implementation: `get_claims()` query, serialize flags JSON string back to list
- Test: After 2 POSTs, GET returns 2 records in correct order
- Demo: `curl http://localhost:8000/claims` shows real claim history

**Task 6: Frontend — form + result card**
- Objective: `index.html` + `app.js` — form submits to API, result card renders inline
- Implementation: Fetch POST /analyze on form submit, update DOM with score + flags, color-coded badge
- Test: Open in browser, submit form, result card appears with correct data
- Demo: Full browser demo — fill form, click Analyze, see risk score card

**Task 7: Frontend — history table + loading state**
- Objective: Past Claims table populated from GET /claims; spinner during API call
- Implementation: `loadClaims()` on page load + after submit; disable button during fetch; show error on failure
- Test: Submit claim → table updates; disconnect server → error message shown
- Demo: Complete end-to-end demo with live-updating history table and smooth UX

---

## Directory Layout (final)

```
ai-hackathon/
├── backend/
│   ├── app.py
│   ├── risk_engine.py
│   ├── database.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── ClaimShield_AI.md
├── IMPLEMENTATION_PLAN.md
└── HACKATHON_BUILD_GUIDE.md
```

---

## Summary

This plan provides a complete roadmap for building ClaimShield AI with:

1. **Clear UI Flow**: Single-page application with form → result → history table
2. **Component Structure**: Minimal vanilla JS architecture with clear separation of concerns
3. **Backend Architecture**: Sanic API with modular risk engine and database layer
4. **Implementation Phases**: 7 tasks with clear objectives, tests, and demos
5. **Time Estimate**: ~2 hours for core functionality, extensible for enhancements

The design prioritizes simplicity, speed of implementation, and clear demonstration value for a hackathon setting.
