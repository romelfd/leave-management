import { useEffect, useState, useCallback } from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody, Chip, Button,
  Stack, Select, MenuItem, Alert,
} from '@mui/material';
import { api } from '../lib/api';

const STATUS_COLOR = { pending: 'warning', approved: 'success', rejected: 'error' };

export default function LeaveRequestList({ refreshKey }) {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await api.getLeaveRequests(statusFilter ? { status: statusFilter } : {});
      setRequests(data);
    } catch (err) {
      setError(err.message);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load, refreshKey]);

  const handleReview = async (id, action) => {
    setError(null);
    try {
      // reviewerId hardcoded to employee 1 (Ana, the manager) for this exercise —
      // a real app would pull this from an auth session.
      await api.reviewLeaveRequest(id, action, 1);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <Select
        value={statusFilter}
        displayEmpty
        onChange={(e) => setStatusFilter(e.target.value)}
        size="small"
        sx={{ width: 200 }}
      >
        <MenuItem value="">All statuses</MenuItem>
        <MenuItem value="pending">Pending</MenuItem>
        <MenuItem value="approved">Approved</MenuItem>
        <MenuItem value="rejected">Rejected</MenuItem>
      </Select>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Employee</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Dates</TableCell>
            <TableCell>Days</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.first_name} {r.last_name}</TableCell>
              <TableCell>{r.leave_type}</TableCell>
              <TableCell>{r.start_date} → {r.end_date}</TableCell>
              <TableCell>{r.days_requested}</TableCell>
              <TableCell><Chip label={r.status} color={STATUS_COLOR[r.status]} size="small" /></TableCell>
              <TableCell>
                {r.status === 'pending' && (
                  <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={() => handleReview(r.id, 'approve')}>Approve</Button>
                    <Button size="small" color="error" onClick={() => handleReview(r.id, 'reject')}>Reject</Button>
                  </Stack>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  );
}
