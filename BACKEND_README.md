# ⚙️ Backend README — Kids Hobbies Prediction System

> **Tech Stack:** Django 4.x · Django REST Framework · scikit-learn · SQLite  
> **Location:** `kids_hobby_project/` (root)  
> **Runs at:** http://localhost:8000

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Setup & Running](#setup--running)
5. [All Files Explained](#all-files-explained)
   - [Project Config (kids_hobby_prediction/)](#project-config)
   - [Main App (prediction/)](#main-app-prediction)
   - [ML Scripts (ml_scripts/)](#ml-scripts)
   - [Saved Models (saved_models/)](#saved-models)
   - [Dataset (dataset/)](#dataset)
6. [Database Models](#database-models)
7. [API Reference (All Endpoints)](#api-reference)
8. [ML Pipeline](#ml-pipeline)
9. [JWT Authentication](#jwt-authentication)

---

## Overview

The backend is a **Django REST Framework (DRF)** API server. It handles:
- **User authentication** using JWT tokens (login, register, logout, token refresh).
- **Prediction requests** — receives 19 form fields, runs the ML model, stores the result, and returns the predicted hobby.
- **History & Feedback** — storing and retrieving per-user prediction records.
- **Admin dashboard** — aggregated statistics for admin users.
- **ML Model** — a trained Random Forest Classifier loaded from a `.pkl` file.

React frontend sends all requests to this server at `http://localhost:8000/api/`.

---

## Tech Stack

| Library | Purpose |
|---------|---------|
| **Django 4.x** | Web framework |
| **Django REST Framework** | REST API building |
| **djangorestframework-simplejwt** | JWT token authentication |
| **django-cors-headers** | Allow requests from React frontend (localhost:5173) |
| **scikit-learn** | Random Forest ML model |
| **pandas / numpy** | Data manipulation for ML inference |
| **joblib** | Loading `.pkl` model files |
| **SQLite** | Default database (zero config for development) |
| **Matplotlib / Seaborn** | Chart generation in ML scripts |

---

## Folder Structure

```
kids_hobby_project/            ← Django project root
│
├── manage.py                  ← Django CLI entry point
├── requirements.txt           ← All Python dependencies
├── db.sqlite3                 ← SQLite database (auto-created on migrate)
│
├── kids_hobby_prediction/     ← Django PROJECT config package
│   ├── __init__.py
│   ├── settings.py            ← All Django settings (DB, JWT, CORS, apps)
│   ├── urls.py                ← Root URL router
│   ├── wsgi.py                ← WSGI entry point (for production servers)
│   └── asgi.py                ← ASGI entry point (for async servers)
│
├── prediction/                ← Main Django APP (all business logic)
│   ├── __init__.py
│   ├── apps.py                ← App configuration class
│   ├── models.py              ← 3 database models: InputData, Prediction, Feedback
│   ├── serializers.py         ← DRF serializers (Python ↔ JSON conversion)
│   ├── api_views.py           ← All API view functions (the main logic)
│   ├── api_urls.py            ← All /api/ URL routes
│   ├── ml_helpers_v3.py       ← ML inference pipeline (active version) ⭐
│   ├── admin.py               ← Django admin panel configuration
│   └── migrations/            ← Auto-generated database migration files
│       ├── 0001_initial.py
│       └── ...
│
├── ml_scripts/                ← Standalone scripts to build the ML model
│   ├── generate_dataset_v4.py ← Creates the synthetic CSV dataset
│   ├── preprocess_v4.py       ← Encodes features, saves encoders to .pkl
│   ├── train_model_v4.py      ← Trains Random Forest, saves model.pkl
│   └── visualize.py           ← Generates comparison charts (optional)
│
├── dataset/
│   └── Hobby_Data_v4.csv      ← Training dataset (1,601 records, age 5–12)
│
├── saved_models/              ← Trained model artifacts (loaded by Django at runtime)
│   ├── model_v4.pkl           ← Trained Random Forest Classifier
│   ├── label_encoders_v4.pkl  ← Encoders for categorical input features
│   ├── target_encoder_v4.pkl  ← Encoder for the target hobby label
│   └── feature_cols_v4.pkl    ← Ordered list of feature column names
│
└── venv/                      ← Python virtual environment (not committed to git)
```

---

## Setup & Running

### Prerequisites
- Python 3.9+ → check: `python3 --version`
- pip → check: `pip --version`

### Steps

```bash
# 1. Navigate to project root
cd kids_hobby_project

# 2. Create & activate virtual environment
python3 -m venv venv
source venv/bin/activate          # Linux / macOS
# venv\Scripts\activate.bat       # Windows CMD
# source venv/Scripts/activate    # Windows Git Bash

# 3. Install all Python packages
pip install -r requirements.txt

# 4. Train the ML model (only needed once, or after data changes)
python ml_scripts/generate_dataset_v4.py   # creates dataset CSV
python ml_scripts/preprocess_v4.py         # encodes + saves encoders
python ml_scripts/train_model_v4.py        # trains model, saves model_v4.pkl

# 5. Apply database migrations
python manage.py makemigrations
python manage.py migrate

# 6. Create an admin (superuser) account
python manage.py createsuperuser

# 7. Start the server
python manage.py runserver
```

**API server starts at:** http://localhost:8000  
**Django admin panel:** http://localhost:8000/admin/

---

## All Files Explained

### Project Config

#### `kids_hobby_prediction/settings.py`
The master configuration file for Django. Key settings:

| Setting | Value / Purpose |
|---------|----------------|
| `SECRET_KEY` | Django secret key (change in production) |
| `DEBUG` | `True` in development |
| `INSTALLED_APPS` | Includes `prediction`, `rest_framework`, `corsheaders`, `rest_framework_simplejwt` |
| `DATABASES` | SQLite by default, MySQL config available (commented out) |
| `CORS_ALLOWED_ORIGINS` | `['http://localhost:5173']` — allows React dev server |
| `REST_FRAMEWORK` | Sets JWT as default authentication class |
| `SIMPLE_JWT` | Access token lifetime, refresh token lifetime settings |

#### `kids_hobby_prediction/urls.py`
Root URL router. Routes all `/api/` requests to `prediction/api_urls.py`.

```python
urlpatterns = [
    path('admin/', admin.site.urls),           # Django built-in admin
    path('api/', include('prediction.api_urls')),  # All REST API routes
]
```

#### `kids_hobby_prediction/wsgi.py`
Entry point for production WSGI servers (e.g., Gunicorn). Not used in development.

---

### Main App (prediction/)

#### `prediction/apps.py`
Registers the `prediction` app with Django. Minimal config, tells Django the app name.

#### `prediction/models.py` — Database Models

Three models store all application data:

---

**Model 1: `InputData`**  
Stores the 19 input parameters a parent fills in for their child.

| Field | Type | Description |
|-------|------|-------------|
| `user` | ForeignKey → User | Which user submitted this |
| `age` | IntegerField | Child's age (5–12) |
| `olympiad_participation` | CharField | Yes / No |
| `scholarship` | CharField | Yes / No |
| `fav_sub` | CharField | Maths / Science / History / Languages / Arts |
| `projects` | CharField | Yes / No |
| `grasp_pow` | IntegerField | Scale 1–6 |
| `time_sprt` | IntegerField | Hours/day on sports (1–6) |
| `medals` | CharField | Yes / No |
| `career_sprt` | CharField | Yes / No |
| `act_sprt` | CharField | Yes / No |
| `fant_arts` | CharField | Yes / No |
| `won_arts` | CharField | Yes / No |
| `time_art` | IntegerField | Hours/day on arts (1–6) |
| `solves_puzzles` | CharField | Yes / No |
| `logical_score` | IntegerField | Scale 1–10 |
| `plays_board_games` | CharField | Yes / No |
| `daily_exercise` | IntegerField | Minutes per day |
| `dietary_habits` | CharField | Healthy / Average / Junk |
| `health_awareness` | CharField | Yes / No |
| `submitted_at` | DateTimeField | Auto set on creation |

---

**Model 2: `Prediction`**  
Stores the ML model's output for each `InputData` submission.

| Field | Type | Description |
|-------|------|-------------|
| `user` | ForeignKey → User | Who made the prediction |
| `input_data` | OneToOneField → InputData | Linked input record |
| `predicted_hobby` | CharField | `Academics` / `Sports` / `Arts` / `Analytical Thinking` / `Health & Fitness` |
| `confidence_score` | FloatField | Probability from model (e.g., 0.87 = 87%) |
| `predicted_at` | DateTimeField | Auto set on creation |

---

**Model 3: `Feedback`**  
Stores user feedback on whether the prediction was accurate.

| Field | Type | Description |
|-------|------|-------------|
| `user` | ForeignKey → User | Who gave feedback |
| `prediction` | OneToOneField → Prediction | Which prediction this is for |
| `is_accurate` | BooleanField | True = accurate, False = inaccurate |
| `comments` | TextField | Optional user comment |
| `submitted_at` | DateTimeField | Auto set on creation |

---

#### `prediction/serializers.py`
DRF Serializers convert Django model instances to/from JSON.

| Serializer | Model | Purpose |
|-----------|-------|---------|
| `InputDataSerializer` | InputData | Validates & deserializes prediction form data |
| `PredictionSerializer` | Prediction | Serializes prediction results |
| `FeedbackSerializer` | Feedback | Validates & deserializes feedback submissions |
| `UserSerializer` | User | Serializes basic user info (username, email, is_staff) |

**Validation examples:**
- `InputDataSerializer` ensures `age` is within range 5–12.
- `FeedbackSerializer` ensures `is_accurate` is a boolean.

---

#### `prediction/api_urls.py`
Defines all REST API URL patterns under `/api/`.

| URL Pattern | View Function | Name |
|-------------|--------------|------|
| `auth/register/` | `api_register` | `api_register` |
| `auth/login/` | `api_login` | `api_login` |
| `auth/logout/` | `api_logout` | `api_logout` |
| `auth/token/refresh/` | `TokenRefreshView` (built-in) | `api_token_refresh` |
| `profile/` | `api_profile` | `api_profile` |
| `profile/change-password/` | `api_change_password` | `api_change_password` |
| `predict/` | `api_predict` | `api_predict` |
| `history/` | `api_history` | `api_history` |
| `feedback/<int:prediction_id>/` | `api_feedback` | `api_feedback` |
| `contact/` | `api_contact` | `api_contact` |
| `admin/dashboard/` | `api_admin_dashboard` | `api_admin_dashboard` |

---

#### `prediction/api_views.py` — Core Business Logic

All API logic lives here. Each function handles one endpoint.

| Function | Method | Auth | Description |
|----------|--------|------|-------------|
| `api_register` | POST | Public | Creates a new User account |
| `api_login` | POST | Public | Validates credentials, returns JWT access + refresh tokens |
| `api_logout` | POST | 🔒 JWT | Blacklists the refresh token (logs user out) |
| `api_profile` | GET/PATCH | 🔒 JWT | Get or update the logged-in user's profile |
| `api_change_password` | POST | 🔒 JWT | Validates old password, sets new password |
| `api_predict` | POST | 🔒 JWT | Receives 19 fields → runs ML model → saves InputData + Prediction → returns result |
| `api_history` | GET | 🔒 JWT | Returns all Prediction records for the logged-in user |
| `api_feedback` | POST | 🔒 JWT | Saves feedback (accurate/inaccurate + comments) for a given prediction |
| `api_contact` | POST | Public | Saves/emails a contact form submission |
| `api_admin_dashboard` | GET | 🔒 Admin | Returns user count, prediction stats, hobby distribution |

**`api_predict` flow (the most important view):**
```python
1. Parse & validate 19 input fields from request.body
2. Save InputData record to DB
3. Call ml_helpers_v3.predict(input_data) → runs Random Forest
4. Save Prediction record (hobby + confidence score) to DB
5. Return JSON: { predicted_hobby, confidence_score, prediction_id }
```

---

#### `prediction/ml_helpers_v3.py` — ML Inference Pipeline ⭐

This file is the bridge between Django and the ML model.

**What it does:**
1. **Loads model files on startup** (once, using `joblib.load()`):
   - `model_v4.pkl` — the trained Random Forest Classifier
   - `label_encoders_v4.pkl` — encoders for categorical input fields
   - `feature_cols_v4.pkl` — correct column order expected by the model

2. **`predict(input_dict)` function:**
   - Accepts a dictionary of 19 raw values from the form.
   - Encodes categorical values (e.g., "Yes" → 1, "No" → 0) using stored label encoders.
   - Scales numerical values using the stored scaler.
   - Runs `model.predict()` and `model.predict_proba()`.
   - Decodes the result back to a hobby label string.
   - Returns `{ predicted_hobby: str, confidence_score: float }`.

**Why it loads once:**
The `.pkl` files are large (~30 MB). Django loads them into memory once when the server starts (via `apps.py`), and reuses the in-memory model for every request — this is fast.

---

#### `prediction/admin.py`
Registers models in the Django admin panel (http://localhost:8000/admin/).

**Registered models:**
- `InputData` — view all form submissions
- `Prediction` — view all ML prediction results  
- `Feedback` — view all user feedback

Admins can view, filter, and delete records from the browser without writing any code.

---

### ML Scripts

These are standalone Python scripts run **once** before starting Django to build the model.

#### `ml_scripts/generate_dataset_v4.py`
**Purpose:** Generates a synthetic training dataset.

**What it creates:**
- `dataset/Hobby_Data_v4.csv`
- **1,601 rows**, each representing a child aged **5–12**
- **19 feature columns** + 1 target column (`Hobby`)
- Target classes: `Academics`, `Sports`, `Arts`, `Analytical Thinking`, `Health & Fitness`

**How it works:**
- Uses `numpy.random` to generate plausible behavioral data.
- Rules-based logic ensures the data is realistic:  
  (e.g., high `logical_score` + `solves_puzzles=Yes` → likely `Analytical Thinking`)

```bash
python ml_scripts/generate_dataset_v4.py
```

---

#### `ml_scripts/preprocess_v4.py`
**Purpose:** Cleans and encodes the raw CSV dataset.

**Steps it performs:**
1. Reads `dataset/Hobby_Data_v4.csv`.
2. Applies `LabelEncoder` to all categorical columns (Yes/No, subject names, etc.).
3. Saves encoders to `saved_models/label_encoders_v4.pkl` and `target_encoder_v4.pkl`.
4. Saves the encoded feature column order to `saved_models/feature_cols_v4.pkl`.
5. Saves the preprocessed data for use by the training script.

```bash
python ml_scripts/preprocess_v4.py
```

---

#### `ml_scripts/train_model_v4.py`
**Purpose:** Trains the ML model and saves it.

**Steps:**
1. Loads the preprocessed dataset.
2. Splits into **80% training / 20% testing**.
3. Trains a **Random Forest Classifier** (`n_estimators=100`).
4. Also trains Decision Tree, Logistic Regression, Naive Bayes, SVM for comparison.
5. Prints accuracy scores for all 5 algorithms.
6. Saves the best model (Random Forest) to `saved_models/model_v4.pkl`.

```bash
python ml_scripts/train_model_v4.py
```

**Expected output:**
```
Random Forest Accuracy:     92.3%   ← Best → saved as model_v4.pkl
Decision Tree Accuracy:     85.1%
Logistic Regression:        78.4%
Naive Bayes:                74.2%
SVM:                        80.6%
```

---

#### `ml_scripts/visualize.py`
**Purpose:** Generates charts for the admin dashboard and project report.

**Charts generated:**
| Chart | What It Shows |
|-------|--------------|
| Algorithm Accuracy Bar Chart | Accuracy of all 5 algorithms side by side |
| Feature Importance Chart | Which of the 19 inputs most influence predictions |
| Hobby Distribution Pie Chart | Class balance in the dataset |
| Confusion Matrix Heatmap | True vs. predicted labels for Random Forest |

```bash
python ml_scripts/visualize.py
```

---

### Saved Models

These files are created by running the ML scripts and loaded by Django at runtime.

| File | Size | Purpose |
|------|------|---------|
| `model_v4.pkl` | ~30 MB | The trained Random Forest Classifier |
| `label_encoders_v4.pkl` | Small | Encoders for each categorical input column |
| `target_encoder_v4.pkl` | Small | Encoder for the hobby target label |
| `feature_cols_v4.pkl` | Tiny | Ordered list of feature column names (ensures correct input order) |

> ⚠️ If these files are missing, Django will throw errors when you try to predict. Run the ML scripts first.

---

### Dataset

#### `dataset/Hobby_Data_v4.csv`
- **Rows:** 1,601 synthetic records
- **Target age group:** 5–12 years old
- **Columns:** 19 features + 1 target (`Hobby`)
- **Classes:** Academics, Sports, Arts, Analytical Thinking, Health & Fitness

---

## Database Models

```
User (Django built-in)
 │
 ├──< InputData (one user → many input submissions)
 │        │
 │        └──── Prediction (one-to-one with InputData)
 │                   │
 │                   └──── Feedback (one-to-one with Prediction)
 │
 └──< Prediction (direct link, for easy querying)
 └──< Feedback (direct link)
```

---

## API Reference

All endpoints are prefixed with `/api/`.

### Authentication Endpoints

#### `POST /api/auth/register/`
Register a new user.
```json
Request:  { "username": "john", "email": "john@email.com", "password": "pass123", "password2": "pass123" }
Response: { "message": "User registered successfully" }
```

#### `POST /api/auth/login/`
Login and receive JWT tokens.
```json
Request:  { "username": "john", "password": "pass123" }
Response: { "access": "<jwt_access_token>", "refresh": "<jwt_refresh_token>", "user": { "username": "john", "is_staff": false } }
```

#### `POST /api/auth/logout/`
Logout (blacklist refresh token). Requires: `Authorization: Bearer <access_token>`
```json
Request:  { "refresh": "<jwt_refresh_token>" }
Response: { "message": "Logged out successfully" }
```

#### `POST /api/auth/token/refresh/`
Get a new access token using the refresh token.
```json
Request:  { "refresh": "<jwt_refresh_token>" }
Response: { "access": "<new_jwt_access_token>" }
```

---

### Profile Endpoints

#### `GET /api/profile/`
Get logged-in user's profile info. Requires JWT.
```json
Response: { "username": "john", "email": "john@email.com", "date_joined": "2026-04-01" }
```

#### `POST /api/profile/change-password/`
Change password. Requires JWT.
```json
Request:  { "old_password": "oldpass", "new_password": "newpass123" }
Response: { "message": "Password changed successfully" }
```

---

### Prediction Endpoints

#### `POST /api/predict/`
Submit child data and get hobby prediction. Requires JWT.
```json
Request: {
  "age": 8,
  "olympiad_participation": "Yes",
  "scholarship": "No",
  "fav_sub": "Mathematics",
  "projects": "Yes",
  "grasp_pow": 5,
  "time_sprt": 2,
  "medals": "No",
  "career_sprt": "No",
  "act_sprt": "No",
  "fant_arts": "No",
  "won_arts": "No",
  "time_art": 1,
  "solves_puzzles": "Yes",
  "logical_score": 8,
  "plays_board_games": "Yes",
  "daily_exercise": 30,
  "dietary_habits": "Healthy",
  "health_awareness": "Yes"
}

Response: {
  "predicted_hobby": "Analytical Thinking",
  "confidence_score": 0.87,
  "prediction_id": 42
}
```

#### `GET /api/history/`
Get all past predictions for the logged-in user. Requires JWT.
```json
Response: [
  {
    "id": 42,
    "predicted_hobby": "Analytical Thinking",
    "confidence_score": 0.87,
    "predicted_at": "2026-04-27T10:30:00Z",
    "has_feedback": false
  },
  ...
]
```

#### `POST /api/feedback/<prediction_id>/`
Submit feedback for a prediction. Requires JWT.
```json
Request:  { "is_accurate": true, "comments": "Very accurate prediction!" }
Response: { "message": "Feedback submitted successfully" }
```

---

### Admin Endpoints

#### `GET /api/admin/dashboard/`
Get admin statistics. Requires JWT + `is_staff=True`.
```json
Response: {
  "total_users": 45,
  "total_predictions": 312,
  "hobby_distribution": {
    "Academics": 98,
    "Sports": 87,
    "Arts": 72,
    "Analytical Thinking": 35,
    "Health & Fitness": 20
  },
  "accuracy_rate": 0.84,
  "recent_predictions": [ ... ],
  "users": [ ... ]
}
```

### Misc

#### `POST /api/contact/`
Submit a contact form (public endpoint).
```json
Request:  { "name": "Alice", "email": "alice@gmail.com", "subject": "Question", "message": "Hello!" }
Response: { "message": "Message received" }
```

---

## ML Pipeline

```
generate_dataset_v4.py
        │
        ▼
dataset/Hobby_Data_v4.csv   (1,601 rows × 20 cols)
        │
        ▼
preprocess_v4.py
        │  Encodes categorical columns
        │  Saves label_encoders.pkl, target_encoder.pkl, feature_cols.pkl
        ▼
train_model_v4.py
        │  Trains Random Forest (+ 4 others for comparison)
        │  Saves model_v4.pkl
        ▼
Django server starts
        │  ml_helpers_v3.py loads .pkl files into memory
        ▼
POST /api/predict/
        │  api_views.api_predict() called
        │  ml_helpers_v3.predict(input) runs inference
        ▼
{ predicted_hobby, confidence_score }  →  saved to DB  →  returned to React
```

---

## JWT Authentication

| Token | Lifetime | Storage |
|-------|---------|---------|
| Access Token | 60 minutes | localStorage (frontend) |
| Refresh Token | 7 days | localStorage (frontend) |

**How it works:**
1. On login, Django returns both tokens.
2. React stores them in `localStorage`.
3. Every API request includes `Authorization: Bearer <access_token>` header.
4. When access token expires (401 error), React auto-uses refresh token to get a new one.
5. On logout, the refresh token is sent to `/api/auth/logout/` to be blacklisted (invalidated).

---

*For frontend documentation, see `FRONTEND_README.md`*
