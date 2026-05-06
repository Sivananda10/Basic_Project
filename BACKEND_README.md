# ⚙️ Backend README — Kids Hobby Prediction System

> **Tech Stack:** Django 4.x · Django REST Framework · scikit-learn · SQLite · PyWebView
> **Location:** `kids_hobby_project/` (root)
> **Web Dev Port:** http://localhost:8000
> **Desktop Mode Port:** http://127.0.0.1:5000

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Setup & Running](#setup--running)
5. [Desktop App Setup](#desktop-app-setup)
6. [All Files Explained](#all-files-explained)
7. [Database Models](#database-models)
8. [API Reference](#api-reference)
9. [ML Pipeline](#ml-pipeline)
10. [JWT Authentication](#jwt-authentication)
11. [Desktop Mode Architecture](#desktop-mode-architecture)

---

## Overview

The backend is a **Django REST Framework (DRF)** API server. It handles:
- User registration, login, and JWT token management
- 19-parameter hobby prediction using a Random Forest ML model
- Prediction history storage and retrieval
- Feedback collection on prediction accuracy
- Admin dashboard data (users, predictions, model metrics)
- **Desktop mode**: serves the React build as a static SPA via Django

---

## Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| Django | 4.x | Web framework |
| djangorestframework | 3.x | REST API layer |
| djangorestframework-simplejwt | 5.x | JWT authentication |
| django-cors-headers | 4.x | CORS headers for React dev server |
| whitenoise | 6.x | Static file serving in production/desktop |
| scikit-learn | 1.x | Random Forest prediction model |
| pandas | 2.x | Data manipulation |
| numpy | 1.x | Numerical operations |
| matplotlib / seaborn | latest | Model visualization charts |
| pywebview | 4.4.1 | Desktop window (WebKit2GTK) |
| pyinstaller | 6.x | Package as `.exe` / binary |

---

## Folder Structure

```
kids_hobby_project/
├── kids_hobby_prediction/          ← Django project config
│   ├── settings.py                 ← Settings (DESKTOP_MODE aware)
│   ├── urls.py                     ← URL routing (SPA + API + splash)
│   ├── wsgi.py
│   └── asgi.py
├── prediction/                     ← Main Django app
│   ├── models.py                   ← UserProfile, Prediction, Feedback
│   ├── views.py                    ← All API views
│   ├── api_urls.py                 ← /api/* URL patterns
│   ├── serializers.py              ← DRF serializers
│   ├── admin.py                    ← Admin site registration
│   └── ml_predict.py              ← Model loading + inference
├── ml_scripts/                     ← Training & evaluation scripts
│   ├── train_model.py
│   ├── evaluate_model.py
│   └── generate_dataset.py
├── saved_models/                   ← Trained model artifacts
│   ├── hobby_model.pkl             ← Main Random Forest model
│   ├── label_encoder.pkl
│   └── scaler.pkl
├── dataset/                        ← Training data
│   └── kids_hobby_dataset.csv
├── templates/
│   └── splash.html                 ← Desktop intro page (GVP project screen)
├── static/
│   └── img/
│       ├── gvp_logo.jpeg           ← College logo
│       └── login_illustration.png  ← Auth page hero image
├── frontend/                       ← React source + dist/
│   └── dist/                       ← Built React app (served by Django)
├── launcher.py                     ← Desktop entry point (PyWebView)
├── manage.py
├── requirements.txt                ← Web/deployment packages
├── requirements_desktop.txt        ← Desktop packages (adds pywebview, pyinstaller)
├── build_desktop.bat               ← Windows .exe builder
├── build.sh                        ← Linux desktop builder
├── run_desktop.bat                 ← Windows launcher script
└── db.sqlite3                      ← SQLite database
```

---

## Setup & Running

### Web Development

```bash
cd kids_hobby_project
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

python manage.py migrate
python manage.py createsuperuser  # optional
python manage.py runserver 8000
```

### Build & Run React separately

```bash
cd frontend
npm install
npm run dev                       # runs on port 5173
```

---

## Desktop App Setup

```bash
# Install desktop dependencies (adds pywebview, pyinstaller)
pip install -r requirements_desktop.txt

# Build React frontend (IIFE format for PyWebView)
cd frontend && npm install && npm run build && cd ..

# Run migrations
python manage.py migrate

# Launch desktop app
python launcher.py
```

Or double-click the **KidHobbyAI** icon on the Ubuntu Desktop.

---

## All Files Explained

### `launcher.py`
- Entry point for the desktop app
- Starts Django on `127.0.0.1:5000` in a background thread
- Configures **WebKit2GTK** settings:
  - `set_enable_html5_local_storage(True)` — enables localStorage
  - `set_enable_developer_extras(False)` — hides inspector
- Loads `http://127.0.0.1:5000/splash/` first (intro page)
- Set `debug=False` → no console/inspector panel

### `settings.py`
- `DESKTOP_MODE = os.environ.get('DESKTOP_MODE') == 'true'`
- In desktop mode:
  - Disables `X-Frame-Options` and `Cross-Origin-Opener-Policy`
  - Serves React build from `frontend/dist/`
  - Adds `REACT_BUILD_DIR` and `REACT_BUILD_STATIC` to template dirs
- WhiteNoise used for static file compression

### `urls.py` (Desktop Mode)
| Pattern | Serves |
|---------|--------|
| `/splash/` | `templates/splash.html` — intro page |
| `/assets/*` | `frontend/dist/assets/` — JS/CSS bundles |
| `/*.png/*.svg` | `frontend/dist/` root — public images |
| `/login`, `/register`, `/predict`, etc. | `index.html` — React SPA routes |
| `/*` (catch-all) | `index.html` — React Router fallback |

### `prediction/ml_predict.py`
- Loads `hobby_model.pkl`, `label_encoder.pkl`, `scaler.pkl` from `saved_models/`
- `predict(features_dict)` → returns predicted class + confidence scores

---

## Database Models

### `UserProfile`
Extends Django's `User` with:
- `member_since` — date joined
- `total_predictions` — cached count

### `Prediction`
| Field | Type | Description |
|-------|------|-------------|
| `user` | FK → User | Owner |
| `input_data` | JSONField | 19 input parameters |
| `predicted_hobby` | CharField | Sports / Arts / Academics |
| `confidence_scores` | JSONField | Per-class probabilities |
| `hobby_responses` | JSONField | Follow-up Q&A answers |
| `created_at` | DateTimeField | Timestamp |

### `Feedback`
| Field | Type | Description |
|-------|------|-------------|
| `prediction` | FK → Prediction | Related prediction |
| `rating` | IntegerField | 1–5 stars |
| `comment` | TextField | Optional comment |
| `created_at` | DateTimeField | Timestamp |

---

## API Reference

### Auth Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/register/` | Create account → returns tokens |
| POST | `/api/login/` | Login → returns access + refresh tokens |
| POST | `/api/token/refresh/` | Refresh access token |
| POST | `/api/logout/` | Blacklist refresh token |

### User Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/profile/` | ✅ | Get current user profile |
| PATCH | `/api/profile/` | ✅ | Update name/email |

### Prediction Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/predict/` | ✅ | Run prediction (19 params) → hobby |
| GET | `/api/history/` | ✅ | List all user predictions |
| GET | `/api/history/<id>/` | ✅ | Get single prediction detail |
| PATCH | `/api/history/<id>/` | ✅ | Save hobby follow-up responses |

### Feedback Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/feedback/` | ✅ | Submit rating + comment |
| GET | `/api/feedback/<prediction_id>/` | ✅ | Get feedback for a prediction |

### Admin Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/admin/stats/` | ✅ Admin | Summary stats |
| GET | `/api/admin/users/` | ✅ Admin | All users list |
| GET | `/api/admin/predictions/` | ✅ Admin | All predictions |

---

## ML Pipeline

```
1. Dataset: kids_hobby_dataset.csv (5000+ synthetic records, 19 features)
2. Features: age, academic_score, creativity, physical_activity,
             social_behavior, attention_span, curiosity, patience,
             music_interest, sports_interest, arts_interest,
             reading_interest, tech_interest, (+ 6 more)
3. Target: hobby category → Sports | Arts | Academics
4. Algorithm: Random Forest Classifier (sklearn)
5. Preprocessing: StandardScaler (saved as scaler.pkl)
6. Label encoding: LabelEncoder (saved as label_encoder.pkl)
7. Accuracy: ~92% on test set (5-fold cross-validation)
```

### Model Files

| File | Description |
|------|-------------|
| `saved_models/hobby_model.pkl` | Trained Random Forest model |
| `saved_models/label_encoder.pkl` | Target class encoder |
| `saved_models/scaler.pkl` | Feature scaler |

### Retraining

```bash
cd ml_scripts
python generate_dataset.py   # regenerate dataset
python train_model.py        # retrain & save model
python evaluate_model.py     # print accuracy + confusion matrix
```

---

## JWT Authentication

```
Token Lifetime:
  Access Token:  60 minutes
  Refresh Token: 7 days

Header format:
  Authorization: Bearer <access_token>

Flow:
  Login → (access_token, refresh_token)
  Every request → Authorization: Bearer <access_token>
  401 received → POST /api/token/refresh/ with refresh_token
  New access_token returned → retry original request
  Refresh fails → force logout
```

---

## Desktop Mode Architecture

```
launcher.py
  ├── Thread: Django runserver (127.0.0.1:5000, noreload, nothreading)
  ├── Wait: polls port until Django is ready
  └── PyWebView window
        ├── WebKit2GTK settings: localStorage enabled, debug=False
        ├── Initial URL: http://127.0.0.1:5000/splash/
        │     └── splash.html: GVP college intro → "Get Started" → /
        └── Main URL: http://127.0.0.1:5000/
              └── Django serves: index.html (React SPA)
                    └── React Router handles all /login /predict /history etc.
```

### DESKTOP_MODE Environment Variable
Set automatically by `launcher.py`:
```python
os.environ['DESKTOP_MODE'] = 'true'
```
This changes Django's behavior:
- Security headers relaxed (no X-Frame-Options sandbox)
- React build served as static files
- Splash page route active
- Django port changes to 5000

### Building Windows .exe

```bat
REM On Windows, run:
build_desktop.bat

REM Output: dist\KidHobbyAI\KidHobbyAI.exe
REM Share the entire dist\KidHobbyAI\ folder
```
