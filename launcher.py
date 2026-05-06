"""
launcher.py — Desktop entry point for Kids Hobby Predictor (PyWebView + Django)

HOW IT WORKS:
  1. Starts Django on 127.0.0.1:5000 in a background thread (hidden from user)
  2. Opens a native desktop window (no browser address bar visible)
  3. The window loads the React SPA built and served by Django

Run locally:   python launcher.py
Build for Windows: see build_desktop.bat
"""

import os
import sys
import time
import socket
import threading
import subprocess
import webbrowser

# ── Resolve BASE_DIR whether running as .py or PyInstaller bundle ─────────
if getattr(sys, 'frozen', False):
    # Running as a PyInstaller executable
    BASE_DIR = sys._MEIPASS
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DJANGO_PORT  = 5000
DJANGO_HOST  = '127.0.0.1'
APP_URL      = f'http://{DJANGO_HOST}:{DJANGO_PORT}'
SPLASH_URL   = f'{APP_URL}/splash/'   # shown first; "Get Started" → main app

# ── Django env setup ──────────────────────────────────────────────────────
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kids_hobby_prediction.settings')
os.environ['DESKTOP_MODE'] = 'true'   # read in settings.py to tune behaviour


def _is_port_open(host: str, port: int) -> bool:
    """Return True if something is already listening on host:port."""
    try:
        with socket.create_connection((host, port), timeout=0.5):
            return True
    except OSError:
        return False


def start_django() -> None:
    """
    Start the Django development server silently.
    All stdout/stderr is suppressed so no terminal window flashes.
    """
    python = sys.executable
    manage  = os.path.join(BASE_DIR, 'manage.py')

    subprocess.Popen(
        [
            python, manage, 'runserver',
            f'{DJANGO_HOST}:{DJANGO_PORT}',
            '--noreload',          # no file-watcher needed in desktop mode
            '--nothreading',       # single-threaded is fine for desktop use
        ],
        cwd=BASE_DIR,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        # On Windows, prevent a console window from appearing
        creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0,
    )


def wait_for_django(timeout: int = 30) -> bool:
    """
    Poll until Django is accepting connections, or timeout is reached.
    Returns True if Django started successfully.
    """
    deadline = time.time() + timeout
    while time.time() < deadline:
        if _is_port_open(DJANGO_HOST, DJANGO_PORT):
            return True
        time.sleep(0.3)
    return False


def open_window() -> None:
    """Open the app in a native PyWebView window."""
    try:
        import webview  # type: ignore

        # Force GTK backend with WebKit2 4.1
        import gi
        gi.require_version('WebKit2', '4.1')
        from gi.repository import WebKit2

        # ── Configure WebKit2 settings to enable web storage ─────────────
        # By default, WebKit2GTK disables localStorage/sessionStorage on http://
        # We MUST configure this BEFORE creating the webview window.
        webkit_settings = WebKit2.Settings()
        webkit_settings.set_enable_developer_extras(True)        # inspector
        webkit_settings.set_javascript_can_access_clipboard(True)
        webkit_settings.set_enable_page_cache(True)
        # The key setting: allow all storage types on any origin
        try:
            webkit_settings.set_enable_html5_local_storage(True)
            webkit_settings.set_enable_html5_database(True)
            print('[launcher] WebKit2 localStorage enabled via settings ✓')
        except Exception as e:
            print(f'[launcher] WebKit2 storage setting failed: {e}')

        window = webview.create_window(
            title='KidHobbyAI — Kids Hobby Prediction System',
            url=SPLASH_URL,          # show splash page first
            width=1280,
            height=800,
            resizable=True,
            min_size=(960, 640),
            text_select=True,
        )

        def on_loaded():
            print(f'[launcher] Page loaded: {window.get_current_url()}')
        window.events.loaded += on_loaded

        # debug=False — hides the WebKit inspector/console panel
        webview.start(gui='gtk', debug=False)

    except ImportError:
        # PyWebView not installed — fall back to opening in the system browser
        print("[launcher] pywebview not found — opening in browser instead.")
        webbrowser.open(APP_URL)
        # Keep the process alive so Django keeps running
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass


def main() -> None:
    # ── 1. Start Django in a daemon thread ───────────────────────────────
    print("[launcher] Starting Django backend …")
    django_thread = threading.Thread(target=start_django, daemon=True)
    django_thread.start()

    # ── 2. Wait until Django is ready ────────────────────────────────────
    ready = wait_for_django(timeout=30)
    if not ready:
        print("[launcher] ERROR: Django did not start within 30 seconds.")
        sys.exit(1)

    print(f"[launcher] Django ready at {APP_URL}")

    # ── 3. Open the native desktop window ────────────────────────────────
    open_window()


if __name__ == '__main__':
    main()
