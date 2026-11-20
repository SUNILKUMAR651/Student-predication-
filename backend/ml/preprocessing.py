"""
Data preprocessing, schema definitions, and feature transformation pipelines for EduPredict AI.
Handles both Mode A (Historical Performance with G1/G2) and Mode B (Early Prediction without G1/G2).
"""

from typing import List, Tuple, Dict, Any
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

# Target variable definition
TARGET_COLUMN = 'G3'
ORIGINAL_MIN_SCORE = 0.0
ORIGINAL_MAX_SCORE = 20.0

# Base demographic and behavioral features (present in both modes)
BASE_NUMERIC_FEATURES = [
    'age',
    'Medu',
    'Fedu',
    'traveltime',
    'studytime',
    'failures',
    'famrel',
    'freetime',
    'goout',
    'Dalc',
    'Walc',
    'health',
    'absences'
]

BASE_CATEGORICAL_FEATURES = [
    'school',
    'sex',
    'address',
    'famsize',
    'Pstatus',
    'Mjob',
    'Fjob',
    'reason',
    'guardian',
    'schoolsup',
    'famsup',
    'paid',
    'activities',
    'nursery',
    'higher',
    'internet',
    'romantic'
]

# Mode A adds historical examination grades
HISTORICAL_NUMERIC_FEATURES = BASE_NUMERIC_FEATURES + ['G1', 'G2']
HISTORICAL_CATEGORICAL_FEATURES = BASE_CATEGORICAL_FEATURES.copy()

# Mode B excludes G1 and G2 for early intervention
EARLY_NUMERIC_FEATURES = BASE_NUMERIC_FEATURES.copy()
EARLY_CATEGORICAL_FEATURES = BASE_CATEGORICAL_FEATURES.copy()

# Value validation ranges
FEATURE_RANGES = {
    'age': (15, 22),
    'Medu': (0, 4),
    'Fedu': (0, 4),
    'traveltime': (1, 4),
    'studytime': (1, 4),
    'failures': (0, 4),
    'famrel': (1, 5),
    'freetime': (1, 5),
    'goout': (1, 5),
    'Dalc': (1, 5),
    'Walc': (1, 5),
    'health': (1, 5),
    'absences': (0, 93),
    'G1': (0, 20),
    'G2': (0, 20),
}

def get_feature_lists(mode: str = 'historical') -> Tuple[List[str], List[str]]:
    """Return numeric and categorical feature name lists for specified mode."""
    if mode == 'historical':
        return HISTORICAL_NUMERIC_FEATURES, HISTORICAL_CATEGORICAL_FEATURES
    elif mode == 'early':
        return EARLY_NUMERIC_FEATURES, EARLY_CATEGORICAL_FEATURES
    else:
        raise ValueError(f"Unknown prediction mode: {mode}. Must be 'historical' or 'early'.")

def build_preprocessor(numeric_features: List[str], categorical_features: List[str]) -> ColumnTransformer:
    """
    Construct a scikit-learn ColumnTransformer for numerical scaling and categorical encoding.
    Uses SimpleImputer to prevent failure on missing values and OneHotEncoder with handle_unknown='ignore'.
    """
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ],
        remainder='drop'
    )
    return preprocessor

def convert_scale_to_100(score_20: float) -> float:
    """Convert score from 0-20 scale to 0-100 scale."""
    return float(np.clip(round((score_20 / 20.0) * 100.0, 1), 0.0, 100.0))

def convert_scale_to_20(score_100: float) -> float:
    """Convert score from 0-100 scale to 0-20 scale."""
    return float(np.clip(round((score_100 / 100.0) * 20.0, 1), 0.0, 20.0))

def get_performance_category(score: float, scale: str = '100') -> Tuple[str, str]:
    """
    Map a numeric score to an academic performance classification and letter grade.
    Returns (category_name, letter_grade).
    """
    score_100 = score if scale == '100' else convert_scale_to_100(score)
    
    if score_100 >= 80.0:
        return 'Distinction', 'A+'
    elif score_100 >= 70.0:
        return 'Distinction', 'A'
    elif score_100 >= 60.0:
        return 'First Class', 'B'
    elif score_100 >= 50.0:
        return 'Second Class', 'C'
    elif score_100 >= 40.0:
        return 'Pass', 'D'
    else:
        return 'At Risk / Fail', 'F'

def validate_and_clean_df(df: pd.DataFrame, mode: str = 'historical') -> pd.DataFrame:
    """
    Validate dataset structure, types, and remove unneeded columns or illegal values.
    """
    clean_df = df.copy()
    
    # Strip whitespace from string columns
    str_cols = clean_df.select_dtypes(include=['object']).columns
    for c in str_cols:
        clean_df[c] = clean_df[c].astype(str).str.strip()

    num_cols, cat_cols = get_feature_lists(mode)
    all_needed = num_cols + cat_cols
    if TARGET_COLUMN in clean_df.columns:
        all_needed.append(TARGET_COLUMN)

    # Check for missing required columns
    missing = [c for c in all_needed if c not in clean_df.columns]
    if missing:
        raise ValueError(f"Dataset is missing required columns for {mode} mode: {missing}")

    # Clip numeric columns to valid physical bounds
    for col, (min_v, max_v) in FEATURE_RANGES.items():
        if col in clean_df.columns:
            clean_df[col] = pd.to_numeric(clean_df[col], errors='coerce').fillna(min_v)
            clean_df[col] = clean_df[col].clip(min_v, max_v)

    if TARGET_COLUMN in clean_df.columns:
        clean_df[TARGET_COLUMN] = pd.to_numeric(clean_df[TARGET_COLUMN], errors='coerce').fillna(0)
        clean_df[TARGET_COLUMN] = clean_df[TARGET_COLUMN].clip(ORIGINAL_MIN_SCORE, ORIGINAL_MAX_SCORE)

    return clean_df
