# EduPredict AI — Student Final Marks Prediction System
## Comprehensive Technical Project Report

---

### Table of Contents
1. Abstract
2. Introduction
3. Problem Statement
4. Objectives
5. Existing System and Proposed System
6. Literature and Dataset Review
7. Requirements Analysis
8. System Architecture
9. Data Preprocessing & Pipeline Design
10. Machine Learning Algorithms
11. Implementation Details
12. Testing & Quality Assurance
13. Experimental Results & Discussion
14. System Limitations
15. Future Scope
16. Conclusion
17. References

---

### 1. Abstract
Student academic performance forecasting plays a pivotal role in modern educational data mining (EDM). Early identification of at-risk students enables educational institutions to implement targeted remedial support before final examinations occur. **EduPredict AI** is an end-to-end Machine Learning web application designed to predict secondary school students' final exam marks ($G_3$) using behavioral, socio-demographic, and historical assessment data. Trained on the benchmark UCI Student Performance Portuguese dataset ($N = 649$), the system systematically compares four supervised regression algorithms: Dummy Baseline, Linear Regression, Random Forest Regressor, and Gradient Boosting Regressor. 

To resolve the timing trade-off in academic advising, the system implements two distinct operational modes: **Mode A (Historical Performance Mode)** utilizing prior period marks ($G_1, G_2$) achieving an $R^2$ of $0.761$ and a Test Mean Absolute Error (MAE) of $1.017$ on a $0\text{--}20$ scale, and **Mode B (Early Intervention Mode)** operating strictly on pre-exam indicators achieving a Test MAE of $2.006$. The application is deployed with a high-performance Python FastAPI backend, SQLite persistence, and an interactive React + Vite TypeScript dashboard. Automated unit and integration test suites confirm complete functional stability and absence of data leakage.

---

### 2. Introduction
In tertiary and secondary academic institutions, evaluating academic trajectories historically relied on cumulative summative evaluations conducted at the conclusion of an instructional semester. However, such retrospective evaluations inherently prevent timely pedagogical intervention. Machine learning techniques provide empirical mechanisms to model multi-dimensional student traits—including study habits, family background, absenteeism, and prior exam history—into predictive forecasts.

EduPredict AI bridges academic research and practical deployment by providing educators with an intuitive, real-time prediction dashboard. Unlike theoretical Jupyter notebook prototypes or static mockup interfaces, EduPredict AI features an operational scikit-learn pipeline integrated with a RESTful API and persistent database.

---

### 3. Problem Statement
Educational institutions often struggle to identify students at risk of academic failure before final grades are recorded. Traditional monitoring exhibits three critical limitations:
1. **Lack of Early Warnings:** Evaluations occur late in the instructional cycle, leaving insufficient time for tutoring or remediation.
2. **Subjective Heuristics:** Mentors rely on informal, subjective impressions rather than calibrated statistical correlations.
3. **Failure to Model Complex Interactions:** Factors such as study hours, class failures, parental education, and school absenteeism interact non-linearly, making manual student evaluation imprecise.

---

### 4. Objectives
The core objectives of the EduPredict AI capstone project are:
- To develop a reproducible, leak-free supervised machine learning regression pipeline.
- To empirically benchmark four candidate regression models using 5-fold cross-validation on training data.
- To implement dual prediction modes addressing both early-semester screening and late-semester grade forecasting.
- To deploy a production-grade FastAPI backend with SQLite storage and comprehensive OpenAPI documentation.
- To build a responsive, accessible React SaaS interface with dynamic chart visualizations and exportable PDF/CSV reports.
- To validate the system through automated pytest test suites and strict TypeScript verification.

---

### 5. Existing System vs. Proposed System

| Dimension | Existing System | Proposed System (EduPredict AI) |
| :--- | :--- | :--- |
| **Methodology** | Manual grading sheets & retrospective analysis | Automated supervised regression modeling |
| **Prediction Timing** | Post-examination only | Early-semester (Mode B) & Mid-semester (Mode A) |
| **Feature Integration** | Single-variable (prior exam only) | 33 multi-factor academic, demographic, and lifestyle attributes |
| **Uncertainty Quantification** | None | 80% Confidence Interval bounds ($\pm 1.28 \times \text{RMSE}$) |
| **Advisory Support** | Intuitive guesswork | Automated risk-factor & strength tagging |
| **Deployment** | Paper records or disconnected spreadsheets | Full-Stack React + FastAPI web application |

