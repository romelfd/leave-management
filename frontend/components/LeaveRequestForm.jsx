import { useState } from 'react';
import {
  Box, TextField, MenuItem, Button, Alert, Stack,
} from '@mui/material';
import { api } from '../lib/api';

const LEAVE_TYPES = ['vacation', 'sick', 'unpaid', 'bereavement'];

export default function LeaveRequestForm({ employees, onCreated }) {
  const [form, setForm] = useState({
    employeeId: '', leaveType: 'vacation', startDate: '', endDate: '', reason: '',
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.employeeId || !form.startDate || !form.endDate) {
      setError('Please fill in employee, start date, and end date.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createLeaveRequest(form);
      setForm({ employeeId: '', leaveType: 'vacation', startDate: '', endDate: '', reason: '' });
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 480 }}>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          select label="Employee" value={form.employeeId} onChange={handleChange('employeeId')} required
        >
          {employees.map((emp) => (
            <MenuItem key={emp.id} value={emp.id}>
              {emp.first_name} {emp.last_name} ({emp.leave_balance} days left)
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select label="Leave type" value={form.leaveType} onChange={handleChange('leaveType')}
        >
          {LEAVE_TYPES.map((t) => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Start date" type="date" value={form.startDate} onChange={handleChange('startDate')}
          InputLabelProps={{ shrink: true }} required
        />
        <TextField
          label="End date" type="date" value={form.endDate} onChange={handleChange('endDate')}
          InputLabelProps={{ shrink: true }} required
        />
        <TextField
          label="Reason" value={form.reason} onChange={handleChange('reason')} multiline rows={2}
        />
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit request'}
        </Button>
      </Stack>
    </Box>
  );
}
