import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// GET /api/leave-requests?status=pending&department=Engineering
// Demonstrates a join for display data plus dynamic-but-safe filter building
// (parameterized — never string-concatenate user input into SQL).
router.get('/', async (req, res, next) => {
  try {
    const { status, department } = req.query;
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('lr.status = ?');
      params.push(status);
    }
    if (department) {
      conditions.push('e.department = ?');
      params.push(department);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT lr.id, lr.leave_type, lr.start_date, lr.end_date, lr.days_requested,
              lr.status, lr.reason, lr.created_at,
              e.id AS employee_id, e.first_name, e.last_name, e.department, e.leave_balance
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       ${whereClause}
       ORDER BY lr.created_at DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/leave-requests — create a new request, enforcing balance at submit time
router.post('/', async (req, res, next) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    if (!employeeId || !leaveType || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res.status(400).json({ error: 'End date cannot be before start date' });
    }
    // Naive business-day-free day count for the exercise — swap for a holiday-aware
    // calendar calculation in a real system.
    const daysRequested = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const [[employee]] = await pool.query(
      'SELECT leave_balance FROM employees WHERE id = ?',
      [employeeId]
    );
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    if (leaveType !== 'unpaid' && daysRequested > employee.leave_balance) {
      return res.status(400).json({
        error: `Requested ${daysRequested} days but only ${employee.leave_balance} available`,
      });
    }

    const [result] = await pool.query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days_requested, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [employeeId, leaveType, startDate, endDate, daysRequested, reason || null]
    );

    res.status(201).json({ id: result.insertId, daysRequested, status: 'pending' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/leave-requests/:id — approve or reject.
// Approving deducts the balance; both actions run in a transaction so a failed balance
// update can never leave a request marked approved with no deduction applied.
router.patch('/:id', async (req, res, next) => {
  const { action, reviewerId } = req.body; // action: 'approve' | 'reject'
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'action must be approve or reject' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[request]] = await conn.query(
      'SELECT * FROM leave_requests WHERE id = ? FOR UPDATE',
      [req.params.id]
    );
    if (!request) {
      await conn.rollback();
      return res.status(404).json({ error: 'Leave request not found' });
    }
    if (request.status !== 'pending') {
      await conn.rollback();
      return res.status(409).json({ error: `Request already ${request.status}` });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    await conn.query(
      `UPDATE leave_requests
       SET status = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [newStatus, reviewerId || null, req.params.id]
    );

    if (action === 'approve' && request.leave_type !== 'unpaid') {
      const [updateResult] = await conn.query(
        `UPDATE employees
         SET leave_balance = leave_balance - ?
         WHERE id = ? AND leave_balance >= ?`,
        [request.days_requested, request.employee_id, request.days_requested]
      );
      // affectedRows guards against a balance change that happened between the earlier
      // read and this write (e.g. another concurrent approval) — fail loudly rather
      // than silently let the balance go negative.
      if (updateResult.affectedRows === 0) {
        await conn.rollback();
        return res.status(409).json({ error: 'Balance changed since request was submitted' });
      }
    }

    await conn.commit();
    res.json({ id: req.params.id, status: newStatus });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

export default router;
