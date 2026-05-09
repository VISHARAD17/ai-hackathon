# ClaimShield AI — User Claim Filing System Implementation Plan

---

## Problem Statement

ClaimShield AI is a user-facing insurance claim filing system. Users submit their own insurance claims (personal details, medical information, treatment costs) through a web form. The system validates the claim in real-time, provides transparency about potential issues, generates a unique claim ID, and stores it for insurance company processing. Users can track their submitted claims and see their status.

---

## Requirements

- User claim submission form: personal info (name, email, policy number), medical details (diagnosis, procedure, doctor, treatment date), claim amount
- POST /submit-claim → validates and stores claim, returns claim ID + validation feedback
- GET /my-claims → user's claim history with status
- Real-time validation and feedback (helps user understand any issues)
- SQLite persistence
- Claim status tracking: Under Review → Approved/Rejected/Needs Info
- Transparent feedback: if validation flags appear, explain why in user-friendly language
- Simple single-page UI with claim form and claim history

---

## Proposed Solution

```
frontend/          ← Next.js app
  app/
    page.tsx       — main claim filing page
    components/
      ClaimForm.tsx
      ClaimResult.tsx
      ClaimHistory.tsx
backend/
  app.py                — Sanic app, routes
  validation_engine.py  — claim validation, user-friendly feedback
  database.py           — SQLite init + CRUD helpers
  requirements.txt
```

Next.js single-page app with React components. User fills claim form, submits to Sanic API, receives claim ID and validation feedback. Claim history component shows user's submitted claims with status.

---

## UI Screens & Components

### Screen 1 — File New Claim + My Claims (single page)

```
┌─────────────────────────────────────────────────────┐
│  🛡️  ClaimShield AI - File Your Insurance Claim     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─── File a New Claim ────────────────────────┐   │
│  │  Personal Information                       │   │
│  │  Full Name         [_______________________]│   │
│  │  Email             [_______________________]│   │
│  │  Policy Number     [_______________________]│   │
│  │                                             │   │
│  │  Medical Details                            │   │
│  │  Diagnosis         [_______________________]│   │
│  │  Procedure/Treatment [_____________________]│   │
│  │  Doctor Name       [_______________________]│   │
│  │  Treatment Date    [_______________________]│   │
│  │                                             │   │
│  │  Claim Amount ($)  [_______________________]│   │
│  │                                             │   │
│  │              [ Submit Claim ]               │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─── Submission Result ───────────────────────┐   │  ← shown after submit
│  │                                             │   │
│  │   ✅ Claim Submitted Successfully!          │   │
│  │   Claim ID: #CLM-2026-001234                │   │
│  │                                             │   │
│  │   Status: Under Review                      │   │
│  │                                             │   │
│  │   📋 Validation Notes:                      │   │
│  │   • High claim amount - may require         │   │
│  │     additional documentation                │   │
│  │   • Please ensure all receipts are ready    │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─── My Claims ───────────────────────────────┐   │
│  │  Claim ID    Date      Amount   Status      │   │
│  │  #CLM-001234 05/09/26  $5,000   Under Review│   │
│  │  #CLM-001198 04/28/26  $1,200   Approved ✅  │   │
│  │  #CLM-001156 04/15/26  $850     Approved ✅  │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Component hierarchy (vanilla JS):**
```
index.html
├── <header>          — logo + title + tagline
├── <section#claimForm>
│   ├── <form#newClaimForm>
│   │   ├── <fieldset#personalInfo>
│   │   │   ├── input#fullName
│   │   │   ├── input#email
│   │   │   └── input#policyNumber
│   │   ├── <fieldset#medicalDetails>
│   │   │   ├── input#diagnosis
│   │   │   ├── input#procedure
│   │   │   ├── input#doctorName
│   │   │   └── input#treatmentDate
│   │   ├── input#claimAmount
│   │   └── button#submitBtn
│   └── <div#loadingSpinner>  (hidden by default)
├── <section#submissionResult>  (hidden by default)
│   ├── <div#successMessage>    — claim ID, status
│   └── <div#validationNotes>   — helpful warnings/tips
└── <section#myClaimsHistory>
    └── <table#claimsTable>     — user's submitted claims
