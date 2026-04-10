"""
ml_helpers_v3.py — Prediction pipeline for v3 branching questionnaire.

Two-stage prediction:
  Stage 1: ML model → predicts CATEGORY (5 classes)
  Stage 2: Rule-based → picks SPECIFIC HOBBY from user answers

Health-condition filtering:
  - Asthma      → block Cricket / Football / Running as PRIMARY hobby
                   → show warning info, recommend indoors / calm alternative
  - Joint Pain  → block Gymnastics / Running as PRIMARY hobby
                   → show warning info, recommend low-impact alternative
In both cases the restricted hobby may still appear as a SECONDARY option
with a ⚠️ flag and a health-advisory message.
"""
import os
import numpy as np
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAVE_DIR = os.path.join(BASE_DIR, 'saved_models')

FEATURE_COLS = [
    'age',
    'likes_sports', 'sport_indoor_outdoor', 'which_sport',
    'sport_hours_per_day', 'sport_team_solo', 'sport_activity_level', 'sport_frequency',
    'likes_arts', 'which_art', 'art_creativity', 'art_performance',
    'art_hours', 'art_learning_style', 'art_digital_traditional',
    'likes_academics', 'fav_subject', 'acad_problem_solving',
    'acad_curiosity', 'acad_study_type', 'acad_competitions', 'acad_reading_habit',
    'likes_analytical', 'analy_puzzle_type', 'analy_logic_level',
    'analy_challenge', 'analy_work_style', 'analy_coding_interest', 'analy_patience_level',
    'health_condition', 'health_energy', 'health_outdoor_preference',
    'health_activity_preference', 'health_hours', 'health_sleep_quality',
]

NUMERIC_COLS = {'age'}

# ── Health restriction rules ─────────────────────────────────────────────────
HEALTH_RESTRICTIONS = {
    'Asthma': {
        'blocked_hobbies': ['Cricket', 'Football', 'Running'],
        'safe_alternative': 'Swimming',
        'warning': (
            'Due to Asthma, high-intensity outdoor activities like Cricket, '
            'Football and Running may trigger breathing difficulties. '
            'Always consult a doctor before playing. Consider indoor or '
            'low-impact activities instead.'
        ),
    },
    'Joint Pain': {
        'blocked_hobbies': ['Gymnastics', 'Running'],
        'safe_alternative': 'Yoga',
        'warning': (
            'Due to Joint Pain, high-impact activities like Gymnastics and '
            'Running can worsen the condition. Yoga and Swimming are gentler '
            'alternatives that build flexibility without stressing the joints.'
        ),
    },
}

# ── Hobby metadata ────────────────────────────────────────────────────────────
HOBBY_META = {
    'Cricket':          {'category': 'Sports',
                         'desc': 'A team outdoor sport focusing on strategy and physical fitness',
                         'icon': '🏏', 'outdoor': True},
    'Football':         {'category': 'Sports',
                         'desc': 'A high-energy team sport building endurance and teamwork',
                         'icon': '⚽', 'outdoor': True},
    'Badminton':        {'category': 'Sports',
                         'desc': 'A fast-paced racket sport improving reflexes and agility',
                         'icon': '🏸', 'outdoor': False},
    'Swimming':         {'category': 'Sports',
                         'desc': 'A full-body workout sport great for fitness and relaxation',
                         'icon': '🏊', 'outdoor': False},
    'Table Tennis':     {'category': 'Sports',
                         'desc': 'An indoor precision sport enhancing focus and hand-eye coordination',
                         'icon': '🏓', 'outdoor': False},
    'Basketball':       {'category': 'Sports',
                         'desc': 'A high-energy team sport building coordination and teamwork',
                         'icon': '🏀', 'outdoor': True},
    'Athletics':        {'category': 'Sports',
                         'desc': 'Track and field sports building speed and endurance',
                         'icon': '🏅', 'outdoor': True},
    'Carrom':           {'category': 'Sports',
                         'desc': 'A strategic indoor board game improving precision and focus',
                         'icon': '🎯', 'outdoor': False},
    'Drawing':          {'category': 'Arts',
                         'desc': 'Express creativity through sketching and visual art',
                         'icon': '🎨', 'outdoor': False},
    'Dance':            {'category': 'Arts',
                         'desc': 'Physical expression through rhythm and movement',
                         'icon': '💃', 'outdoor': False},
    'Music':            {'category': 'Arts',
                         'desc': 'Learn instruments or vocals to express through sound',
                         'icon': '🎵', 'outdoor': False},
    'Math Olympiad':    {'category': 'Academics',
                         'desc': 'Competitive mathematics building logical reasoning',
                         'icon': '🔢', 'outdoor': False},
    'Science Club':     {'category': 'Academics',
                         'desc': 'Explore science through experiments and group projects',
                         'icon': '🔬', 'outdoor': False},
    'Creative Writing': {'category': 'Academics',
                         'desc': 'Develop storytelling and language skills through writing',
                         'icon': '✍️', 'outdoor': False},
    'Coding':           {'category': 'Analytical',
                         'desc': 'Build programs and solve problems with code',
                         'icon': '💻', 'outdoor': False},
    'Chess':            {'category': 'Analytical',
                         'desc': 'Strategic board game developing critical thinking',
                         'icon': '♟️', 'outdoor': False},
    'Robotics':         {'category': 'Analytical',
                         'desc': 'Build and program robots combining engineering and coding',
                         'icon': '🤖', 'outdoor': False},
    'Yoga':             {'category': 'Health',
                         'desc': 'Mind-body practice improving flexibility and calm',
                         'icon': '🧘', 'outdoor': False},
    'Gymnastics':       {'category': 'Health',
                         'desc': 'Develop strength, flexibility, and body control',
                         'icon': '🤸', 'outdoor': False},
    'Running':          {'category': 'Health',
                         'desc': 'Build endurance and cardiovascular fitness',
                         'icon': '🏃', 'outdoor': True},
    'Meditation':       {'category': 'Health',
                         'desc': 'Calm the mind and build focus through mindfulness',
                         'icon': '🌿', 'outdoor': False},
}