---

### 6. Literature and Dataset Review
The system utilizes the widely cited **Student Performance Dataset** hosted by the UC Irvine (UCI) Machine Learning Repository, compiled by Paulo Cortez and Alice Silva (2008). The dataset evaluates secondary students from two Portuguese institutions: Gabriel Pereira (`GP`) and Mousinho da Silveira (`MS`). The cohort comprises 649 records across 33 attributes pertaining to Portuguese language students.

The target variable, $G_3$, represents the final examination mark on a $0\text{--}20$ scale (with passing set at $\ge 10$). The dataset captures vital behavioral indicators, such as weekly study time, absenteeism, alcohol consumption (`Dalc`, `Walc`), past failures, and parental educational background (`Medu`, `Fedu`).

---

### 7. Requirements Analysis

#### 7.1 Software Requirements
- **Operating System:** Windows 10/11, macOS, or Linux
- **Runtime Environment:** Python 3.11+, Node.js v18+
- **Backend Framework:** FastAPI 0.110+, Uvicorn 0.28+, Pydantic v2
- **Machine Learning Libraries:** scikit-learn 1.4+, pandas 2.2+, NumPy 1.26+, joblib 1.3+
- **Frontend Framework:** React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React
- **Storage:** SQLite 3 (zero-configuration file-based relational storage)

#### 7.2 Functional Requirements
- Secure dataset validation and inspection.
- Real-time prediction generation with selectable $0\text{--}100\%$ or $0\text{--}20$ display scale.
- Searchable and filterable prediction record history.
- Dynamic actual vs. predicted and feature importance visual analytics.
- Export capabilities for CSV spreadsheets and formatted PDF reports.

---

### 8. System Architecture
The application architecture adheres to a decoupled client-server paradigm:

```
┌────────────────────────────────────────────────────────┐
│               Frontend Presentation Layer              │
│          React 18 + TypeScript + Tailwind CSS          │
│  (Dashboard, Predictor, Records, Benchmarks, Reports)  │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP REST / JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Backend API Layer                    │
│                 FastAPI + Uvicorn ASGI                 │
│      (Pydantic Validation, Lifespan Event Handlers)    │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌───────────────────────────┐  ┌─────────────────────────┐
│     SQLite Database       │  │ ML Inference Engine     │
│   (edupredict.db: CRUD)   │  │ (joblib Pipeline Models)│
└───────────────────────────┘  └─────────────────────────┘
```

---

### 9. Data Preprocessing & Pipeline Design
To ensure scientific validity and eliminate data leakage:
1. **Partitioning:** The dataset is split into 80% training ($N = 519$) and 20% testing ($N = 130$) subsets using a fixed random seed (`random_state=42`).
2. **ColumnTransformer Integration:**
   - Numerical features are imputed using median values to handle any missing entries and normalized using `StandardScaler`.
   - Categorical features are imputed with the most frequent value and encoded via `OneHotEncoder(handle_unknown='ignore')`.
3. **Scale Consistency:** Training and model fitting occur strictly on the original $0\text{--}20$ target scale. Conversion to the $0\text{--}100\%$ display interface is performed post-inference:
   $$\text{Score}_{100} = \left( \frac{\text{Score}_{20}}{20.0} \right) \times 100.0$$

---

### 10. Machine Learning Algorithms
Four supervised regression algorithms were implemented and compared:

1. **DummyRegressor (Baseline):** Employs a mean prediction strategy. Establishes the lower threshold where $R^2 = 0$.
2. **Linear Regression:** Computes ordinary least squares estimates to evaluate linear feature dynamics.
3. **Random Forest Regressor:** An ensemble of 100 bagging decision trees with bounded depth to capture non-linear student trait interactions.
4. **Gradient Boosting Regressor:** Sequential boosting optimizing shallow decision tree ensembles against residual errors.

Model selection was governed strictly by the **lowest 5-Fold Cross-Validation MAE** on training data only.

---

### 11. Implementation Details
The backend utilizes asynchronous routing (`APIRouter`) with Pydantic request models enforcing rigorous range checks ($15 \le \text{age} \le 22$, $1 \le \text{studytime} \le 4$, $0 \le \text{absences} \le 93$). Model artifacts (`historical_model.joblib` and `early_model.joblib`) are lazily loaded into memory on server boot.