```

**Claim status indicators:**
- Under Review: blue badge
- Approved: green badge with ✅
- Rejected: red badge with ❌
- Needs Info: yellow badge "Action Required"

---

## Application Flow (step-by-step)

```
1. User opens index.html
   → JS checks localStorage for saved email
   → If email exists, calls GET /my-claims?email=xxx → populates claim history

2. User fills claim form (all personal info, medical details, amount)

3. User clicks "Submit Claim"
   → Client-side validation (required fields, email format, amount > 0)
   → submitBtn disabled, spinner shown
   → JS POSTs claim data to POST /submit-claim

4. Sanic receives request
   → validates all required fields (400 if missing/invalid)
   → runs validation_engine.validate_claim()
   → generates unique claim ID: CLM-YYYY-NNNNNN
   → stores claim in database with status "Under Review"
   → returns { claim_id, status, validation_notes, submitted_at }

5. JS receives response
   → hides spinner, re-enables button
   → shows success message with claim ID
   → displays validation notes (transparent, helpful feedback)
   → clears form for next submission
   → saves email to localStorage
   → calls GET /my-claims?email=xxx → refreshes claim history table

6. User can track claims
   → claim history shows all submitted claims with current status
   → user can see which claims are approved, under review, or need info

7. Error path
   → missing required fields → inline validation errors before submit
   → invalid data → 400 response with specific error message
   → network error → shows error message with retry option
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
const USER_EMAIL = localStorage.getItem('userEmail') || ''

// On page load
if (USER_EMAIL) {
  loadMyClaims(USER_EMAIL)
}

// Form submit handler
claimForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  
  if (!validateForm()) return
  
  setLoading(true)
  const payload = buildClaimPayload()
  const result = await submitClaim(payload)
  
  if (result.success) {
    renderSubmissionResult(result)
    clearForm()
    await loadMyClaims(payload.email)
    localStorage.setItem('userEmail', payload.email)
  } else {
    showError(result.error)
  }
  
  setLoading(false)
})

// Functions
async function submitClaim(payload) { ... }     // fetch POST /submit-claim
async function loadMyClaims(email) { ... }      // fetch GET /my-claims?email=
function renderSubmissionResult(data) { ... }   // show claim ID + validation notes
function buildClaimPayload() { ... }            // read all form values
function validateForm() { ... }                 // client-side validation
function clearForm() { ... }                    // reset form after submission
function setLoading(bool) { ... }               // toggle spinner/button
function getStatusBadge(status) { ... }         // color-coded status badges
function showError(message) { ... }             // display error message
```

**State model (no framework needed):**
- Loading state: DOM class toggle on button + spinner div
- Result state: show/hide #submissionResult section, update inner HTML
- History state: re-render table rows on each load
- User tracking: localStorage for email (simple demo, would use auth in production)

---

## Backend Architecture

### File structure
```
backend/
├── app.py                — Sanic app, CORS, route registration
├── validation_engine.py  — claim validation logic, user-friendly feedback
├── database.py           — SQLite init + save/fetch helpers
└── requirements.txt      — sanic, aiosqlite
```

### API Endpoints

**POST /submit-claim**
```
Request:  { 
  full_name: str, 
  email: str, 
  policy_number: str,
  diagnosis: str, 
  procedure: str,
  doctor_name: str,
  treatment_date: str,  # YYYY-MM-DD
  amount: float
}
Response: { 
  claim_id: str,           # CLM-2026-001234
  status: "Under Review",
  validation_notes: [str],
  submitted_at: str
}
Errors:   400 { error: "missing required fields" | "invalid email" | "invalid amount" }
```

**GET /my-claims**
```
Query params: email (for demo) or user_id (in production with auth)
Response: [ 
  { 
    claim_id, 
    full_name, 
    amount, 
    diagnosis, 
    procedure, 
    status,
    validation_notes,
    submitted_at
  }, 
  ... 
]
ordered by submitted_at DESC
```

**GET /claim/:claim_id** (optional - for detailed view)
```
Response: {
  claim_id,
  full_name,
  email,
  policy_number,
  diagnosis,
  procedure,
  doctor_name,
  treatment_date,
  amount,
  status,
  validation_notes,
  submitted_at,
  updated_at
}
```

### Validation Engine Logic (`validation_engine.py`)

```python
def validate_claim(full_name, email, policy_number, diagnosis, procedure, 
                   doctor_name, treatment_date, amount) -> dict:
    """
    Validates user claim and provides helpful feedback.
    Returns validation notes to help user understand any potential issues.
    """
    notes = []

    # Validation 1: High amount - inform user about documentation
    if amount > 100_000:
        notes.append("High claim amount detected. Please ensure you have all receipts and medical reports ready for review.")
    elif amount > 50_000:
        notes.append("Claim amount is significant. Additional documentation may be requested during review.")

    # Validation 2: Check diagnosis-procedure alignment
    COMMON_PAIRS = {
        "fracture": ["x-ray", "cast", "surgery", "orthopedic"],
        "flu": ["rest", "medication", "antiviral", "consultation"],
        "diabetes": ["insulin", "medication", "counseling", "blood test"],
        "dental": ["filling", "extraction", "root canal", "cleaning"],
        "vision": ["eye exam", "glasses", "contact", "laser"]
    }
    
    diag_key = diagnosis.lower()
    proc_lower = procedure.lower()
    
    matched = False
    for key, procedures in COMMON_PAIRS.items():
        if key in diag_key:
            if not any(p in proc_lower for p in procedures):
                notes.append(f"The procedure '{procedure}' seems unusual for '{diagnosis}'. Please verify this is correct.")
            matched = True
            break
    
    if not matched and amount > 10_000:
        notes.append("Please ensure diagnosis and procedure information is accurate for faster processing.")

    # Validation 3: Policy number format check
    if len(policy_number.strip()) < 5:
        notes.append("Policy number seems short. Please verify it's correct to avoid processing delays.")

    # Validation 4: Treatment date validation
    from datetime import datetime
    try:
        treatment = datetime.strptime(treatment_date, "%Y-%m-%d")
        today = datetime.now()
        if treatment > today:
            notes.append("Treatment date is in the future. Please verify the date.")
        elif (today - treatment).days > 365:
            notes.append("Treatment date is over a year ago. Claims should typically be filed within 12 months.")
    except:
        notes.append("Please verify treatment date format (YYYY-MM-DD).")

    # Validation 5: Email format
    if "@" not in email or "." not in email:
        notes.append("Please verify your email address for claim updates.")

    # If everything looks good
    if not notes:
        notes.append("All information looks good! Your claim will be processed shortly.")

    return {
        "validation_notes": notes,
        "requires_review": len(notes) > 1
    }
