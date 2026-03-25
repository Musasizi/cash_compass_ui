/**
 * utils/api.js – WalletWise Centralised API Client
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY CENTRALISE API CALLS?
 * ─────────────────────────────────────────────────────────────────────────────
 * If every component wrote its own fetch() call:
 *   • Changing the API base URL means editing 20+ files.
 *   • Error handling logic gets copy-pasted everywhere.
 *   • Adding auth headers has to be remembered every time.
 *
 * Centralising here means:
 *   • One place to change the base URL.
 *   • One place to handle errors consistently.
 *   • Components just call: getIncome(token) — clean and readable.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO USE IN A COMPONENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *   import { getIncome, createIncome } from '../utils/api';
 *
 *   // Inside an async function or useEffect:
 *   const data = await getIncome(token, { from: '2025-01-01' });
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TEACHING POINTS:
 *  • fetch() — the browser's built-in HTTP client
 *  • async/await for readable asynchronous code
 *  • Authorization: Bearer <token> header for JWT authentication
 *  • URLSearchParams for building query strings
 *  • Throwing errors so calling code can use try/catch
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Base URL for every API request.
 * Change this once to point the entire app at a different server.
 * In production you would use an environment variable:
 *   const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
 */
const API_BASE = 'http://localhost:3000/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build the standard request headers for authenticated endpoints.
 *
 * CONTENT-TYPE:
 *   'application/json' tells the server "the request body is JSON".
 *   Without this, Express would not parse the body automatically.
 *
 * AUTHORIZATION — BEARER TOKEN:
 *   After login, the server returns a JWT token.
 *   The client stores it and sends it on every subsequent request in this header:
 *     Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *
 *   The server's authMiddleware.js reads this header, verifies the token,
 *   and attaches the decoded user to req.user before passing to the controller.
 *
 *   Template literal:  `Bearer ${token}`  builds the string dynamically.
 *
 * @param {string} token – the JWT received from the login response
 * @returns {object}     – headers object for fetch()
 */
const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

/**
 * Generic fetch wrapper used by every exported function below.
 *
 * WHAT IT DOES:
 *   1. Calls fetch(url, options) — the raw browser HTTP request.
 *   2. Parses the response body as JSON.
 *   3. If the HTTP status is not 2xx (res.ok === false), throws an Error.
 *      This lets the calling component catch it with try/catch.
 *   4. Otherwise returns the parsed data.
 *
 * WHY THROW AN ERROR?
 *   fetch() does NOT throw on HTTP errors like 401, 404, or 500.
 *   It only throws on network failures (no internet, server unreachable).
 *   We must check res.ok ourselves and throw manually so the component's
 *   catch block triggers for API errors too.
 *
 * ERROR MESSAGE PRIORITY:
 *   data.message  → our API's standard error field (from utils/response.js)
 *   data.error    → fallback in case the format differs
 *   `Request failed (${res.status})` → final fallback with the HTTP status code
 *
 * @param {string} url
 * @param {RequestInit} options  – fetch options (method, headers, body, etc.)
 * @returns {Promise<any>}       – parsed JSON response
 */
const request = async (url, options = {}) => {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) {
    // Throw so the component's catch block handles the error (show a toast, etc.)
    throw new Error(data.message || data.error || `Request failed (${res.status})`);
  }
  return data;
};

// ── Auth ──────────────────────────────────────────────────────────────────────
// No token needed — these endpoints are public (no authMiddleware on the route).

/**
 * POST /api/login
 * @param {{ username: string, password: string }} credentials
 * @returns {Promise<{ token: string, user: object }>}
 */
export const login = ({ username, password }) =>
  request(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

/**
 * POST /api/register
 * @param {string} username
 * @param {string} password
 * @param {string} email
 * @returns {Promise<{ message: string, userId: number }>}
 */
export const register = (username, password, email) =>
  request(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email }),
  });

// ── Reference Data ────────────────────────────────────────────────────────────
// Public endpoints — no token required.
// Used to populate the "Category" dropdown when creating income or expense records.

/** GET /api/reference-data/income-types  → array of { id, name } */
export const getIncomeTypes = () =>
  request(`${API_BASE}/reference-data/income-types`);

/** GET /api/reference-data/expense-types  → array of { id_expense, name } */
export const getExpenseTypes = () =>
  request(`${API_BASE}/reference-data/expense-types`);

// ── Income ────────────────────────────────────────────────────────────────────

