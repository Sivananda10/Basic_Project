"""
generate_dataset_v5.py — Smart Kids Hobby System v5 (12,000 rows, 55+ cols)

New in v5:
  - gender column
  - 8 categories: Sports, Arts, Academics, Analytical, Health, Cooking, Gardening, Digital
  - Art sub-types (Painting/Sketch/Digital/Craft), Dance style, Music type
  - Cooking & Gardening section
  - Screen/Digital section (gaming, design, educational)
  - Behavioral depth: with_whom, time_of_day, emotional_engagement, initiative
  - Previous hobby tracking: tried_before, prev_hobby, stopped_reason
  - Personality traits: introvert/extrovert, creativity_score, leadership, attention_span
  - Target columns: category, hobby, hobby_role, career_mapping, improvement_suggestion, recommendation_reason
"""
import os, random, csv

random.seed(42)
ROWS = 12000

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT      = os.path.join(BASE_DIR, 'dataset', 'Hobby_Data_v5.csv')

# ── Pools ────────────────────────────────────────────────────────────────────
SPORT_POOL = {
    'outdoor': ['Cricket', 'Football', 'Basketball', 'Athletics', 'Swimming'],
    'indoor':  ['Badminton', 'Table Tennis', 'Carrom', 'Chess', 'Swimming'],
    'both':    ['Cricket', 'Football', 'Badminton', 'Table Tennis', 'Swimming', 'Basketball'],
}

ART_TYPES      = ['Drawing', 'Dance', 'Music', 'Acting']
ART_SUB = {
    'Drawing': ['Painting', 'Sketching', 'Craft', 'Digital Art'],
    'Dance':   ['Classical', 'Western', 'Folk', 'Hip-Hop'],
    'Music':   ['Vocals', 'Instrument', 'Both'],
    'Acting':  ['Stage', 'Improv', 'Voice Acting'],
}
ACAD_MAP   = {'Math': 'Math Olympiad', 'Science': 'Science Club', 'Language': 'Creative Writing'}
ANALY_MAP  = {'Coding': 'Coding', 'Puzzles': 'Chess', 'Logical Games': 'Robotics', 'Robotics': 'Robotics'}
HEALTH_LIST = ['Yoga', 'Gymnastics', 'Running', 'Meditation', 'Swimming']
COOK_TYPES  = ['Baking', 'Cooking Meals', 'Both']
GARD_TYPES  = ['Plants/Flowers', 'Vegetables', 'Both']
SCREEN_CONTENT = ['Gaming', 'Educational', 'Social', 'Creative Content', 'Mixed']
GAME_GENRES    = ['Strategy', 'Action', 'Puzzle', 'Adventure', 'RPG']

HEALTH_CONDITIONS = ['None', 'None', 'None', 'None', 'Asthma', 'Joint Pain', 'Autism', 'Physical Limitation', 'Other']
ASTHMA_BLOCKED    = {'Cricket', 'Football', 'Running', 'Athletics'}
JOINT_BLOCKED     = {'Gymnastics', 'Running', 'Athletics'}
AUTISM_PREFERRED  = {'Chess', 'Coding', 'Drawing', 'Gardening', 'Meditation', 'Robotics'}

STOPPED_REASONS = ['Lost Interest', 'Teacher/Coach Issue', 'Environment Issue', 'No Resources', 'Completed It', 'None']
ALL_HOBBIES     = ['Cricket', 'Football', 'Badminton', 'Swimming', 'Basketball', 'Drawing',
                   'Dance', 'Music', 'Acting', 'Chess', 'Coding', 'Robotics', 'Math Olympiad',
                   'Science Club', 'Creative Writing', 'Yoga', 'Gymnastics', 'Baking', 'Gardening']

