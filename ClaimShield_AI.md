# 🛡️ ClaimShield AI — Hackathon Project

## 🚀 What We Are Building

We are building **ClaimShield AI**, a system that analyzes insurance claims in real-time and detects potentially **fraudulent or high-risk claims**.

The goal is simple:
👉 **Take claim data → analyze instantly → return risk score + explanation**

---

## 🎯 Problem

Insurance companies face:

* Fraudulent claims
* Incorrect claim data
* Slow manual verification

This leads to:

* Financial losses
* Delays in processing
* Poor customer experience

---

## 💡 Our Solution

ClaimShield AI provides:

* Instant claim analysis
* Risk score (0–100)
* Clear reasons (flags) for risk
* Simple, fast API-driven system

---

## 🧱 What We Will Build (Scope)

### 1. Frontend (Simple UI)

* Form to submit:

  * Name
  * Claim amount
  * Diagnosis
  * Procedure
* Show:

  * Risk score
  * Flags (reasons)

---

### 2. Backend (Sanic API)

* Endpoint to analyze claims
* Processes data using rule-based logic
* Returns result immediately

---

### 3. Database (SQLite)

* Stores claims and results
* Lightweight and fast (no setup required)

---

## 🔁 System Flow (Detailed Flow Map)

```
            ┌───────────────┐
            │   Frontend    │
            │ (User Input)  │
            └──────┬────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │   Sanic API Server  │
        │  (Handle Request)   │
        └──────┬──────────────┘
               │
               │ Process Claim
               ▼
        ┌─────────────────────┐
        │   Risk Engine       │
        │ (Rule Evaluation)   │
        └──────┬──────────────┘
               │
               │ Generate Score
               ▼
        ┌─────────────────────┐
        │   SQLite Database   │
        │  (Store Result)     │
        └──────┬──────────────┘
               │
               ▼
        ┌─────────────────────┐
        │   API Response      │
        │ (Score + Flags)     │
        └──────┬──────────────┘
               │
               ▼
        ┌───────────────┐
        │   Frontend    │
        │ (Show Result) │
        └───────────────┘
```

---

## ⚙️ API Design (Detailed)

### 1. Analyze Claim

```
POST /analyze
```

**Request**

```json
{
  "name": "John Doe",
  "amount": 50000,
  "procedure": "X-Ray",
  "diagnosis": "Fracture"
}
```

**Response**

```json
{
  "risk_score": 78,
  "flags": [
    "High claim amount",
    "Procedure mismatch"
  ],
  "status": "analyzed"
}
```

---

### 2. Get All Claims (Optional)

```
GET /claims
```

**Response**

```json
[
  {
    "name": "John Doe",
    "amount": 50000,
    "risk_score": 78
  }
]
```

---

## 🧠 Risk Engine (Core Logic)

We will implement simple but effective rules:

* High claim amount → flag
* Rare/suspicious procedure → flag
* Mismatch between diagnosis and procedure → flag
* Repeated activity → flag

👉 Final output = **Risk Score + Explanation**

---

## ⚡ Key Features

* Real-time processing
* Explainable results (not a black box)
* Simple and fast architecture
* Easy to demo

---

## 🔥 Optional Upgrade (if time permits)

* Background processing using task queue
* AI-based analysis for smarter detection
* Dashboard for claim insights

---

## 🏆 Why This Project

* Solves a real-world problem
* Easy to understand and demo
* Strong backend + system design
* Scalable idea for real production use

---

## 💡 Final Summary

ClaimShield AI is a **real-time insurance claim risk detection system** that:

* Improves efficiency
* Reduces fraud risk
* Provides instant, explainable decisions

👉 Built for speed, clarity, and impact in a hackathon setting.
