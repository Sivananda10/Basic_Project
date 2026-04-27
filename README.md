# 🎯 Kids Hobbies Prediction System

A full-stack machine learning web application that predicts the most suitable hobby for a child (ages **5–12**) based on their behavioral traits and academic interests, using the **Random Forest Algorithm**.

---

## 🧩 Features

- 🤖 **ML Prediction** — Predicts hobby (**Sports / Arts / Academics**) from 13 input parameters
- 👤 **User Authentication** — Register, Login, Logout with JWT tokens
- 📋 **Prediction Form** — 13-question child assessment form
- 🕒 **Prediction History** — View all past predictions per user
- 💬 **Feedback System** — Users can rate prediction accuracy
- 🛡️ **Admin Dashboard** — Monitor users, predictions & ML visualizations
- 📊 **5-Algorithm Comparison** — Random Forest, Decision Tree, Logistic Regression, Naive Bayes, SVM
- 👤 **Profile Page** — View and manage user profile

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 (Vite), JSX, CSS |
| **Backend** | Django 4.x, Django REST Framework |
| **Authentication** | JWT (djangorestframework-simplejwt) |
| **ML Model** | scikit-learn — Random Forest Classifier |
| **Database** | SQLite (development) |
| **Visualization** | Matplotlib, Seaborn |
| **CORS** | django-cors-headers |

---

## 📂 Project Structure

```
kids_hobby_project/
│
├── manage.py                        # Django entry point
├── requirements.txt                 # Python dependencies
├── db.sqlite3                       # SQLite database
│
├── kids_hobby_prediction/           # Django project config
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── prediction/                      # Main Django app (API + ML)
│   ├── models.py                    # Database models
│   ├── views.py                     # REST API views + ML integration
│   ├── serializers.py               # DRF serializers
│   ├── urls.py                      # API URL routing
│   └── apps.py
│
├── ml_scripts/                      # ML pipeline scripts
│   ├── generate_dataset_v4.py       # Synthetic dataset generation
│   ├── preprocess_v4.py             # Data cleaning & encoding
│   ├── train_model_v4.py            # Train & evaluate 5 models
│   └── visualize.py                 # Generate charts
│
├── dataset/
│   └── Hobby_Data_v4.csv            # Training dataset (1,601 records, age 5–12)
│
├── saved_models/                    # Trained model artifacts
│   ├── model_v4.pkl                 # Random Forest model
│   ├── label_encoders.pkl           # Feature encoders
│   ├── target_encoder.pkl           # Target label encoder
│   ├── scaler.pkl                   # Feature scaler
│   └── feature_columns.pkl          # Column order
│
└── frontend/                        # React (Vite) frontend
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/
        │   └── axiosInstance.js     # Axios config (JWT interceptors)
        ├── context/
        │   ├── AuthContext.jsx      # Auth state management
        │   └── ToastContext.jsx     # Toast notifications
        ├── components/
        │   ├── Navbar.jsx
        │   └── Sidebar.jsx
        └── pages/
            ├── HomePage.jsx / .css
            ├── AuthPage.jsx / .css
            ├── PredictPage.jsx / .css
            ├── ResultPage.jsx / .css
            ├── HistoryPage.jsx / .css
            ├── FeedbackPage.jsx
            ├── ProfilePage.jsx / .css
            ├── AboutPage.jsx
            ├── ContactPage.jsx
            └── AdminDashboardPage.jsx
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+ & npm
- Git

---

### 🐍 Backend Setup

```bash
# 1. Navigate to project directory
cd kids_hobby_project

# 2. Create & activate virtual environment
python -m venv venv
source venv/bin/activate        # Linux / macOS
# venv\Scripts\activate         # Windows

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Run database migrations
python manage.py makemigrations
python manage.py migrate

# 5. Create an admin superuser
python manage.py createsuperuser

# 6. Start the Django backend server
python manage.py runserver
```

Backend runs at: **http://127.0.0.1:8000**

---

### ⚛️ Frontend Setup

```bash
# In a new terminal tab
cd kids_hobby_project/frontend

# Install Node.js dependencies
npm install

# Start the React development server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

### 🤖 ML Model (Already Trained)

The model (`saved_models/model_v4.pkl`) is pre-trained and ready to use.  
To retrain from scratch:

```bash
# Activate virtual environment first
source venv/bin/activate

# Step 1: Preprocess the dataset
python ml_scripts/preprocess_v4.py

# Step 2: Train all 5 models & evaluate
python ml_scripts/train_model_v4.py

# Step 3: Generate visualizations
python ml_scripts/visualize.py
```

---

## 🚀 Running the Full App

Open **two terminals**:

| Terminal | Command |
|----------|---------|
| Terminal 1 (Backend) | `cd kids_hobby_project && source venv/bin/activate && python manage.py runserver` |
| Terminal 2 (Frontend) | `cd kids_hobby_project/frontend && npm run dev` |

Then open: **http://localhost:5173**

---

## 📊 ML Details

| Property | Value |
|----------|-------|
| **Algorithm** | Random Forest Classifier |
| **Dataset** | 1,601 records, children aged 5–12 |
| **Input Features** | 13 behavioral & academic parameters |
| **Output Classes** | Academics, Sports, Arts |
| **Train/Test Split** | 80% / 20% |
| **Expected Accuracy** | > 85% |

---

## 🧑‍💻 Usage Guide

1. **Register** a new user account at `/register`
2. **Login** with your credentials
3. **Fill** the 13-question form about the child
4. **View** the predicted hobby with confidence score
5. **Give feedback** on prediction accuracy
6. **Admin** can access the dashboard at `/dashboard`

---

## 📦 API Endpoints (Backend)

| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/register/` | User registration |
| POST | `/api/token/` | Login — get JWT tokens |
| POST | `/api/token/refresh/` | Refresh JWT token |
| POST | `/api/predict/` | Submit prediction form |
| GET | `/api/history/` | Get prediction history |
| POST | `/api/feedback/` | Submit feedback |
| GET | `/api/admin/dashboard/` | Admin stats |

---

## 📋 Requirements

See [`requirements.txt`](requirements.txt) for full Python dependencies.

**Key packages:**
- `django >= 4.0`
- `djangorestframework`
- `djangorestframework-simplejwt`
- `django-cors-headers`
- `scikit-learn`
- `pandas`, `numpy`
- `matplotlib`, `seaborn`
- `joblib`

---

## 👨‍💻 Author

**Raghavendra**  
📅 April 2026

---

*Built with ❤️ using Django REST Framework + React + scikit-learn*
