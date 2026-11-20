"""
SQLite database configuration and connection handling for EduPredict AI.
Stores prediction history, input records, and academic advisory tags.
"""

import sqlite3
import os
from contextlib import contextmanager
from backend.app.core.config import settings

def get_db_path() -> str:
    return settings.DB_PATH

def init_db():
    """Initialize the SQLite database schema if not already present."""
    db_path = get_db_path()
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_name TEXT,
                student_id TEXT,
                mode TEXT NOT NULL,
                scale TEXT NOT NULL,
                predicted_score_raw REAL NOT NULL,
                predicted_score_100 REAL NOT NULL,
                display_score REAL NOT NULL,
                display_scale TEXT NOT NULL,
                grade_letter TEXT NOT NULL,
                performance_category TEXT NOT NULL,
                confidence_lower REAL NOT NULL,
                confidence_upper REAL NOT NULL,
                model_name TEXT NOT NULL,
                model_version TEXT NOT NULL,
                inputs_json TEXT NOT NULL,
                risk_factors_json TEXT NOT NULL,
                positive_factors_json TEXT NOT NULL,
                uncertainty_disclaimer TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_predictions_created_at 
            ON predictions (created_at DESC)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_predictions_mode 
            ON predictions (mode)
        """)
        conn.commit()

@contextmanager
def get_db_connection():
    """Yield a database connection configured with Row factory."""
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
