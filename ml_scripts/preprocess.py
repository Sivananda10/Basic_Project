"""
Preprocess v3: train on CATEGORY (5 classes), not hobby.
"""
import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import joblib

BASE_DIR     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, 'dataset', 'Hobby_Data_v2.csv')
SAVE_DIR     = os.path.join(BASE_DIR, 'saved_models')
os.makedirs(SAVE_DIR, exist_ok=True)

FEATURE_COLS = [
    'sport_type','sport_activity_level','sport_play_style','favorite_sport',
    'art_type','art_creativity','art_performance','art_learning',
    'acad_subject','acad_problem_solving','acad_curiosity','acad_study_type',
    'analy_interest','analy_logic','analy_challenge','analy_work_style',
    'health_activity_type','health_energy','health_outdoor','health_activity',
]

def main():
    df = pd.read_csv(DATASET_PATH)
    print(f"✅ Loaded: {df.shape[0]} rows × {df.shape[1]} cols")

    # Encode features
    label_encoders = {}
    for col in FEATURE_COLS:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le

    # Encode target → CATEGORY (5 classes)
    target_enc = LabelEncoder()
    df['category_encoded'] = target_enc.fit_transform(df['category'])

    X = df[FEATURE_COLS].values
    y = df['category_encoded'].values

    print(f"✅ Target: CATEGORY ({len(target_enc.classes_)} classes): {list(target_enc.classes_)}")

    joblib.dump(label_encoders, os.path.join(SAVE_DIR, 'label_encoders.pkl'))
    joblib.dump(target_enc,     os.path.join(SAVE_DIR, 'target_encoder.pkl'))
    joblib.dump(FEATURE_COLS,   os.path.join(SAVE_DIR, 'feature_columns.pkl'))
    np.savez(os.path.join(SAVE_DIR, 'data.npz'), X=X, y=y)

    print(f"✅ Saved → {SAVE_DIR}")

if __name__ == '__main__':
    main()