# ── Rule-based hobby selection ────────────────────────────────────────────────
HOBBY_RULES = {
    'Sports': {
        'key': 'which_sport',
        'map': {
            'Cricket': 'Cricket', 'Football': 'Football',
            'Badminton': 'Badminton', 'Swimming': 'Swimming',
            'Table Tennis': 'Table Tennis', 'Basketball': 'Basketball',
            'Athletics': 'Athletics', 'Carrom': 'Carrom',
            'Chess': 'Chess', 'None': 'Cricket',
        },
        'default': 'Cricket',
    },
    'Arts': {
        'key': 'which_art',
        'map': {'Drawing': 'Drawing', 'Music': 'Music', 'Dance': 'Dance',
                'None': 'Drawing'},
        'default': 'Drawing',
    },
    'Academics': {
        'key': 'fav_subject',
        'map': {
            'Math': 'Math Olympiad', 'Science': 'Science Club',
            'Language': 'Creative Writing', 'None': 'Math Olympiad',
        },
        'default': 'Math Olympiad',
    },
    'Analytical': {
        'key': 'analy_puzzle_type',
        'map': {
            'Coding': 'Coding', 'Puzzles': 'Chess',
            'Logical Games': 'Robotics', 'Robotics': 'Robotics',
            'None': 'Coding',
        },
        'default': 'Coding',
    },
    'Health': {
        'key': 'health_activity_preference',
        'map': {
            'Yoga': 'Yoga', 'Gymnastics': 'Gymnastics',
            'Running': 'Running', 'Meditation': 'Meditation',
            'Swimming': 'Swimming', 'None': 'Yoga',
        },
        'default': 'Yoga',
    },
}


def load_model():
    """Load v4 model + encoders (falls back to v3 then v2)."""
    for version in ['v4', 'v3']:
        try:
            model      = joblib.load(os.path.join(SAVE_DIR, f'model_{version}.pkl'))
            label_encs = joblib.load(os.path.join(SAVE_DIR, f'label_encoders_{version}.pkl'))
            target_enc = joblib.load(os.path.join(SAVE_DIR, f'target_encoder_{version}.pkl'))
            print(f'[ml_helpers] Loaded {version} model')
            return model, label_encs, target_enc
        except Exception as e:
            print(f'[ml_helpers] {version} model not found: {e}')
    # final fallback
    try:
        model      = joblib.load(os.path.join(SAVE_DIR, 'model.pkl'))
        label_encs = joblib.load(os.path.join(SAVE_DIR, 'label_encoders.pkl'))
        target_enc = joblib.load(os.path.join(SAVE_DIR, 'target_encoder.pkl'))
        return model, label_encs, target_enc
    except Exception as e2:
        print(f'[ml_helpers] All model loads failed: {e2}')
        return None, None, None


def build_feature_vector(answers, label_encs):
    """Convert raw answers dict → encoded numpy array."""
    encoded = []
    for col in FEATURE_COLS:
        raw_val = answers.get(col, 'None')

        if col in NUMERIC_COLS:
            try:
                encoded.append(float(raw_val))
            except (ValueError, TypeError):
                encoded.append(10.0)   # default age
            continue

        le = label_encs.get(col)
        if le is None:
            encoded.append(0.0)
            continue

        str_val = str(raw_val)
        if str_val in le.classes_:
            encoded.append(float(le.transform([str_val])[0]))
        else:
            encoded.append(0.0)

    return np.array([encoded], dtype=float)


def pick_hobby_from_answers(category, answers):
    """Rule-based: derive specific hobby from user answers.
    If user typed a custom 'Other' value, use that directly.
    """
    rule = HOBBY_RULES.get(category)
    if not rule:
        return category
    answer_val = str(answers.get(rule['key'], 'None'))

    # If user selected "Other", use the custom text they typed
    if answer_val == 'Other':
        custom = answers.get(rule['key'] + '_custom', '').strip()
        if custom:
            return custom.title()   # capitalise nicely
        return rule['default']

    return rule['map'].get(answer_val, rule['default'])


