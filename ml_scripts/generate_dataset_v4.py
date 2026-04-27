"""
generate_dataset_v4.py — 30-question branching dataset (8000 rows).

KEY ACCURACY IMPROVEMENTS vs earlier version:
  1. Primary category gets STRONG signal (High hours, High activity, frequent)
  2. Secondary categories only appear 10% of the time (was 25%)
  3. Secondary categories get WEAK signals (Low hours, Low activity)
  4. 8000 rows for better generalisation
  5. Age range updated to 5–12 (primary/elementary school kids only)
"""
import os, random, csv

random.seed(42)
ROWS = 8000

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT      = os.path.join(BASE_DIR, 'dataset', 'Hobby_Data_v4.csv')

SPORT_POOL = {
    'outdoor': ['Cricket', 'Football', 'Swimming', 'Basketball', 'Athletics'],
    'indoor':  ['Badminton', 'Table Tennis', 'Swimming', 'Carrom', 'Chess'],
    'both':    ['Cricket', 'Football', 'Badminton', 'Table Tennis', 'Swimming', 'Basketball'],
}
ARTS_LIST  = ['Drawing', 'Music', 'Dance']
ACAD_MAP   = {'Math': 'Math Olympiad', 'Science': 'Science Club', 'Language': 'Creative Writing'}
ANALY_MAP  = {'Coding': 'Coding', 'Puzzles': 'Chess', 'Logical Games': 'Robotics', 'Robotics': 'Robotics'}
HEALTH_LIST = ['Yoga', 'Gymnastics', 'Running', 'Meditation', 'Swimming']

HEALTH_CONDITIONS = ['None', 'None', 'None', 'None', 'Asthma', 'Joint Pain', 'Other']
ASTHMA_BLOCKED    = {'Cricket', 'Football', 'Running'}
JOINT_BLOCKED     = {'Gymnastics', 'Running'}

COLS = [
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
    'category', 'hobby',
]


def _strong_level():
    """Primary category gets strong signals."""
    return random.choices(['High', 'Medium', 'Low'], weights=[60, 30, 10])[0]

def _weak_level():
    """Secondary category gets weak signals."""
    return random.choices(['Low', 'Medium', 'High'], weights=[60, 30, 10])[0]


