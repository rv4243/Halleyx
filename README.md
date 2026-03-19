# HalleyX SaaS (Workflow Engine)

This repo contains a workflow-engine "SaaS":

* Frontend: React + Vite + Tailwind (UI for building workflows, running executions, and reviewing approvals/audit logs).
* Backend: Node.js + Express + Mongoose (stores workflows/steps/rules in MongoDB and executes them).

## Quick Start (Local Development)

### 1) Prerequisites

* Node.js (recommended: 18+)
* MongoDB (local or MongoDB Atlas)

### 2) Install dependencies

Open two terminals.

**Terminal A (backend):**
```powershell
cd backend
npm install
```

**Terminal B (frontend):**
```powershell
cd ..
npm install
```

### 3) Configure backend environment

The backend reads `backend/.env` (at runtime) via `dotenv`.

At minimum set:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<host>/<db>
```

Note: `backend/.env` in this repo currently includes `MONGO_URI` and `PORT`, but the server listens on port `5000` directly.

### 4) Run the backend

In Terminal A:
```powershell
node server.js
```

Backend URL (REST API):

* `http://localhost:5000`

### 5) Run the frontend

In Terminal B:
```powershell
npm run dev
```

Frontend URL (default Vite dev server):

* `http://localhost:5173`

The frontend is configured to call the backend via `http://localhost:5000/api/...`, so keep both servers running.

## UI Flow (What to Try)

1. **Dashboard / Workflows**
   * Open `/` and manage workflows.
   * Create or edit a workflow in `/editor` (or `/editor/:id`).
2. **Workflow Editor**
   * Add steps (task / approval / notification / completed).
   * Define transition rules (conditions evaluated against execution `data`).
   * Save to MongoDB.
3. **Execute a workflow**
   * Open `/execution/:workflowId`.
   * Submit input data to start execution.
4. **Approvals**
   * If the engine hits an `approval` step, the execution pauses.
   * Admin approvals are handled under `/admin` (simple email prompt stored in `localStorage`).
5. **Audit log**
  * The "Audit Log" side panel fetches execution history from the backend.
   * Execution details open via the modal trace UI.

## Debug Helpers

### Dump workflow rules from MongoDB

`check_db.js` connects to MongoDB and prints workflows, steps, and rules:
```powershell
node check_db.js
```

## Troubleshooting

* **Mongo connection fails**
  * Verify `backend/.env` has a reachable `MONGO_URI`.
  * Ensure your MongoDB network rules allow connections from your machine.
* **Frontend shows 404/connection errors**
  * Confirm backend is running on `http://localhost:5000`.
  * Confirm you started both servers (Vite + Express).



# 💼 Sample Workflow: Salary Approval

This workflow demonstrates how employee salary requests are evaluated and processed using rule-based steps.

---

## 🧾 Input Schema

```json
{
  "salary": "number (required)",
  "country": "string (required)",
  "department": "string (optional)",
  "performance": "Excellent | Good | Average | Poor"
}
```

---

## 🔁 Workflow Steps

1. **Manager Review** (approval)
2. **HR Approval** (approval)
3. **Finance Processing** (notification)
4. **Salary Rejection** (task)
5. **Completed** (end)

---

## 🧠 Step: Manager Review Rules

| Priority | Condition                                     | Next Step          |
| -------- | --------------------------------------------- | ------------------ |
| 1        | salary > 100000 && performance == 'Excellent' | HR Approval        |
| 2        | performance == 'Poor'                         | Salary Rejection   |
| 3        | department == 'HR'                            | HR Approval        |
| 4        | DEFAULT                                       | Finance Processing |

---

## 🧠 Step: HR Approval Rules

| Priority | Condition                | Next Step          |
| -------- | ------------------------ | ------------------ |
| 1        | salary > 200000          | Salary Rejection   |
| 2        | performance == 'Average' | Salary Rejection   |
| 3        | DEFAULT                  | Finance Processing |

---

## 🧠 Step: Finance Processing Rules

| Priority | Condition | Next Step |
| -------- | --------- | --------- |
| 1        | DEFAULT   | Completed |

---

## 🧠 Step: Salary Rejection Rules

| Priority | Condition | Next Step |
| -------- | --------- | --------- |
| 1        | DEFAULT   | Completed |

---

## 🧪 Sample Input

```json
{
  "salary": 120000,
  "country": "US",
  "department": "Engineering",
  "performance": "Excellent"
}
```

---

## ▶ Execution Flow

1. **Manager Review**

   * Rule 1 matched → HR Approval

2. **HR Approval**

   * No rejection rules matched → Finance Processing

3. **Finance Processing**

   * DEFAULT → Completed

---

## ✅ Final Output

```json
{
  "status": "APPROVED",
  "path": [
    "Manager Review",
    "HR Approval",
    "Finance Processing",
    "Completed"
  ]
}
```

---

## ❌ Rejection Example

### Input

```json
{
  "salary": 250000,
  "country": "US",
  "department": "Engineering",
  "performance": "Good"
}
```

---

### Execution Flow

* Manager Review → HR Approval
* HR Rule 1 matched (salary > 200000) → Salary Rejection
* Salary Rejection → Completed

---

## ❌ Final Output

```json
{
  "status": "REJECTED",
  "path": [
    "Manager Review",
    "HR Approval",
    "Salary Rejection",
    "Completed"
  ]
}
```

---

## 🧠 Notes

* Rules are evaluated in **priority order (top → bottom)**
* Execution stops at the **first matching rule**
* Each step dynamically decides the **next step**
* Workflow ends at the **Completed** node

```
```
