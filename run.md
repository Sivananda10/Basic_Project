
```bash
# Create the virtual environment
python3 -m venv venv

# Activate it
# On Linux / macOS:
source venv/bin/activate

# On Windows (Git Bash):
source venv/Scripts/activate



 Install Python Dependencies

```bash
pip install -r requirements.txt
```



This installs:
- `django`, `djangorestframework`, `djangorestframework-simplejwt`, `django-cors-headers`
- `scikit-learn`, `pandas`, `numpy`, `joblib`
- `matplotlib`, `seaborn`
- `mysqlclient` (only required if using MySQL — safe to ignore for SQLite dev setup)



Set Up the Django Database

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

