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
    WON_ARTS_CHOICES = [('Yes', 'Yes'), ('No', 'No'), ('Maybe', 'Maybe')]
    FAV_SUB_CHOICES = [
        ('Mathematics', 'Mathematics'),
        ('Science', 'Science'),
        ('History/Geography', 'History/Geography'),
        ('Any language', 'Any language'),
    ]
    SCALE_CHOICES = [(i, str(i)) for i in range(1, 7)]
    AGE_CHOICES = [(i, str(i)) for i in range(5, 18)]  # Ages 5 to 17

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inputs')

    age = models.IntegerField(choices=AGE_CHOICES, verbose_name="Child's Age")
    olympiad_participation = models.CharField(max_length=5, choices=YESNO, verbose_name='Olympiad Participation')
    scholarship = models.CharField(max_length=5, choices=YESNO, verbose_name='Scholarship')
    school = models.CharField(max_length=5, choices=YESNO, verbose_name='School Involvement')
    fav_sub = models.CharField(max_length=30, choices=FAV_SUB_CHOICES, verbose_name='Favourite Subject')
    projects = models.CharField(max_length=5, choices=YESNO, verbose_name='Projects')
    grasp_pow = models.IntegerField(choices=SCALE_CHOICES, verbose_name='Grasping Power')
    time_sprt = models.IntegerField(choices=SCALE_CHOICES, verbose_name='Time on Sports (hrs/day)')
    medals = models.CharField(max_length=5, choices=YESNO, verbose_name='Medals Won')
    career_sprt = models.CharField(max_length=5, choices=YESNO, verbose_name='Career in Sports Interest')
    act_sprt = models.CharField(max_length=5, choices=YESNO, verbose_name='Active in Sports')
    fant_arts = models.CharField(max_length=5, choices=YESNO, verbose_name='Fascination for Arts')
    won_arts = models.CharField(max_length=10, choices=WON_ARTS_CHOICES, verbose_name='Won Art Competitions')
    time_art = models.IntegerField(choices=SCALE_CHOICES, verbose_name='Time on Arts (hrs/day)')

    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']
        verbose_name = 'Input Data'
        verbose_name_plural = 'Input Data'

    def __str__(self):
        return f"Input #{self.pk} by {self.user.username} at {self.submitted_at:%Y-%m-%d %H:%M}"


class Prediction(models.Model):
    """Stores the ML model's prediction result."""

    HOBBY_CHOICES = [
        ('Academics', 'Academics'),
        ('Sports', 'Sports'),
        ('Arts', 'Arts'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='predictions')
    input_data = models.OneToOneField(InputData, on_delete=models.CASCADE, related_name='prediction')
    predicted_hobby = models.CharField(max_length=20, choices=HOBBY_CHOICES)
    confidence_score = models.FloatField(null=True, blank=True)
    predicted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-predicted_at']
        verbose_name = 'Prediction'

    def __str__(self):
        return f"{self.predicted_hobby} for {self.user.username} ({self.confidence_score:.0%})"


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
