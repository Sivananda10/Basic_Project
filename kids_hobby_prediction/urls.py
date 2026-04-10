"""
kids_hobby_prediction URL Configuration
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # React SPA handles all frontend routes
    # Django only serves the REST API
    path('api/', include('prediction.api_urls')),
]
