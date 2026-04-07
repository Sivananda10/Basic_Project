"""
Visualization Script for Kids Hobbies Prediction System
========================================================
Generates all required charts and saves them as PNG files.
"""

import os
import sys
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAVE_DIR = os.path.join(BASE_DIR, 'saved_models')
IMG_DIR = os.path.join(BASE_DIR, 'static', 'images')
DATASET_PATH = os.path.join(BASE_DIR, 'dataset', 'Hobby_Data.csv')

os.makedirs(IMG_DIR, exist_ok=True)

# Styling
plt.style.use('seaborn-v0_8-whitegrid')
COLORS = ['#4361ee', '#f72585', '#4cc9f0', '#7209b7', '#3a0ca3']


def plot_accuracy_comparison():
    """Bar chart comparing accuracy of all 5 algorithms."""
    comparison = joblib.load(os.path.join(SAVE_DIR, 'model_comparison.pkl'))

    models = list(comparison.keys())
    accuracies = [comparison[m]['accuracy'] * 100 for m in models]

    fig, ax = plt.subplots(figsize=(10, 6))
    bars = ax.bar(models, accuracies, color=COLORS, edgecolor='white', linewidth=1.5)

    # Add value labels on bars
    for bar, acc in zip(bars, accuracies):
        ax.text(bar.get_x() + bar.get_width() / 2., bar.get_height() + 0.5,
                f'{acc:.2f}%', ha='center', va='bottom', fontweight='bold', fontsize=11)

    ax.set_xlabel('Algorithm', fontsize=12, fontweight='bold')
    ax.set_ylabel('Accuracy (%)', fontsize=12, fontweight='bold')
    ax.set_title('Model Accuracy Comparison', fontsize=14, fontweight='bold', pad=15)
    ax.set_ylim(0, 105)
    ax.tick_params(axis='x', rotation=15)

    plt.tight_layout()
    plt.savefig(os.path.join(IMG_DIR, 'accuracy_comparison.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print("✅ Saved: accuracy_comparison.png")


def plot_all_metrics_comparison():
    """Grouped bar chart comparing all 4 metrics across algorithms."""
    comparison = joblib.load(os.path.join(SAVE_DIR, 'model_comparison.pkl'))

    models = list(comparison.keys())
    metrics = ['accuracy', 'precision', 'recall', 'f1_score']
    metric_labels = ['Accuracy', 'Precision', 'Recall', 'F1-Score']

    x = np.arange(len(models))
    width = 0.2

    fig, ax = plt.subplots(figsize=(12, 6))

    for i, (metric, label) in enumerate(zip(metrics, metric_labels)):
        values = [comparison[m][metric] * 100 for m in models]
        ax.bar(x + i * width, values, width, label=label, color=COLORS[i], edgecolor='white')

    ax.set_xlabel('Algorithm', fontsize=12, fontweight='bold')
    ax.set_ylabel('Score (%)', fontsize=12, fontweight='bold')
    ax.set_title('Model Performance Comparison — All Metrics', fontsize=14, fontweight='bold', pad=15)
    ax.set_xticks(x + width * 1.5)
    ax.set_xticklabels(models, rotation=15)
    ax.legend(loc='lower right')
    ax.set_ylim(0, 110)

    plt.tight_layout()
    plt.savefig(os.path.join(IMG_DIR, 'metrics_comparison.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print("✅ Saved: metrics_comparison.png")


def plot_feature_importance():
    """Horizontal bar chart showing feature importance from Random Forest."""
    importances = joblib.load(os.path.join(SAVE_DIR, 'feature_importances.pkl'))

    # Sort by importance
    sorted_features = sorted(importances.items(), key=lambda x: x[1], reverse=True)
    features = [f[0] for f in sorted_features]
    values = [f[1] for f in sorted_features]

    fig, ax = plt.subplots(figsize=(10, 7))
    bars = ax.barh(features, values, color=plt.cm.viridis(np.linspace(0.2, 0.9, len(features))))

    # Add value labels
    for bar, val in zip(bars, values):
        ax.text(bar.get_width() + 0.005, bar.get_y() + bar.get_height() / 2.,
                f'{val:.4f}', ha='left', va='center', fontsize=10)

    ax.set_xlabel('Importance Score', fontsize=12, fontweight='bold')
    ax.set_title('Feature Importance (Random Forest)', fontsize=14, fontweight='bold', pad=15)
    ax.invert_yaxis()

    plt.tight_layout()
    plt.savefig(os.path.join(IMG_DIR, 'feature_importance.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print("✅ Saved: feature_importance.png")


def plot_hobby_distribution():
    """Pie chart and count plot showing hobby distribution in the dataset."""
    df = pd.read_csv(DATASET_PATH)
    hobby_counts = df['Predicted Hobby'].value_counts()

    fig, axes = plt.subplots(1, 2, figsize=(14, 6))

    # Pie chart
    colors_pie = ['#4361ee', '#f72585', '#4cc9f0']
    explode = (0.05, 0.05, 0.05)
    axes[0].pie(hobby_counts.values, labels=hobby_counts.index, autopct='%1.1f%%',
                colors=colors_pie, explode=explode, shadow=True, startangle=140,
                textprops={'fontsize': 12})
    axes[0].set_title('Hobby Distribution (Pie Chart)', fontsize=13, fontweight='bold')

    # Count plot
    sns.countplot(data=df, x='Predicted Hobby', palette=colors_pie, ax=axes[1],
                  order=hobby_counts.index, edgecolor='white', linewidth=1.5)
    axes[1].set_title('Hobby Distribution (Bar Chart)', fontsize=13, fontweight='bold')
    axes[1].set_xlabel('Hobby', fontsize=11)
    axes[1].set_ylabel('Count', fontsize=11)

    # Add counts on bars
    for i, (idx, val) in enumerate(hobby_counts.items()):
        axes[1].text(i, val + 10, str(val), ha='center', fontweight='bold', fontsize=11)

    plt.tight_layout()
    plt.savefig(os.path.join(IMG_DIR, 'hobby_distribution.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print("✅ Saved: hobby_distribution.png")


def plot_confusion_matrix():
    """Heatmap of the Random Forest confusion matrix."""
    cm = joblib.load(os.path.join(SAVE_DIR, 'confusion_matrix.pkl'))
    target_encoder = joblib.load(os.path.join(SAVE_DIR, 'target_encoder.pkl'))
    class_names = list(target_encoder.classes_)

    fig, ax = plt.subplots(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=class_names,
                yticklabels=class_names, linewidths=1, linecolor='white',
                annot_kws={'size': 14}, ax=ax)

    ax.set_xlabel('Predicted', fontsize=12, fontweight='bold')
    ax.set_ylabel('Actual', fontsize=12, fontweight='bold')
    ax.set_title('Confusion Matrix (Random Forest)', fontsize=14, fontweight='bold', pad=15)

    plt.tight_layout()
    plt.savefig(os.path.join(IMG_DIR, 'confusion_matrix.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print("✅ Saved: confusion_matrix.png")


def plot_correlation_heatmap():
    """Correlation heatmap of encoded features."""
    processed = pd.read_csv(os.path.join(SAVE_DIR, 'processed_data.csv'))

    fig, ax = plt.subplots(figsize=(12, 10))
    corr = processed.corr()
    mask = np.triu(np.ones_like(corr, dtype=bool))

    sns.heatmap(corr, mask=mask, annot=True, fmt='.2f', cmap='RdBu_r',
                center=0, linewidths=0.5, ax=ax, annot_kws={'size': 8},
                vmin=-1, vmax=1)

    ax.set_title('Feature Correlation Heatmap', fontsize=14, fontweight='bold', pad=15)

    plt.tight_layout()
    plt.savefig(os.path.join(IMG_DIR, 'correlation_heatmap.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print("✅ Saved: correlation_heatmap.png")


if __name__ == '__main__':
    print("=" * 60)
    print("GENERATING VISUALIZATIONS")
    print("=" * 60)

    plot_accuracy_comparison()
    plot_all_metrics_comparison()
    plot_feature_importance()
    plot_hobby_distribution()
    plot_confusion_matrix()
    plot_correlation_heatmap()

    print(f"\n✅ All visualizations saved to {IMG_DIR}/")
