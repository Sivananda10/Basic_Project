# Kids Hobby Prediction System — Setup Guide

> Follow these steps to clone the project from GitHub and run it on your laptop from scratch.

---

## Prerequisites

Make sure you have the following installed before starting:

| Tool | Minimum Version | Check Command |
|---|---|---|
| Python | 3.10+ | `python3 --version` |
| pip | latest | `pip --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | any | `git --version` |

> **Windows users:** Use **Git Bash** or **WSL2** for all terminal commands below.

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>/kids_hobby_project
```

> Replace `<your-username>` and `<your-repo-name>` with the actual GitHub details shared with you.

---

## Step 2 — Set Up the Python Virtual Environment

```bash
# Create the virtual environment
python3 -m venv venv

# Activate it
# On Linux / macOS:
source venv/bin/activate

# On Windows (Git Bash):
source venv/Scripts/activate

# On Windows (Command Prompt):
venv\Scripts\activate.bat
```

Your terminal prompt should now show `(venv)`.

---

## Step 3 — Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `django`, `djangorestframework`, `djangorestframework-simplejwt`, `django-cors-headers`
- `scikit-learn`, `pandas`, `numpy`, `joblib`
- `matplotlib`, `seaborn`
- `mysqlclient` (only required if using MySQL — safe to ignore for SQLite dev setup)

> **Note:** If `mysqlclient` fails to install on your system, you can remove it from `requirements.txt` for local development since the project defaults to SQLite.

---

## Step 4 — Train the ML Model (Required — model files are not in git)

The trained model files (`.pkl`) are large and are excluded from the repository. You must generate them locally.

```bash
# 1. Generate the synthetic dataset (creates dataset/Hobby_Data_v4.csv)
python ml_scripts/generate_dataset_v4.py

# 2. Preprocess and encode the dataset (saves encoders to saved_models/)
python ml_scripts/preprocess_v4.py

# 3. Train the Random Forest model (saves model_v4.pkl — takes 1-3 minutes)
python ml_scripts/train_model_v4.py
```

After this, the `saved_models/` folder should contain:
```
saved_models/
├── model_v4.pkl
├── label_encoders_v4.pkl
├── target_encoder_v4.pkl
└── feature_cols_v4.pkl
```

---

## Step 5 — Set Up the Django Database

```bash
# Apply all database migrations (creates db.sqlite3)
python manage.py migrate

# Create a superuser (admin) account
python manage.py createsuperuser
```

When prompted, enter a username, email (optional), and password.

> **Remember this username and password** — you'll use it to log in as admin and access `/dashboard`.

---

## Step 6 — Start the Django Backend Server

```bash
python manage.py runserver
```

The API server will start at: **http://localhost:8000**

You should see output like:
```
System check identified no issues.
April 11, 2026 - 10:30:00
Django version 4.x, using settings 'kids_hobby_prediction.settings'
Starting development server at http://127.0.0.1:8000/
```

> Keep this terminal window open.

---

## Step 7 — Set Up the React Frontend

Open a **new terminal window** (keep the Django server running in the first one).

```bash
# Navigate to the frontend directory
cd frontend

# Install npm dependencies
npm install

# Start the Vite development server
npm run dev
```

The React app will start at: **http://localhost:5173**

---

## Step 8 — Open the App

Open your browser and go to: **http://localhost:5173**

You should see the KidHobbyAI homepage. 🎉

---

## Quick Summary of Both Servers

| Server | Command | URL |
|---|---|---|
| Django Backend | `python manage.py runserver` | http://localhost:8000 |
| React Frontend | `npm run dev` (inside `frontend/`) | http://localhost:5173 |

Both servers must be running at the same time for the app to work.

---

## Step 9 — Using the App

1. Click **Register** and create a new account.
2. Click **Predict** in the sidebar.
3. Fill out the multi-step questionnaire about your child.
4. View the predicted hobby with confidence score and alternatives.
5. Optionally submit feedback on whether the prediction was accurate.
6. View all past predictions in **History**.
7. Log in with the **superuser** account you created and go to `/dashboard` for admin stats.

---

## Django Admin Panel

The Django built-in admin panel is available at:

**http://localhost:8000/admin/**

Log in with your superuser credentials to directly view and manage `InputData`, `Prediction`, and `Feedback` records in the database.

