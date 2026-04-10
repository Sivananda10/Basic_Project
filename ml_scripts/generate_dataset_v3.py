"""
Generate Hobby_Data_v3.csv — 5000 rows aligned to the new 25-question
branching questionnaire flow.

Schema (25 feature columns + category + hobby):
  age
  likes_sports, sport_indoor_outdoor, which_sport,
    sport_hours_per_day, sport_team_solo, sport_activity_level   [6 sport Q]
  likes_arts, which_art, art_creativity, art_performance,
    art_hours, art_learning_style                                 [6 art Q]
  likes_academics, fav_subject, acad_problem_solving,
    acad_curiosity, acad_study_type, acad_competitions            [6 acad Q]
  likes_analytical, analy_puzzle_type, analy_logic_level,
    analy_challenge, analy_work_style, analy_coding_interest      [6 analy Q]
  health_condition, health_energy, health_outdoor_preference,
    health_activity_preference, health_hours                      [5 health Q]
  category, hobby

Health-filtering rule (stored in dataset but also enforced at prediction):
  - Asthma    → do NOT assign Cricket / Football / Running as primary hobby
  - Joint Pain → do NOT assign Gymnastics / Running as primary hobby
"""

import os, random
import numpy as np
import pandas as pd

random.seed(42)
np.random.seed(42)

# ── Vocabulary ────────────────────────────────────────────────────────────────
SPORTS_OUTDOOR   = ['Cricket', 'Football']
SPORTS_INDOOR    = ['Table Tennis', 'Badminton']
SPORTS_NEUTRAL   = ['Swimming']            # safe for most conditions
ALL_SPORTS       = SPORTS_OUTDOOR + SPORTS_INDOOR + SPORTS_NEUTRAL

ARTS             = ['Drawing', 'Music', 'Dance']
ACADEMICS        = ['Math Olympiad', 'Science Club', 'Creative Writing']
FAV_SUBJ_MAP     = {'Math': 'Math Olympiad', 'Science': 'Science Club', 'Language': 'Creative Writing'}
ANALYTICAL       = ['Coding', 'Chess', 'Robotics']
ANALY_TYPE_MAP   = {'Coding': 'Coding', 'Puzzles': 'Chess', 'Logical Games': 'Robotics', 'Robotics': 'Robotics'}
HEALTH_HOBBIES   = ['Yoga', 'Running', 'Gymnastics', 'Meditation']

HEALTH_CONDITIONS = ['None', 'None', 'None', 'Asthma', 'Joint Pain', 'Other']
# "None" repeated to make it most common (~50 %)

ACTIVITY_PREF_SAFE  = ['Yoga', 'Meditation', 'Swimming']
# if health condition restricts high-impact activities

N = 5000

rows = []

