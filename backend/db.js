import mysql from 'mysql2/promise';

// Connection pool — reused across requests instead of opening a connection per query.
// In production these would come from env vars / AWS Secrets Manager, never hardcoded.
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3308,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'leave_management',
  waitForConnections: true,
  connectionLimit: 10,
});
