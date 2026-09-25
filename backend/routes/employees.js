import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// GET /api/employees — list all, with manager name resolved via self-join
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.id, e.first_name, e.last_name, e.email, e.department, e.leave_balance,
              m.first_name AS manager_first_name, m.last_name AS manager_last_name
       FROM employees e
       LEFT JOIN employees m ON e.manager_id = m.id
       ORDER BY e.last_name`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/:id
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
