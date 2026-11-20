# EduPredict AI — College Presentation Outline (22 Slides)

## Slide 1: Title Slide
- **Project Title:** EduPredict AI — Student Final Marks Prediction System
- **Subtitle:** Machine Learning Powered Academic Advisory and Early-Intervention Platform
- **Project Category:** Final Year Capstone Project / Educational Data Mining (EDM)
- **Technology Stack:** React 18, Vite, TypeScript, Tailwind CSS, FastAPI, Python 3.11, scikit-learn, SQLite
- **Presenter Information:** Student Name, Roll Number, Department of Computer Science & Engineering
- **Faculty Guide:** Advisor Name & Department

---

## Slide 2: Problem Statement
- **Educational Context:** Academic underperformance is often discovered only when end-of-semester exam grades are published.
- **The Core Issue:** By the time final grades are released, opportunities for remedial tutoring, counseling, and attendance intervention have passed.
- **Current Limitation:** Traditional evaluation is reactive, relying on subjective impressions rather than empirical predictive analytics.

---

## Slide 3: Motivation
- **Proactive Academic Support:** Enabling faculty mentors to detect struggling students months before exams.
- **Resource Optimization:** Directing tutoring and institutional resources where the measurable need is highest.
- **Data-Driven Retention:** Improving course pass rates, reducing dropout rates, and supporting at-risk demographics.

---

## Slide 4: Project Objectives
- Build a genuine, fully functioning end-to-end Machine Learning web application (not a static prototype).
- Train, validate, and compare four supervised regression algorithms against standard benchmarks.
- Implement two distinct prediction operational modes: Mode A (Historical Performance) and Mode B (Early Prediction).
- Provide a clean, accessible SaaS analytics dashboard with real-time inference, SQLite persistence, and PDF report export.

---

## Slide 5: Existing System & Literature
- **Manual Assessment:** Teacher guesswork and end-of-term score compilation.
- **Spreadsheet Tracking:** Static Excel sheets lacking statistical correlation or multi-factor weighting.
- **Limitations:** No predictive capability, no confidence bounds, high human effort, and failure to model non-linear socio-academic interactions.

---

## Slide 6: Proposed System — EduPredict AI
- **Automated ML Pipeline:** End-to-end data pipeline from raw demographic and attendance inputs to validated score predictions.
- **Dual Prediction Paradigms:** Immediate early-semester screening and high-accuracy mid-term examination forecasts.
- **Full-Stack SaaS Platform:** Modern React + Tailwind interface backed by a high-throughput FastAPI REST server and SQLite database.

---

## Slide 7: Dataset Overview & Provenance
- **Dataset:** UCI Machine Learning Repository — Student Performance Dataset (Cortez & Silva, 2008).
- **Domain:** Secondary Education Portuguese Language Course.
- **Dimensions:** 649 authentic student observations, 33 attributes.
- **Target Variable ($G_3$):** Final examination score evaluated on the standard Portuguese $0\text{--}20$ scale.

---

## Slide 8: Feature Breakdown & Categorization
- **Academic Factors:** Weekly study time ($1\text{--}4$), past class failures ($0\text{--}4$), school absences ($0\text{--}93$).
- **Examination Marks:** First period grade ($G_1$), second period grade ($G_2$).
- **Socio-Demographic Indicators:** Parental education level (`Medu`, `Fedu`), parental cohabitation status (`Pstatus`), address (`Urban`/`Rural`).
- **Support & Lifestyle:** Extra school support (`schoolsup`), paid tutoring (`paid`), desire for higher education (`higher`), internet access (`internet`), alcohol consumption (`Dalc`, `Walc`).

---

## Slide 9: Data Preprocessing & Leakage Prevention
- **Leakage Prevention:** 80/20 train/test split executed prior to any scaling or feature transformations.
- **ColumnTransformer Pipelines:**
  - *Numeric Features:* Median Imputer followed by `StandardScaler`.
  - *Categorical Features:* Most Frequent Imputer followed by `OneHotEncoder(handle_unknown='ignore')`.
- **Reproducibility:** Seeded random states (`seed=42`) ensuring identical artifact generation.

---

## Slide 10: Machine Learning Pipeline Workflow
```
Raw Dataset (CSV) 
       │
       ▼
Data Cleaning & Range Validation 
       │
       ▼
80/20 Isolated Train/Test Partitioning
       │
       ▼
5-Fold Cross-Validation on Training Split (Tuning & Scoring)
       │
       ▼
Model Selection (Minimum CV MAE Criterion)
       │
       ▼
Final Evaluation on Unseen 20% Holdout Test Split
       │
       ▼
joblib Serialization (.joblib + .json metadata)
```

---

## Slide 11: Evaluated Regression Algorithms
1. **Dummy Regressor (Baseline):** Predicts training mean; establishes empirical baseline ($R^2 = 0$).
2. **Linear Regression:** Ordinary least squares modeling linear feature relationships.
3. **Random Forest Regressor:** Non-linear ensemble of 100 decision trees mitigating variance.
4. **Gradient Boosting Regressor:** Sequential boosting optimizing residual squared errors.

---

