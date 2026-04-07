"""
Views for Kids Hobbies Prediction System
==========================================
Handles authentication, prediction, history, feedback, and admin dashboard.
"""

import os
import numpy as np
import joblib
from pathlib import Path

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.conf import settings

from .forms import UserRegistrationForm, PredictionInputForm, FeedbackForm
from .models import InputData, Prediction, Feedback

# ──────────────────────────────────────────────
# ML Model Loading
# ──────────────────────────────────────────────
MODEL_DIR = os.path.join(settings.BASE_DIR, 'saved_models')


def load_ml_model():
    """Load the trained Random Forest model and preprocessing objects."""
    try:
        model = joblib.load(os.path.join(MODEL_DIR, 'model.pkl'))
        label_encoders = joblib.load(os.path.join(MODEL_DIR, 'label_encoders.pkl'))
        target_encoder = joblib.load(os.path.join(MODEL_DIR, 'target_encoder.pkl'))
        scaler = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))
        feature_columns = joblib.load(os.path.join(MODEL_DIR, 'feature_columns.pkl'))
        return model, label_encoders, target_encoder, scaler, feature_columns
    except FileNotFoundError as e:
        print(f"⚠️ ML model files not found: {e}")
        return None, None, None, None, None


def preprocess_input(form_data, label_encoders, scaler):
    """
    Preprocess raw form input to match the format expected by the trained model.
    Applies the same encoding and scaling used during training.
    """
    # Binary columns
    binary_cols = ['Olympiad_Participation', 'Scholarship', 'School',
                   'Projects', 'Medals', 'Career_sprt', 'Act_sprt', 'Fant_arts']
    # Multi-class categorical columns
    multi_cat_cols = ['Fav_sub', 'Won_arts']
    # Numerical columns
    num_cols = ['Age', 'Grasp_pow', 'Time_sprt', 'Time_art']

    # Map form field names to dataset column names
    field_map = {
        'age': 'Age',
        'olympiad_participation': 'Olympiad_Participation',
        'scholarship': 'Scholarship',
        'school': 'School',
        'fav_sub': 'Fav_sub',
        'projects': 'Projects',
        'grasp_pow': 'Grasp_pow',
        'time_sprt': 'Time_sprt',
        'medals': 'Medals',
        'career_sprt': 'Career_sprt',
        'act_sprt': 'Act_sprt',
        'fant_arts': 'Fant_arts',
        'won_arts': 'Won_arts',
        'time_art': 'Time_art',
    }

    # Build feature dict with dataset column names
    features = {}
    for form_field, dataset_col in field_map.items():
        features[dataset_col] = form_data[form_field]

    # Encode binary columns
    for col in binary_cols:
        le = label_encoders[col]
        features[col] = le.transform([features[col]])[0]

    # Encode multi-class columns
    for col in multi_cat_cols:
        le = label_encoders[col]
        features[col] = le.transform([features[col]])[0]

    # Ensure numerical columns are float
    for col in num_cols:
        features[col] = float(features[col])

    # Scale numerical columns
    num_values = np.array([[features[col] for col in num_cols]])
    scaled = scaler.transform(num_values)[0]
    for i, col in enumerate(num_cols):
        features[col] = scaled[i]

    # Build feature array in the correct column order
    feature_columns = joblib.load(os.path.join(MODEL_DIR, 'feature_columns.pkl'))
    feature_array = np.array([[features[col] for col in feature_columns]])

    return feature_array


# ──────────────────────────────────────────────
# PUBLIC VIEWS
# ──────────────────────────────────────────────

def home(request):
    """Landing page."""
    return render(request, 'home.html')


# ──────────────────────────────────────────────
# AUTHENTICATION VIEWS
# ──────────────────────────────────────────────

def register_view(request):
    """User registration."""
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, f'Account created for {user.username}! You can now login.')
            return redirect('login')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = UserRegistrationForm()

    return render(request, 'register.html', {'form': form})


def login_view(request):
    """User login."""
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, f'Welcome back, {user.first_name or user.username}!')
            next_url = request.GET.get('next', 'home')
            return redirect(next_url)
        else:
            messages.error(request, 'Invalid username or password.')

    return render(request, 'login.html')


def logout_view(request):
    """User logout."""
    logout(request)
    messages.info(request, 'You have been logged out.')
    return redirect('login')


# ──────────────────────────────────────────────
# PREDICTION VIEWS
# ──────────────────────────────────────────────

