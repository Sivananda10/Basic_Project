"""
Admin registration for Kids Hobbies Prediction System.
"""
from django.contrib import admin
from .models import InputData, Prediction, Feedback


@admin.register(InputData)
class InputDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'fav_sub', 'grasp_pow', 'time_sprt', 'time_art', 'submitted_at')
    list_filter = ('fav_sub', 'submitted_at')
    search_fields = ('user__username',)


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'predicted_hobby', 'confidence_score', 'predicted_at')
    list_filter = ('predicted_hobby', 'predicted_at')
    search_fields = ('user__username', 'predicted_hobby')


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'prediction', 'is_accurate', 'submitted_at')
    list_filter = ('is_accurate', 'submitted_at')
    search_fields = ('user__username',)
