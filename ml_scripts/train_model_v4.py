"""
train_model_v4.py — Train Random Forest on v4 (30-question) data.
"""
import os, pandas as pd, joblib
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA     = os.path.join(BASE_DIR, 'dataset', 'Hobby_Data_v4.csv')
SAVE_DIR = os.path.join(BASE_DIR, 'saved_models')
os.makedirs(SAVE_DIR, exist_ok=True)

df = pd.read_csv(DATA)
print(f'Loaded {len(df)} rows, {len(df.columns)} cols')

NUMERIC = {'age'}
TARGET  = 'category'

# Encode
label_encoders = {}
for col in df.columns:
    if col in NUMERIC or col == TARGET or col == 'hobby':
        continue
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    label_encoders[col] = le

target_enc = LabelEncoder()
df[TARGET] = target_enc.fit_transform(df[TARGET])

feature_cols = [c for c in df.columns if c not in (TARGET, 'hobby')]
X = df[feature_cols].values
y = df[TARGET].values

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print('Training Random Forest...')
model = RandomForestClassifier(
    n_estimators=300, max_depth=20, min_samples_split=5,
    class_weight='balanced', random_state=42, n_jobs=-1
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f'\nAccuracy: {acc*100:.1f}%')
print(classification_report(y_test, y_pred, target_names=target_enc.classes_))

# Save everything
joblib.dump(model,          os.path.join(SAVE_DIR, 'model_v4.pkl'))
joblib.dump(label_encoders, os.path.join(SAVE_DIR, 'label_encoders_v4.pkl'))
joblib.dump(target_enc,     os.path.join(SAVE_DIR, 'target_encoder_v4.pkl'))
joblib.dump(feature_cols,   os.path.join(SAVE_DIR, 'feature_cols_v4.pkl'))

print(f'\nModel saved → {os.path.join(SAVE_DIR, "model_v4.pkl")}')
