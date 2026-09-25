import express from 'express';
import cors from 'cors';
import employeesRouter from './routes/employees.js';
import leaveRequestsRouter from './routes/leaveRequests.js';

const app = express();
// cors() with no options allows all origins — fine in dev where frontend and
// backend are same-origin via the Next.js proxy anyway. In production, once
// the frontend is a separate static S3/CloudFront origin, this should be
// locked down: cors({ origin: process.env.ALLOWED_ORIGIN }).
app.use(cors());
app.use(express.json());

app.use('/api/employees', employeesRouter);
app.use('/api/leave-requests', leaveRequestsRouter);

// Central error handler — keeps route handlers free of repetitive try/catch boilerplate
// for the response shape; routes still catch DB errors to add context, then re-throw.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
