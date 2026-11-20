"""
Prediction service for EduPredict AI.
Coordinates inference execution, dual database persistence (SQLite + Cloud Firestore),
and history queries.
"""

import json
import sqlite3
from typing import Dict, Any, List, Optional
import os

from backend.ml.predict import predictor
from backend.app.database.database import get_db_connection, init_db
from backend.app.database.firebase_db import firebase_manager
from backend.app.core.config import settings

class PredictionService:
    def __init__(self):
        init_db()
        # Initialize Firebase if credentials exist
        firebase_manager.initialize()

    def create_prediction(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Run ML prediction and persist record in SQLite and Cloud Firestore (if connected)."""
        result = predictor.predict(request_data)
        
        # Attach student metadata
        student_name = request_data.get('student_name') or 'Anonymous Student'
        student_id = request_data.get('student_id') or 'N/A'
        result['student_name'] = student_name
        result['student_id'] = student_id

        # 1. Save to SQLite database
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO predictions (
                    student_name, student_id, mode, scale,
                    predicted_score_raw, predicted_score_100, display_score, display_scale,
                    grade_letter, performance_category, confidence_lower, confidence_upper,
                    model_name, model_version, inputs_json, risk_factors_json,
                    positive_factors_json, uncertainty_disclaimer
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                student_name,
                student_id,
                result['mode'],
                result['scale'],
                result['predicted_score_raw'],
                result['predicted_score_100'],
                result['display_score'],
                result['display_scale'],
                result['grade_letter'],
                result['performance_category'],
                result['confidence_lower'],
                result['confidence_upper'],
                result['model_name'],
                result['model_version'],
                json.dumps(result['input_summary']),
                json.dumps(result['risk_factors']),
                json.dumps(result['positive_factors']),
                result['uncertainty_disclaimer']
            ))
            conn.commit()
            record_id = cursor.lastrowid
            result['id'] = record_id

            # Retrieve created timestamp
            cursor.execute("SELECT created_at FROM predictions WHERE id = ?", (record_id,))
            row = cursor.fetchone()
            if row:
                result['created_at'] = str(row['created_at'])

        # 2. Dual-mode sync to Google Cloud Firestore (Firebase)
        try:
            firestore_id = firebase_manager.save_prediction(result)
            if firestore_id:
                result['firestore_id'] = firestore_id
        except Exception as e:
            print(f"[Warning] Firebase sync skipped: {e}")

        return result

    def get_predictions(
        self, search: Optional[str] = None, mode: Optional[str] = None, page: int = 1, limit: int = 10
    ) -> Dict[str, Any]:
        """Fetch paginated prediction records with filtering."""
        offset = (page - 1) * limit
        where_clauses = []
        params = []

        if search:
            where_clauses.append("(student_name LIKE ? OR student_id LIKE ?)")
            params.extend([f"%{search}%", f"%{search}%"])

        if mode and mode in ['historical', 'early']:
            where_clauses.append("mode = ?")
            params.append(mode)

        where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

        with get_db_connection() as conn:
            cursor = conn.cursor()
            # Count total
            cursor.execute(f"SELECT COUNT(*) as count FROM predictions {where_sql}", params)
            total = cursor.fetchone()['count']

            # Fetch page
            query = f"""
                SELECT * FROM predictions 
                {where_sql} 
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?
            """
            cursor.execute(query, params + [limit, offset])
            rows = cursor.fetchall()

            items = []
            for r in rows:
                items.append({
                    "id": r['id'],
                    "student_name": r['student_name'],
                    "student_id": r['student_id'],
                    "mode": r['mode'],
                    "scale": r['scale'],
                    "predicted_score_raw": r['predicted_score_raw'],
                    "predicted_score_100": r['predicted_score_100'],
                    "display_score": r['display_score'],
                    "display_scale": r['display_scale'],
                    "grade_letter": r['grade_letter'],
                    "performance_category": r['performance_category'],
                    "confidence_lower": r['confidence_lower'],
                    "confidence_upper": r['confidence_upper'],
                    "model_name": r['model_name'],
                    "model_version": r['model_version'],
                    "uncertainty_disclaimer": r['uncertainty_disclaimer'],
                    "created_at": str(r['created_at']),
                    "risk_factors": json.loads(r['risk_factors_json']),
                    "positive_factors": json.loads(r['positive_factors_json']),
                    "input_summary": json.loads(r['inputs_json'])
                })

        pages = (total + limit - 1) // limit if total > 0 else 1
        return {
            "items": items,
            "total": total,
            "page": page,
            "pages": pages,
            "firebase_status": firebase_manager.get_status()
        }

    def get_prediction_by_id(self, prediction_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve single prediction record by primary key."""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM predictions WHERE id = ?", (prediction_id,))
            r = cursor.fetchone()
            if not r:
                return None
            return {
                "id": r['id'],
                "student_name": r['student_name'],
                "student_id": r['student_id'],
                "mode": r['mode'],
                "scale": r['scale'],
                "predicted_score_raw": r['predicted_score_raw'],
                "predicted_score_100": r['predicted_score_100'],
                "display_score": r['display_score'],
                "display_scale": r['display_scale'],
                "grade_letter": r['grade_letter'],
                "performance_category": r['performance_category'],
                "confidence_lower": r['confidence_lower'],
                "confidence_upper": r['confidence_upper'],
                "model_name": r['model_name'],
                "model_version": r['model_version'],
                "uncertainty_disclaimer": r['uncertainty_disclaimer'],
                "created_at": str(r['created_at']),
                "risk_factors": json.loads(r['risk_factors_json']),
                "positive_factors": json.loads(r['positive_factors_json']),
                "input_summary": json.loads(r['inputs_json'])
            }

    def delete_prediction(self, prediction_id: int) -> bool:
        """Delete prediction record from database."""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM predictions WHERE id = ?", (prediction_id,))
            conn.commit()
            return cursor.rowcount > 0

    def get_summary_statistics(self) -> Dict[str, Any]:
        """Compute aggregated prediction statistics for dashboard."""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as count, AVG(predicted_score_100) as avg_score FROM predictions")
            row = cursor.fetchone()
            total_count = row['count'] or 0
            avg_score = round(float(row['avg_score'] or 0.0), 1)

            # Pass rate and at-risk percentages
            cursor.execute("SELECT COUNT(*) as pass_count FROM predictions WHERE predicted_score_100 >= 50.0")
            pass_count = cursor.fetchone()['pass_count'] or 0
            pass_rate = round((pass_count / total_count * 100.0), 1) if total_count > 0 else 0.0

            cursor.execute("SELECT COUNT(*) as risk_count FROM predictions WHERE predicted_score_100 < 50.0")
            risk_count = cursor.fetchone()['risk_count'] or 0
            risk_rate = round((risk_count / total_count * 100.0), 1) if total_count > 0 else 0.0

        return {
            "total_predictions": total_count,
            "average_predicted_score_100": avg_score,
            "pass_rate_percentage": pass_rate,
            "high_risk_percentage": risk_rate,
            "database_provider": firebase_manager.get_status()["provider"],
            "firebase_connected": firebase_manager.is_connected()
        }

    def get_firebase_status(self) -> Dict[str, Any]:
        return firebase_manager.get_status()

    def update_firebase_credentials(self, json_content: str) -> Dict[str, Any]:
        return firebase_manager.set_credentials_json(json_content)

prediction_service = PredictionService()
