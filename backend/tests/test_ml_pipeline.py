import pytest
import os
import pandas as pd
from backend.ml.preprocessing import (
    convert_scale_to_100,
    convert_scale_to_20,
    get_performance_category,
    build_preprocessor,
    validate_and_clean_df,
    get_feature_lists
)
from backend.ml.predict import predictor, StudentPredictor
from backend.ml.dataset_loader import load_or_prepare_dataset

def test_scale_conversions():
    # 0/20 -> 0/100
    assert convert_scale_to_100(0.0) == 0.0
    # 20/20 -> 100/100
    assert convert_scale_to_100(20.0) == 100.0
    # 10/20 -> 50/100
    assert convert_scale_to_100(10.0) == 50.0
    # 15/20 -> 75/100
    assert convert_scale_to_100(15.0) == 75.0

    # Reverse 100 -> 20
    assert convert_scale_to_20(100.0) == 20.0
    assert convert_scale_to_20(50.0) == 10.0
    assert convert_scale_to_20(0.0) == 0.0

def test_performance_categories():
    cat, grade = get_performance_category(85.0, scale='100')
    assert cat == 'Distinction'
    assert grade in ['A+', 'A']

    cat, grade = get_performance_category(65.0, scale='100')
    assert cat == 'First Class'
    assert grade == 'B'

    cat, grade = get_performance_category(52.0, scale='100')
    assert cat == 'Second Class'
    assert grade == 'C'

    cat, grade = get_performance_category(42.0, scale='100')
    assert cat == 'Pass'
    assert grade == 'D'

    cat, grade = get_performance_category(35.0, scale='100')
    assert cat == 'At Risk / Fail'
    assert grade == 'F'

def test_dataset_loading_and_shape():
    df = load_or_prepare_dataset()
    assert isinstance(df, pd.DataFrame)
    assert df.shape[0] >= 300
    assert 'G3' in df.columns
    assert 'studytime' in df.columns
    assert 'absences' in df.columns

def test_historical_prediction():
    sample_input = {
        "mode": "historical",
        "scale": "100",
        "studytime": 3,
        "absences": 2,
        "failures": 0,
        "G1": 15,
        "G2": 16,
        "higher": "yes",
        "age": 17,
        "sex": "F",
        "school": "GP"
    }
    result = predictor.predict(sample_input)
    assert "predicted_score_100" in result
    assert 0.0 <= result["predicted_score_100"] <= 100.0
    assert 0.0 <= result["predicted_score_raw"] <= 20.0
    assert result["performance_category"] in ['Distinction', 'First Class', 'Second Class', 'Pass', 'At Risk / Fail']
    assert len(result["positive_factors"]) > 0

def test_early_prediction():
    sample_input = {
        "mode": "early",
        "scale": "100",
        "studytime": 2,
        "absences": 12,
        "failures": 1,
        "higher": "no",
        "age": 18,
        "sex": "M",
        "school": "MS"
    }
    result = predictor.predict(sample_input)
    assert "predicted_score_100" in result
    assert 0.0 <= result["predicted_score_100"] <= 100.0
    assert result["mode"] == "early"
    assert len(result["risk_factors"]) > 0

def test_missing_artifacts_detection():
    # Test that predictor handles non-existent artifact path cleanly
    bogus_predictor = StudentPredictor(artifacts_dir="/tmp/non_existent_artifacts_dir_xyz")
    assert bogus_predictor.is_ready('historical') is False
