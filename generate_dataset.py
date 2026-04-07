import pandas as pd
import numpy as np
import random
import os

def generate_dataset(num_records=2500):
    np.random.seed(42)
    random.seed(42)
    
    data = []
    
    # 5 Target Classes
    hobbies = ['Academics', 'Sports', 'Arts', 'Analytical Thinking', 'Health & Fitness']
    
    for _ in range(num_records):
        hobby = random.choice(hobbies)
        
        # Base Age
        age = random.randint(5, 17)
        
        # Default initialization
        olympiad = random.choice(['Yes', 'No'])
        scholarship = random.choice(['Yes', 'No'])
        projects = random.choice(['Yes', 'No'])
        fav_sub = random.choice(['Mathematics', 'Science', 'History', 'Languages', 'Arts'])
        grasp_pow = random.randint(1, 6)
        
        time_sprt = random.randint(0, 3)
        medals = random.choice(['Yes', 'No'])
        career_sprt = random.choice(['Yes', 'No'])
        act_sprt = random.choice(['Yes', 'No'])
        
        fant_arts = random.choice(['Yes', 'No'])
        won_arts = random.choice(['Yes', 'No'])
        time_art = random.randint(0, 3)
        
        solves_puzzles = random.choice(['Yes', 'No'])
        logical_score = random.randint(1, 10)
        plays_board_games = random.choice(['Yes', 'No'])
        
        daily_exercise = random.randint(10, 60)
        dietary = random.choice(['Healthy', 'Average', 'Junk'])
        health_aware = random.choice(['Yes', 'No'])
        
        # Tweak probabilities based on target hobby
        if hobby == 'Academics':
            olympiad = random.choices(['Yes', 'No'], weights=[0.8, 0.2])[0]
            scholarship = random.choices(['Yes', 'No'], weights=[0.7, 0.3])[0]
            projects = random.choices(['Yes', 'No'], weights=[0.85, 0.15])[0]
            grasp_pow = random.randint(4, 6)
            fav_sub = random.choice(['Mathematics', 'Science'])
        
        elif hobby == 'Sports':
            time_sprt = random.randint(2, 6)
            medals = random.choices(['Yes', 'No'], weights=[0.7, 0.3])[0]
            career_sprt = random.choices(['Yes', 'No'], weights=[0.8, 0.2])[0]
            act_sprt = random.choices(['Yes', 'No'], weights=[0.9, 0.1])[0]
            daily_exercise = random.randint(45, 120)
            health_aware = random.choices(['Yes', 'No'], weights=[0.8, 0.2])[0]
            
        elif hobby == 'Arts':
            fant_arts = random.choices(['Yes', 'No'], weights=[0.9, 0.1])[0]
            won_arts = random.choices(['Yes', 'No'], weights=[0.6, 0.4])[0]
            time_art = random.randint(2, 6)
            fav_sub = 'Arts'
            
        elif hobby == 'Analytical Thinking':
            solves_puzzles = random.choices(['Yes', 'No'], weights=[0.9, 0.1])[0]
            logical_score = random.randint(7, 10)
            plays_board_games = random.choices(['Yes', 'No'], weights=[0.8, 0.2])[0]
            grasp_pow = random.randint(4, 6)
            fav_sub = 'Mathematics'
            
        elif hobby == 'Health & Fitness':
            daily_exercise = random.randint(60, 150)
            dietary = random.choices(['Healthy', 'Average'], weights=[0.8, 0.2])[0]
            health_aware = random.choices(['Yes', 'No'], weights=[0.9, 0.1])[0]
            act_sprt = random.choices(['Yes', 'No'], weights=[0.7, 0.3])[0]
        
        data.append({
            'Age': age,
            'Olympiad_Participation': olympiad,
            'Scholarship': scholarship,
            'Fav_sub': fav_sub,
            'Projects': projects,
            'Grasp_pow': grasp_pow,
            
            'Time_sprt': time_sprt,
            'Medals': medals,
            'Career_sprt': career_sprt,
            'Act_sprt': act_sprt,
            
            'Fant_arts': fant_arts,
            'Won_arts': won_arts,
            'Time_art': time_art,
            
            'Solves_Puzzles': solves_puzzles,
            'Logical_Score': logical_score,
            'Plays_Board_Games': plays_board_games,
            
            'Daily_Exercise_Mins': daily_exercise,
            'Dietary_Habits': dietary,
            'Health_Awareness': health_aware,
            
            'Predicted Hobby': hobby
        })
        
    df = pd.DataFrame(data)
    
    # Save
    os.makedirs('dataset', exist_ok=True)
    df.to_csv('dataset/Hobby_Data.csv', index=False)
    print(f"✅ Generated new dataset with {len(df)} records and {len(df.columns)} columns")
    print(df['Predicted Hobby'].value_counts())

if __name__ == '__main__':
    generate_dataset()
