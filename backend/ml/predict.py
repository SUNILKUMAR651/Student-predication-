"""
Inference engine for EduPredict AI.
Loads serialized models and preprocessors, handles scaling, input validation,
confidence intervals, and factor analysis.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, Optional

from backend.ml.preprocessing import (
    get_feature_lists,
    convert_scale_to_100,
    convert_scale_to_20,
    get_performance_category,
    FEATURE_RANGES,
    ORIGINAL_MIN_SCORE,
    ORIGINAL_MAX_SCORE,
)

ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "artifacts"))

class ModelArtifactNotFoundError(Exception):
    """Raised when model artifacts cannot be found on disk."""
    pass

class StudentPredictor:
    def __init__(self, artifacts_dir: str = ARTIFACTS_DIR):
        self.artifacts_dir = artifacts_dir
        self._models = {}
        self._metrics = {}
        self._features = {}

    def is_ready(self, mode: str = 'historical') -> bool:
        """Check if artifacts exist for the given mode."""
        model_path = os.path.join(self.artifacts_dir, f"{mode}_model.joblib")
        metrics_path = os.path.join(self.artifacts_dir, f"{mode}_metrics.json")
        return os.path.exists(model_path) and os.path.exists(metrics_path)

    def load_artifacts(self, mode: str = 'historical'):
        """Load joblib pipeline and metadata JSON for mode."""
        if not self.is_ready(mode):
            raise ModelArtifactNotFoundError(
                f"Model artifacts for mode '{mode}' were not found in {self.artifacts_dir}. "
                f"Please run the training pipeline first (e.g., 'python -m backend.ml.train')."
            )

        if mode not in self._models:
            model_path = os.path.join(self.artifacts_dir, f"{mode}_model.joblib")
            self._models[mode] = joblib.load(model_path)

            metrics_path = os.path.join(self.artifacts_dir, f"{mode}_metrics.json")
            with open(metrics_path, "r") as f:
                self._metrics[mode] = json.load(f)

            features_path = os.path.join(self.artifacts_dir, f"{mode}_features.json")
            with open(features_path, "r") as f:
                self._features[mode] = json.load(f)

    def predict(self, student_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute prediction for an input dictionary.
        Supports 'historical' (with G1/G2) and 'early' (without G1/G2) modes.
        Handles scale options ('100' or '20').
        """
        mode = student_data.get('mode', 'historical')
        scale = str(student_data.get('scale', '100'))
        
        self.load_artifacts(mode)
        pipeline = self._models[mode]
        metrics = self._metrics[mode]
        
        num_cols, cat_cols = get_feature_lists(mode)
        
        # Prepare input dict
        row = {}
        for col in num_cols:
            val = student_data.get(col)
            if val is None:
                # Default fallback if not provided
                val = FEATURE_RANGES[col][0]
            else:
                val = float(val)
                # If user entered G1 or G2 on 0-100 scale, convert to 0-20 scale for model
                if col in ['G1', 'G2'] and scale == '100' and val > 20.0:
                    val = convert_scale_to_20(val)
            # Clip to valid training range
            min_v, max_v = FEATURE_RANGES[col]
            val = max(min_v, min(max_v, val))
            row[col] = val

        for col in cat_cols:
            val = student_data.get(col)
            if val is None or str(val).strip() == '':
                # Common sensible defaults from dataset modes
                defaults = {
                    'school': 'GP', 'sex': 'F', 'address': 'U', 'famsize': 'GT3',
                    'Pstatus': 'T', 'Mjob': 'other', 'Fjob': 'other', 'reason': 'course',
                    'guardian': 'mother', 'schoolsup': 'no', 'famsup': 'yes',
                    'paid': 'no', 'activities': 'yes', 'nursery': 'yes',
                    'higher': 'yes', 'internet': 'yes', 'romantic': 'no'
                }
                val = defaults.get(col, 'other')
            row[col] = str(val).strip()

        input_df = pd.DataFrame([row])
        
        # Model inference on 0-20 scale
        raw_pred = float(pipeline.predict(input_df)[0])
        # Clip prediction to true bounds [0, 20]
        raw_pred = float(np.clip(raw_pred, ORIGINAL_MIN_SCORE, ORIGINAL_MAX_SCORE))
        score_20 = round(raw_pred, 1)
        score_100 = convert_scale_to_100(score_20)

        # Confidence intervals based on model RMSE
        test_rmse = float(metrics.get("test_metrics", {}).get("rmse", 1.8))
        conf_lower_20 = float(np.clip(score_20 - 1.28 * test_rmse, ORIGINAL_MIN_SCORE, ORIGINAL_MAX_SCORE))
        conf_upper_20 = float(np.clip(score_20 + 1.28 * test_rmse, ORIGINAL_MIN_SCORE, ORIGINAL_MAX_SCORE))

        display_score = score_100 if scale == '100' else score_20
        conf_lower = convert_scale_to_100(conf_lower_20) if scale == '100' else round(conf_lower_20, 1)
        conf_upper = convert_scale_to_100(conf_upper_20) if scale == '100' else round(conf_upper_20, 1)

        category, letter_grade = get_performance_category(display_score, scale=scale)

        # Factor identification for actionable advice
        risk_factors = []
        positive_factors = []

        if row.get('absences', 0) > 10:
            risk_factors.append(f"High absenteeism ({int(row['absences'])} recorded absences)")
        elif row.get('absences', 0) <= 2:
            positive_factors.append("Consistent school attendance")

        if row.get('studytime', 2) >= 3:
            positive_factors.append("Strong weekly study commitment (5+ hours)")
        elif row.get('studytime', 2) <= 1:
            risk_factors.append("Low weekly study time (< 2 hours)")

        if row.get('failures', 0) > 0:
            risk_factors.append(f"{int(row['failures'])} past course failures")

        if row.get('higher') == 'yes':
            positive_factors.append("Strong motivation for higher education")

        if mode == 'historical':
            g1_val = row.get('G1', 10)
            g2_val = row.get('G2', 10)
            if g2_val >= 14:
                positive_factors.append("Above average Mid-term Examination mark (G2)")
            elif g2_val < 10:
                risk_factors.append("Sub-passing Mid-term Assessment mark (G2 < 10)")

        return {
            "mode": mode,
            "scale": scale,
            "predicted_score_raw": score_20,
            "predicted_score_100": score_100,
            "display_score": display_score,
            "display_scale": f"0-{scale}",
            "grade_letter": letter_grade,
            "performance_category": category,
            "confidence_lower": conf_lower,
            "confidence_upper": conf_upper,
            "model_name": metrics.get("best_model", "Trained Regressor"),
            "model_version": "1.0.0",
            "uncertainty_disclaimer": (
                "Educational Advisory Notice: This marks prediction is a statistical estimate based on "
                "the historical correlation patterns of the trained machine learning pipeline. It is intended "
                "for proactive mentoring and academic support, not as an absolute guarantee of final outcomes."
            ),
            "risk_factors": risk_factors,
            "positive_factors": positive_factors,
            "input_summary": row
        }

predictor = StudentPredictor()
