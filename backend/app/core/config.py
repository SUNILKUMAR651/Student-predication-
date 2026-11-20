import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "EduPredict AI — Student Marks Prediction System"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ]
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    ARTIFACTS_DIR: str = os.path.join(BASE_DIR, "artifacts")
    DB_PATH: str = os.path.join(BASE_DIR, "edupredict.db")

settings = Settings()
