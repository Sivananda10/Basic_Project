"""
REST API URL Configuration
============================
All routes are prefixed with /api/ in the root urls.py
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import api_views

urlpatterns = [
    # ── Auth ──────────────────────────────────
    path('auth/register/',       api_views.api_register,        name='api_register'),
    path('auth/login/',          api_views.api_login,           name='api_login'),
    path('auth/logout/',         api_views.api_logout,          name='api_logout'),
    path('auth/token/refresh/',  TokenRefreshView.as_view(),    name='api_token_refresh'),

    # ── Profile ───────────────────────────────
    path('profile/',                   api_views.api_profile,         name='api_profile'),
    path('profile/change-password/',   api_views.api_change_password, name='api_change_password'),

    # ── Prediction ────────────────────────────
    path('predict/',                   api_views.api_predict,         name='api_predict'),
    path('predict/<int:prediction_id>/followup/', api_views.api_save_followup, name='api_save_followup'),
    path('history/',                   api_views.api_history,         name='api_history'),
    path('feedback/<int:prediction_id>/', api_views.api_feedback,     name='api_feedback'),

    # ── Misc ──────────────────────────────────
    path('contact/',                   api_views.api_contact,         name='api_contact'),

    # ── Admin ─────────────────────────────────
    path('admin/dashboard/',           api_views.api_admin_dashboard, name='api_admin_dashboard'),
]
