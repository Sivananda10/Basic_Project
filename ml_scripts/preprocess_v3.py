"""
preprocess_v3.py — Encode Hobby_Data_v3.csv for ML training.
Target: CATEGORY (5 classes). The specific hobby is derived by rule
        (with health-condition filtering applied at prediction time).
"""
import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import joblib

BASE_DIR     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, 'dataset', 'Hobby_Data_v3.csv')
SAVE_DIR     = os.path.join(BASE_DIR, 'saved_models')
os.makedirs(SAVE_DIR, exist_ok=True)

# All 31 feature columns (excluding category/hobby/health_note)
FEATURE_COLS = [
    'age',
    'likes_sports', 'sport_indoor_outdoor', 'which_sport',
    'sport_hours_per_day', 'sport_team_solo', 'sport_activity_level',
    'likes_arts', 'which_art', 'art_creativity', 'art_performance',
    'art_hours', 'art_learning_style',
    'likes_academics', 'fav_subject', 'acad_problem_solving',
    'acad_curiosity', 'acad_study_type', 'acad_competitions',
    'likes_analytical', 'analy_puzzle_type', 'analy_logic_level',
    'analy_challenge', 'analy_work_style', 'analy_coding_interest',
    'health_condition', 'health_energy', 'health_outdoor_preference',
    'health_activity_preference', 'health_hours',
]

NUMERIC_COLS = ['age']   # encoded as float, rest as labels

def main():
    df = pd.read_csv(DATASET_PATH)
    print(f"✅ Loaded: {df.shape[0]} rows × {df.shape[1]} cols")
    print(f"   Columns: {list(df.columns)}")

    label_encoders = {}

    for col in FEATURE_COLS:
        if col in NUMERIC_COLS:
            df[col] = df[col].astype(float)
            label_encoders[col] = None   # no LabelEncoder for numeric
        else:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            label_encoders[col] = le

    # Target: CATEGORY (5 classes)
    target_enc = LabelEncoder()
    df['category_encoded'] = target_enc.fit_transform(df['category'])

    X = df[FEATURE_COLS].values.astype(float)
    y = df['category_encoded'].values

    print(f"\n✅ Target classes ({len(target_enc.classes_)}): {list(target_enc.classes_)}")
    print(f"   Feature shape: {X.shape}")

    joblib.dump(label_encoders, os.path.join(SAVE_DIR, 'label_encoders_v3.pkl'))
    joblib.dump(target_enc,     os.path.join(SAVE_DIR, 'target_encoder_v3.pkl'))
    joblib.dump(FEATURE_COLS,   os.path.join(SAVE_DIR, 'feature_columns_v3.pkl'))
    np.savez(os.path.join(SAVE_DIR, 'data_v3.npz'), X=X, y=y)

    print(f"\n✅ Saved encoders + data → {SAVE_DIR}")

if __name__ == '__main__':
    main()
