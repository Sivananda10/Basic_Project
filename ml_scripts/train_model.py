"""
Model Training Script for Kids Hobbies Prediction System
=========================================================
Trains 5 ML models, evaluates them, compares results,
and saves the best model (Random Forest) for production use.
"""

import os
import sys
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, classification_report, confusion_matrix
)

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAVE_DIR = os.path.join(BASE_DIR, 'saved_models')
DATA_PATH = os.path.join(SAVE_DIR, 'processed_data.csv')


def load_processed_data():
    """Load preprocessed data."""
    df = pd.read_csv(DATA_PATH)
    X = df.drop('target', axis=1)
    y = df['target']
    print(f"✅ Loaded processed data: {X.shape[0]} samples, {X.shape[1]} features")
    return X, y


def train_and_evaluate_models(X_train, X_test, y_train, y_test, target_names):
    """Train all 5 models and return their results."""

    models = {
        'Random Forest': RandomForestClassifier(
            n_estimators=100, random_state=42, n_jobs=-1
        ),
        'Decision Tree': DecisionTreeClassifier(random_state=42),
        'Logistic Regression': LogisticRegression(
            max_iter=1000, random_state=42, multi_class='multinomial'
        ),
        'Naive Bayes': GaussianNB(),
        'SVM': SVC(kernel='rbf', random_state=42, probability=True),
    }

    results = {}

    print("\n" + "=" * 70)
    print("MODEL TRAINING & EVALUATION")
    print("=" * 70)

    for name, model in models.items():
        print(f"\n{'─' * 50}")
        print(f"Training: {name}")
        print(f"{'─' * 50}")

        # Train
        model.fit(X_train, y_train)

        # Predict
        y_pred = model.predict(X_test)

        # Evaluate
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
        cm = confusion_matrix(y_test, y_pred)

        results[name] = {
            'model': model,
            'accuracy': acc,
            'precision': prec,
            'recall': rec,
            'f1_score': f1,
            'confusion_matrix': cm,
            'y_pred': y_pred,
        }

        print(f"  Accuracy:  {acc:.4f} ({acc*100:.2f}%)")
        print(f"  Precision: {prec:.4f}")
        print(f"  Recall:    {rec:.4f}")
        print(f"  F1-Score:  {f1:.4f}")
        print(f"\n  Classification Report:")
        print(classification_report(y_test, y_pred, target_names=target_names, zero_division=0))

    return results


def print_comparison(results):
    """Print side-by-side comparison of all models."""
    print("\n" + "=" * 70)
    print("MODEL COMPARISON SUMMARY")
    print("=" * 70)
    print(f"\n{'Model':<25} {'Accuracy':>10} {'Precision':>10} {'Recall':>10} {'F1-Score':>10}")
    print("─" * 65)

    for name, res in sorted(results.items(), key=lambda x: x[1]['accuracy'], reverse=True):
        print(f"{name:<25} {res['accuracy']:>10.4f} {res['precision']:>10.4f} {res['recall']:>10.4f} {res['f1_score']:>10.4f}")

    # Find best model
    best_name = max(results, key=lambda x: results[x]['accuracy'])
    print(f"\n🏆 Best Model: {best_name} (Accuracy: {results[best_name]['accuracy']*100:.2f}%)")

    return best_name


def save_model(model, name):
    """Save the final model."""
    model_path = os.path.join(SAVE_DIR, 'model.pkl')
    joblib.dump(model, model_path)
    print(f"\n✅ {name} model saved to {model_path}")


def save_results(results):
    """Save comparison results for visualization."""
    comparison = {
        name: {
            'accuracy': res['accuracy'],
            'precision': res['precision'],
            'recall': res['recall'],
            'f1_score': res['f1_score'],
        }
        for name, res in results.items()
    }
    joblib.dump(comparison, os.path.join(SAVE_DIR, 'model_comparison.pkl'))

    # Save Random Forest feature importances
    rf = results['Random Forest']['model']
    feature_cols = joblib.load(os.path.join(SAVE_DIR, 'feature_columns.pkl'))
    importances = dict(zip(feature_cols, rf.feature_importances_))
    joblib.dump(importances, os.path.join(SAVE_DIR, 'feature_importances.pkl'))

    # Save confusion matrix for Random Forest
    joblib.dump(
        results['Random Forest']['confusion_matrix'],
        os.path.join(SAVE_DIR, 'confusion_matrix.pkl')
    )

    print("✅ Results, feature importances, and confusion matrix saved")


if __name__ == '__main__':
    # Load data
    X, y = load_processed_data()

    # Load target encoder for class names
    target_encoder = joblib.load(os.path.join(SAVE_DIR, 'target_encoder.pkl'))
    target_names = list(target_encoder.classes_)
    print(f"Target classes: {target_names}")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Train set: {X_train.shape[0]} samples | Test set: {X_test.shape[0]} samples")

    # Train and evaluate
    results = train_and_evaluate_models(X_train, X_test, y_train, y_test, target_names)

    # Compare
    best_name = print_comparison(results)

    # Save the Random Forest model (primary model)
    save_model(results['Random Forest']['model'], 'Random Forest')

    # Save results for visualization
    save_results(results)

    # Quick verification
    print("\n" + "=" * 70)
    print("VERIFICATION — Test prediction with sample input")
    print("=" * 70)
    model = joblib.load(os.path.join(SAVE_DIR, 'model.pkl'))
    sample = X_test.iloc[0:1]
    pred = model.predict(sample)
    pred_class = target_encoder.inverse_transform(pred)
    print(f"Sample input: {sample.values[0]}")
    print(f"Predicted class: {pred[0]} → {pred_class[0]}")
    print(f"Actual class: {y_test.iloc[0]} → {target_encoder.inverse_transform([y_test.iloc[0]])[0]}")

    print("\n✅ Model training complete!")
