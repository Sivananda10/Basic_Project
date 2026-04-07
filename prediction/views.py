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
    binary_cols = ['Olympiad_Participation', 'Scholarship', 
                   'Projects', 'Medals', 'Career_sprt', 'Act_sprt', 'Fant_arts',
                   'Won_arts', 'Solves_Puzzles', 'Plays_Board_Games', 'Health_Awareness']
    # Multi-class categorical columns
    multi_cat_cols = ['Fav_sub', 'Dietary_Habits']
    # Numerical columns
    num_cols = ['Age', 'Grasp_pow', 'Time_sprt', 'Time_art', 'Logical_Score', 'Daily_Exercise_Mins']

    # Map form field names to dataset column names
    field_map = {
        'age': 'Age',
        'olympiad_participation': 'Olympiad_Participation',
        'scholarship': 'Scholarship',
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
        'solves_puzzles': 'Solves_Puzzles',
        'logical_score': 'Logical_Score',
        'plays_board_games': 'Plays_Board_Games',
        'daily_exercise': 'Daily_Exercise_Mins',
        'dietary_habits': 'Dietary_Habits',
        'health_awareness': 'Health_Awareness',
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


def about(request):
    """About page."""
    return render(request, 'about.html')


def contact(request):
    """Contact page."""
    if request.method == 'POST':
        messages.success(request, 'Thank you for your message! We will get back to you soon.')
        return redirect('contact')
    return render(request, 'contact.html')


@login_required
def profile(request):
    """User profile — view and edit."""
    from django.contrib.auth.models import User
    user = request.user
    total_predictions = Prediction.objects.filter(user=user).count()
    recent_predictions = Prediction.objects.filter(user=user).order_by('-predicted_at')[:5]

    if request.method == 'POST':
        action = request.POST.get('action', 'update_profile')

        if action == 'update_profile':
            first_name = request.POST.get('first_name', '').strip()
            last_name  = request.POST.get('last_name', '').strip()
            email      = request.POST.get('email', '').strip()

            if email and email != user.email:
                if User.objects.filter(email=email).exclude(pk=user.pk).exists():
                    messages.error(request, 'That email is already in use by another account.')
                    return redirect('profile')

            user.first_name = first_name
            user.last_name  = last_name
            user.email      = email
            user.save()
            messages.success(request, 'Profile updated successfully!')
            return redirect('profile')

        elif action == 'change_password':
            current_pw  = request.POST.get('current_password', '')
            new_pw      = request.POST.get('new_password', '')
            confirm_pw  = request.POST.get('confirm_password', '')

            from django.contrib.auth import update_session_auth_hash
            if not user.check_password(current_pw):
                messages.error(request, 'Current password is incorrect.')
            elif new_pw != confirm_pw:
                messages.error(request, 'New passwords do not match.')
            elif len(new_pw) < 8:
                messages.error(request, 'Password must be at least 8 characters.')
            else:
                user.set_password(new_pw)
                user.save()
                update_session_auth_hash(request, user)  # keep logged in
                messages.success(request, 'Password changed successfully!')
            return redirect('profile')

    context = {
        'total_predictions': total_predictions,
        'recent_predictions': recent_predictions,
    }
    return render(request, 'profile.html', context)


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
            login(request, user)
            messages.success(request, f'Welcome, {user.first_name or user.username}! Your account has been created.')
            return redirect('home')
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
                'solves_puzzles': input_data.solves_puzzles,
                'logical_score': input_data.logical_score,
                'plays_board_games': input_data.plays_board_games,
                'daily_exercise': input_data.daily_exercise,
                'dietary_habits': input_data.dietary_habits,
                'health_awareness': input_data.health_awareness,
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
    """Show past predictions for the logged-in user with chart analytics."""
    import json
    from collections import Counter

    predictions = (
        Prediction.objects.filter(user=request.user)
        .select_related('input_data', 'feedback')
        .order_by('-predicted_at')
    )

    total = predictions.count()

    # ── Category distribution ──
    hobby_counts = Counter(p.predicted_hobby for p in predictions)
    all_categories = ['Sports', 'Arts', 'Academics', 'Analytical Thinking', 'Health & Fitness']
    cat_labels  = all_categories
    cat_data    = [hobby_counts.get(c, 0) for c in all_categories]
    cat_colors  = ['#4361ee', '#f72585', '#06d6a0', '#ffd166', '#4cc9f0']

    # ── Confidence over time (last 10) ──
    recent = list(predictions[:10])[::-1]
    conf_labels = [p.predicted_at.strftime('%b %d') for p in recent]
    conf_data   = [float(p.confidence_score) if p.confidence_score else 0 for p in recent]

    # ── Accuracy from feedback ──
    feedback_preds = [p for p in predictions if hasattr(p, 'feedback') and p.feedback]
    accurate = sum(1 for p in feedback_preds if p.feedback.is_accurate)
    inaccurate = len(feedback_preds) - accurate
    accuracy_pct = round((accurate / len(feedback_preds)) * 100) if feedback_preds else None

    # ── Most predicted category ──
    top_hobby = hobby_counts.most_common(1)[0][0] if hobby_counts else None

    context = {
        'predictions'   : predictions,
        'total'         : total,
        'top_hobby'     : top_hobby,
        'accuracy_pct'  : accuracy_pct,
        'feedback_count': len(feedback_preds),
        'cat_labels'    : json.dumps(cat_labels),
        'cat_data'      : json.dumps(cat_data),
        'cat_colors'    : json.dumps(cat_colors),
        'conf_labels'   : json.dumps(conf_labels),
        'conf_data'     : json.dumps(conf_data),
        'accurate'      : accurate,
        'inaccurate'    : inaccurate,
    }
    return render(request, 'history.html', context)


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
    for hobby in ['Academics', 'Sports', 'Arts', 'Analytical Thinking', 'Health & Fitness']:
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
