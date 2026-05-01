"""
Database Models for Kids Hobbies Prediction System
====================================================
Stores user input data, predictions, and feedback.
"""

from django.db import models
from django.contrib.auth.models import User


class InputData(models.Model):
    """Stores the 14 input parameters entered by a parent for their child's hobby prediction."""

    YESNO = [('Yes', 'Yes'), ('No', 'No')]
    WON_ARTS_CHOICES = [('Yes', 'Yes'), ('No', 'No')]
    FAV_SUB_CHOICES = [
        ('Mathematics', 'Mathematics'),
        ('Science', 'Science'),
        ('History', 'History'),
        ('Languages', 'Languages'),
        ('Arts', 'Arts'),
    ]
    DIET_CHOICES = [
        ('Healthy', 'Healthy'),
        ('Average', 'Average'),
        ('Junk', 'Junk'),
    ]
    SCALE_CHOICES = [(i, str(i)) for i in range(1, 7)]
    LOGICAL_TEST_CHOICES = [(i, str(i)) for i in range(1, 11)]
    AGE_CHOICES = [(i, str(i)) for i in range(5, 18)]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inputs')

    # Base & Academics
    age = models.IntegerField(choices=AGE_CHOICES, verbose_name="Child's Age")
    olympiad_participation = models.CharField(max_length=5, choices=YESNO, verbose_name='Olympiad Participation')
    scholarship = models.CharField(max_length=5, choices=YESNO, verbose_name='Scholarship')
    fav_sub = models.CharField(max_length=30, choices=FAV_SUB_CHOICES, verbose_name='Favourite Subject')
    projects = models.CharField(max_length=5, choices=YESNO, verbose_name='Projects')
    grasp_pow = models.IntegerField(choices=SCALE_CHOICES, verbose_name='Grasping Power')
    
    # Sports
    time_sprt = models.IntegerField(choices=SCALE_CHOICES, verbose_name='Time on Sports (hrs/day)')
    medals = models.CharField(max_length=5, choices=YESNO, verbose_name='Medals Won')
    career_sprt = models.CharField(max_length=5, choices=YESNO, verbose_name='Career in Sports Interest')
    act_sprt = models.CharField(max_length=5, choices=YESNO, verbose_name='Active in Sports')
    
    # Arts
    fant_arts = models.CharField(max_length=5, choices=YESNO, verbose_name='Fascination for Arts')
    won_arts = models.CharField(max_length=10, choices=WON_ARTS_CHOICES, verbose_name='Won Art Competitions')
    time_art = models.IntegerField(choices=SCALE_CHOICES, verbose_name='Time on Arts (hrs/day)')

    # Analytical Thinking
    solves_puzzles = models.CharField(max_length=5, choices=YESNO, verbose_name='Solves Puzzles')
    logical_score = models.IntegerField(choices=LOGICAL_TEST_CHOICES, verbose_name='Logical Reasoning Score (1-10)')
    plays_board_games = models.CharField(max_length=5, choices=YESNO, verbose_name='Plays Chess or Board Games')

    # Health & Fitness
    daily_exercise = models.IntegerField(verbose_name='Daily Exercise (minutes)')
    dietary_habits = models.CharField(max_length=15, choices=DIET_CHOICES, verbose_name='Dietary Habits')
    health_awareness = models.CharField(max_length=5, choices=YESNO, verbose_name='Health Awareness')

    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']
        verbose_name = 'Input Data'
        verbose_name_plural = 'Input Data'

    def __str__(self):
        return f"Input #{self.pk} by {self.user.username} at {self.submitted_at:%Y-%m-%d %H:%M}"


class Prediction(models.Model):
    """Stores the ML model's prediction result (v5: includes role, reason, improvement, career)."""

    user             = models.ForeignKey(User, on_delete=models.CASCADE, related_name='predictions')
    input_data       = models.OneToOneField(InputData, on_delete=models.SET_NULL, null=True, blank=True, related_name='prediction')
    predicted_hobby  = models.CharField(max_length=100)
    confidence_score = models.FloatField(null=True, blank=True)
    predicted_at     = models.DateTimeField(auto_now_add=True)

    # v5 enriched fields
    hobby_role             = models.CharField(max_length=100, blank=True, null=True)
    recommendation_reason  = models.TextField(blank=True, null=True)
    improvement_suggestions= models.JSONField(blank=True, null=True)
    career_paths           = models.JSONField(blank=True, null=True)

    class Meta:
        ordering = ['-predicted_at']
        verbose_name = 'Prediction'

    def __str__(self):
        return f"{self.predicted_hobby} ({self.hobby_role}) for {self.user.username}"


class Feedback(models.Model):
    """Stores user feedback about prediction accuracy."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedbacks')
    prediction = models.OneToOneField(Prediction, on_delete=models.CASCADE, related_name='feedback')
    is_accurate = models.BooleanField(verbose_name='Was the prediction accurate?')
    comments = models.TextField(blank=True, verbose_name='Comments')
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']
        verbose_name = 'Feedback'

    def __str__(self):
        status = "Accurate" if self.is_accurate else "Inaccurate"
        return f"{status} feedback by {self.user.username}"
