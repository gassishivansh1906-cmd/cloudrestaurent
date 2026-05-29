// Central API client. In production the frontend is served by Nginx which
// proxies /api to the backend container, so a relative base URL works everywhere.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('cr_token');
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  // auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: () => request('/auth/me', { auth: true }),

  // menu
  getCategories: () => request('/categories'),
  getMenu: (params = '') => request(`/menu${params}`),
  createMenuItem: (payload) => request('/menu', { method: 'POST', body: payload, auth: true }),
  deleteMenuItem: (id) => request(`/menu/${id}`, { method: 'DELETE', auth: true }),

  // reservations
  createReservation: (payload) => request('/reservations', { method: 'POST', body: payload }),
  getReservations: () => request('/reservations', { auth: true }),
  updateReservation: (id, status) => request(`/reservations/${id}`, { method: 'PATCH', body: { status }, auth: true }),

  // orders
  createOrder: (payload) => request('/orders', { method: 'POST', body: payload }),
  getOrders: () => request('/orders', { auth: true }),

  // contact
  sendContact: (payload) => request('/contact', { method: 'POST', body: payload }),
  getMessages: () => request('/contact', { auth: true }),
};