def apply_health_filter(hobby, health_condition):
    """
    Returns (safe_hobby, health_warning_msg | None).
    If hobby is blocked by a health condition, substitute with safe alternative
    and return a warning message. The caller should display the warning
    prominently and NOT show the blocked hobby as primary.
    """
    restriction = HEALTH_RESTRICTIONS.get(health_condition)
    if restriction and hobby in restriction['blocked_hobbies']:
        return restriction['safe_alternative'], restriction['warning']
    return hobby, None


def _explicit_category(answers):
    """
    Determine category from explicit likes.
    Returns (forced_category | None, liked_categories list).
    """
    explicit_map = {
        'Sports':     answers.get('likes_sports',     'No') == 'Yes',
        'Arts':       answers.get('likes_arts',       'No') == 'Yes',
        'Academics':  answers.get('likes_academics',  'No') == 'Yes',
        'Analytical': answers.get('likes_analytical', 'No') == 'Yes',
    }
    liked = [cat for cat, v in explicit_map.items() if v]
    if len(liked) == 1:
        return liked[0], liked   # hard force
    return None, liked            # soft constraint / unconstrained


def predict_hobby(answers):
    """
    Full prediction pipeline with explicit-preference override.

    Priority:
      1. If exactly ONE category is liked (likes_X='Yes') → force that category.
      2. If MULTIPLE liked → ML picks the highest-probability among liked set.
      3. If NONE liked    → trust ML unconstrained (Health likely wins).
    """
    model, label_encs, target_enc = load_model()
    if model is None:
        return None

    health_condition = str(answers.get('health_condition', 'None'))
    all_classes      = list(target_enc.classes_)  # ['Academics','Analytical','Arts','Health','Sports']

    # Always run ML to get full probability vector (needed for alternatives)
    vec   = build_feature_vector(answers, label_encs)
    probs = model.predict_proba(vec)[0]

    # ── Explicit preference override ────────────────────────────────────────
    forced_category, liked_cats = _explicit_category(answers)

    if forced_category:
        # HARD override: only one section explicitly liked
        category = forced_category
        cat_idx  = all_classes.index(category) if category in all_classes else 0
        category_conf = round(float(probs[cat_idx]) * 100, 1)

    elif liked_cats:
        # SOFT constraint: highest ML prob among liked categories
        best_cat, best_prob = None, -1.0
        for cat in liked_cats:
            if cat in all_classes:
                p = float(probs[all_classes.index(cat)])
                if p > best_prob:
                    best_prob, best_cat = p, cat
        category = best_cat or liked_cats[0]
        cat_idx  = all_classes.index(category) if category in all_classes else 0
        category_conf = round(float(probs[cat_idx]) * 100, 1)

    else:
        # UNCONSTRAINED: all 4 sections "No" → force Health
        # (the only section always answered)
        category      = 'Health'
        cat_idx       = all_classes.index('Health') if 'Health' in all_classes else 0
        category_conf = round(float(probs[cat_idx]) * 100, 1)

    # Stage 2: Rule-based specific hobby
    hobby = pick_hobby_from_answers(category, answers)

    # Stage 3: Health filter on primary hobby
    original_hobby = None
    health_warning = None
    safe_hobby, warning = apply_health_filter(hobby, health_condition)
    if safe_hobby != hobby:
        original_hobby = hobby
        hobby          = safe_hobby
        health_warning = warning
        meta_cat = HOBBY_META.get(hobby, {}).get('category', category)
        category = meta_cat

    meta = HOBBY_META.get(hobby, {})

    # Build top-3 secondary hobbies (different categories, health-filtered)
    sorted_idxs  = np.argsort(probs)[::-1]
    alternatives = []
    seen_cats    = {category}

    for idx in sorted_idxs:
        if len(alternatives) >= 3:
            break
        cat = all_classes[idx]
        if cat in seen_cats:
            continue
        seen_cats.add(cat)
        conf  = round(float(probs[idx]) * 100, 1)
        alt_h = pick_hobby_from_answers(cat, answers)

        safe_alt, alt_warning = apply_health_filter(alt_h, health_condition)
        alt_meta = HOBBY_META.get(safe_alt, {})

        alternatives.append({
            'hobby':          safe_alt,
            'original_hobby': alt_h if safe_alt != alt_h else None,
            'category':       cat,
            'confidence':     conf,
            'desc':           alt_meta.get('desc', ''),
            'health_warning': alt_warning,
        })

    return {
        'predicted_hobby':  hobby,
        'original_hobby':   original_hobby,
        'category':         meta.get('category', category),
        'confidence_score': category_conf,
        'description':      meta.get('desc', ''),
        'health_warning':   health_warning,
        'alternatives':     alternatives,
    }


