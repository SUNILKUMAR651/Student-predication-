"""
Pydantic schemas for request validation and response models in EduPredict AI.
"""

from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field, field_validator

class StudentPredictRequest(BaseModel):
    student_name: Optional[str] = Field(None, max_length=100, description="Optional student name or nickname")
    student_id: Optional[str] = Field(None, max_length=50, description="Optional student identifier / roll number")
    mode: Literal['historical', 'early'] = Field('historical', description="Prediction mode: historical (with G1/G2) or early (pre-exam)")
    scale: Literal['100', '20'] = Field('100', description="Display scale: 100 or 20")

    # Core academic & behavioral inputs
    studytime: int = Field(2, ge=1, le=4, description="Weekly study time (1: <2h, 2: 2-5h, 3: 5-10h, 4: >10h)")
    absences: int = Field(4, ge=0, le=93, description="Number of school absences")
    failures: int = Field(0, ge=0, le=4, description="Number of past class failures")

    # Historical grades (Mode A)
    G1: Optional[float] = Field(None, ge=0.0, le=100.0, description="First period grade")
    G2: Optional[float] = Field(None, ge=0.0, le=100.0, description="Second period grade")

    # Demographics
    age: int = Field(17, ge=15, le=22, description="Student age in years")
    sex: Literal['F', 'M'] = Field('F', description="Student sex")
    school: Literal['GP', 'MS'] = Field('GP', description="School code")
    address: Literal['U', 'R'] = Field('U', description="Home address type: U (urban) or R (rural)")
    famsize: Literal['LE3', 'GT3'] = Field('GT3', description="Family size")
    Pstatus: Literal['T', 'A'] = Field('T', description="Parent cohabitation status: T (together), A (apart)")

    # Family & Education
    Medu: int = Field(2, ge=0, le=4, description="Mother education level (0-4)")
    Fedu: int = Field(2, ge=0, le=4, description="Father education level (0-4)")
    Mjob: Literal['teacher', 'health', 'services', 'at_home', 'other'] = Field('other', description="Mother's job")
    Fjob: Literal['teacher', 'health', 'services', 'at_home', 'other'] = Field('other', description="Father's job")
    reason: Literal['home', 'reputation', 'course', 'other'] = Field('course', description="Reason to choose school")
    guardian: Literal['mother', 'father', 'other'] = Field('mother', description="Student guardian")
    traveltime: int = Field(1, ge=1, le=4, description="Home to school travel time (1-4)")

    # Support & Lifestyle
    schoolsup: Literal['yes', 'no'] = Field('no', description="Extra educational support")
    famsup: Literal['yes', 'no'] = Field('yes', description="Family educational support")
    paid: Literal['yes', 'no'] = Field('no', description="Extra paid classes")
    activities: Literal['yes', 'no'] = Field('yes', description="Extra-curricular activities")
    nursery: Literal['yes', 'no'] = Field('yes', description="Attended nursery school")
    higher: Literal['yes', 'no'] = Field('yes', description="Wants to pursue higher education")
    internet: Literal['yes', 'no'] = Field('yes', description="Internet access at home")
    romantic: Literal['yes', 'no'] = Field('no', description="In a romantic relationship")

    # Wellbeing & Social
    famrel: int = Field(4, ge=1, le=5, description="Quality of family relationships (1-5)")
    freetime: int = Field(3, ge=1, le=5, description="Free time after school (1-5)")
    goout: int = Field(3, ge=1, le=5, description="Going out with friends (1-5)")
    Dalc: int = Field(1, ge=1, le=5, description="Workday alcohol consumption (1-5)")
    Walc: int = Field(1, ge=1, le=5, description="Weekend alcohol consumption (1-5)")
    health: int = Field(4, ge=1, le=5, description="Current health status (1-5)")

    @field_validator('G1', 'G2')
    @classmethod
    def validate_historical_grades(cls, v, info):
        # In historical mode, grades will be defaulted if omitted
        return v

class PredictionResponse(BaseModel):
    id: Optional[int] = None
    student_name: Optional[str] = None
    student_id: Optional[str] = None
    mode: str
    scale: str
    predicted_score_raw: float
    predicted_score_100: float
    display_score: float
    display_scale: str
    grade_letter: str
    performance_category: str
    confidence_lower: float
    confidence_upper: float
    model_name: str
    model_version: str
    uncertainty_disclaimer: str
    created_at: Optional[str] = None
    risk_factors: List[str]
    positive_factors: List[str]
    input_summary: Dict[str, Any]

class PredictionListResponse(BaseModel):
    items: List[PredictionResponse]
    total: int
    page: int
    pages: int

class ModelInfoResponse(BaseModel):
    status: str
    historical_model: Optional[Dict[str, Any]]
    early_model: Optional[Dict[str, Any]]
    artifacts_ready: bool

class HealthResponse(BaseModel):
    status: str
    version: str
    artifacts_ready: bool
    database_ready: bool
