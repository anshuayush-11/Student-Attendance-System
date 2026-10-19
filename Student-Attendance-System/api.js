/**
 * Attendify API Client
 * Shared across all HTML screens.
 * Handles auth tokens, fetch calls, and navigation.
 *
 * Include this script in every HTML page:
 *   <script src="../frontend/api.js"></script>
 *   (or use the path relative to each HTML file)
 */

const API_BASE = 'http://localhost:5000/api';

// ─── Token Storage ────────────────────────────────────────────────────────────
const Auth = {
  getToken: () => localStorage.getItem('attendify_token'),
  getUser:  () => JSON.parse(localStorage.getItem('attendify_user') || 'null'),
  save: (data) => {
    localStorage.setItem('attendify_token', data.token);
    localStorage.setItem('attendify_user', JSON.stringify(data));
  },
  clear: () => {
    localStorage.removeItem('attendify_token');
    localStorage.removeItem('attendify_user');
  },
  isLoggedIn: () => !!localStorage.getItem('attendify_token'),
};

// ─── Core Fetch Helper ────────────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = Auth.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
const AuthAPI = {
  login: (email, password) =>
    apiFetch('/auth/login', { method: 'POST', body: { email, password } }),

  register: (userData) =>
    apiFetch('/auth/register', { method: 'POST', body: userData }),

  me: () => apiFetch('/auth/me'),

  logout: () => {
    Auth.clear();
    window.location.href = '/login.html';
  },
};

// ─── Classes API ──────────────────────────────────────────────────────────────
const ClassesAPI = {
  getAll: () => apiFetch('/classes'),
  getOne: (id) => apiFetch(`/classes/${id}`),
  create: (data) => apiFetch('/classes', { method: 'POST', body: data }),
  addStudents: (classId, studentIds) =>
    apiFetch(`/classes/${classId}/students`, {
      method: 'PUT',
      body: { studentIds, action: 'add' },
    }),
};

// ─── Attendance API ───────────────────────────────────────────────────────────
const AttendanceAPI = {
  mark: (data) => apiFetch('/attendance', { method: 'POST', body: data }),
  update: (id, records) =>
    apiFetch(`/attendance/${id}`, { method: 'PUT', body: { records } }),
  getByClass: (classId, from, to) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to)   params.set('to', to);
    return apiFetch(`/attendance/class/${classId}?${params}`);
  },
  getByStudent: (studentId) => apiFetch(`/attendance/student/${studentId}`),
  getAnalytics: (classId) => apiFetch(`/attendance/analytics/${classId}`),
};

// ─── Students API ─────────────────────────────────────────────────────────────
const StudentsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiFetch(`/students?${params}`);
  },
  getOne: (id) => apiFetch(`/students/${id}`),
};

// ─── Navigation Helper ────────────────────────────────────────────────────────
const Nav = {
  goTo: (page) => { window.location.href = page; },
  dashboard:  () => Nav.goTo('/teacher-dashboard.html'),
  markAttend: () => Nav.goTo('/mark-attendance.html'),
  records:    () => Nav.goTo('/attendance-records-analytics.html'),
  portal:     () => Nav.goTo('/student-attendance-portal.html'),
};

// ─── Auto-redirect if not logged in ──────────────────────────────────────────
// Call this at the top of any protected page:
//   requireAuth();            // any role
//   requireAuth('teacher');   // only teachers
function requireAuth(role) {
  if (!Auth.isLoggedIn()) {
    window.location.href = '/login.html';
    return null;
  }
  const user = Auth.getUser();
  if (role && user.role !== role) {
    alert(`Access denied. This page is for ${role}s only.`);
    window.location.href = '/index.html';
    return null;
  }
  return user;
}

// ─── Toast notification (optional UI helper) ──────────────────────────────────
function showToast(message, type = 'success') {
  const existing = document.getElementById('_toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = '_toast';
  const colors = {
    success: 'background:#10B981;color:#fff',
    error:   'background:#ba1a1a;color:#fff',
    info:    'background:#5654a8;color:#fff',
  };
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    padding:12px 20px;border-radius:8px;font-family:Inter,sans-serif;
    font-size:14px;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.15);
    transition:opacity .3s;${colors[type] || colors.success}
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}
