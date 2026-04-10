"""
preprocess_v4.py — Encode Hobby_Data_v4.csv and save encoders.
"""
import os, pandas as pd, joblib
from sklearn.preprocessing import LabelEncoder

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA     = os.path.join(BASE_DIR, 'dataset', 'Hobby_Data_v4.csv')
SAVE_DIR = os.path.join(BASE_DIR, 'saved_models')
os.makedirs(SAVE_DIR, exist_ok=True)

df = pd.read_csv(DATA)
print(f'Loaded {len(df)} rows, {len(df.columns)} cols')

NUMERIC = {'age'}
TARGET  = 'category'

# Encode categorical columns
label_encoders = {}
for col in df.columns:
    if col in NUMERIC or col == TARGET or col == 'hobby':
        continue
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    label_encoders[col] = le

# Encode target
target_enc = LabelEncoder()
df[TARGET] = target_enc.fit_transform(df[TARGET])

# Features
feature_cols = [c for c in df.columns if c not in (TARGET, 'hobby')]
X = df[feature_cols].values
y = df[TARGET].values

# Save
joblib.dump(label_encoders, os.path.join(SAVE_DIR, 'label_encoders_v4.pkl'))
joblib.dump(target_enc,     os.path.join(SAVE_DIR, 'target_encoder_v4.pkl'))
joblib.dump(feature_cols,   os.path.join(SAVE_DIR, 'feature_cols_v4.pkl'))

print(f'Features: {len(feature_cols)}')
print(f'Classes:  {list(target_enc.classes_)}')
print('Encoders saved ✓')
