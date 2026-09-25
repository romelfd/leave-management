# MySQL → Oracle: what changes in this schema

Interviewers with an Oracle-heavy stack often ask "how would this differ in Oracle" even
if the exercise itself uses MySQL. Quick reference against `schema.sql`:

| MySQL | Oracle | Notes |
|---|---|---|
| `AUTO_INCREMENT` | `GENERATED ALWAYS AS IDENTITY` (12c+) or a `SEQUENCE` + `BEFORE INSERT` trigger on older versions | Oracle didn't get native identity columns until 12c |
| `ENUM('vacation','sick',...)` | Not supported — use `VARCHAR2` + `CHECK (leave_type IN (...))` | Oracle has no native enum type |
| `VARCHAR(150)` | `VARCHAR2(150)` | Oracle requires the `2` |
| `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` | `TIMESTAMP DEFAULT SYSTIMESTAMP` | or `DATE DEFAULT SYSDATE` if you don't need sub-second precision |
| `LIMIT n` (pagination) | `FETCH FIRST n ROWS ONLY` (12c+) or `ROWNUM` subquery (older) | |
| `INSERT ... ON DUPLICATE KEY UPDATE` | `MERGE INTO ... USING ... WHEN MATCHED THEN UPDATE ... WHEN NOT MATCHED THEN INSERT` | |
| String concat `CONCAT(a,b)` | `a || b` | Oracle uses `||` natively |
| `SHOW TABLES` | `SELECT table_name FROM user_tables` | |

Connection library swap in Node: `mysql2` → `oracledb`. The query style stays similar
(parameterized queries), but Oracle uses positional binds like `:1, :2` or named binds
(`:employeeId`) instead of `?`.
