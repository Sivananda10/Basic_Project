"""
REST API Views for Kids Hobbies Prediction System
===================================================
All views return JSON for consumption by the React frontend.
"""

import os
import json
import numpy as np
import joblib
from collections import Counter
from pathlib import Path

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import InputData, Prediction, Feedback
from .serializers import (
    RegisterSerializer, UserSerializer, ChangePasswordSerializer,
    InputDataSerializer, PredictionSerializer, FeedbackSerializer,
)

# ──────────────────────────────────────────────
# ML Model Loader (reused from views.py)
# ──────────────────────────────────────────────
MODEL_DIR = os.path.join(settings.BASE_DIR, 'saved_models')


def load_ml_model():
    try:
        model           = joblib.load(os.path.join(MODEL_DIR, 'model.pkl'))
        label_encoders  = joblib.load(os.path.join(MODEL_DIR, 'label_encoders.pkl'))
        target_encoder  = joblib.load(os.path.join(MODEL_DIR, 'target_encoder.pkl'))
        scaler          = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))
        feature_columns = joblib.load(os.path.join(MODEL_DIR, 'feature_columns.pkl'))
        return model, label_encoders, target_encoder, scaler, feature_columns
    except FileNotFoundError as e:
        print(f"⚠️  ML model files not found: {e}")
        return None, None, None, None, None


def preprocess_input(form_data, label_encoders, scaler):
    binary_cols   = ['Olympiad_Participation', 'Scholarship', 'Projects', 'Medals',
                     'Career_sprt', 'Act_sprt', 'Fant_arts', 'Won_arts',
                     'Solves_Puzzles', 'Plays_Board_Games', 'Health_Awareness']
    multi_cat_cols = ['Fav_sub', 'Dietary_Habits']
    num_cols       = ['Age', 'Grasp_pow', 'Time_sprt', 'Time_art', 'Logical_Score', 'Daily_Exercise_Mins']

    field_map = {
        'age': 'Age', 'olympiad_participation': 'Olympiad_Participation',
        'scholarship': 'Scholarship', 'fav_sub': 'Fav_sub', 'projects': 'Projects',
        'grasp_pow': 'Grasp_pow', 'time_sprt': 'Time_sprt', 'medals': 'Medals',
        'career_sprt': 'Career_sprt', 'act_sprt': 'Act_sprt', 'fant_arts': 'Fant_arts',
        'won_arts': 'Won_arts', 'time_art': 'Time_art', 'solves_puzzles': 'Solves_Puzzles',
        'logical_score': 'Logical_Score', 'plays_board_games': 'Plays_Board_Games',
        'daily_exercise': 'Daily_Exercise_Mins', 'dietary_habits': 'Dietary_Habits',
        'health_awareness': 'Health_Awareness',
    }

    features = {dataset_col: form_data[form_field] for form_field, dataset_col in field_map.items()}

    for col in binary_cols:
        features[col] = label_encoders[col].transform([features[col]])[0]
    for col in multi_cat_cols:
        features[col] = label_encoders[col].transform([features[col]])[0]
    for col in num_cols:
        features[col] = float(features[col])

    num_values = np.array([[features[col] for col in num_cols]])
    scaled = scaler.transform(num_values)[0]
    for i, col in enumerate(num_cols):
        features[col] = scaled[i]

    feature_columns = joblib.load(os.path.join(MODEL_DIR, 'feature_columns.pkl'))
    return np.array([[features[col] for col in feature_columns]])