for _ in range(N):
    age = random.randint(5, 17)
    health_cond = random.choice(HEALTH_CONDITIONS)

    # ─ Randomly decide which categories the child "likes" ─────────────────
    # At least one must be True; weights so there's good class balance
    cat_weights = {
        'sports':     0.30,
        'arts':       0.25,
        'academics':  0.25,
        'analytical': 0.20,
        'health':     0.25,
    }

    # Roll each category independently (child may like multiple)
    likes = {cat: (random.random() < w) for cat, w in cat_weights.items()}

    # Guarantee at least one liked
    if not any(likes.values()):
        likes[random.choice(list(likes.keys()))] = True

    # ─ Sports ─────────────────────────────────────────────────────────────
    likes_sports = 'Yes' if likes['sports'] else 'No'

    if likes['sports']:
        # If asthma or joint-pain, bias away from high-impact outdoor sports
        if health_cond == 'Asthma':
            sport_pool = SPORTS_INDOOR + SPORTS_NEUTRAL
        elif health_cond == 'Joint Pain':
            sport_pool = SPORTS_INDOOR + SPORTS_NEUTRAL
        else:
            sport_pool = ALL_SPORTS

        which_sport = random.choice(sport_pool)
        sport_io    = 'outdoor' if which_sport in SPORTS_OUTDOOR else (
                      'indoor'  if which_sport in SPORTS_INDOOR else 'both')
        sport_hrs   = random.choice(['Low', 'Medium', 'High'])
        sport_team  = random.choice(['Team', 'Individual'])
        sport_act   = random.choice(['Low', 'Medium', 'High'])
    else:
        which_sport = 'None'
        sport_io    = 'None'
        sport_hrs   = 'None'
        sport_team  = 'None'
        sport_act   = 'None'

    # ─ Arts ───────────────────────────────────────────────────────────────
    likes_arts = 'Yes' if likes['arts'] else 'No'
    if likes['arts']:
        which_art     = random.choice(ARTS)
        art_creat     = random.choice(['Low', 'Medium', 'High'])
        art_perf      = random.choice(['Yes', 'No'])
        art_hrs       = random.choice(['Low', 'Medium', 'High'])
        art_learn     = random.choice(['Structured', 'Free'])
    else:
        which_art = art_creat = art_perf = art_hrs = art_learn = 'None'

    # ─ Academics ──────────────────────────────────────────────────────────
    likes_acad = 'Yes' if likes['academics'] else 'No'
    if likes['academics']:
        fav_sub      = random.choice(['Math', 'Science', 'Language'])
        acad_ps      = random.choice(['Yes', 'No'])
        acad_cur     = random.choice(['Yes', 'No'])
        acad_study   = random.choice(['Individual', 'Group'])
        acad_comp    = random.choice(['Yes', 'No'])
    else:
        fav_sub = acad_ps = acad_cur = acad_study = acad_comp = 'None'

    # ─ Analytical ─────────────────────────────────────────────────────────
    likes_analy = 'Yes' if likes['analytical'] else 'No'
    if likes['analytical']:
        analy_type  = random.choice(['Coding', 'Puzzles', 'Logical Games', 'Robotics'])
        analy_logic = random.choice(['Low', 'Medium', 'High'])
        analy_chal  = random.choice(['Yes', 'No'])
        analy_work  = random.choice(['Alone', 'With others'])
        analy_code  = random.choice(['Yes', 'No'])
    else:
        analy_type = analy_logic = analy_chal = analy_work = analy_code = 'None'

    # ─ Health ─────────────────────────────────────────────────────────────
    health_energy = random.choice(['Low', 'Medium', 'High'])
    health_out    = random.choice(['Yes', 'No'])

    # Safe activity pool based on health condition
    if health_cond == 'Asthma':
        h_pref_pool = ['Yoga', 'Meditation', 'Swimming']
    elif health_cond == 'Joint Pain':
        h_pref_pool = ['Yoga', 'Meditation', 'Swimming']
    else:
        h_pref_pool = ['Yoga', 'Running', 'Gymnastics', 'Meditation', 'Swimming']

    health_pref   = random.choice(h_pref_pool)
    health_hrs    = random.choice(['Low', 'Medium', 'High'])

    # ─ Determine PRIMARY category & hobby ─────────────────────────────────
    # Score each liked category by engagement signals
    scores = {}

    if likes['sports']:
        s = 0
        if sport_act == 'High': s += 3
        elif sport_act == 'Medium': s += 2
        else: s += 1
        if sport_hrs == 'High': s += 2
        elif sport_hrs == 'Medium': s += 1
        scores['Sports'] = s

    if likes['arts']:
        s = 0
        if art_creat == 'High': s += 3
        elif art_creat == 'Medium': s += 2
        else: s += 1
        if art_perf == 'Yes': s += 2
        if art_hrs == 'High': s += 2
        elif art_hrs == 'Medium': s += 1
        scores['Arts'] = s

    if likes['academics']:
        s = 0
        if acad_ps == 'Yes': s += 2
        if acad_cur == 'Yes': s += 2
        if acad_comp == 'Yes': s += 3
        scores['Academics'] = s

    if likes['analytical']:
        s = 0
        if analy_logic == 'High': s += 3
        elif analy_logic == 'Medium': s += 2
        else: s += 1
        if analy_chal == 'Yes': s += 2
        if analy_code == 'Yes': s += 1
        scores['Analytical'] = s

    # Health always gets a base score (since health section always runs)
    h_score = 0
    if health_energy == 'High': h_score += 2
    elif health_energy == 'Medium': h_score += 1
    if health_hrs == 'High': h_score += 2
    elif health_hrs == 'Medium': h_score += 1
    scores['Health'] = h_score

    # Pick category with highest score; tiebreak randomly
    max_score = max(scores.values())
    top_cats  = [c for c, v in scores.items() if v == max_score]
    category  = random.choice(top_cats)

    # ─ Assign specific hobby ───────────────────────────────────────────────
    if category == 'Sports':
        hobby = which_sport   # already health-filtered
    elif category == 'Arts':
        hobby = which_art
    elif category == 'Academics':
        hobby = FAV_SUBJ_MAP.get(fav_sub, 'Math Olympiad')
    elif category == 'Analytical':
        hobby = ANALY_TYPE_MAP.get(analy_type, 'Coding')
    else:  # Health
        hobby = health_pref
        # Map Swimming here too
        if hobby == 'Swimming':
            # Swimming as a health hobby — make it a sports one preference-wise,
            # but here it stays under Health if that's the category
            pass

    # ─ Final health safety check ───────────────────────────────────────────
    # If health_condition causes conflict, demote the hobby to safe alternative
    health_note = 'None'
    if health_cond == 'Asthma' and hobby in ['Cricket', 'Football', 'Running']:
        health_note = 'Asthma'
        hobby       = 'Swimming'   # safe alternative
        category    = 'Sports'
    if health_cond == 'Joint Pain' and hobby in ['Gymnastics', 'Running']:
        health_note = 'Joint Pain'
        hobby       = 'Yoga'
        category    = 'Health'

    row = {
        'age':                      age,
        'likes_sports':             likes_sports,
        'sport_indoor_outdoor':     sport_io,
        'which_sport':              which_sport,
        'sport_hours_per_day':      sport_hrs,
        'sport_team_solo':          sport_team,
        'sport_activity_level':     sport_act,
        'likes_arts':               likes_arts,
        'which_art':                which_art,
        'art_creativity':           art_creat,
        'art_performance':          art_perf,
        'art_hours':                art_hrs,
        'art_learning_style':       art_learn,
        'likes_academics':          likes_acad,
        'fav_subject':              fav_sub,
        'acad_problem_solving':     acad_ps,
        'acad_curiosity':           acad_cur,
        'acad_study_type':          acad_study,
        'acad_competitions':        acad_comp,
        'likes_analytical':         likes_analy,
        'analy_puzzle_type':        analy_type,
        'analy_logic_level':        analy_logic,
        'analy_challenge':          analy_chal,
        'analy_work_style':         analy_work,
        'analy_coding_interest':    analy_code,
        'health_condition':         health_cond,
        'health_energy':            health_energy,
        'health_outdoor_preference':health_out,
        'health_activity_preference':health_pref,
        'health_hours':             health_hrs,
        'health_note':              health_note,
        'category':                 category,
        'hobby':                    hobby,
    }
    rows.append(row)

df = pd.DataFrame(rows)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out_path = os.path.join(BASE_DIR, 'dataset', 'Hobby_Data_v3.csv')
df.to_csv(out_path, index=False)

print(f"✅ Generated {len(df)} rows → {out_path}")
print(f"\nCategory distribution:\n{df['category'].value_counts()}")
print(f"\nHobby distribution:\n{df['hobby'].value_counts()}")
print(f"\nHealth conditions:\n{df['health_condition'].value_counts()}")
print(f"\nHealth notes (filtered rows):\n{df['health_note'].value_counts()}")