@login_required
def predict_hobby(request):
    """Accept child data and return hobby prediction."""
    if request.method == 'POST':
        form = PredictionInputForm(request.POST)
        if form.is_valid():
            # Save input data
            input_data = form.save(commit=False)
            input_data.user = request.user
            input_data.save()

            # Load ML model
            model, label_encoders, target_encoder, scaler, feature_columns = load_ml_model()

            if model is None:
                messages.error(request, 'ML model is not available. Please contact the administrator.')
                return redirect('predict')

            # Preprocess input
            form_data = {
                'age': input_data.age,
                'olympiad_participation': input_data.olympiad_participation,
                'scholarship': input_data.scholarship,
                'school': input_data.school,
                'fav_sub': input_data.fav_sub,
                'projects': input_data.projects,
                'grasp_pow': input_data.grasp_pow,
                'time_sprt': input_data.time_sprt,
                'medals': input_data.medals,
                'career_sprt': input_data.career_sprt,
                'act_sprt': input_data.act_sprt,
                'fant_arts': input_data.fant_arts,
                'won_arts': input_data.won_arts,
                'time_art': input_data.time_art,
            }

            try:
                processed_input = preprocess_input(form_data, label_encoders, scaler)

                # Predict
                prediction_num = model.predict(processed_input)[0]
                predicted_hobby = target_encoder.inverse_transform([prediction_num])[0]

                # Get confidence score
                confidence = None
                if hasattr(model, 'predict_proba'):
                    probabilities = model.predict_proba(processed_input)[0]
                    confidence = round(float(max(probabilities)) * 100, 2)

                # Save prediction
                prediction = Prediction.objects.create(
                    user=request.user,
                    input_data=input_data,
                    predicted_hobby=predicted_hobby,
                    confidence_score=confidence,
                )

                return render(request, 'result.html', {
                    'prediction': prediction,
                    'input_data': input_data,
                })

            except Exception as e:
                messages.error(request, f'Prediction error: {str(e)}')
                return redirect('predict')
        else:
            messages.error(request, 'Please correct the errors in the form.')
    else:
        form = PredictionInputForm()

    return render(request, 'input_form.html', {'form': form})


@login_required
def prediction_history(request):
    """Show past predictions for the logged-in user."""
    predictions = Prediction.objects.filter(user=request.user).select_related('input_data', 'feedback')
    return render(request, 'history.html', {'predictions': predictions})


@login_required
def feedback_view(request, prediction_id):
    """Submit feedback for a specific prediction."""
    prediction = get_object_or_404(Prediction, id=prediction_id, user=request.user)

    # Check if feedback already exists
    if hasattr(prediction, 'feedback'):
        messages.info(request, 'You have already submitted feedback for this prediction.')
        return redirect('history')

    if request.method == 'POST':
        form = FeedbackForm(request.POST)
        if form.is_valid():
            feedback = form.save(commit=False)
            feedback.user = request.user
            feedback.prediction = prediction
            feedback.save()
            messages.success(request, 'Thank you for your feedback!')
            return redirect('history')
    else:
        form = FeedbackForm()

    return render(request, 'feedback.html', {
        'form': form,
        'prediction': prediction,
    })


# ──────────────────────────────────────────────
# ADMIN DASHBOARD
# ──────────────────────────────────────────────

def is_admin(user):
    return user.is_staff


@login_required
@user_passes_test(is_admin)
def admin_dashboard(request):
    """Admin-only dashboard with statistics and monitoring."""
    from django.contrib.auth.models import User

    total_users = User.objects.count()
    total_predictions = Prediction.objects.count()
    total_feedback = Feedback.objects.count()

    # Hobby distribution from predictions
    hobby_stats = {}
    for hobby in ['Academics', 'Sports', 'Arts']:
        hobby_stats[hobby] = Prediction.objects.filter(predicted_hobby=hobby).count()

    # Feedback accuracy
    accurate = Feedback.objects.filter(is_accurate=True).count()
    feedback_accuracy = (accurate / total_feedback * 100) if total_feedback > 0 else 0

    # Recent predictions
    recent_predictions = Prediction.objects.select_related('user', 'input_data').order_by('-predicted_at')[:10]

    # Check if visualization images exist
    img_dir = os.path.join(settings.BASE_DIR, 'static', 'images')
    charts = {
        'accuracy_comparison': os.path.exists(os.path.join(img_dir, 'accuracy_comparison.png')),
        'feature_importance': os.path.exists(os.path.join(img_dir, 'feature_importance.png')),
        'hobby_distribution': os.path.exists(os.path.join(img_dir, 'hobby_distribution.png')),
        'confusion_matrix': os.path.exists(os.path.join(img_dir, 'confusion_matrix.png')),
        'correlation_heatmap': os.path.exists(os.path.join(img_dir, 'correlation_heatmap.png')),
        'metrics_comparison': os.path.exists(os.path.join(img_dir, 'metrics_comparison.png')),
    }

    context = {
        'total_users': total_users,
        'total_predictions': total_predictions,
        'total_feedback': total_feedback,
        'hobby_stats': hobby_stats,
        'feedback_accuracy': round(feedback_accuracy, 1),
        'recent_predictions': recent_predictions,
        'charts': charts,
    }
    return render(request, 'admin_dashboard.html', context)