## Slide 12: System Architecture
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

## Slide 13: Frontend Design & UI/UX
- **Design Philosophy:** Professional SaaS dashboard with Royal Blue (`#2563eb`) and Cyan (`#06b6d4`) accents.
- **Interactive Pages:** Dashboard, Predict Marks, Student Records, Model Performance, Dataset Management, Reports, About.
- **Accessibility & Responsiveness:** Fully responsive across mobile, tablet, and widescreen desktop layouts.

---

## Slide 14: Backend Architecture & REST API
- **Framework:** FastAPI running on high-speed Uvicorn ASGI server.
- **Validated Endpoints:**
  - `GET /api/health` & `GET /api/model-info`
  - `GET /api/metrics`
  - `POST /api/predict`
  - `GET /api/predictions` & `DELETE /api/predictions/{id}`
  - `POST /api/dataset/validate`
  - `GET /api/predictions/export/csv` & `GET /api/predictions/export/pdf`
- **Documentation:** Interactive OpenAPI Swagger UI auto-served at `/docs`.

---

## Slide 15: Interactive Prediction Process
1. User enters student information, study habits, and optional prior exam marks.
2. Client sends typed JSON payload to `POST /api/predict`.
3. Backend validates schema via Pydantic; preprocessor normalizes inputs.
4. Active regression model computes predicted score on $0\text{--}20$ scale.
5. Scale conversion computes corresponding $0\text{--}100\%$ score and letter grade.
6. Confidence intervals ($\pm 1.28 \times \text{RMSE}$) and qualitative risk factors are tagged.
7. Record is saved to SQLite; structured response is rendered in real time.

---

## Slide 16: Evaluation Metrics Explained
- **Mean Absolute Error (MAE):** Average magnitude of prediction errors in actual grade units ($0\text{--}20$).
- **Root Mean Squared Error (RMSE):** Penalizes larger outlier prediction errors.
- **Coefficient of Determination ($R^2$):** Proportion of variance in exam marks explained by input attributes.
- **Clarification:** $R^2$ is not classification accuracy; an $R^2$ of 0.761 means 76.1% of score variation is captured.

---

## Slide 17: Experimental Results & Benchmarks
### Mode A: Historical Performance Mode (with $G_1, G_2$)
| Model | 5-Fold CV MAE | Test MAE | Test RMSE | Test $R^2$ | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Dummy Regressor | 2.126 | 2.051 | 2.551 | -0.002 | Baseline |
| Linear Regression | 1.139 | 1.054 | 1.341 | 0.723 | Evaluated |
| Random Forest | 1.096 | 1.062 | 1.332 | 0.727 | Evaluated |
| **Gradient Boosting** | **1.045** | **1.017** | **1.246** | **0.761** | **Selected** |

### Mode B: Early Intervention Mode (Pre-Exam)
- **Selected Model:** Random Forest Regressor
- **Test MAE:** 2.006 (on $0\text{--}20$ scale)
- **Finding:** Honest reflection of high real-world variance before exams occur.

---

## Slide 18: Dashboard & User Interface Tour
- **KPI Cards:** Total evaluations, cohort average, pass rate %, at-risk student count.
- **Interactive Visualizations:**
  - Actual vs. Predicted scatter plot demonstrating regression alignment.
  - Grade category distribution histogram.
  - Feature importance horizontal bar chart.
- **Prediction Card:** Visual score readout, letter grade badge, 80% CI range, and actionable advisory bullets.

---

## Slide 19: Testing & Quality Assurance
- **Unit & Integration Tests:** 15 automated pytest test cases covering ML pipelines, data cleaning, API endpoints, and database CRUD.
- **Result:** $100\%$ test pass rate (15/15 passed).
- **Frontend Build:** Strict TypeScript compilation (`tsc && vite build`) passed with zero type errors.

---

## Slide 20: System Limitations
- **Dataset Specificity:** Calibrated to secondary education Portuguese curriculum; cross-domain transfer requires retraining.
- **Tabular Scope:** Does not process unstructured essay text or qualitative teacher notes.
- **Point Estimation:** While confidence intervals are provided, exact human test performance can fluctuate due to health or stress.

---

## Slide 21: Future Scope & Enhancements
- Integration with Learning Management Systems (Canvas, Blackboard, Moodle).
- Support for time-series attendance tracking and semester-over-semester progress.
- Deep Learning tabular architectures (TabNet / FT-Transformer) for larger institutional datasets ($N > 50,000$).
- Automated SMS/Email alerting for counselors when high-risk thresholds are crossed.

---

## Slide 22: Conclusion & References
### Summary
EduPredict AI demonstrates a production-quality, scientifically sound machine learning application for education analytics. By pairing rigorous regression modeling with an accessible web interface, the system transforms historical student data into proactive academic advisory guidance.

### Key References
1. Cortez, P., & Silva, A. (2008). *Using data mining to predict secondary school student performance*. FUBUTEC 2008.
2. Pedregosa, F., et al. (2011). *Scikit-learn: Machine Learning in Python*. JMLR.
3. Tiangolo, S. (2024). *FastAPI Documentation & High Performance Async Architecture*.
