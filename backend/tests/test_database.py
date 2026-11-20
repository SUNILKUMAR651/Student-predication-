import pytest
import os
from backend.app.database.database import init_db, get_db_connection
from backend.app.services.prediction_service import prediction_service

def test_database_initialization():
    init_db()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='predictions'")
        table = cursor.fetchone()
        assert table is not None
        assert table['name'] == 'predictions'

def test_prediction_crud():
    sample_request = {
        "student_name": "DB Test Student",
        "student_id": "DB999",
        "mode": "historical",
        "scale": "100",
        "studytime": 2,
        "absences": 3,
        "failures": 0,
        "G1": 13,
        "G2": 14
    }
    created = prediction_service.create_prediction(sample_request)
    assert created["id"] is not None
    assert created["student_name"] == "DB Test Student"

    # Query
    fetched = prediction_service.get_prediction_by_id(created["id"])
    assert fetched is not None
    assert fetched["student_id"] == "DB999"

    # Delete
    del_ok = prediction_service.delete_prediction(created["id"])
    assert del_ok is True

    # Re-query
    assert prediction_service.get_prediction_by_id(created["id"]) is None
