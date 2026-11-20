"""
Training and model evaluation pipeline for EduPredict AI.
Implements supervised regression comparing:
  1. DummyRegressor (Baseline)
  2. LinearRegression
  3. RandomForestRegressor
  4. GradientBoostingRegressor

Evaluates both Historical Performance Mode (Mode A) and Early Prediction Mode (Mode B).
Saves artifacts, validation & test metrics, feature importances, and residual data.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List

from sklearn.model_selection import train_test_split, KFold, cross_validate
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

from backend.ml.dataset_loader import load_or_prepare_dataset
from backend.ml.preprocessing import (
    get_feature_lists,
    build_preprocessor,
    validate_and_clean_df,
    TARGET_COLUMN,
    ORIGINAL_MIN_SCORE,
    ORIGINAL_MAX_SCORE,
)

ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "artifacts"))

def ensure_artifacts_dir():
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)

def train_and_evaluate_mode(df: pd.DataFrame, mode: str = 'historical', seed: int = 42) -> Dict[str, Any]:
    """
    Train and evaluate multiple regression models for a specific prediction mode.
    Follows strict best practices:
      - Train/test split (80/20) with fixed random seed
      - Cross-validation on train split only
      - Best model selected by mean CV MAE
      - Test metrics computed strictly after selection
    """
    ensure_artifacts_dir()
    clean_df = validate_and_clean_df(df, mode=mode)
    
    num_features, cat_features = get_feature_lists(mode)
    all_features = num_features + cat_features
    
    X = clean_df[all_features]
    y = clean_df[TARGET_COLUMN].values

    # Train / Test Split without leakage
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=seed
    )

    models_to_evaluate = {
        "DummyRegressor (Baseline)": DummyRegressor(strategy="mean"),
        "LinearRegression": LinearRegression(),
        "RandomForestRegressor": RandomForestRegressor(
            n_estimators=100, max_depth=6, min_samples_split=4, random_state=seed
        ),
        "GradientBoostingRegressor": GradientBoostingRegressor(
            n_estimators=100, learning_rate=0.08, max_depth=3, random_state=seed
        )
    }

    cv = KFold(n_splits=5, shuffle=True, random_state=seed)
    model_comparison_results = []
    fitted_pipelines = {}

    best_model_name = None
    lowest_cv_mae = float('inf')

    # Preprocessor
    preprocessor = build_preprocessor(num_features, cat_features)

    for model_name, model in models_to_evaluate.items():
        pipeline = Pipeline(steps=[
            ('preprocessor', build_preprocessor(num_features, cat_features)),
            ('regressor', model)
        ])

        # 5-fold Cross-validation on TRAIN set only
        scoring = {
            'mae': 'neg_mean_absolute_error',
            'r2': 'r2'
        }
        cv_results = cross_validate(pipeline, X_train, y_train, cv=cv, scoring=scoring, n_jobs=-1)
        
        cv_mae_mean = float(-np.mean(cv_results['test_mae']))
        cv_mae_std = float(np.std(cv_results['test_mae']))
        cv_r2_mean = float(np.mean(cv_results['test_r2']))
        cv_r2_std = float(np.std(cv_results['test_r2']))

        # Fit on full training set
        pipeline.fit(X_train, y_train)
        fitted_pipelines[model_name] = pipeline

        # Evaluate on test set
        test_preds = np.clip(pipeline.predict(X_test), ORIGINAL_MIN_SCORE, ORIGINAL_MAX_SCORE)
        test_mae = float(mean_absolute_error(y_test, test_preds))
        test_rmse = float(root_mean_squared_error(y_test, test_preds))
        test_r2 = float(r2_score(y_test, test_preds))

        model_comparison_results.append({
            "model_name": model_name,
            "cv_mae_mean": round(cv_mae_mean, 3),
            "cv_mae_std": round(cv_mae_std, 3),
            "cv_r2_mean": round(cv_r2_mean, 3),
            "cv_r2_std": round(cv_r2_std, 3),
            "test_mae": round(test_mae, 3),
            "test_rmse": round(test_rmse, 3),
            "test_r2": round(test_r2, 3),
            "is_selected": False
        })

        if cv_mae_mean < lowest_cv_mae:
            lowest_cv_mae = cv_mae_mean
            best_model_name = model_name

    # Mark the selected best model
    for item in model_comparison_results:
        if item["model_name"] == best_model_name:
            item["is_selected"] = True

    best_pipeline = fitted_pipelines[best_model_name]
    best_test_preds = np.clip(best_pipeline.predict(X_test), ORIGINAL_MIN_SCORE, ORIGINAL_MAX_SCORE)
    best_test_mae = float(mean_absolute_error(y_test, best_test_preds))
    best_test_rmse = float(root_mean_squared_error(y_test, best_test_preds))
    best_test_r2 = float(r2_score(y_test, best_test_preds))

    # Feature Importance Extraction
    feature_importances: List[Dict[str, Any]] = []
    regressor = best_pipeline.named_steps['regressor']
    
    try:
        encoded_cats = best_pipeline.named_steps['preprocessor'].named_transformers_['cat'].named_steps['onehot'].get_feature_names_out(cat_features)
        feature_names = list(num_features) + list(encoded_cats)
        
        if hasattr(regressor, 'feature_importances_'):
            importances = regressor.feature_importances_
            raw_pairs = sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)
            feature_importances = [{"feature": k, "importance": round(float(v), 4)} for k, v in raw_pairs[:15]]
        elif hasattr(regressor, 'coef_'):
            coefs = np.abs(regressor.coef_)
            raw_pairs = sorted(zip(feature_names, coefs), key=lambda x: x[1], reverse=True)
            feature_importances = [{"feature": k, "importance": round(float(v), 4)} for k, v in raw_pairs[:15]]
    except Exception as e:
        print(f"Warning: Could not extract feature importances for {best_model_name}: {e}")

    # Residuals & Actual vs Predicted samples (sample first 40 test samples for visual rendering)
    residuals_data = []
    for actual, pred in zip(y_test[:40], best_test_preds[:40]):
        residuals_data.append({
            "actual": round(float(actual), 1),
            "predicted": round(float(pred), 1),
            "residual": round(float(actual - pred), 1)
        })

    # Save artifacts
    model_filename = f"{mode}_model.joblib"
    model_path = os.path.join(ARTIFACTS_DIR, model_filename)
    joblib.dump(best_pipeline, model_path)

    metrics_payload = {
        "mode": mode,
        "best_model": best_model_name,
        "selection_criterion": "Lowest 5-Fold Cross-Validation MAE on Training Data",
        "training_sample_count": len(X_train),
        "test_sample_count": len(X_test),
        "target_column": TARGET_COLUMN,
        "target_scale": "0-20",
        "test_metrics": {
            "mae": round(best_test_mae, 3),
            "rmse": round(best_test_rmse, 3),
            "r2": round(best_test_r2, 3)
        },
        "models_comparison": model_comparison_results,
        "feature_importances": feature_importances,
        "actual_vs_predicted": residuals_data
    }

    metrics_path = os.path.join(ARTIFACTS_DIR, f"{mode}_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics_payload, f, indent=2)

    features_path = os.path.join(ARTIFACTS_DIR, f"{mode}_features.json")
    with open(features_path, "w") as f:
        json.dump({
            "numeric_features": num_features,
            "categorical_features": cat_features,
            "all_features": all_features
        }, f, indent=2)

    print(f"[{mode.upper()} MODE] Best Model: {best_model_name}")
    print(f"  Test MAE: {best_test_mae:.3f} (on 0-20 scale)")
    print(f"  Test RMSE: {best_test_rmse:.3f}")
    print(f"  Test R²: {best_test_r2:.3f}")
    print(f"  Saved artifacts to {ARTIFACTS_DIR}")

    return metrics_payload

def train_all_modes():
    """Execute training pipeline for both Historical and Early modes."""
    df = load_or_prepare_dataset()
    print(f"Loaded dataset with shape {df.shape}")

    hist_metrics = train_and_evaluate_mode(df, mode='historical')
    early_metrics = train_and_evaluate_mode(df, mode='early')

    summary_path = os.path.join(ARTIFACTS_DIR, "model_comparison.json")
    with open(summary_path, "w") as f:
        json.dump({
            "historical": hist_metrics,
            "early": early_metrics
        }, f, indent=2)

    print("\n--- Training Pipeline Completed Successfully ---")

if __name__ == "__main__":
    train_all_modes()
