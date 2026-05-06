# 🎨 Frontend README — Kids Hobby Prediction System

> **Tech Stack:** React 18 · Vite · JSX · Vanilla CSS · Poppins / Inter fonts
> **Location:** `kids_hobby_project/frontend/`
> **Dev Server:** http://localhost:5173
> **Desktop Mode:** Served by Django at http://127.0.0.1:5000

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Setup & Running](#setup--running)
5. [Build for Desktop](#build-for-desktop)
6. [All Files Explained](#all-files-explained)
7. [Routing Map](#routing-map)
8. [Authentication Flow](#authentication-flow)
9. [Desktop Mode Notes](#desktop-mode-notes)

---

## Overview

The frontend is a **Single Page Application (SPA)** built with **React 18** and **Vite**. It communicates with the Django REST API backend using **Axios** with **JWT authentication**. The app includes:

- Persistent sidebar layout with protected routes
- Toast notification system
- Multi-step hobby prediction form (19 behavioral + academic parameters)
- Admin dashboard with charts and user management
- Full prediction history with detail expansion
- Contact form, About page, Profile page

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool & dev server |
| React Router DOM | 6.x | Client-side routing |
| Axios | 1.x | HTTP client |
| Bootstrap Icons | 1.11.x | Icon library |
| Poppins / Inter | (Google Fonts) | Typography |

---

## Folder Structure

```
frontend/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   ├── login_illustration.png       ← Auth page hero image
│   └── login_illustration__.png
├── src/
│   ├── api/
│   │   └── axiosInstance.js         ← Axios + JWT interceptors
│   ├── context/
│   │   ├── AuthContext.jsx          ← Global auth state (login/register/logout)
│   │   └── ToastContext.jsx         ← Toast notification state
│   ├── components/
│   │   ├── Sidebar.jsx              ← Main navigation sidebar
│   │   ├── Footer.jsx               ← App footer
│   │   ├── ProtectedRoute.jsx       ← Redirects unauthenticated users
│   │   └── AdminRoute.jsx           ← Restricts to admin users only
│   ├── pages/
│   │   ├── HomePage.jsx             ← Landing/home page
│   │   ├── AuthPage.jsx             ← Login + Register (tabbed with animation)
│   │   ├── PredictPage.jsx          ← 19-question prediction form
│   │   ├── ResultPage.jsx           ← Prediction result + hobby follow-up Q&A
│   │   ├── HistoryPage.jsx          ← Past predictions with detail expansion
│   │   ├── ProfilePage.jsx          ← User profile (edit name, view stats)
│   │   ├── AboutPage.jsx            ← Project info page
│   │   ├── ContactPage.jsx          ← Contact form (functional)
│   │   ├── FeedbackPage.jsx         ← Rate prediction accuracy
│   │   └── AdminDashboardPage.jsx   ← Admin panel (users, predictions, charts)
│   ├── App.jsx                      ← Root component + route definitions
│   ├── main.jsx                     ← React DOM entry point
│   └── index.css                    ← Global styles & design tokens
├── index.html                       ← HTML entry point
├── vite.config.js                   ← Vite config (IIFE build + HTML patcher)
└── package.json
```

---

## Setup & Running

### Development (Vite dev server)

```bash
cd frontend
npm install
npm run dev          # → http://localhost:5173
```

> Make sure Django is running separately at port 8000 with CORS enabled.

### Production Build

```bash
cd frontend
npm run build        # → frontend/dist/
```

The build script automatically:
1. Bundles all JS into a single **IIFE** file (required for PyWebView)
2. Patches `dist/index.html`:
   - Removes `crossorigin` and `defer` attributes
   - Injects a **localStorage polyfill** (for WebKit2GTK on Linux)
   - Injects a **global JS error catcher** (shows errors as red text in window)
   - Moves all scripts to end of `<body>` (ensures `#root` exists before execution)

---

## Build for Desktop

After building, Django serves the React app:

```bash
# From project root
source venv/bin/activate
python launcher.py    # launches desktop window
```

Or double-click the **KidHobbyAI** icon on the Ubuntu Desktop.

---

## All Files Explained

### `vite.config.js`
- **IIFE build format** — required for PyWebView (no ES module support over `http://`)
- **HTML patcher plugin** — post-build hook that patches `dist/index.html`
- **localStorage polyfill** — `Object.defineProperty` override for WebKit2GTK
- **Error catcher** — renders JS crashes as visible red text in the app window

### `axiosInstance.js`
- Base URL: `http://127.0.0.1:5000/api/` (desktop) or `/api/` (web)
- **Request interceptor** — attaches `Authorization: Bearer <token>` header
- **Response interceptor** — on 401, attempts token refresh; on failure, logs out

### `AuthContext.jsx`
- Stores `user`, `accessToken`, `refreshToken` in `localStorage`
- Exposes: `login()`, `register()`, `logout()`, `refreshTokens()`
- Auto-restores session on page load

### `AuthPage.jsx`
- Reads URL path to determine Login vs Register mode
- Uses `window.history.replaceState()` for URL sync (avoids PyWebView reload loop)
- Animated slide transition between Login and Register forms

### `PredictPage.jsx`
- 19-parameter multi-step form (behavioral + academic inputs)
- Sends `POST /api/predict/` → receives predicted hobby
- Stores result in `localStorage` then navigates to `/result`

### `ResultPage.jsx`
- Displays predicted hobby with confidence scores
- Shows hobby-specific follow-up Q&A questionnaire
- Save response → stored with the prediction record

---

## Routing Map

| URL | Page | Auth Required |
|-----|------|---------------|
| `/` | HomePage | ❌ |
| `/about` | AboutPage | ❌ |
| `/contact` | ContactPage | ❌ |
| `/login` | AuthPage (login) | ❌ |
| `/register` | AuthPage (register) | ❌ |
| `/predict` | PredictPage | ✅ |
| `/result` | ResultPage | ✅ |
| `/history` | HistoryPage | ✅ |
| `/profile` | ProfilePage | ✅ |
| `/feedback/:id` | FeedbackPage | ✅ |
| `/dashboard` | AdminDashboardPage | ✅ Admin only |

---

## Authentication Flow

```
1. User registers → POST /api/register/ → receives access + refresh tokens
2. Tokens stored in localStorage (or in-memory polyfill on Linux desktop)
3. Every API request → Authorization: Bearer <access_token>
4. Token expired (401) → auto-refresh via POST /api/token/refresh/
5. Refresh fails → logout() clears tokens, redirects to /login
```

---

## Desktop Mode Notes

When running inside **PyWebView** (desktop app):

| Issue | Cause | Fix Applied |
|-------|-------|------------|
| `localStorage` is null | WebKit2GTK disables storage on `http://` | `Object.defineProperty` polyfill + `set_enable_html5_local_storage(True)` |
| ES modules fail | WebKit2GTK rejects `type="module"` | IIFE build format via Vite |
| `crossorigin` blocks scripts | Security sandbox | Stripped from `<script>` tags in patcher |
| Navigation causes full reload | React Router `navigate()` triggers server request | Use `window.history.replaceState()` instead |
| Images not loading | Root-level public files not mapped in Django | Added explicit route for `.png/.svg` files from `dist/` |
