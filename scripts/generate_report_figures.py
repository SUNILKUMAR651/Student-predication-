import os
import json
import matplotlib
os.environ['MPLCONFIGDIR'] = os.path.abspath(r'.tmp')
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

# Create output directory
out_dir = os.path.abspath(r'docs/report_figures')
os.makedirs(out_dir, exist_ok=True)

# Load comparison artifacts
with open(r'backend/artifacts/model_comparison.json', 'r') as f:
    data = json.load(f)

hist_data = data['historical']
models = hist_data['models_comparison']
importances = hist_data['feature_importances'][:10]
actual_vs_pred = hist_data['actual_vs_predicted']

# Colors
primary_blue = '#1e40af'
secondary_cyan = '#0284c7'
accent_emerald = '#059669'

plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.size': 11,
    'axes.labelsize': 12,
    'axes.titlesize': 13,
    'figure.titlesize': 15,
    'figure.autolayout': True
})

# -------------------------------------------------------------
# FIGURE 1: Model Comparison (MAE, RMSE, R2)
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(9, 5), dpi=300)
model_names = [m['model_name'].replace('Regressor', '').replace(' (Baseline)', '') for m in models]
r2_scores = [max(0, m['test_r2']) for m in models]
mae_scores = [m['test_mae'] for m in models]

x = np.arange(len(model_names))
width = 0.35

rects1 = ax.bar(x - width/2, mae_scores, width, label='Test MAE (Lower is better)', color='#f43f5e', alpha=0.85)
rects2 = ax.bar(x + width/2, r2_scores, width, label='Test R² Score (Higher is better)', color='#2563eb', alpha=0.85)

ax.set_ylabel('Metric Value')
ax.set_title('Figure 5.2: Machine Learning Models Benchmark Comparison')
ax.set_xticks(x)
ax.set_xticklabels(model_names, rotation=10, ha='right', fontweight='bold')
ax.legend(frameon=True, facecolor='#f8fafc', edgecolor='#cbd5e1')
ax.grid(axis='y', linestyle='--', alpha=0.5)

for rect in rects1:
    h = rect.get_height()
    ax.annotate(f'{h:.2f}', xy=(rect.get_x() + rect.get_width()/2, h),
                xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontsize=9, fontweight='bold')

for rect in rects2:
    h = rect.get_height()
    ax.annotate(f'{h:.2f}', xy=(rect.get_x() + rect.get_width()/2, h),
                xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontsize=9, fontweight='bold')

fig.savefig(os.path.join(out_dir, 'figure_5_2_model_comparison.png'))
plt.close(fig)

# -------------------------------------------------------------
# FIGURE 2: Actual vs Predicted Final Exam Marks (Scatter)
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(8, 6), dpi=300)
actuals = [p['actual'] for p in actual_vs_pred]
preds = [p['predicted'] for p in actual_vs_pred]

ax.scatter(actuals, preds, color='#2563eb', alpha=0.65, edgecolors='#1e40af', s=45, label='Student Predictions (Test Set)')
ax.plot([0, 20], [0, 20], color='#dc2626', linestyle='--', linewidth=2, label='Perfect Prediction (y = x)')

ax.set_xlabel('Actual Final Grade (G3: 0–20 Scale)', fontweight='bold')
ax.set_ylabel('Predicted Final Grade (G3: 0–20 Scale)', fontweight='bold')
ax.set_title('Figure 5.3: Actual vs Predicted Final Exam Marks (GradientBoosting)', fontweight='bold')
ax.set_xlim(0, 20)
ax.set_ylim(0, 20)
ax.grid(True, linestyle='--', alpha=0.5)
ax.legend(loc='upper left', frameon=True, facecolor='#f8fafc')

# Add metrics text box
info_text = f"GradientBoosting Regressor\nTest R² = {hist_data['test_metrics']['r2']:.3f}\nTest MAE = {hist_data['test_metrics']['mae']:.2f}\nTest RMSE = {hist_data['test_metrics']['rmse']:.2f}"
ax.text(0.95, 0.08, info_text, transform=ax.transAxes, fontsize=10,
        verticalalignment='bottom', horizontalalignment='right',
        bbox=dict(boxstyle='round,pad=0.6', facecolor='#eff6ff', edgecolor='#93c5fd', alpha=0.9))

fig.savefig(os.path.join(out_dir, 'figure_5_3_actual_vs_predicted.png'))
plt.close(fig)

# -------------------------------------------------------------
# FIGURE 3: Top Feature Importances
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(8, 5), dpi=300)
feat_names = [f['feature'] for f in reversed(importances)]
feat_values = [f['importance'] * 100 for f in reversed(importances)]

bars = ax.barh(feat_names, feat_values, color='#0284c7', alpha=0.85)
ax.set_xlabel('Relative Importance Contribution (%)', fontweight='bold')
ax.set_title('Figure 5.4: Top 10 Feature Importance Ranking (Supervised Model)', fontweight='bold')
ax.grid(axis='x', linestyle='--', alpha=0.5)

for bar in bars:
    w = bar.get_width()
    ax.annotate(f'{w:.1f}%', xy=(w, bar.get_y() + bar.get_height()/2),
                xytext=(5, 0), textcoords="offset points", ha='left', va='center', fontsize=9, fontweight='bold')

fig.savefig(os.path.join(out_dir, 'figure_5_4_feature_importance.png'))
plt.close(fig)

# -------------------------------------------------------------
# FIGURE 4: Prediction Error / Residual Distribution
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(8, 5), dpi=300)
residuals = [p['residual'] for p in actual_vs_pred]

n, bins, patches = ax.hist(residuals, bins=15, color='#10b981', edgecolor='#047857', alpha=0.75, density=False)
ax.axvline(0, color='#dc2626', linestyle='--', linewidth=2, label='Zero Error Line')

ax.set_xlabel('Prediction Error (Actual - Predicted Marks)', fontweight='bold')
ax.set_ylabel('Number of Students', fontweight='bold')
ax.set_title('Figure 5.5: Residual Error Distribution (Near-Normal Calibration)', fontweight='bold')
ax.grid(axis='y', linestyle='--', alpha=0.5)
ax.legend(frameon=True, facecolor='#f8fafc')

fig.savefig(os.path.join(out_dir, 'figure_5_5_residuals_distribution.png'))
plt.close(fig)

print('Generated all 4 report figures successfully in', out_dir)