# ── Career + Role + Improvement + Reason maps ────────────────────────────────
HOBBY_ROLE_MAP = {
    'Cricket':         ['Competitive Player', 'Team Captain', 'Cricket Coach'],
    'Football':        ['Striker', 'Goalkeeper', 'Football Coach'],
    'Badminton':       ['Competitive Player', 'Doubles Partner', 'Badminton Coach'],
    'Swimming':        ['Competitive Swimmer', 'Recreational Swimmer', 'Swimming Coach'],
    'Basketball':      ['Point Guard', 'Team Captain', 'Basketball Coach'],
    'Athletics':       ['Sprinter', 'Long-distance Runner', 'Athletics Coach'],
    'Table Tennis':    ['Competitive Player', 'Club Player', 'TT Coach'],
    'Carrom':          ['Competitive Player', 'Casual Player'],
    'Chess':           ['Competitive Player', 'Online Chess Coach', 'Tournament Organizer'],
    'Drawing':         ['Hobby Artist', 'Commercial Artist', 'Graphic Designer'],
    'Dance':           ['Performer', 'Choreographer', 'Dance Teacher'],
    'Music':           ['Vocalist', 'Instrumentalist', 'Music Composer'],
    'Acting':          ['Stage Actor', 'Film Actor', 'Drama Director'],
    'Coding':          ['App Developer', 'Game Developer', 'Web Developer'],
    'Robotics':        ['Robot Builder', 'AI Programmer', 'Robotics Engineer'],
    'Math Olympiad':   ['Olympiad Competitor', 'Math Tutor', 'Researcher'],
    'Science Club':    ['Experimenter', 'Science Communicator', 'Researcher'],
    'Creative Writing':['Fiction Writer', 'Blogger/Journalist', 'Poet'],
    'Yoga':            ['Yoga Practitioner', 'Yoga Instructor', 'Wellness Coach'],
    'Gymnastics':      ['Gymnast', 'Gymnastics Coach', 'Fitness Trainer'],
    'Meditation':      ['Mindfulness Practitioner', 'Mindfulness Guide'],
    'Running':         ['Casual Runner', 'Competitive Runner', 'Marathon Athlete'],
    'Baking':          ['Home Baker', 'Pastry Chef', 'Baking Instructor'],
    'Cooking Meals':   ['Home Cook', 'Professional Chef', 'Food Blogger'],
    'Gardening':       ['Home Gardener', 'Landscape Designer', 'Botanist'],
    'Game Design':     ['Game Designer', 'Game Developer', 'Indie Game Creator'],
    'Digital Content': ['Content Creator', 'YouTuber', 'Digital Artist'],
}

CAREER_MAP = {
    'Cricket':          'Professional Cricketer → IPL/National Team → Coaching/Commentary',
    'Football':         'Club Player → State League → National Team → Football Coach/Manager',
    'Badminton':        'State Badminton Player → BWF Circuit → National Coach/Academy',
    'Swimming':         'Competitive Swimmer → National Championships → Olympic Athlete/Coach',
    'Basketball':       'School Team → State League → Professional Player or Coach',
    'Athletics':        'District Athlete → State Level → National/International Track Events',
    'Chess':            'District Champion → FIDE Rating → Online Coach or Competitive Chess Pro',
    'Drawing':          'Hobby Artist → Fine Arts Degree → Graphic Designer / Illustrator / Animator',
    'Dance':            'Dance Academy → Competitions → Professional Performer or Choreographer / Own Studio',
    'Music':            'School Band → Music Academy → Playback Singer / Composer / Music Teacher',
    'Acting':           'School Play → Drama Academy → Theatre Artist / Film Actor / Drama Teacher',
    'Coding':           'School Coding Club → Engineering Degree → Software Engineer / Startup Founder',
    'Robotics':         'Robotics Club → Engineering College → Robotics Engineer / AI Researcher',
    'Math Olympiad':    'School Olympiad → National Math Competition → Data Scientist / Finance / Academia',
    'Science Club':     'School Lab → Science Olympiad → Research Scientist / Engineer / Professor',
    'Creative Writing': 'School Stories → Creative Writing Course → Author / Editor / Content Creator',
    'Yoga':             'Daily Practice → Yoga Certification → Yoga Teacher / Wellness Studio Owner',
    'Gymnastics':       'Gymnastics Club → State Level → Olympic Athlete / Gymnastics Coach',
    'Baking':           'Home Kitchen → Baking Course → Pastry Chef / Bakery Owner / Food Blogger',
    'Cooking Meals':    'Home Cooking → Culinary School → Professional Chef / Restaurant Owner',
    'Gardening':        'Home Garden → Botany Degree → Botanist / Landscape Architect / Organic Farming',
    'Game Design':      'Gaming Interest → Design Tools → Game Designer / Indie Developer / Esports Career',
    'Digital Content':  'Content Creation → YouTube/Instagram → Content Creator / Digital Marketer / Influencer',
    'Meditation':       'Daily Practice → Mindfulness Course → Therapist / Wellness Coach / Author',
}

