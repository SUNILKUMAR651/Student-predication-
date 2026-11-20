# Machine Learning Methodology & Architecture

## 1. Problem Formulation
EduPredict AI models student performance forecasting as a **supervised regression task**. Given an input vector of student academic behaviors, demographic context, and evaluation marks $\mathbf{x} \in \mathbb{R}^d$, the system aims to predict the continuous final exam score $y \in [0, 20]$ (and scaled representation $y_{100} \in [0, 100]$):

$$\hat{y} = f_\theta(\mathbf{x})$$

Where $f_\theta$ represents the trained regression estimator selected based on empirical cross-validation.

---

## 2. Multi-Mode Prediction Design
The system addresses the timing dilemma in educational data mining by implementing two operational modes:

### Mode A: Historical Performance Mode
- **Timing:** Administered mid-semester or prior to final exams.
- **Features Included:** First period grade ($G_1$), second period grade ($G_2$), study hours, class failures, absenteeism, and 28 socio-demographic features.
- **Role:** High-accuracy final grade estimation ($\text{R}^2 \approx 0.76$, $\text{MAE} \approx 1.02/20$).

### Mode B: Early Intervention Mode
- **Timing:** Administered during student orientation or early weeks before any examinations occur.
- **Features Included:** Weekly study hours, historical class failures, school absenteeism, parental education, higher education aspirations, and lifestyle indicators.
- **Strict Constraint:** $G_1$ and $G_2$ are explicitly removed from the feature space to prevent future data leakage.
- **Role:** Proactive identification of students needing study guidance, attendance counseling, and tutoring.

---

## 3. Data Leakage Prevention & Preprocessing
To ensure rigorous real-world validity:
1. **Split Isolation:** The dataset is partitioned into an $80\%$ training split and $20\%$ holdout test split using a fixed random seed (`seed=42`).
2. **Pipeline Encapsulation:** All scalers, imputers, and one-hot encoders are fitted exclusively on training data using `sklearn.compose.ColumnTransformer` and `sklearn.pipeline.Pipeline`:
   - Numeric Features $\rightarrow$ `SimpleImputer(strategy='median')` followed by `StandardScaler()`.
   - Categorical Features $\rightarrow$ `SimpleImputer(strategy='most_frequent')` followed by `OneHotEncoder(handle_unknown='ignore')`.
3. **Cross-Validation:** 5-fold cross-validation is executed strictly within the $80\%$ training split.

---

## 4. Evaluated Algorithms & Model Selection
Four regression algorithms were comparatively trained:

1. **DummyRegressor (Baseline):** Predicts the mean target value of the training data. Provides the lower benchmark for $\text{R}^2 = 0$.
2. **Linear Regression:** Standard ordinary least squares regression evaluating linear relationships.
3. **Random Forest Regressor:** Non-linear bagging ensemble of decision trees with feature subsampling and depth constraints.
4. **Gradient Boosting Regressor:** Sequential boosting ensemble minimizing squared error loss.

### Model Selection Criterion
The winning production model is chosen strictly by the **lowest 5-Fold Cross-Validation MAE** on training data:
$$\text{Best Model} = \arg\min_m \left( \frac{1}{K} \sum_{k=1}^K \text{MAE}_{k}(m) \right)$$

---

## 5. Evaluation Metrics
Models are evaluated across three primary regression metrics:
- **Mean Absolute Error (MAE):**
  $$\text{MAE} = \frac{1}{n} \sum_{i=1}^n |y_i - \hat{y}_i|$$
- **Root Mean Squared Error (RMSE):**
  $$\text{RMSE} = \sqrt{\frac{1}{n} \sum_{i=1}^n (y_i - \hat{y}_i)^2}$$
- **Coefficient of Determination ($\text{R}^2$):**
  $$\text{R}^2 = 1 - \frac{\sum_{i=1}^n (y_i - \hat{y}_i)^2}{\sum_{i=1}^n (y_i - \bar{y})^2}$$

*Note:* In this regression setting, $\text{R}^2$ represents the proportion of variance explained by the model, not a classification accuracy percentage.

---

## 6. Uncertainty Quantification & Academic Categories
Predictions provide an 80% confidence interval based on test RMSE ($\pm 1.28 \times \text{RMSE}$).
Scores are categorized into academic bands:
- $\ge 75\%$: **Distinction** (Grade A/A+)
- $60\% - 74\%$: **First Class** (Grade B)
- $50\% - 59\%$: **Second Class** (Grade C)
- $40\% - 49\%$: **Pass** (Grade D)
- $< 40\%$: **At Risk / Fail** (Grade F)
