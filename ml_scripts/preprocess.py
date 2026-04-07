"""
Data Preprocessing Script for Kids Hobbies Prediction System
=============================================================
Loads raw CSV data, cleans it, encodes categorical features,
scales numerical features, and saves preprocessing objects for Django.
"""

import os
import sys
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, 'dataset', 'Hobby_Data.csv')
SAVE_DIR = os.path.join(BASE_DIR, 'saved_models')

os.makedirs(SAVE_DIR, exist_ok=True)


def load_data():
    """Load the raw dataset."""
    df = pd.read_csv(DATASET_PATH)
    print(f"✅ Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
    return df


def explore_data(df):
    """Print dataset summary and statistics."""
    print("\n" + "=" * 60)
    print("DATASET EXPLORATION")
    print("=" * 60)

    print(f"\nShape: {df.shape}")
    print(f"\nColumns: {list(df.columns)}")

    print(f"\nData Types:\n{df.dtypes}")

    print(f"\nMissing Values:\n{df.isnull().sum()}")
    print(f"Total missing: {df.isnull().sum().sum()}")

    print(f"\nTarget Distribution:")
    print(df['Predicted Hobby'].value_counts())

    print(f"\nSample Data:")
    print(df.head())

    print(f"\nDescriptive Statistics:")
    print(df.describe(include='all'))


def preprocess_data(df):
    """
    Preprocess the dataset:
    1. Handle missing values
    2. Encode categorical features
    3. Scale numerical features
    """
    print("\n" + "=" * 60)
    print("DATA PREPROCESSING")
    print("=" * 60)

    # 1. Handle missing values
    missing_before = df.isnull().sum().sum()
    df = df.dropna()
    missing_after = df.isnull().sum().sum()
    print(f"\n✅ Missing values: {missing_before} → {missing_after} (dropped rows with nulls)")

    # 2. Separate features and target
    X = df.drop('Predicted Hobby', axis=1)
    y = df['Predicted Hobby']

    # 3. Encode target variable
    target_encoder = LabelEncoder()
    y_encoded = target_encoder.fit_transform(y)
    print(f"✅ Target encoded: {dict(zip(target_encoder.classes_, target_encoder.transform(target_encoder.classes_)))}")

    # 4. Encode categorical features
    # Binary columns (Yes/No)
    binary_cols = ['Olympiad_Participation', 'Scholarship', 'School',
                   'Projects', 'Medals', 'Career_sprt', 'Act_sprt', 'Fant_arts']

    # Multi-class categorical columns
    multi_cat_cols = ['Fav_sub', 'Won_arts']

    # Numerical columns (already numeric in dataset)
    num_cols = ['Age', 'Grasp_pow', 'Time_sprt', 'Time_art']

    # Store encoders for each column
    label_encoders = {}

    # Encode binary columns
    for col in binary_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        label_encoders[col] = le
        print(f"  Encoded {col}: {dict(zip(le.classes_, le.transform(le.classes_)))}")

    # Encode multi-class categorical columns
    for col in multi_cat_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        label_encoders[col] = le
        print(f"  Encoded {col}: {dict(zip(le.classes_, le.transform(le.classes_)))}")

    # Ensure numerical columns are int/float
    for col in num_cols:
        X[col] = pd.to_numeric(X[col], errors='coerce')

    print(f"\n✅ All categorical features encoded")

    # 5. Scale numerical features
    scaler = StandardScaler()
    X[num_cols] = scaler.fit_transform(X[num_cols])
    print(f"✅ Numerical features scaled: {num_cols}")

    # 6. Save all preprocessing objects
    joblib.dump(label_encoders, os.path.join(SAVE_DIR, 'label_encoders.pkl'))
    joblib.dump(target_encoder, os.path.join(SAVE_DIR, 'target_encoder.pkl'))
    joblib.dump(scaler, os.path.join(SAVE_DIR, 'scaler.pkl'))

    # Save feature column order
    feature_columns = list(X.columns)
    joblib.dump(feature_columns, os.path.join(SAVE_DIR, 'feature_columns.pkl'))

    print(f"\n✅ Preprocessing objects saved to {SAVE_DIR}/")
    print(f"  - label_encoders.pkl")
    print(f"  - target_encoder.pkl")
    print(f"  - scaler.pkl")
    print(f"  - feature_columns.pkl")

    # Save processed data
    processed_df = X.copy()
    processed_df['target'] = y_encoded
    processed_df.to_csv(os.path.join(SAVE_DIR, 'processed_data.csv'), index=False)
    print(f"  - processed_data.csv")

    print(f"\nFinal feature shape: {X.shape}")
    print(f"Feature columns: {feature_columns}")

    return X, y_encoded


if __name__ == '__main__':
    df = load_data()
    explore_data(df)
    X, y = preprocess_data(df)
    print("\n✅ Preprocessing complete!")
