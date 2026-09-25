# Coding Exercise: Employee Leave Management System

A scoped take-home exercise modeled on the JD you shared. It hits every "must-have" skill
(React/Next.js, Node.js REST API, SQL/MySQL with Oracle awareness) plus a couple of the
"good to have" items (AWS, MUI/Bootstrap) as stretch goals.

## Scenario
Build a small internal tool where employees submit leave requests and a manager can
approve/reject them. Balances must be enforced (can't request more days than you have
left), and approving/rejecting must update the employee's leave balance atomically.

## What's provided
- `database/schema.sql` — MySQL schema + seed data, ready to load
- `database/oracle-notes.md` — the same schema's MySQL → Oracle syntax deltas (this is the
  kind of thing interviewers ask verbally even if you never touch Oracle in the exercise)
- `backend/` — working Express API (Node.js) with the SQL queries written out
- `frontend/` — working React components (structured the way a Next.js page/component
  split would look) consuming the API

## Must-have requirements this satisfies
| JD requirement | Where |
|---|---|
| React/Next.js frontend | `frontend/src/App.jsx`, `LeaveRequestForm.jsx`, `LeaveRequestList.jsx` |
| Node.js backend, REST APIs | `backend/server.js`, `backend/routes/*.js` |
| API design + consumption | `backend/routes/leaveRequests.js` ↔ `frontend/src/api.js` |
| SQL (MySQL/Oracle), querying, schema | `database/schema.sql`, joins + transactions in `leaveRequests.js` |
| AI-assisted dev workflow | see "How to talk about this in interview" below |
| AWS awareness | `AWS_NOTES.md` (stretch — deployment sketch, not deployed) |
| MUI/Bootstrap | frontend uses MUI components (`@mui/material`) |

## How to run it (if you want to actually execute it)
1. `mysql -u root -p < database/schema.sql`
2. `cd backend && npm install && node server.js` (defaults to port 4000; set `DB_*` env vars
   for your MySQL connection)
3. `cd frontend && npm install && npm run dev` — a Vite/Next dev server would proxy
   `/api` to `localhost:4000`

You don't have to run it to learn from it — reading the API design and SQL is the point.

## Suggested self-test (do this like a real take-home, time-boxed)
Before looking at the provided solution, try building `PATCH /api/leave-requests/:id`
yourself (approve/reject with balance update in a transaction) and the
`LeaveRequestForm.jsx` submit handler with validation. Then compare against what's here.
Budget ~90 minutes for those two pieces — that's roughly what a senior-level take-home
expects.

## Stretch goals (good-to-have skills)
- Add a `GET /api/leave-requests?department=Engineering&status=pending` filter (join +
  WHERE + dynamic query building — good SQL talking point)
- Sketch the AWS deployment: EC2 for the API, S3 for the built frontend, an ALB in front,
  Security Groups scoped to just the ALB → EC2 → RDS path. `AWS_NOTES.md` has a start.
- Convert `schema.sql` to Oracle syntax yourself using `oracle-notes.md` as a checklist

## How to talk about this in interview
This JD explicitly wants you to describe *how* you use AI tools (Codex/ChatGPT), not just
that you use them. Concrete framing that holds up under follow-up questions:
- "I used an AI assistant to scaffold the transaction logic for the approve/reject
  endpoint, then manually verified the balance math and added the rollback path myself —
  I don't take generated SQL transactions on faith."
- "I had it review my endpoint for injection risk since I was building the WHERE clause
  dynamically for the filter — worth flagging that as a habit, not a one-off."
- Be ready to explain any line of code without the AI tool open. That's the actual bar.
