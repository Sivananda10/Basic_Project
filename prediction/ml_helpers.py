"""
ml_helpers.py — Two-stage prediction:
  Stage 1: ML model → predicts CATEGORY (5 classes, 95%+ accuracy)
  Stage 2: Rule-based → picks SPECIFIC HOBBY from user answers
"""
import os
import numpy as np
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAVE_DIR = os.path.join(BASE_DIR, 'saved_models')

FEATURE_COLS = [
    'sport_type','sport_activity_level','sport_play_style','favorite_sport',
    'art_type','art_creativity','art_performance','art_learning',
    'acad_subject','acad_problem_solving','acad_curiosity','acad_study_type',
    'analy_interest','analy_logic','analy_challenge','analy_work_style',
    'health_activity_type','health_energy','health_outdoor','health_activity',
]

# ── Hobby metadata ───────────────────────────────────────────────────────────
HOBBY_META = {
    'Cricket':          {'category':'Sports',     'desc':'A team outdoor sport focusing on strategy and physical fitness'},
    'Football':         {'category':'Sports',     'desc':'A high-energy team sport building endurance and teamwork'},
    'Badminton':        {'category':'Sports',     'desc':'A fast-paced racket sport improving reflexes and agility'},
    'Swimming':         {'category':'Sports',     'desc':'A full-body workout sport great for fitness and relaxation'},
    'Table Tennis':     {'category':'Sports',     'desc':'An indoor precision sport enhancing focus and hand-eye coordination'},
    'Drawing':          {'category':'Arts',       'desc':'Express creativity through sketching and visual art'},
    'Dance':            {'category':'Arts',       'desc':'Physical expression through rhythm and movement'},
    'Music':            {'category':'Arts',       'desc':'Learn instruments or vocals to express through sound'},
    'Math Olympiad':    {'category':'Academics',  'desc':'Competitive mathematics building logical reasoning'},
    'Science Club':     {'category':'Academics',  'desc':'Explore science through experiments and group projects'},
    'Creative Writing': {'category':'Academics',  'desc':'Develop storytelling and language skills through writing'},
    'Coding':           {'category':'Analytical', 'desc':'Build programs and solve problems with code'},
    'Chess':            {'category':'Analytical', 'desc':'Strategic board game developing critical thinking'},
    'Robotics':         {'category':'Analytical', 'desc':'Build and program robots combining engineering and coding'},
    'Yoga':             {'category':'Health',     'desc':'Mind-body practice improving flexibility and calm'},
    'Gymnastics':       {'category':'Health',     'desc':'Develop strength, flexibility, and body control'},
    'Running':          {'category':'Health',     'desc':'Build endurance and cardiovascular fitness'},
    'Meditation':       {'category':'Health',     'desc':'Calm the mind and build focus through mindfulness'},
}

# ── Rule-based hobby selection from answers ──────────────────────────────────
HOBBY_RULES = {
    'Sports': {
        'key': 'favorite_sport',
        'map': {
            'Cricket': 'Cricket', 'Football': 'Football',
            'Badminton': 'Badminton', 'Table Tennis': 'Table Tennis',
            'Chess': 'Chess',  # Chess picked under sports → still valid
        },
        'default': 'Cricket',
    },
    'Arts': {
        'key': 'art_type',
        'map': {'Drawing': 'Drawing', 'Music': 'Music', 'Dance': 'Dance'},
        'default': 'Drawing',
    },
    'Academics': {
        'key': 'acad_subject',
        'map': {
            'Math': 'Math Olympiad', 'Science': 'Science Club',
            'Language': 'Creative Writing',
        },
        'default': 'Math Olympiad',
    },
    'Analytical': {
        'key': 'analy_interest',
        'map': {
            'Puzzles': 'Chess', 'Coding': 'Coding',
            'Logical Games': 'Robotics',
        },
        'default': 'Coding',
    },
    'Health': {
        'key': 'health_activity',
        'map': {
            'Yoga': 'Yoga', 'Gymnastics': 'Gymnastics',
            'Running': 'Running', 'Meditation': 'Meditation',
        },
        'default': 'Yoga',
    },
}


def load_model():
    """Load model + encoders."""
    try:
        model      = joblib.load(os.path.join(SAVE_DIR, 'model.pkl'))
        label_encs = joblib.load(os.path.join(SAVE_DIR, 'label_encoders.pkl'))
        target_enc = joblib.load(os.path.join(SAVE_DIR, 'target_encoder.pkl'))
        return model, label_encs, target_enc
    except Exception as e:
        print(f"[ml_helpers] Error loading model: {e}")
        return None, None, None


def build_feature_vector(answers, label_encs):
    """Convert raw answers → encoded numpy array."""
    encoded = []
    for col in FEATURE_COLS:
        raw_val = str(answers.get(col, ''))
        le = label_encs[col]
        if raw_val in le.classes_:
            encoded.append(le.transform([raw_val])[0])
        else:
            encoded.append(0)
    return np.array([encoded])


def pick_hobby_from_answers(category, answers):
    """Stage 2: Rule-based hobby selection from user's answers."""
    rule = HOBBY_RULES.get(category)
    if not rule:
        return category  # fallback

    answer_val = str(answers.get(rule['key'], ''))
    hobby = rule['map'].get(answer_val, rule['default'])
    return hobby


def predict_hobby(answers):
    """
    Two-stage prediction:
      Stage 1: ML → category (Sports/Arts/Academics/Analytical/Health)
      Stage 2: Rule-based → specific hobby from user answers
    Returns structured result dict.
    """
    model, label_encs, target_enc = load_model()
    if model is None:
        return None

    # Stage 1: Predict category
    vec = build_feature_vector(answers, label_encs)
    pred_idx = model.predict(vec)[0]
    category = target_enc.inverse_transform([pred_idx])[0]

    # Get probabilities for all categories
    probs = model.predict_proba(vec)[0]
    category_conf = round(float(probs[pred_idx]) * 100, 1)

    # Stage 2: Pick specific hobby from answers
    hobby = pick_hobby_from_answers(category, answers)
    meta = HOBBY_META.get(hobby, {})

    # Build alternatives from other categories
    sorted_idxs = np.argsort(probs)[::-1]
    alternatives = []
    for idx in sorted_idxs:
        cat = target_enc.inverse_transform([idx])[0]
        p = round(float(probs[idx]) * 100, 1)
        h = pick_hobby_from_answers(cat, answers)
        m = HOBBY_META.get(h, {})
        alternatives.append({
            'hobby': h,
            'category': cat,
            'confidence': p,
            'desc': m.get('desc', ''),
        })

    return {
        'predicted_hobby':  hobby,
        'category':         meta.get('category', category),
        'confidence_score': category_conf,
        'description':      meta.get('desc', ''),
        'alternatives':     alternatives,
    }
