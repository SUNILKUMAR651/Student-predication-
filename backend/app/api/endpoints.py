"""
FastAPI REST router for EduPredict AI.
Implements validation, prediction, history query, dataset inspection, and reporting endpoints.
"""

import os
import io
import csv
import json
import pandas as pd
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Response
from fastapi.responses import StreamingResponse

from backend.app.schemas.student import (
    StudentPredictRequest,
    PredictionResponse,
    PredictionListResponse,
    ModelInfoResponse,
    HealthResponse
)
from backend.app.services.prediction_service import prediction_service
from backend.app.core.config import settings
from backend.ml.predict import predictor, ModelArtifactNotFoundError
from backend.ml.preprocessing import (
    HISTORICAL_NUMERIC_FEATURES,
    HISTORICAL_CATEGORICAL_FEATURES,
    TARGET_COLUMN
)
from backend.ml.dataset_loader import load_or_prepare_dataset

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Service health and readiness check."""
    artifacts_ready = predictor.is_ready('historical') and predictor.is_ready('early')
    db_ready = os.path.exists(settings.DB_PATH)
    return {
        "status": "online" if artifacts_ready else "degraded",
        "version": settings.VERSION,
        "artifacts_ready": artifacts_ready,
        "database_ready": db_ready
    }

@router.get("/model-info", response_model=ModelInfoResponse)
async def get_model_info():
    """Retrieve metadata about trained ML models."""
    artifacts_ready = predictor.is_ready('historical') and predictor.is_ready('early')
    
    historical_info = None
    early_info = None

    if predictor.is_ready('historical'):
        with open(os.path.join(settings.ARTIFACTS_DIR, "historical_metrics.json"), "r") as f:
            historical_info = json.load(f)

    if predictor.is_ready('early'):
        with open(os.path.join(settings.ARTIFACTS_DIR, "early_metrics.json"), "r") as f:
            early_info = json.load(f)

    return {
        "status": "ready" if artifacts_ready else "training_required",
        "historical_model": historical_info,
        "early_model": early_info,
        "artifacts_ready": artifacts_ready
    }

@router.get("/metrics")
async def get_metrics():
    """Aggregate dashboard metrics and model evaluation comparison."""
    summary = prediction_service.get_summary_statistics()

    hist_metrics = {}
    early_metrics = {}

    hist_file = os.path.join(settings.ARTIFACTS_DIR, "historical_metrics.json")
    if os.path.exists(hist_file):
        with open(hist_file, "r") as f:
            hist_metrics = json.load(f)

    early_file = os.path.join(settings.ARTIFACTS_DIR, "early_metrics.json")
    if os.path.exists(early_file):
        with open(early_file, "r") as f:
            early_metrics = json.load(f)

    return {
        **summary,
        "historical_evaluation": hist_metrics,
        "early_evaluation": early_metrics
    }

@router.post("/predict", response_model=PredictionResponse)
async def predict_marks(request: StudentPredictRequest):
    """
    Generate student exam marks prediction using trained supervised regression pipeline.
    Validates inputs, executes inference, and records result to SQLite database.
    """
    try:
        data = request.model_dump()
        result = prediction_service.create_prediction(data)
        return result
    except ModelArtifactNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Inference error: {str(e)}")

@router.get("/predictions", response_model=PredictionListResponse)
async def list_predictions(
    search: Optional[str] = Query(None, description="Search by student name or ID"),
    mode: Optional[str] = Query(None, description="Filter by historical or early mode"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    """List historical prediction records with pagination and filtering."""
    return prediction_service.get_predictions(search=search, mode=mode, page=page, limit=limit)

@router.get("/predictions/{prediction_id}", response_model=PredictionResponse)
async def get_prediction_detail(prediction_id: int):
    """Retrieve detailed record for a specific prediction."""
    rec = prediction_service.get_prediction_by_id(prediction_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Prediction record not found")
    return rec

@router.delete("/predictions/{prediction_id}")
async def delete_prediction_record(prediction_id: int):
    """Remove a prediction record from history."""
    deleted = prediction_service.delete_prediction(prediction_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Prediction record not found")
    return {"success": True, "message": f"Prediction record #{prediction_id} deleted successfully"}

@router.get("/dataset/info")
async def get_dataset_info():
    """Return dataset overview, columns, missing values, and preview rows."""
    try:
        df = load_or_prepare_dataset()
        missing_dict = df.isnull().sum().to_dict()
        preview = df.head(8).to_dict(orient='records')
        
        target_series = pd.to_numeric(df[TARGET_COLUMN], errors='coerce').dropna()
        target_stats = {
            "min": float(target_series.min()),
            "max": float(target_series.max()),
            "mean": round(float(target_series.mean()), 2),
            "median": float(target_series.median()),
            "std": round(float(target_series.std()), 2)
        }

        provenance_path = os.path.join(settings.DATA_DIR, "dataset_provenance.json")
        provenance = {}
        if os.path.exists(provenance_path):
            with open(provenance_path, "r") as pf:
                provenance = json.load(pf)

        return {
            "filename": "student-por.csv",
            "source": provenance.get("source_type", "UCI Student Performance Benchmark"),
            "rows_count": int(df.shape[0]),
            "columns_count": int(df.shape[1]),
            "columns": list(df.columns),
            "missing_values": missing_dict,
            "data_preview": preview,
            "target_distribution": target_stats,
            "provenance": provenance
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load dataset: {str(e)}")

@router.post("/dataset/validate")
async def validate_uploaded_dataset(file: UploadFile = File(...)):
    """
    Validate a user-uploaded CSV file for schema compliance, row count,
    missing columns, and missing values. Does not execute user code.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files (.csv) are supported.")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds safe upload limit of 5MB.")

    try:
        # Detect delimiter
        text_preview = content[:2048].decode('utf-8', errors='ignore')
        sep = ';' if ';' in text_preview else ','
        
        df = pd.read_csv(io.BytesIO(content), sep=sep)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid or corrupted CSV format: {str(e)}")

    # Schema checks
    required_cols = set(HISTORICAL_NUMERIC_FEATURES + HISTORICAL_CATEGORICAL_FEATURES)
    present_cols = set(df.columns)
    missing_cols = list(required_cols - present_cols)

    row_count = len(df)
    missing_counts = df.isnull().sum().to_dict()
    total_missing_cells = sum(missing_counts.values())

    is_valid = len(missing_cols) == 0 and row_count > 0

    return {
        "filename": file.filename,
        "is_valid": is_valid,
        "row_count": row_count,
        "column_count": len(df.columns),
        "columns_present": list(df.columns),
        "missing_required_columns": missing_cols,
        "total_missing_values": total_missing_cells,
        "preview_rows": df.head(5).to_dict(orient='records'),
        "message": "Dataset structure is fully compatible with EduPredict AI." if is_valid 
                   else f"Dataset is missing {len(missing_cols)} required columns for full historical mode."
    }

