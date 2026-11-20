# EduPredict AI — Student Marks Prediction System
> **Predict Performance. Improve Learning.**  
> A college-level, end-to-end Machine Learning web application that predicts students' final examination marks using supervised regression, cross-validation, a FastAPI backend, and an interactive React dashboard.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4+-F7931E.svg?logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-06B6D4.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white)](https://python.org)

---

## 1. Project Overview
EduPredict AI is a full-stack educational data mining system designed to forecast secondary school students' final marks ($G_3$) to facilitate proactive academic advisory interventions. 

Unlike toy demonstrations or mock dashboards, EduPredict AI features:
- A genuine **scikit-learn supervised regression pipeline** comparing 4 algorithms.
- **Leak-free preprocessing** using scikit-learn `Pipeline` and `ColumnTransformer`.
- **5-Fold Cross-Validation** on training data only to prevent data leakage.
- **Two prediction modes**:
  - **Mode A (Historical Performance Mode):** Uses prior period grades ($G_1, G_2$) + habits ($\text{Test } R^2 = 0.761$, $\text{Test MAE} = 1.017/20$).
  - **Mode B (Early Intervention Mode):** Pre-exam forecast using study habits, attendance, and demographics without $G_1/G_2$.
- **FastAPI backend** with Pydantic validation, SQLite database persistence, and OpenAPI Swagger documentation.
- **Modern React SaaS interface** with scale selection ($0\text{--}100\%$ or $0\text{--}20$), dynamic Recharts graphs, CSV export, and PDF generation.

---

## 2. Problem Statement & Objectives
- **Problem Statement:** Academic struggles are frequently identified only after final exams have concluded, eliminating opportunities for remedial tutoring, study coaching, or attendance counseling.
- **Objectives:**
  1. Build a scientifically rigorous regression model to forecast final student marks.
  2. Implement an automated data preprocessing pipeline preventing data leakage.
  3. Deploy a production-quality, low-latency REST API with SQLite storage.
  4. Provide an intuitive dashboard for educators to monitor cohorts and download reports.

---

## 3. System Architecture
```
┌────────────────────────────────────────────────────────┐
│             React 18 + Vite Frontend Client            │
│  (Tailwind CSS, Lucide Icons, Recharts Analytics)      │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (Fetch API)
                            ▼
┌────────────────────────────────────────────────────────┐
│               FastAPI Python 3.11 Backend              │
│      (Pydantic Validation, CORS, Lifespan Handler)     │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌───────────────────────────┐  ┌─────────────────────────┐
│     SQLite Database       │  │ scikit-learn Pipeline   │
│ (Prediction History Logs) │  │  (Serialized Artifacts) │
└───────────────────────────┘  └─────────────────────────┘
```

---

## 4. Dataset Details & Attribution
- **Source:** UCI Machine Learning Repository — *Student Performance Dataset* (Cortez & Silva, 2008).
- **Cohort:** Secondary education students enrolled in Portuguese language classes ($N = 649$ instances, 33 attributes).
- **Target Variable ($G_3$):** Final examination grade evaluated on the standard Portuguese $0\text{--}20$ scale.
- **Attribution Citation:**
  > Cortez, P., & Silva, A. (2008). *Using data mining to predict secondary school student performance*. In Proceedings of 5th Annual Future Business Technology Conference (FUBUTEC 2008), pp. 5–12.

---

## 5. Machine Learning Methodology

### 5.1 Preprocessing Pipeline
- **Numerical Features (13 attributes):** Median imputation via `SimpleImputer(strategy='median')` followed by z-score standardization via `StandardScaler()`.
- **Categorical Features (17 attributes):** Most frequent imputation via `SimpleImputer(strategy='most_frequent')` followed by `OneHotEncoder(handle_unknown='ignore')`.
- **Target Scaling:** Model fitting occurs strictly on the native $0\text{--}20$ scale to maintain evaluation integrity. The frontend interface converts scores to $0\text{--}100\%$ using:
  $$\text{Score}_{100} = \left( \frac{\text{Score}_{20}}{20.0} \right) \times 100.0$$

### 5.2 Benchmark Results (Mode A: Historical Performance)
| Model | 5-Fold CV MAE | CV MAE Std | CV $R^2$ Mean | Test MAE | Test RMSE | Test $R^2$ | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Dummy Regressor** | 2.126 | 0.174 | -0.015 | 2.051 | 2.551 | -0.002 | Baseline |
| **Linear Regression** | 1.139 | 0.111 | 0.698 | 1.054 | 1.341 | 0.723 | Evaluated |
| **Random Forest** | 1.096 | 0.125 | 0.721 | 1.062 | 1.332 | 0.727 | Evaluated |
| **Gradient Boosting** | **1.045** | **0.119** | **0.742** | **1.017** | **1.246** | **0.761** | **Selected** |