# ──────────────────────────────────────────────
# AUTH ENDPOINTS
# ──────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def api_register(request):
    """POST /api/auth/register/  →  create user + return JWT tokens."""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    """POST /api/auth/login/  →  return JWT tokens."""
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    if not username or not password:
        return Response({'error': 'Username and password are required.'},
                        status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({'error': 'Invalid username or password.'},
                        status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    return Response({
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_logout(request):
    """POST /api/auth/logout/  →  blacklist refresh token."""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except Exception:
        pass
    return Response({'message': 'Logged out successfully.'})


# ──────────────────────────────────────────────
# PROFILE ENDPOINTS
# ──────────────────────────────────────────────

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def api_profile(request):
    """GET/PUT /api/profile/  →  view or update user profile."""
    user = request.user

    if request.method == 'GET':
        total_predictions = Prediction.objects.filter(user=user).count()
        recent = Prediction.objects.filter(user=user).order_by('-predicted_at')[:5]
        return Response({
            'user': UserSerializer(user).data,
            'total_predictions': total_predictions,
            'recent_predictions': PredictionSerializer(recent, many=True).data,
        })

    # PUT — update profile fields
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'user': serializer.data})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_change_password(request):
    """POST /api/profile/change-password/"""
    user = request.user
    serializer = ChangePasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if not user.check_password(serializer.validated_data['current_password']):
        return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(serializer.validated_data['new_password'])
    user.save()
    return Response({'message': 'Password changed successfully.'})


# ──────────────────────────────────────────────
# PREDICTION ENDPOINTS
# ──────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_predict(request):
    """
    POST /api/predict/
    v3: Branching 25-question questionnaire with health-condition filtering.
    Accepts all v3 feature fields from the React frontend.
    """
    from .ml_helpers_v3 import predict_hobby

    data    = request.data
    answers = dict(data)

    try:
        result = predict_hobby(answers)
        if result is None:
            return Response({'error': 'ML model is not available.'},
                            status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # ── Persist to DB (map v3 fields → existing InputData model) ────────
        try:
            fav_sub_raw = answers.get('fav_subject', 'Math')
            fav_sub     = fav_sub_raw if fav_sub_raw not in ('None', None, '') else 'Math'

            input_record = InputData.objects.create(
                user               = request.user,
                age                = int(answers.get('age', 10)),
                olympiad_participation = 'Yes' if answers.get('acad_competitions') == 'Yes' else 'No',
                scholarship        = 'No',
                fav_sub            = fav_sub,
                projects           = 'No',
                grasp_pow          = 5,
                time_sprt          = 2 if answers.get('sport_hours_per_day') == 'High' else 1,
                medals             = 'No',
                career_sprt        = 'No',
                act_sprt           = 'Yes' if answers.get('sport_activity_level') == 'High' else 'No',
                fant_arts          = 'Yes' if answers.get('art_creativity') == 'High' else 'No',
                won_arts           = 'Yes' if answers.get('art_performance') == 'Yes' else 'No',
                time_art           = 2 if answers.get('art_hours') == 'High' else 1,
                solves_puzzles     = 'Yes' if answers.get('acad_problem_solving') == 'Yes' else 'No',
                logical_score      = 7 if answers.get('analy_logic_level') == 'High' else 5,
                plays_board_games  = 'Yes' if answers.get('analy_puzzle_type') in ('Puzzles', 'Logical Games') else 'No',
                daily_exercise     = 60 if answers.get('health_hours') == 'High' else 30,
                dietary_habits     = 'Average',
                health_awareness   = 'Yes' if answers.get('health_condition', 'None') != 'None' else 'No',
            )
        except Exception as db_err:
            import traceback
            print(f"[api_predict] DB save error (non-fatal): {db_err}")
            print(traceback.format_exc())
            input_record = None

        prediction_obj = Prediction.objects.create(
            user             = request.user,
            input_data       = input_record,
            predicted_hobby  = result['predicted_hobby'],
            confidence_score = result['confidence_score'],
        )

        result['id']           = prediction_obj.id
        result['predicted_at'] = prediction_obj.predicted_at
        return Response(result, status=status.HTTP_201_CREATED)

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response({'error': f'Prediction error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_history(request):
    """GET /api/history/  →  prediction history + analytics data."""
    predictions = (
        Prediction.objects.filter(user=request.user)
        .select_related('input_data', 'feedback')
        .order_by('-predicted_at')
    )

    total       = predictions.count()

    # Map specific hobbies → parent category for the distribution chart
    from .ml_helpers_v3 import HOBBY_META
    CATEGORY_MAP = {
        'Sports': 'Sports', 'Arts': 'Arts', 'Academics': 'Academics',
        'Analytical': 'Analytical Thinking', 'Health': 'Health & Fitness',
    }
    def _get_category(hobby):
        meta = HOBBY_META.get(hobby, {})
        raw_cat = meta.get('category', hobby)
        return CATEGORY_MAP.get(raw_cat, raw_cat)

    hobby_counts = Counter(p.predicted_hobby for p in predictions)
    cat_counts   = Counter(_get_category(p.predicted_hobby) for p in predictions)
    all_categories = ['Sports', 'Arts', 'Academics', 'Analytical Thinking', 'Health & Fitness']
    cat_colors     = ['#4361ee', '#f72585', '#06d6a0', '#ffd166', '#4cc9f0']

    recent      = list(predictions[:10])[::-1]
    conf_labels = [p.predicted_at.strftime('%b %d') for p in recent]
    conf_data   = [float(p.confidence_score) if p.confidence_score else 0 for p in recent]

    feedback_preds = [p for p in predictions if hasattr(p, 'feedback') and p.feedback]
    accurate       = sum(1 for p in feedback_preds if p.feedback.is_accurate)
    inaccurate     = len(feedback_preds) - accurate
    accuracy_pct   = round((accurate / len(feedback_preds)) * 100) if feedback_preds else None
    top_hobby      = hobby_counts.most_common(1)[0][0] if hobby_counts else None

    return Response({
        'predictions':   PredictionSerializer(predictions, many=True).data,
        'total':         total,
        'top_hobby':     top_hobby,
        'accuracy_pct':  accuracy_pct,
        'feedback_count': len(feedback_preds),
        'accurate':      accurate,
        'inaccurate':    inaccurate,
        'charts': {
            'categories': {
                'labels': all_categories,
                'data':   [cat_counts.get(c, 0) for c in all_categories],
                'colors': cat_colors,
            },
            'confidence': {
                'labels': conf_labels,
                'data':   conf_data,
            },
        },
    })


# ──────────────────────────────────────────────
# FEEDBACK ENDPOINT
# ──────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_feedback(request, prediction_id):
    """POST /api/feedback/<id>/  →  submit feedback for a prediction."""
    try:
        prediction = Prediction.objects.get(id=prediction_id, user=request.user)
    except Prediction.DoesNotExist:
        return Response({'error': 'Prediction not found.'}, status=status.HTTP_404_NOT_FOUND)

    if hasattr(prediction, 'feedback') and prediction.feedback:
        return Response({'error': 'Feedback already submitted for this prediction.'},
                        status=status.HTTP_400_BAD_REQUEST)

    serializer = FeedbackSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user, prediction=prediction)
        return Response({'message': 'Feedback submitted successfully.'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ──────────────────────────────────────────────
# CONTACT ENDPOINT
# ──────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def api_contact(request):
    """POST /api/contact/  →  log contact form submission (no DB model needed)."""
    name    = request.data.get('name', '').strip()
    email   = request.data.get('email', '').strip()
    message = request.data.get('message', '').strip()

    if not name or not email or not message:
        return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

    # In production you'd send an email here
    print(f"📧 Contact form: {name} <{email}> — {message[:80]}")
    return Response({'message': 'Thank you for your message! We will get back to you soon.'})


# ──────────────────────────────────────────────
# ADMIN DASHBOARD ENDPOINT
# ──────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def api_admin_dashboard(request):
    """GET /api/admin/dashboard/  →  site-wide stats for admin."""
    total_users       = User.objects.count()
    total_predictions = Prediction.objects.count()
    total_feedback    = Feedback.objects.count()

    hobby_stats = {}
    for hobby in ['Academics', 'Sports', 'Arts', 'Analytical Thinking', 'Health & Fitness']:
        hobby_stats[hobby] = Prediction.objects.filter(predicted_hobby=hobby).count()

    accurate         = Feedback.objects.filter(is_accurate=True).count()
    feedback_accuracy = round((accurate / total_feedback * 100), 1) if total_feedback > 0 else 0

    recent_predictions = Prediction.objects.select_related('user', 'input_data').order_by('-predicted_at')[:10]

    img_dir = os.path.join(settings.BASE_DIR, 'static', 'images')
    chart_flags = {
        'accuracy_comparison': os.path.exists(os.path.join(img_dir, 'accuracy_comparison.png')),
        'feature_importance':  os.path.exists(os.path.join(img_dir, 'feature_importance.png')),
        'hobby_distribution':  os.path.exists(os.path.join(img_dir, 'hobby_distribution.png')),
        'confusion_matrix':    os.path.exists(os.path.join(img_dir, 'confusion_matrix.png')),
        'correlation_heatmap': os.path.exists(os.path.join(img_dir, 'correlation_heatmap.png')),
        'metrics_comparison':  os.path.exists(os.path.join(img_dir, 'metrics_comparison.png')),
    }

    return Response({
        'total_users':        total_users,
        'total_predictions':  total_predictions,
        'total_feedback':     total_feedback,
        'hobby_stats':        hobby_stats,
        'feedback_accuracy':  feedback_accuracy,
        'charts':             chart_flags,
        'recent_predictions': PredictionSerializer(recent_predictions, many=True).data,
    })