@router.get("/predictions/export/csv")
async def export_predictions_csv():
    """Export prediction history as downloadable CSV."""
    records = prediction_service.get_predictions(limit=10000)['items']
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow([
        "ID", "Student Name", "Student ID", "Mode", "Scale", 
        "Predicted Score (0-20)", "Predicted Score (0-100)", "Display Score",
        "Grade Letter", "Performance Category", "Confidence Lower", "Confidence Upper",
        "Model Name", "Model Version", "Timestamp"
    ])

    for r in records:
        writer.writerow([
            r['id'], r['student_name'], r['student_id'], r['mode'], r['scale'],
            r['predicted_score_raw'], r['predicted_score_100'], r['display_score'],
            r['grade_letter'], r['performance_category'], r['confidence_lower'], r['confidence_upper'],
            r['model_name'], r['model_version'], r['created_at']
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=edupredict_predictions_history.csv"}
    )

@router.get("/predictions/export/pdf")
async def export_predictions_pdf():
    """Generate a clean printable executive PDF report using ReportLab."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        elements = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#1e40af')
        )
        subtitle_style = ParagraphStyle(
            'DocSub',
            parent=styles['Normal'],
            fontSize=11,
            leading=14,
            textColor=colors.HexColor('#475569')
        )

        elements.append(Paragraph("EduPredict AI — Academic Performance Report", title_style))
        elements.append(Paragraph("Predict Performance. Improve Learning. | Generated Evaluation Summary", subtitle_style))
        elements.append(Spacer(1, 16))

        # Model evaluation metrics table
        summary = prediction_service.get_summary_statistics()
        elements.append(Paragraph("<b>System Summary Statistics:</b>", styles['Heading3']))
        stats_data = [
            ["Metric", "Value"],
            ["Total Predictions Logged", str(summary['total_predictions'])],
            ["Average Predicted Mark (0-100)", f"{summary['average_predicted_score_100']}%"],
            ["Pass Rate", f"{summary['pass_rate_percentage']}%"],
            ["Students at Academic Risk", f"{summary['high_risk_percentage']}%"]
        ]
        t1 = Table(stats_data, colWidths=[240, 240])
        t1.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1'))
        ]))
        elements.append(t1)
        elements.append(Spacer(1, 20))

        # Recent 10 predictions
        elements.append(Paragraph("<b>Recent Student Prediction Records:</b>", styles['Heading3']))
        recent_records = prediction_service.get_predictions(limit=10)['items']
        rec_data = [["ID", "Student", "Mode", "Score (100)", "Grade", "Category"]]
        for r in recent_records:
            rec_data.append([
                str(r['id']),
                str(r['student_name'])[:18],
                r['mode'].capitalize(),
                f"{r['predicted_score_100']}%",
                r['grade_letter'],
                r['performance_category']
            ])

        t2 = Table(rec_data, colWidths=[35, 130, 75, 75, 55, 120])
        t2.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0'))
        ]))
        elements.append(t2)
        elements.append(Spacer(1, 24))

        disclaimer_text = (
            "<b>Notice:</b> Predictions are generated by trained machine learning regression models for educational "
            "advisory and early-intervention guidance. They do not constitute an academic certificate or guarantee."
        )
        elements.append(Paragraph(disclaimer_text, styles['Italic']))

        doc.build(elements)
        buffer.seek(0)
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=edupredict_performance_report.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

@router.get("/firebase/status")
async def get_firebase_status():
    """Retrieve Google Cloud Firestore connection status."""
    return prediction_service.get_firebase_status()

@router.post("/firebase/config")
async def configure_firebase(payload: dict):
    """
    Configure Firebase Service Account credentials dynamically.
    Accepts JSON containing 'credentials_json' or raw service account dictionary.
    """
    raw_content = payload.get("credentials_json") or json.dumps(payload)
    res = prediction_service.update_firebase_credentials(raw_content)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message", "Invalid Firebase configuration"))
    return res

@router.post("/database/seed")
async def trigger_seed_database(count: int = Query(35, ge=5, le=100)):
    """Seed the database with authentic student observations from the UCI dataset."""
    from backend.scripts.seed_real_data import seed_database
    seed_database(count)
    return {"success": True, "message": f"Successfully seeded {count} authentic student records into the database."}

