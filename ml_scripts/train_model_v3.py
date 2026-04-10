"""
train_model_v3.py — Train Random Forest on v3 dataset (branching questionnaire).
"""
import os
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import classification_report, accuracy_score

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAVE_DIR = os.path.join(BASE_DIR, 'saved_models')


def main():
    data       = np.load(os.path.join(SAVE_DIR, 'data_v3.npz'))
    X, y       = data['X'], data['y']
    target_enc = joblib.load(os.path.join(SAVE_DIR, 'target_encoder_v3.pkl'))

    print(f"✅ {X.shape[0]} rows × {X.shape[1]} features, "
          f"{len(target_enc.classes_)} classes: {list(target_enc.classes_)}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y)

    print(f"   Train: {len(X_train)} | Test: {len(X_test)}")

    # ── Random Forest ────────────────────────────────────────────────────────
    rf = RandomForestClassifier(
        n_estimators=500, max_depth=None, min_samples_split=2,
        random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    rf_acc = accuracy_score(y_test, rf.predict(X_test)) * 100

    print(f"\n{'='*55}")
    print(f"  Random Forest Accuracy : {rf_acc:.2f}%")
    print(f"{'='*55}")
    print(classification_report(
        y_test, rf.predict(X_test), target_names=target_enc.classes_))

    # Save the best model as model_v3.pkl
    joblib.dump(rf, os.path.join(SAVE_DIR, 'model_v3.pkl'))
    print(f"✅ Model saved → {SAVE_DIR}/model_v3.pkl")


if __name__ == '__main__':
    main()
