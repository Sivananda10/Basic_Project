"""
train_model_v5.py — Train Gradient Boosting on v5 data (55+ cols, 8 categories).
Saves model_v5.pkl, label_encoders_v5.pkl, target_encoder_v5.pkl, feature_cols_v5.pkl
"""
import os, pandas as pd, joblib
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA     = os.path.join(BASE_DIR, 'dataset', 'Hobby_Data_v5.csv')
SAVE_DIR = os.path.join(BASE_DIR, 'saved_models')
os.makedirs(SAVE_DIR, exist_ok=True)

df = pd.read_csv(DATA)
print(f'Loaded {len(df)} rows, {len(df.columns)} cols')

# Non-ML columns (rich text / targets beyond category)
NON_FEATURE_COLS = {'category', 'hobby', 'hobby_role', 'career_mapping',
                    'improvement_suggestion', 'recommendation_reason'}
NUMERIC_COLS     = {'age', 'creativity_score'}
TARGET           = 'category'

label_encoders = {}
for col in df.columns:
    if col in NUMERIC_COLS or col in NON_FEATURE_COLS:
        continue
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    label_encoders[col] = le

target_enc  = LabelEncoder()
df[TARGET]  = target_enc.fit_transform(df[TARGET])

feature_cols = [c for c in df.columns if c not in NON_FEATURE_COLS]
X = df[feature_cols].values.astype(float)
y = df[TARGET].values

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print(f'Training on {len(X_train)} samples, {len(feature_cols)} features...')
model = GradientBoostingClassifier(
    n_estimators=300, learning_rate=0.1, max_depth=6,
    min_samples_split=5, subsample=0.85, random_state=42,
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
acc    = accuracy_score(y_test, y_pred)
print(f'\nAccuracy: {acc * 100:.1f}%')
print(classification_report(y_test, y_pred, target_names=target_enc.classes_))

# Save all artifacts
joblib.dump(model,          os.path.join(SAVE_DIR, 'model_v5.pkl'))
joblib.dump(label_encoders, os.path.join(SAVE_DIR, 'label_encoders_v5.pkl'))
joblib.dump(target_enc,     os.path.join(SAVE_DIR, 'target_encoder_v5.pkl'))
joblib.dump(feature_cols,   os.path.join(SAVE_DIR, 'feature_cols_v5.pkl'))

print(f'\nSaved → {SAVE_DIR}/model_v5.pkl')
print(f'Classes: {list(target_enc.classes_)}')