*Note on $R^2$:* $R^2$ is the coefficient of determination (variance explained), **not** classification accuracy. An $R^2$ of 0.761 indicates that 76.1% of the total variance in final student marks is accounted for by the trained model.

---

## 6. Installation & Environment Setup

### Prerequisites
- Python 3.11 or compatible installed and on PATH
- Node.js v18+ and npm installed and on PATH

### Quick Launch (Windows)
Double-click `run.bat` in the project root directory, or execute in PowerShell:
```powershell
.\run.bat
```
The script will automatically:
1. Verify Python and Node runtimes.
2. Create `venv` if missing and install all dependencies.
3. Train ML models and generate artifacts if missing.
4. Launch both Backend (FastAPI) and Frontend (Vite) in separate terminals.

### Manual Setup Step-by-Step

#### 1. Backend Setup & Training
```powershell
# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install Python requirements
pip install -r backend\requirements.txt

# Run ML Training Pipeline
python -m backend.ml.train

# Run automated test suite
python -m pytest backend\tests -v
```

#### 2. Frontend Setup & Build
```powershell
cd frontend
npm install
npm run build
```

#### 3. Start Development Servers
**Terminal 1 (Backend):**
```powershell
.\venv\Scripts\activate
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm run dev
```

- Frontend Application: [http://localhost:5173](http://localhost:5173)
- Backend Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 7. Backend API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and readiness check |
| `GET` | `/api/model-info` | Metadata, hyperparameters, and feature schemas |
| `GET` | `/api/metrics` | Summary KPIs and model evaluation benchmarks |
| `POST` | `/api/predict` | Executes real-time prediction and saves to SQLite |
| `GET` | `/api/predictions` | Paginated prediction history with search/filter |
| `GET` | `/api/predictions/{id}` | Retrieves specific prediction record by ID |
| `DELETE`| `/api/predictions/{id}` | Permanently deletes prediction record from database |
| `GET` | `/api/dataset/info` | Raw dataset schema, preview, and distribution |
| `POST` | `/api/dataset/validate` | Validates uploaded custom CSV files |
| `GET` | `/api/predictions/export/csv` | Streams prediction history as CSV download |
| `GET` | `/api/predictions/export/pdf` | Generates formatted printable PDF report |

---

## 8. Application Pages & Screenshots
The frontend features 7 dedicated pages:
1. **Dashboard:** Aggregate KPI cards, actual vs. predicted scatter plot, grade distribution histogram, and recent predictions table.
2. **Predict Marks:** Validated prediction form with preset profiles (High, Average, At-Risk), scale toggle ($0\text{--}100\%$ vs $0\text{--}20$), and detailed output card with confidence interval and advisory factors.
3. **Student Records:** Paginated history table stored in SQLite with search, mode filtering, detail view modal, and delete confirmation.
4. **Model Performance:** Side-by-side benchmark comparison table, actual vs. predicted plot, residual plot, and feature importance bar chart.
5. **Dataset Management:** UCI dataset statistics, 33-column schema documentation, preview table, and drag-and-drop CSV validation tool.
6. **Reports & Export:** Executive summary view with direct links to download CSV and PDF reports.
7. **About Project:** Architecture documentation, algorithm summaries, and college submission guidelines.

> **To capture real screenshots for college submissions:**  
> Start the application (`.\run.bat`), open [http://localhost:5173](http://localhost:5173), and take screenshots of each of the 7 pages. Save them into `docs/screenshots/` and embed them in your final report.

---

## 9. Limitations & Future Scope
- **Domain Specificity:** The model is calibrated to the Portuguese secondary educational structure; cross-institutional transfer requires retraining.
- **Tabular Scope:** Evaluates structured student traits; does not process unstructured text (essays, mentor interview notes).
- **Future Improvements:** Integration with LMS platforms (Canvas, Blackboard), semester-over-semester time series tracking, and automated counselor email alerts.

---

## 10. College Submission Guide & Git Publication
To publish your project to GitHub:
```bash
git init
git add .
git commit -m "feat: complete EduPredict AI marks prediction system"
git branch -M main
git remote add origin https://github.com/<your-username>/edupredict-ai.git
git push -u origin main
```
*Note: Large virtual environment folders (`venv`), caches (`.tmp`), and dependencies (`node_modules`) are already configured in `.gitignore`.*
