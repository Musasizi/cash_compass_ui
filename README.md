# CashCompass UI — Frontend

> **Teaching Project** | React 19 · Vite · Material UI v7 · ApexCharts · React Router v7
>
> This is the frontend for the **CashCompass Personal Finance Tracker**.
> It is built to be read and understood — every folder has a single clear
> purpose, and every component is commented to explain the React patterns used.

---

## Table of Contents
1. [What This Project Teaches](#what-this-project-teaches)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Step-by-Step Setup](#step-by-step-setup)
6. [Pages & Features](#pages--features)
7. [How Data Flows](#how-data-flows)
8. [Key Concepts Explained](#key-concepts-explained)
9. [Connecting to the Backend](#connecting-to-the-backend)
10. [Available Scripts](#available-scripts)
11. [Common Errors & Fixes](#common-errors--fixes)

---

## What This Project Teaches

| Concept | Where to look |
|---------|--------------|
| React component structure | `src/pages/*.jsx` |
| React Router (protected routes) | `src/AppRouter.jsx` |
| Calling a REST API from React | `src/utils/api.js` |
| Shared layout (sidebar + topbar) | `src/layouts/ModernLayout.jsx` |
| State management with `useState` | any page component |
| Side effects with `useEffect` | `Dashboard.jsx`, `Income.jsx`, etc. |
| Custom hooks | `src/hooks/useToast.js` |
| Reusable components | `src/components/Toast.jsx` |
| Charts with ApexCharts | `Dashboard.jsx`, `Balance.jsx`, `Reports.jsx` |
| Form handling & validation | `Income.jsx`, `Expense.jsx` |
| MUI theming & `sx` props | all page files |

---

## Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| [React](https://react.dev/) | UI framework | 19 |
| [Vite](https://vitejs.dev/) | Build tool & dev server | 6 |
| [Material UI (MUI)](https://mui.com/) | Component library | 7 |
| [React Router](https://reactrouter.com/) | Client-side routing | 7 |
| [ApexCharts](https://apexcharts.com/) | Charts (donut, bar, area) | latest |
| [prop-types](https://www.npmjs.com/package/prop-types) | Runtime prop validation | latest |

---

## Project Structure

```
cashcompass_ui/
│
├── index.html              ← The single HTML file Vite serves (SPA entry point)
├── vite.config.js          ← Vite configuration (dev proxy settings live here)
├── eslint.config.js        ← Linting rules (enforces code quality)
│
└── src/
    │
    ├── main.jsx            ← Mounts the React app into index.html
    ├── App.jsx             ← Top-level component; holds auth state (user/token)
    ├── AppRouter.jsx       ← All routes defined here; protects pages behind login
    │
    ├── assets/             ← Static images and icons
    │
    ├── utils/
    │   └── api.js          ← ⭐ All HTTP calls to the backend — start reading here
    │
    ├── hooks/
    │   └── useToast.js     ← Custom hook: manages toast notification state
    │
    ├── components/
    │   └── Toast.jsx       ← Reusable snackbar/alert notification component
    │
    ├── layouts/
    │   ├── ModernLayout.jsx ← Main shell: sidebar navigation + topbar + page area
    │   └── MainLayout.jsx  ← Simpler layout (kept for reference)
    │
    └── pages/
        ├── Login.jsx       ← Login form (public — no token needed)
        ├── Register.jsx    ← Registration form (public)
        ├── Dashboard.jsx   ← KPI cards + income/expense charts (protected)
        ├── Income.jsx      ← Income CRUD — list, add, edit, delete (protected)
        ├── Expense.jsx     ← Expense CRUD (protected)
        ├── Balance.jsx     ← Live balance + trend chart (protected)
        ├── Reports.jsx     ← Analytics — bar chart, donut charts, summary table
        └── Users.jsx       ← User management (protected)
```

---

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18 or higher | https://nodejs.org |
| npm | comes with Node.js | — |
| The CashCompass API | running on port 3000 | see `cashcompass_api/readme.md` |

Check your version:
```bash
node --version   # v18 or higher
npm --version    # 9 or higher
```

---

## Step-by-Step Setup

### 1 — Navigate into the UI folder

```bash
cd cashcompass/cashcompass_ui
```

### 2 — Install dependencies

```bash
npm install
```

This installs React, MUI, ApexCharts, React Router and all other packages
listed in `package.json`.

### 3 — Configure the API base URL

Open `src/utils/api.js`. Near the top you will see:

```javascript
const API_BASE = 'http://localhost:3000/api';
```

If your backend runs on a different port, change this value. For development
this default is correct — leave it as-is.

### 4 — Start the development server

```bash
npm run dev
```

Vite will print something like:

```
  VITE v6.x.x  ready in 120 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open **http://localhost:5173** in your browser.

### 5 — Log in

Use the demo account seeded by the backend:

```
Username:  demo
Password:  password123
```

---

## Pages & Features

### Login & Register
- Split-screen layout: CashCompass teal branding on the left, form on the right
- On successful login the JWT token is stored in React state and passed to all protected pages
- On successful registration, redirects automatically to Login

### Dashboard
- **Period filter** — This Week / This Month / Custom date range
- **KPI Cards** — Live Balance, Total Income, Total Expenditure
- **Income by Type** — Donut chart (e.g. Salary, Gigs, Pocket Money, Gifts)
- **Expense by Type** — Donut chart (e.g. Necessity, Luxury)
- **Balance Trend** — Area chart of daily snapshots

### Income
- Table of all income records with date, type and amount
- **Filter** by income type and date range
- **Add** a new income record (dialog form)
- **Edit** an existing record (same dialog, pre-filled)
- **Delete** with confirmation
- Toast notification on every action

### Expense
- Same CRUD pattern as Income
- Extra fields: Description (name), Budgeted amount vs Actual amount spent
- Color-coded Budgeted vs Spent columns

### Balance
- Live balance KPI card (always current)
- Total Income and Total Expense KPI cards
- Area trend chart — last 30 daily balance snapshots
- Snapshot history table with type chip (live vs daily)

### Reports
- Summary table (Total Income, Total Expense, Net Balance, Live Balance)
- **Income vs Expense by Type** — grouped bar chart
- **Income Breakdown** — donut chart
- **Expense Breakdown** — donut chart
- Date range filter

### Users
- List all registered users
- Update username / email
- Delete a user

---

## How Data Flows

```
User action (click / form submit)
          │
          ▼
  Page component (e.g. Income.jsx)
  calls api.js function
          │
          ▼
  api.js sends fetch() request
  to Express backend on :3000
          │
          ▼
  Backend returns JSON
          │
          ▼
  useState() updates with new data
          │
          ▼
  React re-renders the UI automatically
```

All API functions are in **`src/utils/api.js`** — open this file first when
you want to understand how the frontend talks to the backend.

---

## Key Concepts Explained

### 1. Protected Routes

Not every page should be accessible without logging in. `AppRouter.jsx`
wraps protected pages in a `<ProtectedRoute>` component:

```jsx
// AppRouter.jsx
function ProtectedRoute({ user, token, children }) {
  // If there's no logged-in user, redirect to the login page
  if (!user) return <Navigate to="/login" replace />;
  // Otherwise, render the page (injecting user and token as props)
  return children;
}
```

Students: try removing the `<ProtectedRoute>` wrapper from a route and see
what happens when you visit that page without logging in.

---

### 2. Lifting State Up

`App.jsx` owns the `user` and `token` state. It passes them *down* to every
page via props. This is called **lifting state up**:

```jsx
// App.jsx
const [user,  setUser]  = useState(null);
const [token, setToken] = useState(null);

// Login.jsx receives onLogin and calls it with the user + token
<Login onLogin={(u, t) => { setUser(u); setToken(t); }} />

// Protected pages receive user + token as props
<Dashboard token={token} user={user} />
```

This avoids having to re-fetch the user in every page.

---

### 3. Custom Hooks

`useToast.js` is a **custom hook** — a function that starts with `use` and
can contain React state and effects:

```javascript
// src/hooks/useToast.js
export function useToast() {
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  const showToast = (message, severity = 'info') => {
    setToast({ open: true, message, severity });
  };

  const hideToast = () => setToast(prev => ({ ...prev, open: false }));

  return { toast, showToast, hideToast };
}
```

Usage in any page:
```jsx
const { toast, showToast, hideToast } = useToast();

// After saving a record:
showToast('Income saved!', 'success');

// In JSX:
<Toast toast={toast} onClose={hideToast} />
```

This keeps toast logic in one place and out of every page.

---

### 4. useEffect for Data Fetching

Every data page follows this pattern:

```jsx
const [data,    setData]    = useState([]);
const [loading, setLoading] = useState(true);

// useEffect runs AFTER the component renders for the first time
// (and again whenever the values in the [] dependency array change)
useEffect(() => {
  getIncome(token)          // call the API
    .then(res => setData(res.data))  // save the result in state
    .catch(() => {})         // handle errors silently (or show a toast)
    .finally(() => setLoading(false)); // always stop the spinner
}, [token]); // re-run if token changes
```

The `loading` state is used to show a `<CircularProgress />` spinner while
the data loads.

---

### 5. MUI `sx` prop

Instead of separate CSS files, MUI components accept an `sx` prop for inline
styling that has access to the theme:

```jsx
// Regular CSS:  color: #1E3A8A; font-weight: 800;
// With sx prop:
<Typography sx={{ color: '#1E3A8A', fontWeight: 800 }}>
  CashCompass
</Typography>

// Responsive values work too:
<Stack direction={{ xs: 'column', sm: 'row' }}>
  {/* stacks vertically on mobile, horizontally on tablet+ */}
</Stack>
```

---

## Connecting to the Backend

All backend communication is in **one file**: `src/utils/api.js`.

Each function follows the same pattern:

```javascript
// A helper that wraps fetch() and handles errors consistently
const request = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

// An exported function for each backend endpoint
export const getIncome = (token, filters = {}) => {
  const q = new URLSearchParams(filters).toString();
  const url = q ? `${API_BASE}/income?${q}` : `${API_BASE}/income`;
  return request(url, { headers: { Authorization: `Bearer ${token}` } });
};
```

To add a new endpoint:
1. Add a function to `api.js`
2. Import it in your page
3. Call it inside a `useEffect` or an event handler

---

## Available Scripts

Run these from inside the `cashcompass_ui/` folder:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server at http://localhost:5173 |
| `npm run build` | Build the production bundle into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint — fix all warnings before committing |

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| Blank page / 404 on refresh | React Router needs server config | Use `npm run dev`; for production configure the server to serve `index.html` for all routes |
| `Failed to fetch` in browser console | Backend not running | Start the API: `cd cashcompass_api && npm start` |
| `401 Unauthorized` API responses | Token missing or expired | Log out and log in again |
| Charts not rendering | ApexCharts needs numeric data | Check that `series` is an array of numbers, not strings |
| `EADDRINUSE` on port 5173 | Another Vite instance is running | Kill it: `lsof -ti:5173 \| xargs kill` |
| MUI deprecation warning in console | Old MUI v5 prop used | Check `eslint` output — all pages are updated to v7 syntax |

---

## Author

**Musasizi Kenneth**
GitHub: [github.com/musasizi](https://github.com/musasizi)
Email: kennymusasizi@gmail.com

---

*Happy Coding! 🚀 — The best way to learn React is to change something,
break it, understand why, and fix it.*
