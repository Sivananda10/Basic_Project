"""
Django settings for kids_hobby_prediction project.
"""

import os
import dj_database_url
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# ── Desktop mode flag (set by launcher.py before Django starts) ───────────
DESKTOP_MODE = os.environ.get('DESKTOP_MODE') == 'true'

# Where Vite puts the production build
REACT_BUILD_DIR    = BASE_DIR / 'frontend' / 'dist'
REACT_BUILD_STATIC = BASE_DIR / 'frontend' / 'dist' / 'assets'

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-k1ds-h0bby-pr3d1ct10n-s3cr3t-k3y-ch4ng3-1n-pr0d')

DEBUG = os.environ.get('DEBUG', 'True') == 'True'

_RENDER_HOST = os.environ.get('RENDER_EXTERNAL_HOSTNAME', '')
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '.onrender.com'] + ([_RENDER_HOST] if _RENDER_HOST else [])

# Desktop mode: only 127.0.0.1 is needed; add it explicitly
if DESKTOP_MODE:
    ALLOWED_HOSTS = ['127.0.0.1', 'localhost']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    # Local
    'prediction',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',   # Must be first
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Static files in production
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Desktop mode: remove headers that cause WebKit2GTK to block script execution.
# Cross-Origin-Opener-Policy and X-Frame-Options sandbox the page in WebKit2.
if DESKTOP_MODE:
    MIDDLEWARE = [
        'corsheaders.middleware.CorsMiddleware',
        'whitenoise.middleware.WhiteNoiseMiddleware',
        'django.contrib.sessions.middleware.SessionMiddleware',
        'django.middleware.common.CommonMiddleware',
        'django.contrib.auth.middleware.AuthenticationMiddleware',
        'django.contrib.messages.middleware.MessageMiddleware',
    ]
    # Disable security headers that interfere with WebKit2GTK
    SECURE_CROSS_ORIGIN_OPENER_POLICY = None
    X_FRAME_OPTIONS = 'ALLOWALL'


ROOT_URLCONF = 'kids_hobby_prediction.urls'

# In desktop mode, also look inside the React build folder for index.html
_template_dirs = [BASE_DIR / 'templates']
if DESKTOP_MODE:
    _template_dirs.insert(0, REACT_BUILD_DIR)   # dist/index.html is served here

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': _template_dirs,
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'kids_hobby_prediction.wsgi.application'

# ──────────────────────────────────────────────
# DATABASE — PostgreSQL on Render, SQLite locally
# ──────────────────────────────────────────────
_DATABASE_URL = os.environ.get('DATABASE_URL')
if _DATABASE_URL:
    DATABASES = {'default': dj_database_url.config(default=_DATABASE_URL, conn_max_age=600)}
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Desktop mode: also serve the React build's JS/CSS assets via WhiteNoise
if DESKTOP_MODE and REACT_BUILD_STATIC.exists():
    STATICFILES_DIRS = [BASE_DIR / 'static', REACT_BUILD_STATIC]

# Login redirect
LOGIN_URL = '/login/'
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/login/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ──────────────────────────────────────────────
# CORS — Allow React dev server (any localhost port)
# ──────────────────────────────────────────────
if DEBUG:
    # Allow ALL origins in dev so Vite port changes (5173/5174/5175...)
    # never block requests.
    CORS_ALLOW_ALL_ORIGINS = True
else:
    _VERCEL_URL = os.environ.get('CORS_ALLOWED_ORIGINS', '')
    CORS_ALLOWED_ORIGINS = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ] + ([_VERCEL_URL] if _VERCEL_URL else [])
CORS_ALLOW_CREDENTIALS = True

# ──────────────────────────────────────────────
# Django REST Framework + JWT
# ──────────────────────────────────────────────
from datetime import timedelta

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS':  True,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ──────────────────────────────────────────────
# EMAIL — Contact form delivery
# Set EMAIL_HOST_USER / EMAIL_HOST_PASSWORD in environment
# or keep console backend for pure offline demo.
# ──────────────────────────────────────────────
CONTACT_EMAIL = 'nammisivananda10@gmail.com'

# Desktop / offline mode: silently log emails to console instead of SMTP
if DESKTOP_MODE:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
else:
    EMAIL_BACKEND = os.environ.get('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')

EMAIL_HOST          = 'smtp.gmail.com'
EMAIL_PORT          = 587
EMAIL_USE_TLS       = True
EMAIL_HOST_USER     = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL  = EMAIL_HOST_USER or 'noreply@hobbypredictor.in'
