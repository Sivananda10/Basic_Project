# 🎨 Frontend README — Kids Hobbies Prediction System

> **Tech Stack:** React 18 · Vite · JSX · Vanilla CSS  
> **Location:** `kids_hobby_project/frontend/`  
> **Runs at:** http://localhost:5173

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Setup & Running](#setup--running)
5. [All Files Explained](#all-files-explained)
   - [Entry Points](#entry-points)
   - [Context Providers](#context-providers)
   - [API Layer](#api-layer)
   - [Components](#components)
   - [Pages](#pages)
   - [Styles](#styles)
6. [Routing Map](#routing-map)
7. [Authentication Flow](#authentication-flow)
8. [How Frontend Talks to Backend](#how-frontend-talks-to-backend)

---

## Overview

The frontend is a **Single Page Application (SPA)** built with **React 18** and **Vite**. It communicates with the Django REST API backend using **Axios** with **JWT authentication**. The app includes a persistent sidebar layout, protected routes, toast notifications, and a multi-step hobby prediction form.

---

## Tech Stack

| Tool / Library | Purpose |
|----------------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server (fast HMR) |
| **React Router DOM v6** | Client-side routing |
| **Axios** | HTTP requests to Django REST API |
| **JWT (via localStorage)** | Authentication token storage |
| **Vanilla CSS** | All styling (no Tailwind/Bootstrap) |

---

## Folder Structure

```
frontend/
├── index.html                   ← HTML entry point (Vite injects JS here)
├── package.json                 ← Project dependencies & scripts
├── vite.config.js               ← Vite configuration (proxy, aliases)
│
└── src/
    ├── main.jsx                 ← React app mount point
    ├── App.jsx                  ← Router, Layout, all route definitions
    ├── App.css                  ← App-level layout styles
    ├── index.css                ← Global CSS reset & base styles
    │
    ├── api/                     ← All HTTP request functions (Axios)
    │   ├── axiosInstance.js     ← Axios base config + JWT interceptors
    │   ├── authApi.js           ← Login, Register, Logout API calls
    │   └── predictionApi.js     ← Predict & History API calls
    │
    ├── context/                 ← React Context (global state)
    │   ├── AuthContext.jsx      ← User auth state (login/logout/token)
    │   └── ToastContext.jsx     ← Toast notification state
    │
    ├── components/              ← Reusable UI components
    │   ├── Sidebar.jsx          ← Side navigation bar
    │   ├── Navbar.jsx           ← Top navigation bar
    │   ├── Navbar.css           ← Navbar styles
    │   ├── Footer.jsx           ← Page footer
    │   ├── ProtectedRoute.jsx   ← Redirects unauthenticated users to /login
    │   └── AdminRoute.jsx       ← Redirects non-admin users away from /dashboard
    │
    ├── pages/                   ← One file per page/screen
    │   ├── HomePage.jsx         ← Landing page
    │   ├── HomePage.css         ← Landing page styles
    │   ├── AboutPage.jsx        ← About the project page
    │   ├── ContactPage.jsx      ← Contact form page
    │   ├── AuthPage.jsx         ← Combined Login + Register page
    │   ├── AuthPage.css         ← Auth page styles
    │   ├── PredictPage.jsx      ← Multi-step child assessment form ⭐
    │   ├── PredictPage.css      ← Predict page styles
    │   ├── ResultPage.jsx       ← Shows prediction result + confidence
    │   ├── ResultPage.css       ← Result page styles
    │   ├── HistoryPage.jsx      ← All past predictions for the user
    │   ├── HistoryPage.css      ← History page styles
    │   ├── FeedbackPage.jsx     ← Submit feedback on a prediction
    │   ├── ProfilePage.jsx      ← User profile + change password
    │   ├── ProfilePage.css      ← Profile page styles
    │   └── AdminDashboardPage.jsx ← Admin stats, user list, predictions
    │
    ├── styles/
    │   └── global.css           ← Design system: CSS variables, colors, fonts
    │
    └── assets/                  ← Static images, icons, illustrations
```

---

## Setup & Running

### Prerequisites
- Node.js 18+ installed → check: `node --version`
- npm 9+ installed → check: `npm --version`

### Steps

```bash
# 1. Navigate to frontend directory
cd kids_hobby_project/frontend

# 2. Install all dependencies
npm install

# 3. Start the development server
npm run dev
```

**App opens at:** http://localhost:5173

> ⚠️ The Django backend must also be running at **http://localhost:8000** for API calls to work.

### Available npm Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Build production bundle into `dist/` |
| `npm run preview` | Preview the production build locally |

---

## All Files Explained

### Entry Points

#### `index.html`
The root HTML file. Vite injects the compiled JavaScript here. Contains the `<div id="root">` where React mounts.

#### `src/main.jsx`
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
```
- The true JavaScript entry point.
- Mounts the `<App />` component into `#root` in `index.html`.
- Imports global CSS via `index.css`.

#### `src/App.jsx`
The root React component. Does three things:
1. **Wraps the entire app** in `AuthProvider` and `ToastProvider` context providers.
2. **Sets up React Router** with `BrowserRouter`.
3. **Defines all routes** — public, protected (login-required), and admin-only.

**Layout structure:**
```
App
 └── AuthProvider
      └── ToastProvider
           └── BrowserRouter
                └── Layout
                     ├── Sidebar (always visible)
                     └── sb-content
                          ├── <Routes> (changes per page)
                          └── Footer
```

**Route groups:**
- **Public** → `/`, `/about`, `/contact`, `/login`, `/register`
- **Protected** (must be logged in) → `/profile`, `/predict`, `/result`, `/history`, `/feedback/:id`
- **Admin only** → `/dashboard`

---

### Context Providers

#### `src/context/AuthContext.jsx`
**Purpose:** Global authentication state shared across all components.

**What it stores:**
- `user` — the logged-in user object (username, is_staff flag, etc.)
- `tokens` — JWT access & refresh tokens (from localStorage)
- `login(data)` — stores tokens + user after successful login
- `logout()` — clears tokens + redirects to `/login`
- `isAuthenticated` — boolean, true if access token exists

**How it works:**
- On app load, reads tokens from `localStorage` to restore session.
- Any component can call `useAuth()` to access user state.

#### `src/context/ToastContext.jsx`
**Purpose:** Global toast notification system.

**What it provides:**
- `showToast(message, type)` — triggers a toast popup (success / error / info)
- Toasts auto-dismiss after a few seconds.
- Any page or component can call `useToast()` to show notifications.

---

### API Layer

#### `src/api/axiosInstance.js`
**Purpose:** A pre-configured Axios instance used by all API files.

**Key configurations:**
```js
baseURL: "http://localhost:8000/api"   // Django REST API base URL
```

**JWT Interceptors:**
- **Request interceptor** → Automatically attaches the JWT `access` token to every request in the `Authorization: Bearer <token>` header.
- **Response interceptor** → If a `401 Unauthorized` response is received (token expired), it automatically uses the `refresh` token to get a new access token, then retries the original request.
- If refresh also fails → logs out the user automatically.

#### `src/api/authApi.js`
| Function | Endpoint | Description |
|----------|---------|-------------|
| `registerUser(data)` | POST `/api/auth/register/` | Creates a new user account |
| `loginUser(data)` | POST `/api/auth/login/` | Returns JWT access + refresh tokens |
| `logoutUser(refresh)` | POST `/api/auth/logout/` | Blacklists the refresh token |

#### `src/api/predictionApi.js`
| Function | Endpoint | Description |
|----------|---------|-------------|
| `submitPrediction(data)` | POST `/api/predict/` | Sends 19 form fields, gets predicted hobby back |
| `getHistory()` | GET `/api/history/` | Fetches all past predictions for logged-in user |

---

### Components

#### `src/components/Sidebar.jsx`
The persistent left-side navigation panel visible on every page.

**Features:**
- Collapsible on mobile (hamburger toggle).
- Shows different links based on auth state:
  - **Guest** → Home, About, Contact, Login, Register
  - **Logged in** → Home, Predict, History, Profile, Logout
  - **Admin** → All above + Dashboard
- Highlights the active route using `NavLink` from React Router.
- Shows the logged-in username at the bottom.

#### `src/components/Navbar.jsx`
Top navigation bar (visible on mobile / small screens).

**Features:**
- App title / logo on the left.
- Auth buttons (Login / Register or Logout) on the right.

#### `src/components/Footer.jsx`
Page footer, shown at the bottom of every page.

**Contains:**
- Project name and tagline.
- Copyright info.

#### `src/components/ProtectedRoute.jsx`
A route guard component.

**Logic:**
- If user is **not logged in** → redirects to `/login`.
- If user **is logged in** → renders the child route normally.
- Used by wrapping protected routes in `App.jsx`:
  ```jsx
  <Route element={<ProtectedRoute />}>
    <Route path="/predict" element={<PredictPage />} />
    ...
  </Route>
  ```

#### `src/components/AdminRoute.jsx`
Admin-only route guard.

**Logic:**
- If user is **not staff/admin** → redirects to `/`.
- If user **is admin** → renders the child route.
- Wraps `/dashboard` route.

---

### Pages

#### `pages/HomePage.jsx` + `HomePage.css`
The public landing page.

**Sections:**
- Hero section with project tagline and CTA (Call-to-Action) button.
- "How it works" — step-by-step explanation.
- Feature highlights (prediction, history, feedback, admin).
- Info about the age group (5–12) and 3 hobby categories.

#### `pages/AboutPage.jsx`
Information about the project.

**Sections:**
- Project purpose and problem it solves.
- ML algorithm description (Random Forest).
- Dataset info (1,601 records, 19 features).
- Team / author credits.

#### `pages/ContactPage.jsx`
Contact form page.

**Features:**
- Name, Email, Subject, Message fields.
- Submits to `POST /api/contact/` via Axios.
- Shows toast on success or error.

#### `pages/AuthPage.jsx` + `AuthPage.css`
Combined Login and Register page (renders differently based on route `/login` or `/register`).

**Login flow:**
1. User enters username + password.
2. Calls `loginUser()` from `authApi.js`.
3. On success → stores tokens via `AuthContext.login()` → redirects to `/predict`.

**Register flow:**
1. User enters username, email, password, confirm password.
2. Calls `registerUser()` from `authApi.js`.
3. On success → shows toast → redirects to `/login`.

#### `pages/PredictPage.jsx` + `PredictPage.css` ⭐ (Most Important Page)
The multi-step child assessment form. This is the core feature of the application.

**Form structure — 19 input fields organized into steps:**

| Step | Category | Fields |
|------|---------|--------|
| Step 1 | Basic Info | Age (5–12) |
| Step 2 | Academics | Olympiad, Scholarship, Favourite Subject, Projects, Grasping Power |
| Step 3 | Sports | Time on Sports, Medals, Career in Sports, Active in Sports |
| Step 4 | Arts | Fascination for Arts, Won Art Competitions, Time on Arts |
| Step 5 | Analytical | Solves Puzzles, Logical Score, Plays Chess/Board Games |
| Step 6 | Health | Daily Exercise (min), Dietary Habits, Health Awareness |

**Submission flow:**
1. User fills all steps.
2. On submit → calls `POST /api/predict/` with all 19 fields.
3. Backend processes and returns `{ predicted_hobby, confidence_score, prediction_id }`.
4. Frontend stores result in React state and navigates to `/result`.

#### `pages/ResultPage.jsx` + `ResultPage.css`
Displays the ML prediction result.

**Shows:**
- Predicted hobby (Sports / Arts / Academics / Analytical Thinking / Health & Fitness).
- Confidence score as a percentage.
- Recommended activities based on the predicted hobby.
- CTA buttons → "Predict Again" or "Give Feedback".

#### `pages/HistoryPage.jsx` + `HistoryPage.css`
Shows all past predictions made by the logged-in user.

**Features:**
- Calls `GET /api/history/` on mount.
- Lists each prediction card with: date, predicted hobby, confidence %, feedback status.
- Each card has a "Give Feedback" button (links to `/feedback/:id`).

#### `pages/FeedbackPage.jsx`
Allows users to rate the prediction accuracy.

**Form fields:**
- Was the prediction accurate? (Yes / No toggle)
- Comments (optional text area)

**Submits to:** `POST /api/feedback/<prediction_id>/`

#### `pages/ProfilePage.jsx` + `ProfilePage.css`
User profile page.

**Features:**
- Shows username, email, date joined.
- Change password form (current password + new password + confirm).
- Submits to `POST /api/profile/change-password/`.

#### `pages/AdminDashboardPage.jsx`
Admin-only statistics dashboard.

**Shows (calls `GET /api/admin/dashboard/`):**
- Total users count.
- Total predictions count.
- Hobby distribution breakdown (Sports / Arts / Academics counts).
- Accuracy rate from feedback.
- Recent predictions list.
- User list.

---

### Styles

#### `src/styles/global.css`
The core design system. Defines all CSS custom properties (variables) used throughout the app.

**Contains:**
- Color palette (primary, secondary, accent, background, text colors).
- Typography scale (font sizes, weights, line heights).
- Spacing scale.
- Border radius values.
- Box shadow presets.
- Utility classes.

#### `src/index.css`
Global CSS reset and base element styles (body, html, *, box-sizing).

#### `src/App.css`
Layout styles for the sidebar + content area structure:
- `.sb-layout` → flexbox container (sidebar + main content side by side).
- `.sb-content` → the scrollable main content area.
- `.sb-page` → padding + max-width for page content.

#### Per-page CSS files
Each major page has its own `.css` file co-located in `pages/`:
- `HomePage.css` — hero section, feature cards, how-it-works steps.
- `AuthPage.css` — login/register form card and input styling.
- `PredictPage.css` — multi-step form, step indicators, field groups.
- `ResultPage.css` — prediction result card, confidence ring, hobby icons.
- `HistoryPage.css` — prediction cards list layout.
- `ProfilePage.css` — profile info card, change-password form.

---

## Routing Map

| Path | Page | Access |
|------|------|--------|
| `/` | HomePage | Public |
| `/about` | AboutPage | Public |
| `/contact` | ContactPage | Public |
| `/login` | AuthPage (login mode) | Public |
| `/register` | AuthPage (register mode) | Public |
| `/predict` | PredictPage | 🔒 Login required |
| `/result` | ResultPage | 🔒 Login required |
| `/history` | HistoryPage | 🔒 Login required |
| `/feedback` | FeedbackPage | 🔒 Login required |
| `/feedback/:id` | FeedbackPage (for specific prediction) | 🔒 Login required |
| `/profile` | ProfilePage | 🔒 Login required |
| `/dashboard` | AdminDashboardPage | 🔒 Admin only |

---

## Authentication Flow

```
User fills Login form
        │
        ▼
POST /api/auth/login/
        │
        ▼
Django returns { access, refresh, user }
        │
        ▼
AuthContext.login() stores tokens in localStorage
        │
        ▼
axiosInstance auto-attaches token to all future requests
        │
        ▼
If token expires → interceptor auto-refreshes using refresh token
        │
        ▼
User logs out → tokens cleared from localStorage
```

---

## How Frontend Talks to Backend

```
React Page
    │
    ├── calls function in src/api/predictionApi.js or authApi.js
    │        │
    │        ▼
    │   axiosInstance  ← attaches JWT token automatically
    │        │
    │        ▼
    │   HTTP Request to http://localhost:8000/api/...
    │        │
    │        ▼
    │   Django REST API processes request
    │        │
    │        ▼
    │   JSON Response
    │        │
    ▼
React updates state → re-renders UI
```

### CORS Note
The Django backend has `django-cors-headers` configured to allow requests from `http://localhost:5173` during development. This is why the frontend can talk to a different port (8000) without browser errors.

---

*For backend documentation, see `BACKEND_README.md`*