---

## Common Issues & Fixes

### ❌ `Error: That port is already in use` (Django)
Another process is using port 8000. Kill it or run on a different port:
```bash
python manage.py runserver 8001
```
Then update the frontend API URL in `frontend/src/api/axiosInstance.js`:
```js
const BASE_URL = 'http://localhost:8001/api';
```

### ❌ `CORS error` in browser console
Make sure Django is running (`http://localhost:8000`) and that `DEBUG = True` is set in `settings.py` (CORS is open in dev mode).

### ❌ `ModuleNotFoundError: No module named 'sklearn'`
You forgot to activate the virtual environment. Run:
```bash
source venv/bin/activate   # Linux/macOS
```
Then try again.

### ❌ `ML model is not available` error after predicting
The model `.pkl` files are missing. Run all three commands in Step 4 again.

### ❌ `npm: command not found`
Node.js is not installed. Download it from https://nodejs.org and choose the LTS version.

### ❌ `mysqlclient` install fails (Windows)
Remove `mysqlclient` from `requirements.txt` — it's only needed for MySQL (production). The project uses SQLite by default.

---

## Project Folder Structure (Quick Reference)

```
kids_hobby_project/
├── manage.py                        # Django entry point
├── requirements.txt                 # Python dependencies
├── db.sqlite3                       # SQLite database (auto-created)
│
├── kids_hobby_prediction/           # Django project settings
│   ├── settings.py                  # All configuration (DB, JWT, CORS)
│   ├── urls.py                      # Root URL router
│   └── wsgi.py                      # Production WSGI entry point
│
├── prediction/                      # Django REST API app
│   ├── models.py                    # InputData, Prediction, Feedback models
│   ├── serializers.py               # DRF serializers (JSON ↔ Model)
│   ├── api_urls.py                  # All /api/ URL routes
│   ├── api_views.py                 # All API view functions
│   ├── ml_helpers_v3.py             # ML inference pipeline (active)
│   ├── ml_helpers.py                # ML helpers v1 (legacy, unused)
│   ├── admin.py                     # Django admin registrations
│   ├── apps.py                      # App config
│   └── migrations/                  # DB schema migrations
│
├── ml_scripts/                      # Standalone ML training scripts
│   ├── generate_dataset_v4.py       # Generate 8000-row synthetic dataset
│   ├── preprocess_v4.py             # Encode features, save encoders
│   ├── train_model_v4.py            # Train Random Forest, save model
│   ├── visualize.py                 # Generate chart images (optional)
│   └── (v1, v3 equivalents)         # Legacy versions kept for reference
│
├── dataset/                         # CSV datasets
│   └── Hobby_Data_v4.csv            # Active dataset (generated by script)
│
├── saved_models/                    # Trained model files (NOT in git)
│   ├── model_v4.pkl                 # Trained Random Forest (~30 MB)
│   ├── label_encoders_v4.pkl        # Feature encoders
│   ├── target_encoder_v4.pkl        # Target label encoder
│   └── feature_cols_v4.pkl          # Feature column order
│
└── frontend/                        # React + Vite SPA
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx                  # React entry point
        ├── App.jsx                   # Routes + Layout
        ├── context/AuthContext.jsx   # Global auth state
        ├── api/
        │   ├── axiosInstance.js      # Axios config + JWT interceptors
        │   ├── authApi.js            # Auth API calls
        │   └── predictionApi.js      # Prediction API calls
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── ProtectedRoute.jsx    # Redirect if not logged in
        │   └── AdminRoute.jsx        # Redirect if not staff
        ├── pages/
        │   ├── HomePage.jsx
        │   ├── AboutPage.jsx
        │   ├── ContactPage.jsx
        │   ├── AuthPage.jsx          # Login + Register
        │   ├── PredictPage.jsx       # Multi-step questionnaire ⭐
        │   ├── ResultPage.jsx        # Prediction result display
        │   ├── ProfilePage.jsx
        │   ├── HistoryPage.jsx       # Past predictions + charts
        │   ├── FeedbackPage.jsx
        │   └── AdminDashboardPage.jsx
        └── styles/global.css         # Global design system
```

---

*For the full technical explanation of every file, see `PROJECT_REFERENCE.md`.*
