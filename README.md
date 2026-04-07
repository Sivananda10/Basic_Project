# Kids Hobbies Prediction System

A machine learning-based web application that predicts the most suitable hobby for a child using the **Random Forest Algorithm**.

## Features

- **ML Prediction**: Predicts hobby (Sports / Arts / Academics) based on 13 input parameters
- **User System**: Registration, Login, Logout
- **Prediction History**: View all past predictions
- **Feedback System**: Users can rate prediction accuracy
- **Admin Dashboard**: Monitor predictions, users, and view ML visualizations
- **5 Algorithm Comparison**: Random Forest, Decision Tree, Logistic Regression, Naive Bayes, SVM

## Tech Stack

- **Backend**: Django 4.x (Python)
- **Frontend**: HTML, CSS, Bootstrap 5
- **ML**: scikit-learn (Random Forest Classifier)
- **Database**: SQLite (dev) / MySQL (production)
- **Visualization**: Matplotlib, Seaborn

## Project Structure

```
kids_hobby_project/
├── manage.py                        # Django entry point
├── requirements.txt                 # Python dependencies
├── kids_hobby_prediction/           # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── prediction/                      # Main Django app
│   ├── models.py                    # Database models
│   ├── views.py                     # View functions + ML integration
│   ├── forms.py                     # Input forms
│   ├── urls.py                      # URL routing
│   └── admin.py                     # Admin panel config
├── templates/                       # HTML templates
│   ├── base.html                    # Base layout
│   ├── home.html                    # Landing page
│   ├── register.html / login.html   # Auth pages
│   ├── input_form.html              # 13-field prediction form
│   ├── result.html                  # Prediction result display
│   ├── history.html                 # Past predictions
│   ├── feedback.html                # Feedback form
│   └── admin_dashboard.html         # Admin stats + charts
├── static/css/style.css             # Custom styles
├── ml_scripts/                      # ML training scripts
│   ├── preprocess.py                # Data cleaning & encoding
│   ├── train_model.py               # Train 5 models & evaluate
│   └── visualize.py                 # Generate charts
├── dataset/
│   └── Hobby_Data.csv               # Training dataset (1601 records)
└── saved_models/                    # Trained model files (after training)
    ├── model.pkl                    # Random Forest model
    ├── label_encoders.pkl           # Feature encoders
    ├── target_encoder.pkl           # Target label encoder
    ├── scaler.pkl                   # Feature scaler
    └── feature_columns.pkl          # Column order
```

## Setup Instructions

### Step 1: Install Dependencies
```bash
cd kids_hobby_project
python -m venv venv
source venv/bin/activate          # Linux/Mac
# venv\Scripts\activate           # Windows
pip install -r requirements.txt
```

### Step 2: Train the ML Model
```bash
python ml_scripts/preprocess.py    # Preprocess dataset
python ml_scripts/train_model.py   # Train & evaluate 5 models
python ml_scripts/visualize.py     # Generate charts
```

### Step 3: Setup Django Database
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser   # Create admin account
```

### Step 4: Run the Server
```bash
python manage.py runserver
```

Visit: http://127.0.0.1:8000

### MySQL Setup (Optional — for production)
```sql
CREATE DATABASE kids_hobby_db;
CREATE USER 'hobby_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON kids_hobby_db.* TO 'hobby_user'@'localhost';
```
Then update `settings.py` to use the MySQL configuration (uncomment the MySQL block).

## Usage

1. **Register** a new account
2. **Login** to the system
3. **Fill** the 13-question form about the child
4. **Get** the predicted hobby with confidence score
5. **Give feedback** on the prediction accuracy
6. **Admin** can view dashboard at `/dashboard/`

## Dataset

- **Records**: 1,601
- **Features**: 13 input parameters
- **Target**: 3 classes (Academics, Sports, Arts)
- **Source**: `dataset/Hobby_Data.csv`