IMPROVEMENT_MAP = {
    'Cricket':          'Practice batting/bowling 30 min daily; join a local cricket academy; watch pro matches for strategy',
    'Football':         'Dribble and shoot daily; join a youth football club; practice footwork and team coordination',
    'Badminton':        'Practice footwork daily; join a badminton academy; learn backhand and smash techniques',
    'Swimming':         'Swim 3-4 days per week; work on breathing technique; try different strokes',
    'Basketball':       'Practice dribbling and shooting daily; play 3-on-3 games; watch NBA for inspiration',
    'Chess':            'Solve 3 chess puzzles daily; study openings; play rated games online on Chess.com',
    'Drawing':          'Sketch daily for 20 min; study one art technique per week; join an art class or workshop',
    'Dance':            'Practice choreography 30 min daily; watch performances; learn a new style every 3 months',
    'Music':            'Practice your instrument 20-30 min daily; learn music theory; perform for family monthly',
    'Acting':           'Join a drama club; practice monologues daily; study famous performances',
    'Coding':           'Code for 30 min daily; complete online projects on Scratch/Python; build a small app each month',
    'Robotics':         'Join a robotics club; build simple circuits; participate in school robotics competitions',
    'Math Olympiad':    'Solve 5 olympiad-level problems daily; join a math club; practice past year papers',
    'Science Club':     'Conduct one experiment weekly; read science magazines; join a science fair',
    'Creative Writing': 'Write 1 page daily; read diverse genres; share stories with family for feedback',
    'Yoga':             'Practice 15-20 min every morning; learn 5 new asanas per month; meditate 5 min after yoga',
    'Gymnastics':       'Stretch daily; work with a certified coach; practice basic floor routines',
    'Baking':           'Bake one recipe weekly; try decorating techniques; experiment with healthy substitutes',
    'Cooking Meals':    'Cook one new recipe weekly; learn knife skills; watch cooking tutorials',
    'Gardening':        'Tend plants daily; start with easy herbs; learn about soil and composting',
    'Game Design':      'Use Scratch or GDevelop to build games; study game mechanics; complete one game per month',
    'Digital Content':  'Create content weekly; learn basic video editing; engage with an audience on a platform',
    'Meditation':       'Meditate 10 min each morning; try guided meditation apps; practice mindful breathing',
}

REASON_TEMPLATES = {
    'Sports':     'Shows high physical energy, enjoys competitive or team-based activities, and prefers active engagement',
    'Arts':       'Demonstrates strong creative expression, emotional engagement in artistic activities, and preference for expressive hobbies',
    'Academics':  'Displays high curiosity, problem-solving tendency, and intellectual interest in structured learning',
    'Analytical': 'Exhibits strong logical reasoning, patience with complex problems, and interest in strategic thinking',
    'Health':     'Prioritizes physical wellness, calm or mindful activities, and consistent healthy habits',
    'Cooking':    'Shows interest in creative food preparation, enjoys experimenting in the kitchen, and likes practical skills',
    'Gardening':  'Demonstrates connection with nature, patience in nurturing living things, and interest in the outdoors',
    'Digital':    'Displays high interest in screen-based creative or analytical activities, with potential for digital skill development',
}

# ── Columns ──────────────────────────────────────────────────────────────────
COLS = [
    'age', 'gender',
    # Sports
    'likes_sports', 'sport_indoor_outdoor', 'which_sport',
    'sport_hours_per_day', 'sport_team_solo', 'sport_activity_level', 'sport_frequency',
    # Arts
    'likes_arts', 'which_art', 'art_sub_type',
    'art_creativity', 'art_performance', 'art_hours',
    'art_learning_style', 'art_digital_traditional', 'art_with_whom',
    'dance_style', 'music_type', 'acting_interest', 'performance_stage_comfort',
    # Academics
    'likes_academics', 'fav_subject', 'acad_problem_solving',
    'acad_curiosity', 'acad_study_type', 'acad_competitions', 'acad_reading_habit',
    # Analytical
    'likes_analytical', 'analy_puzzle_type', 'analy_logic_level',
    'analy_challenge', 'analy_work_style', 'analy_coding_interest', 'analy_patience_level',
    # Health
    'health_condition', 'health_energy', 'health_outdoor_preference',
    'health_activity_preference', 'health_hours', 'health_sleep_quality',
    # Cooking & Gardening
    'likes_cooking', 'cooking_type',
    'likes_gardening', 'gardening_type', 'nature_interest',
    # Screen / Digital
    'screen_usage_hours', 'screen_content_type', 'gaming_genre',
    'game_design_interest', 'digital_creation_interest',
    # Behavioral depth
    'activity_with_whom', 'activity_time_of_day',
    'emotional_engagement', 'initiative_level',
    # Previous hobby
    'tried_hobby_before', 'previous_hobby_name', 'stopped_reason',
    # Personality traits
    'personality_type', 'creativity_score', 'leadership_tendency', 'attention_span',
    # Targets
    'category', 'hobby', 'hobby_role', 'career_mapping',
    'improvement_suggestion', 'recommendation_reason',
]