/**
 * GET /api/income  – fetch all income records (with optional filters)
 *
 * URL SEARCH PARAMS:
 *   URLSearchParams converts an object into a query string:
 *     { type_id: 2, from: '2025-01-01' }  →  "type_id=2&from=2025-01-01"
 *
 *   The filter method removes keys where the value is undefined or empty string,
 *   so we never send "type_id=" with no value.
 *
 * RESULT URL EXAMPLES:
 *   No filters: GET /api/income
 *   With filters: GET /api/income?type_id=2&from=2025-01-01&to=2025-03-31
 *
 * @param {string} token
 * @param {{ type_id?: number, from?: string, to?: string }} [filters]
 * @returns {Promise<Array>}
 */
export const getIncome = (token, filters = {}) => {
  // Build query string — skip any empty/undefined values
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''))
  ).toString();
  const incomeUrl = q ? `${API_BASE}/income?${q}` : `${API_BASE}/income`;
  return request(incomeUrl, { headers: authHeaders(token) });
};

/** GET /api/income/:id */
export const getIncomeById = (id, token) =>
  request(`${API_BASE}/income/${id}`, { headers: authHeaders(token) });

/** POST /api/income */
export const createIncome = (body, token) =>
  request(`${API_BASE}/income`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });

/** PUT /api/income/:id  – partial update, send only fields to change */
export const updateIncome = (id, body, token) =>
  request(`${API_BASE}/income/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });

/** DELETE /api/income/:id */
export const deleteIncome = (id, token) =>
  request(`${API_BASE}/income/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });

// ── Expense ───────────────────────────────────────────────────────────────────
// Mirrors the income section exactly — same patterns, same query-string logic.

/**
 * GET /api/expense  – fetch all expense records (with optional filters)
 *
 * @param {string} token
 * @param {{ type_id?: number, from?: string, to?: string }} [filters]
 * @returns {Promise<Array>}
 */
export const getExpenses = (token, filters = {}) => {
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''))
  ).toString();
  const expenseUrl = q ? `${API_BASE}/expense?${q}` : `${API_BASE}/expense`;
  return request(expenseUrl, { headers: authHeaders(token) });
};

/** GET /api/expense/:id */
export const getExpenseById = (id, token) =>
  request(`${API_BASE}/expense/${id}`, { headers: authHeaders(token) });

/** POST /api/expense */
export const createExpense = (body, token) =>
  request(`${API_BASE}/expense`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });

/** PUT /api/expense/:id  – partial update */
export const updateExpense = (id, body, token) =>
  request(`${API_BASE}/expense/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });

/** DELETE /api/expense/:id */
export const deleteExpense = (id, token) =>
  request(`${API_BASE}/expense/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });

// ── Balance ───────────────────────────────────────────────────────────────────

/**
 * GET /api/balance  – returns the single live balance row:
 *   { amount_balance, total_income, total_expense, date_created }
 */
export const getLiveBalance = (token) =>
  request(`${API_BASE}/balance`, { headers: authHeaders(token) });

/**
 * GET /api/balance/trend?days=30  – returns an array of daily snapshots for charting.
 * @param {string} token
 * @param {number} days – how many past days to include (default 30)
 */
export const getBalanceTrend = (token, days = 30) =>
  request(`${API_BASE}/balance/trend?days=${days}`, { headers: authHeaders(token) });

// ── Dashboard ─────────────────────────────────────────────────────────────────

/**
 * GET /api/dashboard  – fetches all stats needed for the dashboard in one call.
 *
 * Returns:
 *   { balance, totalIncome, totalExpense, incomeBreakdown, expenseBreakdown, trend }
 *
 * Optional date range filters narrow the income/expense breakdowns but
 * the live balance is always the current total (not filtered).
 *
 * @param {string} token
 * @param {{ from?: string, to?: string }} [filters]
 */
export const getDashboard = (token, filters = {}) => {
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
  ).toString();
  const dashUrl = q ? `${API_BASE}/dashboard?${q}` : `${API_BASE}/dashboard`;
  return request(dashUrl, { headers: authHeaders(token) });
};

// ── Users (admin) ─────────────────────────────────────────────────────────────
// These endpoints are protected and typically only usable by admin roles.

export const getUsers = (token) =>
  request(`${API_BASE}/users`, { headers: authHeaders(token) });

export const getUserById = (id, token) =>
  request(`${API_BASE}/users/${id}`, { headers: authHeaders(token) });

export const updateUser = (id, user, token) =>
  request(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(user),
  });

export const deleteUser = (id, token) =>
  request(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
