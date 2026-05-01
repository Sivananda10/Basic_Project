"""
DRF Serializers for Kids Hobbies Prediction System
=====================================================
"""

from django.contrib.auth.models import User
from rest_framework import serializers
from .models import InputData, Prediction, Feedback


# ──────────────────────────────────────────────
# AUTH SERIALIZERS
# ──────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password  = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label='Confirm Password')
    first_name = serializers.CharField(required=True)
    last_name  = serializers.CharField(required=True)
    email      = serializers.EmailField(required=True)

    class Meta:
        model  = User
        fields = ['first_name', 'last_name', 'username', 'email', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({'email': 'A user with this email already exists.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for reading/updating user profile."""

    class Meta:
        model  = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_staff']
        read_only_fields = ['id', 'username', 'is_staff']


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password     = serializers.CharField(required=True, min_length=8)
    confirm_password = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'New passwords do not match.'})
        return data


# ──────────────────────────────────────────────
# INPUT DATA SERIALIZER
# ──────────────────────────────────────────────

class InputDataSerializer(serializers.ModelSerializer):
    """Serializer for the 19-parameter child input form."""

    class Meta:
        model  = InputData
        exclude = ['user', 'submitted_at']


# ──────────────────────────────────────────────
# PREDICTION SERIALIZER
# ──────────────────────────────────────────────

class PredictionSerializer(serializers.ModelSerializer):
    """Serializer for prediction results — v5 includes role, reason, improvement, career."""
    input_data   = InputDataSerializer(read_only=True)
    has_feedback = serializers.SerializerMethodField()
    category     = serializers.SerializerMethodField()

    class Meta:
        model  = Prediction
        fields = [
            'id', 'predicted_hobby', 'hobby_role', 'category',
            'recommendation_reason', 'improvement_suggestions', 'career_paths',
            'predicted_at', 'input_data', 'has_feedback',
        ]

    def get_has_feedback(self, obj):
        return hasattr(obj, 'feedback') and obj.feedback is not None

    def get_category(self, obj):
        from .ml_helpers_v5 import HOBBY_META
        meta = HOBBY_META.get(obj.predicted_hobby, {})
        return meta.get('category', obj.predicted_hobby)


# ──────────────────────────────────────────────
# FEEDBACK SERIALIZER
# ──────────────────────────────────────────────

class FeedbackSerializer(serializers.ModelSerializer):
    """Serializer for submitting feedback on a prediction."""

    class Meta:
        model  = Feedback
        fields = ['is_accurate', 'comments']
