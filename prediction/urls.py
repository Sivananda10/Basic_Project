"""
URL configuration for the prediction app.
"""
from django.urls import path
from . import views

urlpatterns = [
    # Public
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),

    # Authentication
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    # Profile
    path('profile/', views.profile, name='profile'),

    # Prediction
    path('predict/', views.predict_hobby, name='predict'),
    path('history/', views.prediction_history, name='history'),
    path('feedback/<int:prediction_id>/', views.feedback_view, name='feedback'),

    # Admin
    path('dashboard/', views.admin_dashboard, name='admin_dashboard'),
]
