# 🚀 Kids Hobby Prediction System — Free Deployment Guide

> **Stack:** Django backend + React (Vite) frontend  
> **Cost:** ₹0 / $0 — 100% free using **Render + Vercel**

---

## 📐 Architecture

```
Browser → Vercel (React frontend)
              └─► API calls → Render.com (Django + Gunicorn)
                                  └─► Render PostgreSQL (free DB)
```

---

## PART 1 — Prepare Django Backend

### 1.1 Install packages

```bash
cd kids_hobby_project
source venv/bin/activate
pip install gunicorn whitenoise psycopg2-binary dj-database-url
pip freeze > requirements.txt
```

### 1.2 Update `settings.py`

```python
import os, dj_database_url

SECRET_KEY = os.environ.get('SECRET_KEY', 'change-me')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '.onrender.com',
                 os.environ.get('RENDER_EXTERNAL_HOSTNAME', '')]

# Database — PostgreSQL on Render, SQLite locally
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {'default': dj_database_url.config(default=DATABASE_URL, conn_max_age=600)}
else:
    DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3',
                              'NAME': BASE_DIR / 'db.sqlite3'}}

# WhiteNoise for static files
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # ← add here
    # ... rest of middleware
]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# CORS
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'https://your-app.vercel.app',  # ← update after Vercel deploy
]
CORS_ALLOW_CREDENTIALS = True

# Email
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
CONTACT_EMAIL = os.environ.get('CONTACT_EMAIL', 'nammisivananda10@gmail.com')
```

### 1.3 Create `build.sh` (Render build script)

Create `kids_hobby_project/build.sh`:

```bash
#!/usr/bin/env bash
set -o errexit
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
```

```bash
chmod +x kids_hobby_project/build.sh
```

### 1.4 Create `Procfile`

Create `kids_hobby_project/Procfile` (no extension):

```
web: gunicorn kids_hobby_prediction.wsgi:application
```

---

## PART 2 — Deploy Backend on Render.com

### 2.1 Push to GitHub

```bash
git add .
git commit -m "chore: prepare for Render deployment"
git push origin main
```

### 2.2 Create Web Service on Render

1. Go to [render.com](https://render.com) → Sign up (free)
2. **New → Web Service** → connect GitHub repo
3. Configure:

| Setting | Value |
|---|---|
| Name | `kids-hobby-backend` |
| Root Directory | `kids_hobby_project` |
| Runtime | Python 3 |
| Build Command | `./build.sh` |
| Start Command | `gunicorn kids_hobby_prediction.wsgi:application` |
| Instance Type | **Free** |

### 2.3 Add PostgreSQL

1. **New → PostgreSQL** → name `kids-hobby-db` → **Free** tier
2. Copy **Internal Database URL**
3. Add as env var: `DATABASE_URL` = `<paste here>`

### 2.4 Set Environment Variables

| Key | Value |
|---|---|
| `SECRET_KEY` | Run: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `DEBUG` | `False` |
| `EMAIL_HOST_USER` | your Gmail address |
| `EMAIL_HOST_PASSWORD` | Gmail App Password (see Part 4) |
| `CONTACT_EMAIL` | `nammisivananda10@gmail.com` |
| `PYTHON_VERSION` | `3.11.0` |

Click **Deploy**. Note your URL: `https://kids-hobby-backend.onrender.com`

---

## PART 3 — Deploy Frontend on Vercel

### 3.1 Update `axiosInstance.js`

```js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const axiosInstance = axios.create({ baseURL: BASE_URL });
```

### 3.2 Create `frontend/.env.production`

```env
VITE_API_URL=https://kids-hobby-backend.onrender.com/api
```

### 3.3 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. **Add New → Project** → import your repo
3. Configure:

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Root Directory | `kids_hobby_project/frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

4. Add env var: `VITE_API_URL` = `https://kids-hobby-backend.onrender.com/api`
5. **Deploy**

> Your live URL: `https://kids-hobby-prediction.vercel.app`

### 3.4 Fix CORS

Back in Render → Environment → add/update:

```
CORS_ALLOWED_ORIGINS=https://kids-hobby-prediction.vercel.app
```

Then update `settings.py` too and push.

---

## PART 4 — Gmail App Password (for Contact Form)

1. [myaccount.google.com](https://myaccount.google.com) → **Security**
2. Enable **2-Step Verification**
3. Go to **App Passwords** → Select **Mail / Other** → name it `HobbyPredictor`
4. Copy the 16-character password
5. Set in Render: `EMAIL_HOST_PASSWORD` = `abcdefghijklmnop` (no spaces)

---

## PART 5 — Keep Server Awake (UptimeRobot)

> Render free tier sleeps after 15 min. Fix with a free pinger:

1. [uptimerobot.com](https://uptimerobot.com) → Free account
2. **Add Monitor** → HTTP(s)
3. URL: `https://kids-hobby-backend.onrender.com/api/`
4. Interval: **5 minutes**

This pings your server every 5 minutes so it never sleeps.

---

## PART 6 — Final Checklist

```
✅ requirements.txt includes: gunicorn, whitenoise, psycopg2-binary, dj-database-url
✅ build.sh created & chmod +x applied
✅ Procfile created
✅ settings.py: DEBUG=False, ALLOWED_HOSTS, CORS, WhiteNoise, DB config
✅ Render Web Service deployed (root dir = kids_hobby_project)
✅ Render PostgreSQL created + DATABASE_URL env var set
✅ SECRET_KEY set to a strong random value
✅ Vercel project deployed (root dir = kids_hobby_project/frontend)
✅ VITE_API_URL env var set on Vercel
✅ CORS_ALLOWED_ORIGINS updated with Vercel URL
✅ Gmail App Password configured
✅ UptimeRobot monitor set up
```

---

## 🔗 Your Live URLs

| | URL |
|---|---|
| **Frontend** | `https://kids-hobby-prediction.vercel.app` |
| **Backend API** | `https://kids-hobby-backend.onrender.com/api/` |
| **Django Admin** | `https://kids-hobby-backend.onrender.com/admin/` |

---

## 🆓 Free Tier Limits

| Service | Limit |
|---|---|
| Render Web | 750 hrs/month (24/7 usage) |
| Render PostgreSQL | 1 GB, 90 days free |
| Vercel | 100 GB bandwidth/month |
| UptimeRobot | 50 monitors, 5-min intervals |
| Gmail SMTP | 500 emails/day |

---

## ❓ Common Issues

**`ModuleNotFoundError` on Render** → Run `pip freeze > requirements.txt` locally and push again.

**CORS errors in browser** → Make sure Vercel URL in `CORS_ALLOWED_ORIGINS` has no trailing slash.

**DB migration fails** → Use Render Shell tab → run `python manage.py migrate`.

**Email not sending** → Check App Password is 16 chars with no spaces. `EMAIL_HOST_USER` must match the Gmail that generated the password.

**Vite build fails** → Run `npm run build` locally first to catch errors before deploying.
