# Kids Hobby Prediction System — Full Project Reference

> A complete technical reference for every file, folder, and component in this project.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Root-Level Files](#3-root-level-files)
4. [Django Backend](#4-django-backend)
   - [Main Config Package](#41-main-config-package--kids_hobby_prediction)
   - [Prediction App](#42-prediction-app--prediction)
5. [React Frontend](#5-react-frontend--frontend)
   - [Config Files](#51-config-files)
   - [Core App Files](#52-core-app-files)
   - [Context](#53-context)
   - [API Layer](#54-api-layer)
   - [Components](#55-components)
   - [Pages](#56-pages)
   - [Styles](#57-styles)
6. [Machine Learning Pipeline](#6-machine-learning-pipeline)
   - [Datasets](#61-datasets)
   - [ML Scripts](#62-ml-scripts)
   - [Saved Models](#63-saved-models)

---

## 1. Project Overview

**KidHobbyAI** is a full-stack machine learning web application that predicts the most suitable hobby for a child (age 5–17) based on their interests, skills, and health condition. A parent/guardian fills in a multi-step questionnaire on the frontend; the answers are sent to the Django REST API, which runs a trained Random Forest model and returns a ranked hobby recommendation.

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, React Router 7, Chart.js |
| Backend API | Django 4, Django REST Framework, SimpleJWT |
| ML | scikit-learn (Random Forest), pandas, numpy, joblib |
| Database | SQLite (dev) / MySQL (production) |
| Auth | JWT (access token 60 min, refresh token 7 days) |

**5 Hobby Categories → 21 Specific Hobbies:**

| Category | Hobbies |
|---|---|
| Sports | Cricket, Football, Badminton, Swimming, Table Tennis, Basketball, Athletics, Carrom |
| Arts | Drawing, Music, Dance |
| Academics | Math Olympiad, Science Club, Creative Writing |
| Analytical | Coding, Chess, Robotics |
| Health & Fitness | Yoga, Gymnastics, Running, Meditation |

---

## 2. Architecture Diagram

```
Browser (React SPA @ :5173)
        │
        │  HTTP/JSON  (Axios + JWT Bearer token)
        ▼
Django REST API (@ :8000/api/)
        │
        ├── Auth      → /api/auth/register|login|logout|token/refresh
        ├── Profile   → /api/profile/  (GET/PUT)
        ├── Predict   → /api/predict/  (POST) ──► ml_helpers_v3.py ──► model_v4.pkl
        ├── History   → /api/history/  (GET)
        ├── Feedback  → /api/feedback/<id>/ (POST)
        ├── Contact   → /api/contact/  (POST)
        └── Admin     → /api/admin/dashboard/ (GET, staff only)
                │
                ▼
          SQLite DB (dev)
          InputData | Prediction | Feedback tables
```

---

## 3. Root-Level Files

| File | Purpose |
|---|---|
| `manage.py` | Django management entry point. Run `python manage.py runserver` to start the server. |
| `requirements.txt` | Python dependencies: Django, DRF, SimpleJWT, CORS headers, scikit-learn, pandas, numpy, joblib, mysqlclient, matplotlib, seaborn. |
| `db.sqlite3` | SQLite database file auto-created by Django migrations. Contains users, predictions, and feedback rows. |
| `.gitignore` | Excludes `venv/`, `__pycache__/`, `*.pkl`, `*.npz`, and `db.sqlite3` from git. |
| `README.md` | Original setup README (now superseded by this file and `SETUP_GUIDE.md`). |
| `PROJECT_REFERENCE.md` | ← This file. Full technical reference. |
| `SETUP_GUIDE.md` | Step-by-step guide for cloning and running the project from scratch. |

---

## 4. Django Backend

### 4.1 Main Config Package — `kids_hobby_prediction/`

#### `settings.py`
The central configuration file for the Django project.

| Setting | Value / Explanation |
|---|---|
| `SECRET_KEY` | Hardcoded dev key — **must be changed in production**. |
| `DEBUG = True` | Must be set to `False` in production. |
| `ALLOWED_HOSTS = ['*']` | Allow all hosts in dev. Restrict in production. |
| `INSTALLED_APPS` | Includes `rest_framework`, `rest_framework_simplejwt`, `corsheaders`, and the local `prediction` app. |
| `DATABASES` | Currently `SQLite3`. A commented `MySQL` block is ready for production switch. |
| `TIME_ZONE` | `'Asia/Kolkata'` (IST). |
| `CORS_ALLOW_ALL_ORIGINS = True` | Active only when `DEBUG=True`, so the Vite dev server (:5173) can call the API without CORS errors. |
| `REST_FRAMEWORK` | Default auth class = `JWTAuthentication`. Default permission = `IsAuthenticated`. |
| `SIMPLE_JWT` | Access token: 60 min. Refresh token: 7 days. Token rotation enabled. |
| `AUTH_PASSWORD_VALIDATORS` | Empty list for dev — **add validators before production**. |

#### `urls.py`
The root URL config. Only two routes are registered:
- `/admin/` → Django built-in admin panel.
- `/api/` → All REST endpoints, delegated to `prediction/api_urls.py`.

#### `wsgi.py`
Standard Django WSGI entry point for production deployment (e.g., Gunicorn + Nginx).

---

### 4.2 Prediction App — `prediction/`

#### `models.py`
Defines three database tables:

**`InputData`** — Stores the 19-parameter input submitted by a parent for a child.

| Group | Fields |
|---|---|
| Base | `age` (5–17), `fav_sub` (Math/Science/History/Languages/Arts) |
| Academics | `olympiad_participation`, `scholarship`, `projects`, `grasp_pow` (1–6) |
| Sports | `time_sprt` (hrs/day), `medals`, `career_sprt`, `act_sprt` |
| Arts | `fant_arts`, `won_arts`, `time_art` |
| Analytical | `solves_puzzles`, `logical_score` (1–10), `plays_board_games` |
| Health | `daily_exercise` (minutes), `dietary_habits`, `health_awareness` |

**`Prediction`** — One-to-one with `InputData`. Stores `predicted_hobby`, `confidence_score` (0–100%), and `predicted_at` timestamp.

**`Feedback`** — One-to-one with `Prediction`. Stores `is_accurate` (boolean) and an optional `comments` text field.

#### `serializers.py`
DRF serializers that convert model instances to/from JSON:

| Serializer | Purpose |
|---|---|
| `RegisterSerializer` | Validates first name, last name, email, username, password matching. Creates the Django `User`. |
| `UserSerializer` | Read/write for profile update. `id`, `username`, `is_staff` are read-only. |
| `ChangePasswordSerializer` | Validates current password correctness and new password matching. |
| `InputDataSerializer` | Serializes all 19 input fields (excludes `user` and timestamps). |
| `PredictionSerializer` | Nested — includes `InputDataSerializer` + a `has_feedback` computed boolean. |
| `FeedbackSerializer` | Simple — only `is_accurate` and `comments` fields. |

#### `api_urls.py`
Maps all REST endpoints:

| Method | URL | View | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register/` | `api_register` | No |
| POST | `/api/auth/login/` | `api_login` | No |
| POST | `/api/auth/logout/` | `api_logout` | Yes |
| POST | `/api/auth/token/refresh/` | `TokenRefreshView` | No |
| GET/PUT | `/api/profile/` | `api_profile` | Yes |
| POST | `/api/profile/change-password/` | `api_change_password` | Yes |
| POST | `/api/predict/` | `api_predict` | Yes |
| GET | `/api/history/` | `api_history` | Yes |
| POST | `/api/feedback/<id>/` | `api_feedback` | Yes |
| POST | `/api/contact/` | `api_contact` | No |
| GET | `/api/admin/dashboard/` | `api_admin_dashboard` | Yes + Staff |

#### `api_views.py`
All view logic in one file (392 lines). Key functions:

- **`api_register`** — Creates a new user and immediately returns JWT access + refresh tokens.
- **`api_login`** — Authenticates via Django's `authenticate()` and returns JWT tokens.
- **`api_logout`** — Blacklists the provided refresh token (graceful failure).
- **`api_profile`** — GET returns user info + total predictions + 5 recent ones. PUT updates name/email.
- **`api_change_password`** — Verifies old password, sets new one.
- **`api_predict`** — **Core endpoint.** Calls `ml_helpers_v3.predict_hobby(answers)`, saves `InputData` and `Prediction` rows to DB, returns the result dict (hobby, confidence, alternatives, health warning).
- **`api_history`** — Returns all predictions for the user, plus data formatted into chart-ready arrays for the frontend (category distribution counts + confidence trend).
- **`api_feedback`** — Creates one `Feedback` record per prediction (blocks duplicates).
- **`api_contact`** — Logs contact form submissions (no DB model; email sending is a TODO for production).
- **`api_admin_dashboard`** — Staff-only. Returns site-wide counts, hobby stats, feedback accuracy %, and the 10 most recent predictions.

#### `ml_helpers_v3.py`
The ML inference pipeline (377 lines). This is the brain of the prediction:

**Two-Stage Prediction:**
1. **Stage 1 (ML):** Loads the trained model (`model_v4.pkl` → falls back to `v3` → `v1`) and runs `predict_proba()` over the 35-feature vector to get probability scores for all 5 categories.
2. **Stage 2 (Rules):** Uses rule maps (`HOBBY_RULES`) to pick a specific hobby from within the predicted category based on what the child selected (e.g., category = "Sports" + `which_sport = "Cricket"` → hobby = "Cricket").

**Explicit Preference Override Logic:**
- If exactly **1** section (`likes_sports`, `likes_arts`, etc.) is `Yes` → that category is forced regardless of ML probability.
- If **multiple** sections are `Yes` → the one with the highest ML probability among liked categories wins.
- If **none** → defaults to the Health category.

**Health Condition Filtering (`HEALTH_RESTRICTIONS`):**
- `Asthma` → Blocks Cricket, Football, Running as primary. Safe alternative: Swimming.
- `Joint Pain` → Blocks Gymnastics, Running. Safe alternative: Yoga.
- Blocked hobbies can still appear in the alternatives list with a `⚠️ health_warning` message.

**Returns a dict with:**
```python
{
  "predicted_hobby":  "Cricket",
  "category":         "Sports",
  "confidence_score": 87.4,       # percentage
  "description":      "A team outdoor sport ...",
  "health_warning":   None,
  "alternatives":     [ {hobby, category, confidence, desc, health_warning}, ... ]
}
```

#### `ml_helpers.py`
An older v1 helper file. Uses a StandardScaler and loads the original `model.pkl`. **No longer called by the API** (superseded by `ml_helpers_v3.py`). Can be safely deleted in a cleanup.

#### `admin.py`
Registers all three models (`InputData`, `Prediction`, `Feedback`) in the Django admin panel with useful `list_display`, `list_filter`, and `search_fields` for easy data inspection.

#### `apps.py`
Standard Django app config. App name: `prediction`.

#### `migrations/`
Auto-generated Django migration files that define the schema for `InputData`, `Prediction`, and `Feedback` tables. Run `python manage.py migrate` to apply them.

---

## 5. React Frontend — `frontend/`

### 5.1 Config Files

| File | Purpose |
|---|---|
| `package.json` | Lists all npm dependencies and scripts (`dev`, `build`, `lint`, `preview`). |
| `vite.config.js` | Vite build config. Uses `@vitejs/plugin-react` for JSX support. |
| `eslint.config.js` | ESLint rules for React hooks and fast refresh. |
| `index.html` | HTML shell. Vite injects the bundled JS here. `<div id="root">` is the React mount point. |

### 5.2 Core App Files

#### `src/main.jsx`
Entry point. Renders `<App />` into `#root`. Imports `index.css` for global resets.

#### `src/App.jsx`
The application root. Sets up:
- `<AuthProvider>` — wraps everything in authentication context.
- `<BrowserRouter>` — enables client-side routing.
- `<Layout>` — renders `<Sidebar>` + `<main>` content area + `<Footer>`.

**Route structure:**

| Path | Component | Guard |
|---|---|---|
| `/` | `HomePage` | Public |
| `/about` | `AboutPage` | Public |
| `/contact` | `ContactPage` | Public |
| `/login` | `AuthPage` | Public |
| `/register` | `AuthPage` | Public |
| `/profile` | `ProfilePage` | `ProtectedRoute` |
| `/predict` | `PredictPage` | `ProtectedRoute` |
| `/result` | `ResultPage` | `ProtectedRoute` |
| `/history` | `HistoryPage` | `ProtectedRoute` |
| `/feedback/:id` | `FeedbackPage` | `ProtectedRoute` |
| `/dashboard` | `AdminDashboardPage` | `AdminRoute` |

#### `src/App.css` & `src/index.css`
Global CSS resets and base typography. Imported once at the top level.

### 5.3 Context

#### `src/context/AuthContext.jsx`
React Context that provides app-wide authentication state.

**State:** `user` (object or null), `loading` (boolean).

**Methods exposed via `useAuth()` hook:**
- `login(credentials)` — Calls API, stores tokens + user in `localStorage`, updates state.
- `register(formData)` — Same as login but calls the register endpoint.
- `logout()` — Calls API to blacklist token, clears `localStorage`, resets state.
- `refreshUser()` — Re-fetches the user profile and updates state (used after profile edits).

**Session Persistence:** On page load, checks `localStorage` for an existing `access_token` and `user` object to restore the session without requiring a login.

### 5.4 API Layer

#### `src/api/axiosInstance.js`
A pre-configured `axios` instance pointing to `http://localhost:8000/api`.

- **Request interceptor:** Automatically attaches `Authorization: Bearer <token>` to every request.
- **Response interceptor:** On a `401 Unauthorized`, silently calls `/auth/token/refresh/` with the stored refresh token, saves the new access token, and retries the original request. If refresh fails, clears tokens and redirects to `/login`.

#### `src/api/authApi.js`
Exports thin wrapper functions: `loginUser`, `registerUser`, `logoutUser`, `getProfile`. These call the relevant `/api/auth/...` and `/api/profile/` endpoints via `axiosInstance`.

#### `src/api/predictionApi.js`
Exports `submitPrediction(answers)` → POST to `/api/predict/`. Used by `PredictPage` to send the questionnaire answers.

### 5.5 Components

#### `src/components/Navbar.jsx` + `Navbar.css`
Top navigation bar. Shows the app logo/title, nav links, and a login/logout button based on `useAuth()` state.

#### `src/components/Sidebar.jsx`
Collapsible left sidebar. Renders navigation links; hides admin links for non-staff users. Uses `useAuth()` to know which links to show.

#### `src/components/Footer.jsx`
Simple footer with the app name and project details.

#### `src/components/ProtectedRoute.jsx`
Route guard. If `user` is null (not logged in), redirects to `/login`. Otherwise renders `<Outlet />` (the child route).

#### `src/components/AdminRoute.jsx`
Route guard. If `user.is_staff` is not `true`, redirects to `/`. Otherwise renders `<Outlet />`.

### 5.6 Pages

#### `HomePage.jsx` + `HomePage.css`
Landing page visible to all users. Features a hero section, a brief explanation of the system, feature highlights, and a call-to-action to start prediction.

#### `AboutPage.jsx`
Static informational page describing the project — the ML approach, the 5 hobby categories, and the team.

#### `ContactPage.jsx`
A contact form (name, email, message). On submit, calls `POST /api/contact/`. Shows a success/error message. No login required.

#### `AuthPage.jsx` + `AuthPage.css` / `AuthPages.css`
Handles both Login and Register flows in one component. Detects which mode to render based on the current URL (`/login` vs `/register`). On success, navigates to `/predict` or the previous page.

#### `LoginPage.jsx` / `RegisterPage.jsx`
Simpler standalone wrappers used for direct-link access. These may redirect into `AuthPage`.

#### `PredictPage.jsx` + `PredictPage.css` ⭐ (Core Page)
The heart of the application. Implements a **multi-step questionnaire** split across multiple "pages" (2 questions per screen). Collects answers across 5 sections:
1. Sports preferences (likes sport? which? indoor/outdoor? hours? etc.)
2. Arts preferences (likes art? which? creativity level? etc.)
3. Academics preferences (favourite subject? competitions? problem solving?)
4. Analytical preferences (puzzles? coding interest? logic level?)
5. Health section (health condition? energy level? activity preference? sleep quality?)

On submit, calls `submitPrediction(answers)`, then navigates to `/result` passing the response via `location.state`.

#### `ResultPage.jsx` + `ResultPage.css`
Receives the prediction result from `location.state` (passed by `PredictPage`). Displays:
- Primary predicted hobby with icon, confidence score, and description.
- Health warning message (if applicable).
- Top 3 alternative hobby suggestions.
- Links to submit feedback or view history.

#### `ProfilePage.jsx` + `ProfilePage.css`
Shows the user's name, email, and total prediction count. Has a form to update first/last name and email. Has a separate form for changing password.

#### `HistoryPage.jsx` + `HistoryPage.css`
Fetches `GET /api/history/` and displays:
- A table of all past predictions (hobby, confidence, date, feedback status).
- Two Chart.js visualizations: a doughnut chart of hobby category distribution and a line chart of confidence score over time.
- Summary cards (total predictions, top hobby, feedback accuracy %).

#### `FeedbackPage.jsx`
Accessible from `/feedback/:id`. Shows the prediction details and a form asking "Was this prediction accurate?" with an optional comments field. Calls `POST /api/feedback/<id>/`. Prevents double submission.

#### `AdminDashboardPage.jsx`
Only accessible to staff users. Fetches `GET /api/admin/dashboard/` and renders:
- Stats cards (total users, predictions, feedback count, feedback accuracy %).
- Hobby distribution bar chart.
- A table of the 10 most recent predictions across all users.

### 5.7 Styles

#### `src/styles/global.css`
The primary global stylesheet (~18 KB). Contains:
- CSS custom properties (design tokens: colors, spacing, radii, shadows).
- Layout utilities for the sidebar + content structure.
- Reusable card, button, form, badge, and table styles.
- Animation keyframes (`fadeIn`, `slideUp`, `pulse`).
- Responsive breakpoints.

---

## 6. Machine Learning Pipeline

### 6.1 Datasets — `dataset/`

| File | Rows | Features | Target | Notes |
|---|---|---|---|---|
| `Hobby_Data.csv` | 1,601 | 13 | 3 classes | Original v1 dataset. |
| `Hobby_Data_v2.csv` | ~5,000 | ~16 | 3 classes | Expanded v2. |
| `Hobby_Data_v3.csv` | ~6,000 | 19 | 5 categories | Added Analytical & Health. |
| `Hobby_Data_v4.csv` | 8,000 | 35 | 5 categories | **Current.** 30-question branching logic, health condition filtering, strong/weak signal separation. |
| `kids_hobby_dataset_high_low (1).csv` | ~2,000 | — | — | External reference dataset. |

**v4 dataset design highlights:** The primary hobby category gets strong signal features (High hours, High activity, frequent). Secondary categories only appear in 10% of rows with weak signals (Low hours). This dramatically reduces prediction confusion.

### 6.2 ML Scripts — `ml_scripts/`

#### `generate_dataset_v4.py`
Synthetically generates `Hobby_Data_v4.csv` (8,000 rows). Logic:
- Randomly assigns a `primary` category per row (Sports 30%, Arts 20%, Academics 20%, Analytical 15%, Health 15%).
- For the primary category, generates `High` activity signals (60% chance).
- For non-primary categories, generates `Low` signals (60% chance) with a 10% inclusion rate.
- Applies health condition filtering (Asthma blocks Cricket/Football/Running; Joint Pain blocks Gymnastics/Running).

#### `preprocess_v4.py`
Loads `Hobby_Data_v4.csv`, applies `sklearn.LabelEncoder` to all categorical columns (except `age`), and saves:
- `label_encoders_v4.pkl` — dict mapping column name → fitted encoder.
- `target_encoder_v4.pkl` — encoder for the `category` target column.
- `feature_cols_v4.pkl` — ordered list of feature column names.

#### `train_model_v4.py`
Trains the final model:
```
RandomForestClassifier(
    n_estimators=300,
    max_depth=20,
    min_samples_split=5,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1
)
```
Prints accuracy + classification report. Saves `model_v4.pkl`.

#### `generate_dataset_v3.py` / `preprocess_v3.py` / `train_model_v3.py`
Previous generation (v3) equivalents. Still present for reference. The v3 model is the fallback in `ml_helpers_v3.load_model()`.

#### `preprocess.py` / `train_model.py`
Original v1 scripts. The v1 model used a `StandardScaler` and 13 features. No longer used by the API.

#### `visualize.py`
Generates static chart images (accuracy comparison, feature importance, hobby distribution, confusion matrix, correlation heatmap) and saves them to `static/images/`. These were used by the original Django-template admin dashboard. The React admin dashboard currently doesn't use these static images directly.

### 6.3 Saved Models — `saved_models/`

| File | Size | Description |
|---|---|---|
| `model_v4.pkl` | ~30 MB | **Active model.** 300-tree Random Forest trained on 8,000 rows. |
| `label_encoders_v4.pkl` | 9 KB | Dict of LabelEncoders for 34 categorical feature columns. |
| `target_encoder_v4.pkl` | 0.5 KB | LabelEncoder for the 5 category labels. |
| `feature_cols_v4.pkl` | 0.7 KB | Ordered list of 34 feature column names. Ensures inference input matches training order. |
| `model_v3.pkl` | ~78 MB | Fallback v3 model (larger tree, more features). |
| `model.pkl` | ~74 MB | Original v1 model. No longer used. |
| `data.npz` / `data_v3.npz` | ~1 MB each | Preprocessed numpy arrays from v1/v3 datasets. Not used at runtime. |

---

*Last updated: April 2026*
