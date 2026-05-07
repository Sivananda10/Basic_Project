@echo off
REM ============================================================
REM  build_desktop.bat — Build KidHobbyAI as a Windows .exe
REM  Run this script from inside the kids_hobby_project folder.
REM  Prerequisites: Python 3.10+, Node 18+, pip, npm
REM ============================================================

echo.
echo =========================================================
echo  STEP 1 — Install Python desktop dependencies
echo =========================================================
pip install -r requirements_desktop.txt
IF ERRORLEVEL 1 (echo [ERROR] pip install failed & pause & exit /b 1)

echo.
echo =========================================================
echo  STEP 2 — Run Django migrations (create/update db.sqlite3)
echo =========================================================
python manage.py migrate --run-syncdb
IF ERRORLEVEL 1 (echo [ERROR] Django migrations failed & pause & exit /b 1)

echo.
echo =========================================================
echo  STEP 3 — Collect Django static files
echo =========================================================
python manage.py collectstatic --noinput
IF ERRORLEVEL 1 (echo [ERROR] collectstatic failed & pause & exit /b 1)

echo.
echo =========================================================
echo  STEP 4 — Build React frontend (npm run build)
echo =========================================================
cd frontend
call npm install
IF ERRORLEVEL 1 (echo [ERROR] npm install failed & pause & cd .. & exit /b 1)
call npm run build
IF ERRORLEVEL 1 (echo [ERROR] npm build failed & pause & cd .. & exit /b 1)
cd ..

echo.
echo =========================================================
echo  STEP 5 — Package with PyInstaller into a single .exe
echo =========================================================
pyinstaller ^
  --name "KidHobbyAI" ^
  --windowed ^
  --onedir ^
  --add-data "saved_models;saved_models" ^
  --add-data "prediction;prediction" ^
  --add-data "kids_hobby_prediction;kids_hobby_prediction" ^
  --add-data "static;static" ^
  --add-data "frontend\dist;frontend\dist" ^
  --add-data "db.sqlite3;." ^
  --add-data "manage.py;." ^
  --hidden-import "sklearn" ^
  --hidden-import "sklearn.ensemble" ^
  --hidden-import "sklearn.ensemble._forest" ^
  --hidden-import "sklearn.tree" ^
  --hidden-import "sklearn.tree._classes" ^
  --hidden-import "sklearn.utils._weight_vector" ^
  --hidden-import "sklearn.neighbors._partition_nodes" ^
  --hidden-import "joblib" ^
  --hidden-import "django" ^
  --hidden-import "django.template.defaulttags" ^
  --hidden-import "django.template.defaultfilters" ^
  --hidden-import "django.template.loader_tags" ^
  --hidden-import "rest_framework" ^
  --hidden-import "rest_framework_simplejwt" ^
  --hidden-import "corsheaders" ^
  --hidden-import "whitenoise" ^
  --hidden-import "dj_database_url" ^
  --hidden-import "kids_hobby_prediction" ^
  --hidden-import "kids_hobby_prediction.settings" ^
  --hidden-import "kids_hobby_prediction.urls" ^
  --hidden-import "kids_hobby_prediction.wsgi" ^
  --hidden-import "prediction" ^
  --hidden-import "prediction.models" ^
  --hidden-import "prediction.admin" ^
  --hidden-import "prediction.apps" ^
  --hidden-import "prediction.serializers" ^
  --hidden-import "prediction.api_views" ^
  --hidden-import "prediction.api_urls" ^
  --hidden-import "prediction.ml_helpers_v3" ^
  --hidden-import "wsgiref" ^
  --hidden-import "wsgiref.simple_server" ^
  --hidden-import "wsgiref.handlers" ^
  --collect-all "webview" ^
  --collect-all "sklearn" ^
  --collect-all "django" ^
  --collect-all "whitenoise" ^
  --collect-all "corsheaders" ^
  --collect-all "rest_framework" ^
  --collect-all "rest_framework_simplejwt" ^
  launcher.py

IF ERRORLEVEL 1 (
  echo [ERROR] PyInstaller failed — see above for details.
  pause
  exit /b 1
)

echo.
echo =========================================================
echo  BUILD COMPLETE!
echo  Your app is in:  dist\KidHobbyAI\KidHobbyAI.exe
echo  Zip the entire  dist\KidHobbyAI\  folder and share it.
echo =========================================================
pause
