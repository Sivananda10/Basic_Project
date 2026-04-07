"""
WSGI config for kids_hobby_prediction project.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kids_hobby_prediction.settings')
application = get_wsgi_application()