def _strong():
    return random.choices(['High', 'Medium', 'Low'], weights=[60, 30, 10])[0]

def _weak():
    return random.choices(['Low', 'Medium', 'High'], weights=[60, 30, 10])[0]


def gen_row():
    age    = random.randint(5, 12)
    gender = random.choice(['Boy', 'Girl', 'Other'])
    primary = random.choices(
        ['Sports', 'Arts', 'Academics', 'Analytical', 'Health', 'Cooking', 'Gardening', 'Digital'],
        weights=[25, 18, 15, 13, 10, 7, 6, 6],
    )[0]

    health_cond = random.choice(HEALTH_CONDITIONS)

    # ── Sports ──────────────────────────────────────────────────────────────
    is_primary = (primary == 'Sports')
    if is_primary or random.random() < 0.10:
        likes_sports = 'Yes'
        io   = random.choice(['outdoor', 'indoor', 'both'])
        pool = SPORT_POOL[io]
        sport = random.choice(pool)
        if health_cond == 'Asthma'             and sport in ASTHMA_BLOCKED: sport = 'Swimming'
        if health_cond == 'Joint Pain'         and sport in JOINT_BLOCKED:  sport = 'Swimming'
        if health_cond == 'Physical Limitation' and sport in ASTHMA_BLOCKED: sport = 'Swimming'
        hours    = _strong() if is_primary else _weak()
        activity = _strong() if is_primary else _weak()
        freq     = random.choices(['5+ days','3-4 days','1-2 days'], weights=[50,35,15])[0] if is_primary else random.choices(['1-2 days','3-4 days'], weights=[65,35])[0]
        team     = random.choice(['Team', 'Individual'])
    else:
        likes_sports = 'No'
        io = sport = hours = team = activity = freq = 'None'

    # ── Arts ─────────────────────────────────────────────────────────────────
    is_primary = (primary == 'Arts')
    if is_primary or random.random() < 0.10:
        likes_arts  = 'Yes'
        art         = random.choice(ART_TYPES)
        art_sub     = random.choice(ART_SUB[art])
        creativity  = _strong() if is_primary else _weak()
        art_hrs     = _strong() if is_primary else _weak()
        performance = random.choices(['Yes','No'], weights=[70,30])[0] if is_primary else random.choices(['Yes','No'], weights=[30,70])[0]
        learning    = random.choice(['Structured', 'Free'])
        digital     = random.choice(['Digital', 'Traditional', 'Both'])
        art_with    = random.choice(['Alone', 'With Family', 'With Friends', 'Mixed'])
        stage_comf  = _strong() if is_primary else _weak()
        dance_style = random.choice(ART_SUB['Dance']) if art == 'Dance' else 'None'
        music_type  = random.choice(ART_SUB['Music']) if art == 'Music' else 'None'
        acting_int  = random.choice(['Yes', 'No'])  if art == 'Acting' else 'No'
    else:
        likes_arts = 'No'
        art = art_sub = creativity = performance = art_hrs = learning = digital = art_with = 'None'
        dance_style = music_type = acting_int = stage_comf = 'None'

    # ── Academics ────────────────────────────────────────────────────────────
    is_primary = (primary == 'Academics')
    if is_primary or random.random() < 0.10:
        likes_acad = 'Yes'
        subj       = random.choice(['Math', 'Science', 'Language', 'Other'])
        ps         = random.choices(['Yes','No'], weights=[75,25])[0] if is_primary else random.choices(['Yes','No'], weights=[30,70])[0]
        curious    = random.choices(['Yes','No'], weights=[80,20])[0] if is_primary else random.choices(['Yes','No'], weights=[35,65])[0]
        comp       = random.choices(['Yes','No'], weights=[65,35])[0] if is_primary else random.choices(['Yes','No'], weights=[25,75])[0]
        reading    = random.choices(['Yes','No'], weights=[75,25])[0] if is_primary else random.choices(['Yes','No'], weights=[30,70])[0]
        study      = random.choice(['Individual', 'Group'])
    else:
        likes_acad = 'No'
        subj = ps = curious = study = comp = reading = 'None'

    # ── Analytical ───────────────────────────────────────────────────────────
    is_primary = (primary == 'Analytical')
    if is_primary or random.random() < 0.10:
        likes_analy = 'Yes'
        puzzle      = random.choice(['Coding', 'Puzzles', 'Logical Games', 'Robotics'])
        logic       = _strong() if is_primary else _weak()
        challenge   = random.choices(['Yes','No'], weights=[75,25])[0] if is_primary else random.choices(['Yes','No'], weights=[25,75])[0]
        coding_int  = random.choices(['Yes','No'], weights=[70,30])[0] if is_primary else random.choices(['Yes','No'], weights=[30,70])[0]
        patience    = _strong() if is_primary else _weak()
        work        = random.choice(['Alone', 'With Others'])
    else:
        likes_analy = 'No'
        puzzle = logic = challenge = work = coding_int = patience = 'None'

    # ── Health ────────────────────────────────────────────────────────────────
    is_primary = (primary == 'Health')
    energy  = _strong() if is_primary else random.choice(['Low','Medium','High'])
    outdoor = random.choices(['Yes','No'], weights=[60,40])[0] if is_primary else random.choice(['Yes','No'])
    h_hrs   = _strong() if is_primary else random.choice(['Low','Medium','High'])
    sleep   = random.choices(['Good','Average','Poor'], weights=[55,35,10])[0] if is_primary else random.choice(['Poor','Average','Good'])
    act_pref = random.choice(HEALTH_LIST)
    if health_cond == 'Asthma'    and act_pref in ASTHMA_BLOCKED: act_pref = 'Swimming'
    if health_cond == 'Joint Pain' and act_pref in JOINT_BLOCKED:  act_pref = 'Yoga'

    # ── Cooking & Gardening ──────────────────────────────────────────────────
    is_cook = (primary == 'Cooking')
    is_gard = (primary == 'Gardening')
    likes_cooking  = 'Yes' if is_cook or random.random() < 0.12 else 'No'
    cooking_type   = random.choice(COOK_TYPES) if likes_cooking == 'Yes' else 'None'
    likes_gardening= 'Yes' if is_gard or random.random() < 0.10 else 'No'
    gardening_type = random.choice(GARD_TYPES) if likes_gardening == 'Yes' else 'None'
    nature_int     = _strong() if is_gard else random.choice(['Low','Medium','High'])

    # ── Screen / Digital ─────────────────────────────────────────────────────
    is_digi = (primary == 'Digital')
    screen_hrs      = _strong() if is_digi else random.choice(['Low','Medium','High'])
    screen_content  = random.choice(SCREEN_CONTENT) if is_digi else random.choices(SCREEN_CONTENT, weights=[20,20,25,15,20])[0]
    gaming_genre_v  = random.choice(GAME_GENRES) if screen_content == 'Gaming' else 'None'
    game_design_int = random.choices(['Yes','No'], weights=[65,35])[0] if is_digi else random.choices(['Yes','No'], weights=[25,75])[0]
    digital_creat   = random.choices(['Yes','No'], weights=[70,30])[0] if is_digi else random.choices(['Yes','No'], weights=[20,80])[0]

    # ── Behavioral depth ─────────────────────────────────────────────────────
    with_whom     = random.choices(['Alone','With Family','With Friends','Mixed'], weights=[25,30,25,20])[0]
    time_of_day   = random.choice(['Morning','Evening','Anytime'])
    emotional_eng = random.choices(['Very Engaged','Moderate','Passive'], weights=[55,35,10])[0] if primary in ('Arts','Sports','Analytical') else random.choices(['Very Engaged','Moderate','Passive'], weights=[30,45,25])[0]
    initiative    = random.choices(['Initiates Self','Follows Others','Depends on Mood'], weights=[50,30,20])[0]

    # ── Previous hobby ───────────────────────────────────────────────────────
    tried_before = random.choices(['Yes','No'], weights=[35,65])[0]
    prev_hobby   = random.choice(ALL_HOBBIES) if tried_before == 'Yes' else 'None'
    stop_reason  = random.choice(STOPPED_REASONS[:-1]) if tried_before == 'Yes' else 'None'

    # ── Personality traits (derived) ─────────────────────────────────────────
    # Introvert/Extrovert based on with_whom + sports team
    if with_whom in ('Alone',) and team == 'Individual':
        personality = 'Introvert'
    elif with_whom in ('With Friends','Mixed') or team == 'Team':
        personality = 'Extrovert'
    else:
        personality = 'Ambivert'

    if health_cond == 'Autism':
        personality = 'Introvert'

    creativity_score = random.randint(7, 10) if primary in ('Arts','Digital') else random.randint(3, 7)
    leadership       = _strong() if team == 'Team' and is_primary else random.choice(['High','Medium','Low'])
    attention_span   = random.choices(['Long','Medium','Short'], weights=[50,35,15])[0] if primary in ('Analytical','Academics') else random.choices(['Long','Medium','Short'], weights=[25,45,30])[0]

    # ── Determine target ─────────────────────────────────────────────────────
    category = primary
    if primary == 'Sports':
        hobby = sport if sport != 'Other' else 'Cricket'
    elif primary == 'Arts':
        hobby = art if art != 'Other' else 'Drawing'
        if art == 'Music':  hobby = 'Music'
        if art == 'Acting': hobby = 'Acting'
    elif primary == 'Academics':
        hobby = ACAD_MAP.get(subj, 'Math Olympiad')
    elif primary == 'Analytical':
        hobby = ANALY_MAP.get(puzzle, 'Coding')
    elif primary == 'Health':
        hobby = act_pref
    elif primary == 'Cooking':
        hobby = cooking_type if cooking_type != 'None' else 'Baking'
    elif primary == 'Gardening':
        hobby = 'Gardening'
    elif primary == 'Digital':
        hobby = 'Game Design' if game_design_int == 'Yes' else 'Digital Content'
    else:
        hobby = 'Chess'

    # Pick role
    roles = HOBBY_ROLE_MAP.get(hobby, ['Practitioner', 'Coach'])
    # Role logic: performance stage → performer/stage role; creativity → design role
    if art == 'Dance' and stage_comf == 'High':
        role = 'Performer'
    elif art == 'Dance' and creativity == 'High':
        role = 'Choreographer'
    elif art == 'Dance':
        role = 'Dance Teacher'
    elif hobby == 'Game Design' and coding_int == 'Yes':
        role = 'Game Developer'
    elif hobby == 'Game Design':
        role = 'Game Designer'
    elif hobby == 'Drawing' and performance == 'Yes':
        role = 'Commercial Artist'
    elif hobby == 'Drawing':
        role = 'Hobby Artist'
    else:
        role = random.choice(roles)

    career  = CAREER_MAP.get(hobby, 'Pursue further training → Competitions → Professional Career')
    improve = IMPROVEMENT_MAP.get(hobby, 'Practice daily for 20-30 min; join a local club; set monthly goals')
    reason  = REASON_TEMPLATES.get(category, 'Shows strong natural interest and behavioral alignment with this area')

    return [
        age, gender,
        likes_sports, io, sport, hours, team, activity, freq,
        likes_arts, art, art_sub, creativity, performance, art_hrs,
        learning, digital, art_with, dance_style, music_type, acting_int, stage_comf,
        likes_acad, subj, ps, curious, study, comp, reading,
        likes_analy, puzzle, logic, challenge, work, coding_int, patience,
        health_cond, energy, outdoor, act_pref, h_hrs, sleep,
        likes_cooking, cooking_type, likes_gardening, gardening_type, nature_int,
        screen_hrs, screen_content, gaming_genre_v, game_design_int, digital_creat,
        with_whom, time_of_day, emotional_eng, initiative,
        tried_before, prev_hobby, stop_reason,
        personality, creativity_score, leadership, attention_span,
        category, hobby, role, career, improve, reason,
    ]


if __name__ == '__main__':
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(COLS)
        for _ in range(ROWS):
            w.writerow(gen_row())
    print(f'Generated {ROWS} rows → {OUT}')
    print(f'Columns: {len(COLS)} total')