def gen_row():
    age = random.randint(5, 12)
    primary = random.choices(
        ['Sports', 'Arts', 'Academics', 'Analytical', 'Health'],
        weights=[30, 20, 20, 15, 15],
    )[0]

    health_cond = random.choice(HEALTH_CONDITIONS)

    # ── Sports ──────────────────────────────────────────────────────────────
    is_primary_sports = (primary == 'Sports')
    if is_primary_sports or random.random() < 0.10:
        likes_sports = 'Yes'
        io = random.choice(['outdoor', 'indoor', 'both'])
        pool = SPORT_POOL[io] + ['Other']
        sport = random.choice(pool)
        if health_cond == 'Asthma' and sport in ASTHMA_BLOCKED:
            sport = 'Swimming'
        if health_cond == 'Joint Pain' and sport in JOINT_BLOCKED:
            sport = 'Swimming'
        if is_primary_sports:
            hours = _strong_level()
            activity = _strong_level()
            freq = random.choices(['5+ days', '3-4 days', '1-2 days'], weights=[50, 35, 15])[0]
        else:
            hours = _weak_level()
            activity = _weak_level()
            freq = random.choices(['1-2 days', '3-4 days', '5+ days'], weights=[60, 30, 10])[0]
        team = random.choice(['Team', 'Individual'])
    else:
        likes_sports = 'No'
        io = sport = hours = team = activity = freq = 'None'

    # ── Arts ─────────────────────────────────────────────────────────────────
    is_primary_arts = (primary == 'Arts')
    if is_primary_arts or random.random() < 0.10:
        likes_arts = 'Yes'
        art = random.choice(ARTS_LIST + ['Other'])
        if is_primary_arts:
            creativity = _strong_level()
            art_hrs = _strong_level()
            performance = random.choices(['Yes', 'No'], weights=[70, 30])[0]
        else:
            creativity = _weak_level()
            art_hrs = _weak_level()
            performance = random.choices(['Yes', 'No'], weights=[30, 70])[0]
        learning = random.choice(['Structured', 'Free'])
        digital = random.choice(['Digital', 'Traditional', 'Both'])
    else:
        likes_arts = 'No'
        art = creativity = performance = art_hrs = learning = digital = 'None'

    # ── Academics ────────────────────────────────────────────────────────────
    is_primary_acad = (primary == 'Academics')
    if is_primary_acad or random.random() < 0.10:
        likes_acad = 'Yes'
        subj = random.choice(['Math', 'Science', 'Language', 'Other'])
        if is_primary_acad:
            ps = random.choices(['Yes', 'No'], weights=[75, 25])[0]
            curious = random.choices(['Yes', 'No'], weights=[80, 20])[0]
            comp = random.choices(['Yes', 'No'], weights=[65, 35])[0]
            reading = random.choices(['Yes', 'No'], weights=[75, 25])[0]
        else:
            ps = random.choices(['Yes', 'No'], weights=[30, 70])[0]
            curious = random.choices(['Yes', 'No'], weights=[35, 65])[0]
            comp = random.choices(['Yes', 'No'], weights=[25, 75])[0]
            reading = random.choices(['Yes', 'No'], weights=[30, 70])[0]
        study = random.choice(['Individual', 'Group'])
    else:
        likes_acad = 'No'
        subj = ps = curious = study = comp = reading = 'None'

    # ── Analytical ───────────────────────────────────────────────────────────
    is_primary_analy = (primary == 'Analytical')
    if is_primary_analy or random.random() < 0.10:
        likes_analy = 'Yes'
        puzzle = random.choice(['Coding', 'Puzzles', 'Logical Games', 'Robotics', 'Other'])
        if is_primary_analy:
            logic = _strong_level()
            challenge = random.choices(['Yes', 'No'], weights=[75, 25])[0]
            coding_int = random.choices(['Yes', 'No'], weights=[70, 30])[0]
            patience = _strong_level()
        else:
            logic = _weak_level()
            challenge = random.choices(['Yes', 'No'], weights=[25, 75])[0]
            coding_int = random.choices(['Yes', 'No'], weights=[30, 70])[0]
            patience = _weak_level()
        work = random.choice(['Alone', 'With others'])
    else:
        likes_analy = 'No'
        puzzle = logic = challenge = work = coding_int = patience = 'None'

    # ── Health (always answered) ────────────────────────────────────────────
    is_primary_health = (primary == 'Health')
    if is_primary_health:
        energy = _strong_level()
        outdoor = random.choices(['Yes', 'No'], weights=[60, 40])[0]
        health_hrs = _strong_level()
        sleep = random.choices(['Good', 'Average', 'Poor'], weights=[55, 35, 10])[0]
    else:
        energy = random.choice(['Low', 'Medium', 'High'])
        outdoor = random.choice(['Yes', 'No'])
        health_hrs = random.choice(['Low', 'Medium', 'High'])
        sleep = random.choice(['Poor', 'Average', 'Good'])

    act_pref = random.choice(HEALTH_LIST + ['Other'])
    if health_cond == 'Asthma' and act_pref in ASTHMA_BLOCKED:
        act_pref = 'Swimming'
    if health_cond == 'Joint Pain' and act_pref in JOINT_BLOCKED:
        act_pref = 'Yoga'

    # ── Determine hobby ─────────────────────────────────────────────────────
    if primary == 'Sports':
        hobby = sport if sport != 'Other' else 'Cricket'
    elif primary == 'Arts':
        hobby = art if art != 'Other' else 'Drawing'
    elif primary == 'Academics':
        hobby = ACAD_MAP.get(subj, 'Math Olympiad')
    elif primary == 'Analytical':
        hobby = ANALY_MAP.get(puzzle, 'Coding')
    else:
        hobby = act_pref if act_pref != 'Other' else 'Yoga'

    return [
        age,
        likes_sports, io, sport, hours, team, activity, freq,
        likes_arts, art, creativity, performance, art_hrs, learning, digital,
        likes_acad, subj, ps, curious, study, comp, reading,
        likes_analy, puzzle, logic, challenge, work, coding_int, patience,
        health_cond, energy, outdoor, act_pref, health_hrs, sleep,
        primary, hobby,
    ]


if __name__ == '__main__':
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(COLS)
        for _ in range(ROWS):
            w.writerow(gen_row())
    print(f'Generated {ROWS} rows → {OUT}')
    print(f'Columns: {len(COLS)} ({len(COLS) - 2} features + 2 targets)')
