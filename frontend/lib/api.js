const BASE_URL = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  getEmployees: () => request('/employees'),
  getLeaveRequests: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return request(`/leave-requests${params ? `?${params}` : ''}`);
  },
  createLeaveRequest: (payload) =>
    request('/leave-requests', { method: 'POST', body: JSON.stringify(payload) }),
  reviewLeaveRequest: (id, action, reviewerId) =>
    request(`/leave-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action, reviewerId }),
    }),
};