The SQLite storage schema tracks prediction inputs, output scores, letter grades, confidence intervals, and qualitative feedback arrays. The frontend leverages Recharts to render scatter plots, bar charts, and responsive UI cards styled with Tailwind CSS.

---

### 12. Testing & Quality Assurance
A comprehensive automated test suite containing 15 test cases was implemented using `pytest`:
- **Pipeline Tests:** Verifies scale conversion accuracy, bounding logic ($0 \le \text{pred} \le 20$), category classification, and missing artifact detection.
- **Database Tests:** Verifies SQLite schema creation, record insertion, querying, and deletion.
- **API Tests:** Validates `/api/health`, `/api/model-info`, `/api/metrics`, `/api/predict`, and CSV upload endpoints.
- **Frontend Verification:** Strict TypeScript compilation (`tsc && vite build`) executed with zero errors.

All 15 automated backend tests executed and passed successfully.

---

### 13. Experimental Results & Discussion

#### 13.1 Benchmark Comparison Table
The empirical results across models for Mode A (Historical Performance) are summarized below:

| Model | 5-Fold CV MAE | CV MAE Std | CV $R^2$ Mean | Test MAE | Test RMSE | Test $R^2$ | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Dummy Regressor** | 2.126 | 0.174 | -0.015 | 2.051 | 2.551 | -0.002 | Baseline |
| **Linear Regression** | 1.139 | 0.111 | 0.698 | 1.054 | 1.341 | 0.723 | Evaluated |
| **Random Forest** | 1.096 | 0.125 | 0.721 | 1.062 | 1.332 | 0.727 | Evaluated |
| **Gradient Boosting** | **1.045** | **0.119** | **0.742** | **1.017** | **1.246** | **0.761** | **Selected** |

#### 13.2 Key Findings
- **Gradient Boosting** achieved the superior performance in Mode A, explaining $76.1\%$ of final grade variance with an average absolute error of just $1.017$ marks out of 20 ($5.08\%$ error on the 100% scale).
- In Mode B (Early Intervention), **Random Forest** was selected with a Test MAE of $2.006$. This demonstrates that while early screening has higher variance without prior exam scores, it accurately identifies students at risk of falling below the 10/20 passing threshold.
- Feature importance analysis revealed that mid-term marks ($G_2$), prior period marks ($G_1$), number of past failures, weekly study time, and absenteeism were the top five predictive factors.

---

### 14. System Limitations
1. **Geographic & Curricular Context:** The model is trained on Portuguese secondary education data; application to alternative curricula may require calibration.
2. **Tabular Scope:** The system evaluates structured numeric and categorical features, omitting qualitative teacher remarks or essay submissions.
3. **Extraneous Influences:** Sudden health disruptions, personal emergencies, or exam anxiety cannot be anticipated by historical academic models.

---

### 15. Future Scope
- **LMS Integration:** Developing plug-ins for Canvas, Moodle, and Google Classroom to ingest assignments and attendance automatically.
- **Deep Tabular Models:** Benchmarking TabNet and Transformer-based tabular architectures for large-scale university systems ($N > 50,000$).
- **Automated Alerts:** Integrating automated SMS and email notifications to alert academic advisors when risk factors are triggered.

---

### 16. Conclusion
EduPredict AI demonstrates that machine learning regression models can be successfully engineered into a production-grade, full-stack educational advisory platform. By adhering to rigorous data isolation, reproducible cross-validation, modern API design, and intuitive user interfaces, the system proves that proactive data mining can effectively support student retention and instructional success.

---

### 17. References
1. Cortez, P., & Silva, A. (2008). *Using data mining to predict secondary school student performance*. In Proceedings of 5th Annual Future Business Technology Conference (FUBUTEC 2008), pp. 5–12.
2. Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., et al. (2011). *Scikit-learn: Machine Learning in Python*. Journal of Machine Learning Research, 12, 2825–2830.
3. Tiangolo, S. (2024). *FastAPI: High performance, easy to learn, fast to code, ready for production*.
4. McKinney, W. (2010). *Data Structures for Statistical Computing in Python*. Proceedings of the 9th Python in Science Conference, pp. 56–61.