```

### Database Schema (`database.py`)

```sql
CREATE TABLE IF NOT EXISTS claims (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_id        TEXT    UNIQUE NOT NULL,
    full_name       TEXT    NOT NULL,
    email           TEXT    NOT NULL,
    policy_number   TEXT    NOT NULL,
    diagnosis       TEXT    NOT NULL,
    procedure       TEXT    NOT NULL,
    doctor_name     TEXT    NOT NULL,
    treatment_date  TEXT    NOT NULL,
    amount          REAL    NOT NULL,
    status          TEXT    DEFAULT 'Under Review',
    validation_notes TEXT   NOT NULL,
    requires_review INTEGER DEFAULT 0,
    submitted_at    TEXT    DEFAULT (datetime('now')),
    updated_at      TEXT    DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_email ON claims(email);
CREATE INDEX IF NOT EXISTS idx_claim_id ON claims(claim_id);
CREATE INDEX IF NOT EXISTS idx_status ON claims(status);
```

Helper functions:
- `async init_db(app)` — called on Sanic startup listener
- `async save_claim(conn, claim_data)` — INSERT + return claim_id
- `async get_user_claims(conn, email)` — SELECT by email DESC
- `async get_claim_by_id(conn, claim_id)` — SELECT single claim
- `async update_claim_status(conn, claim_id, status)` — UPDATE status (for admin)

### app.py structure

```python
from sanic import Sanic
from sanic.response import json
from sanic_ext import Extend

app = Sanic("ClaimShieldAI")

@app.listener('before_server_start')
async def setup_db(app, loop): ...

@app.post("/submit-claim")
async def submit_claim(request): 
    # Validate input
    # Generate claim_id (CLM-YYYY-NNNNNN)
    # Run validation_engine
    # Save to database
    # Return claim_id + validation_notes
    ...

@app.get("/my-claims")
async def get_my_claims(request):
    # Get email from query params
    # Fetch user's claims
    # Return list
    ...

@app.get("/claim/<claim_id>")
async def get_claim_detail(request, claim_id):
    # Fetch single claim by ID
    # Return full details
    ...
```

CORS: add `Access-Control-Allow-Origin: *` header on all responses.

---

## Implementation Phases

### Phase 1 — Backend skeleton + DB (30 min)
- `requirements.txt` with `sanic`, `aiosqlite`
- `database.py`: schema + init + save + fetch
- `app.py`: Sanic app, DB listener, stub routes returning hardcoded JSON
- **Demo:** `curl http://localhost:8000/my-claims?email=test@test.com` returns `[]`

### Phase 2 — Validation Engine (20 min)
- `validation_engine.py`: all validation rules with user-friendly messages
- Unit-testable with no imports beyond stdlib
- Wire into POST /submit-claim route
- **Demo:** `curl -X POST /submit-claim -d '{"full_name":"John","email":"john@test.com",...}'` returns claim_id + notes

### Phase 3 — DB persistence + claim ID generation (15 min)
- Generate unique claim IDs (CLM-YYYY-NNNNNN format)
- Save each submitted claim to SQLite
- GET /my-claims returns real rows filtered by email
- **Demo:** Submit 2 claims, GET /my-claims shows both with unique IDs

### Phase 4 — Frontend form (30 min)
- `index.html` + `style.css`: comprehensive form layout, result card (hidden), history table
- `app.js`: form submit → POST /submit-claim → render result with claim ID
- **Demo:** Fill form in browser, see success message with claim ID

### Phase 5 — History table + user tracking (15 min)
- `loadMyClaims()` on page load (if email in localStorage) + after each submit
- Status badge colors (blue/green/red/yellow)
- Loading spinner during API call
- Error message display
- **Demo:** Full end-to-end flow, claim history updates live

### Phase 6 — Polish + validation feedback (10 min)
- Display validation notes in user-friendly format
- Form validation before submit
- Clear form after successful submission
- Smooth transitions and animations
- **Demo:** Complete user journey from filing to tracking

### Phase 7 — Optional enhancements (if time permits)
- Claim detail view (click claim ID to see full details)
- File upload for supporting documents
- Email notifications (mock)
- Admin panel to update claim status
- Export claims as PDF

---

## Task Breakdown

**Task 1: Project scaffold + DB layer**
- Create `backend/` directory structure
- `requirements.txt` with sanic, aiosqlite
- `database.py` with schema + helper functions
- Test: DB file created, table schema verified

**Task 2: Sanic app with stub routes**
- `app.py` with CORS headers, JSON responses
- DB listener wired
- Stub routes for POST /submit-claim and GET /my-claims
- Test: Server starts, both endpoints respond

**Task 3: Validation engine implementation**
- `validation_engine.py` with all validation rules
- User-friendly feedback messages
- Pure function, no I/O
- Test: Call with various inputs, verify notes are helpful

**Task 4: Wire validation engine + claim ID generation**
- Generate unique claim IDs (CLM-YYYY-NNNNNN)
- Input validation (400 on missing/invalid)
- Call `validate_claim()`, `save_claim()`
- Return claim_id + validation_notes
- Test: POST returns real claim ID; DB shows the row

**Task 5: GET /my-claims returns user's claims**
- Query by email parameter
- Return claims ordered by submitted_at DESC
- Test: After 2 POSTs with same email, GET returns both

**Task 6: Frontend — comprehensive claim form**
- `index.html` with all form fields (personal + medical)
- `style.css` for layout and styling
- `app.js`: form submit → POST /submit-claim → render result
- Test: Submit form, see claim ID and validation notes

**Task 7: Frontend — claim history + user tracking**
- `loadMyClaims()` with localStorage email tracking
- Status badges with colors
- Loading states and error handling
- Test: Complete flow with live-updating history

---

## Directory Layout (final)

```
ai-hackathon/
├── backend/
│   ├── app.py
│   ├── validation_engine.py
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

This plan provides a complete roadmap for building ClaimShield AI as a **user-facing claim filing system** with:

1. **User-Centric Flow**: Users file their own claims and track status
2. **Transparent Validation**: Helpful feedback explains any potential issues
3. **Claim Tracking**: Users can see all their submitted claims and current status
4. **Simple Architecture**: Vanilla JS frontend + Sanic backend + SQLite
5. **Implementation Phases**: 7 tasks with clear objectives, ~2 hours for core functionality

The key difference from the original plan: **Users are claimants, not insurance companies**. The system helps users file claims properly and provides transparency about the validation process.
