"""
Train Random Forest on v2 dataset (categorical features → hobby prediction).
"""
import os
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

BASE_DIR  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAVE_DIR  = os.path.join(BASE_DIR, 'saved_models')

def main():
    data = np.load(os.path.join(SAVE_DIR, 'data.npz'))
    X, y = data['X'], data['y']
    target_enc = joblib.load(os.path.join(SAVE_DIR, 'target_encoder.pkl'))

    print(f"✅ {X.shape[0]} rows × {X.shape[1]} features, {len(target_enc.classes_)} classes")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y)

    print(f"Train: {len(X_train)} | Test: {len(X_test)}")

    model = RandomForestClassifier(
        n_estimators=500, max_depth=None, min_samples_split=2,
        random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred) * 100

    print(f"\n{'='*50}")
    print(f"  Random Forest: {acc:.2f}%")
    print(f"{'='*50}")
    print(classification_report(y_test, y_pred, target_names=target_enc.classes_))

    joblib.dump(model, os.path.join(SAVE_DIR, 'model.pkl'))
    print(f"✅ Model saved → {SAVE_DIR}/model.pkl")

if __name__ == '__main__':
    main()
