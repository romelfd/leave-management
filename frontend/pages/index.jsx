import { useEffect, useState } from 'react';
import { Container, Typography, Divider, Stack } from '@mui/material';
import { api } from '../lib/api';
import LeaveRequestForm from '../components/LeaveRequestForm';
import LeaveRequestList from '../components/LeaveRequestList';

export default function Home() {
  const [employees, setEmployees] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    api.getEmployees().then(setEmployees).catch(console.error);
  }, [refreshKey]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Leave Requests</Typography>
      <Stack spacing={4}>
        <LeaveRequestForm employees={employees} onCreated={() => setRefreshKey((k) => k + 1)} />
        <Divider />
        <LeaveRequestList refreshKey={refreshKey} />
      </Stack>
    </Container>
  );
}
