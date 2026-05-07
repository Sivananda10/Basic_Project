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

# ── Log file for debugging crashes ───────────────────────────────────────
LOG_FILE = os.path.join(os.path.dirname(sys.executable if getattr(sys, 'frozen', False) else __file__), 'kidhobbyai.log')

def log(msg: str) -> None:
    """Write message to both stdout and a log file."""
    print(msg)
    try:
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(msg + '\n')
    except Exception:
        pass

# ── Django env setup ──────────────────────────────────────────────────────
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kids_hobby_prediction.settings')
os.environ['DESKTOP_MODE'] = 'true'   # read in settings.py to tune behaviour

# Add BASE_DIR to sys.path so Django can find its modules when frozen
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def _is_port_open(host: str, port: int) -> bool:
    """Return True if something is already listening on host:port."""
    try:
        with socket.create_connection((host, port), timeout=0.5):
            return True
    except OSError:
        return False


def start_django() -> None:
    """
    Start the Django development server.
    - When frozen (PyInstaller .exe): uses Django's Python API directly,
      because sys.executable is the .exe — not Python — so subprocess won't work.
    - When running as .py script: uses subprocess (normal dev mode).
    """
    if getattr(sys, 'frozen', False):
        # ── Frozen mode: call Django management API directly in this thread ──
        try:
            log('[launcher] Frozen mode: starting Django via execute_from_command_line')
            # Must set working directory so Django finds manage.py, db.sqlite3, etc.
            os.chdir(BASE_DIR)
            from django.core.management import execute_from_command_line
            execute_from_command_line([
                'manage.py', 'runserver',
                f'{DJANGO_HOST}:{DJANGO_PORT}',
                '--noreload',
                '--nothreading',
            ])
        except Exception as e:
            log(f'[launcher] Django crashed: {e}')
    else:
        # ── Script mode: use subprocess (works fine when Python is sys.executable) ──
        python = sys.executable
        manage = os.path.join(BASE_DIR, 'manage.py')
        log(f'[launcher] Script mode: starting Django via subprocess: {manage}')
        subprocess.Popen(
            [
                python, manage, 'runserver',
                f'{DJANGO_HOST}:{DJANGO_PORT}',
                '--noreload',
                '--nothreading',
            ],
            cwd=BASE_DIR,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0,
        )


def wait_for_django(timeout: int = 60) -> bool:
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


def show_error(title: str, message: str) -> None:
    """Show a native error dialog on Windows, or print on other platforms."""
    if sys.platform == 'win32':
        try:
            import ctypes
            ctypes.windll.user32.MessageBoxW(0, message, title, 0x10)
        except Exception:
            print(f'[ERROR] {title}: {message}')
    else:
        print(f'[ERROR] {title}: {message}')


def open_window() -> None:
    """Open the app in a native PyWebView window (cross-platform)."""
    try:
        import webview  # type: ignore

        window = webview.create_window(
            title='KidHobbyAI — Kids Hobby Prediction System',
            url=SPLASH_URL,
            width=1280,
            height=800,
            resizable=True,
            min_size=(960, 640),
            text_select=True,
        )

        def on_loaded():
            log(f'[launcher] Page loaded: {window.get_current_url()}')
        window.events.loaded += on_loaded

        if sys.platform == 'linux':
            try:
                import gi
                gi.require_version('WebKit2', '4.1')
                from gi.repository import WebKit2
                webkit_settings = WebKit2.Settings()
                webkit_settings.set_enable_developer_extras(True)
                webkit_settings.set_javascript_can_access_clipboard(True)
                webkit_settings.set_enable_page_cache(True)
                try:
                    webkit_settings.set_enable_html5_local_storage(True)
                    webkit_settings.set_enable_html5_database(True)
                    log('[launcher] WebKit2 localStorage enabled ✓')
                except Exception as e:
                    log(f'[launcher] WebKit2 storage setting failed: {e}')
            except Exception as e:
                log(f'[launcher] WebKit2 config skipped: {e}')
            webview.start(gui='gtk', debug=False)

        elif sys.platform == 'win32':
            webview.start(debug=False)

        else:
            webview.start(debug=False)

    except ImportError:
        log('[launcher] pywebview not found — opening in browser instead.')
        webbrowser.open(APP_URL)
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass


def main() -> None:
    log('[launcher] ══════════════════════════════════════')
    log(f'[launcher] KidHobbyAI starting up')
    log(f'[launcher] BASE_DIR = {BASE_DIR}')
    log(f'[launcher] frozen   = {getattr(sys, "frozen", False)}')
    log('[launcher] ══════════════════════════════════════')

    # ── 1. Start Django in a daemon thread ───────────────────────────────
    log('[launcher] Starting Django backend …')
    django_thread = threading.Thread(target=start_django, daemon=True)
    django_thread.start()

    # ── 2. Wait until Django is ready ────────────────────────────────────
    log('[launcher] Waiting for Django to be ready …')
    ready = wait_for_django(timeout=60)
    if not ready:
        msg = (
            f'Django did not start within 60 seconds.\n\n'
            f'Check the log file for details:\n{LOG_FILE}'
        )
        log(f'[launcher] ERROR: {msg}')
        show_error('KidHobbyAI — Startup Error', msg)
        sys.exit(1)

    log(f'[launcher] Django ready at {APP_URL}')

    # ── 3. Open the native desktop window ────────────────────────────────
    open_window()


if __name__ == '__main__':
    main()
