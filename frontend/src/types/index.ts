export type PredictionMode = 'historical' | 'early';
export type ScaleMode = '100' | '20';

export interface StudentInput {
  student_name?: string;
  student_id?: string;
  mode: PredictionMode;
  scale: ScaleMode;

  // Key academic metrics
  studytime: number; // 1: <2h, 2: 2-5h, 3: 5-10h, 4: >10h
  absences: number;  // 0 - 93
  failures: number;  // 0 - 4
  attendance_percentage?: number; // 0 - 100 optional convenience helper

  // Historical grades (Mode A only)
  G1?: number; // 0-20 (or scaled if entered in 100 scale)
  G2?: number; // 0-20 (or scaled if entered in 100 scale)

  // Demographics & Habits
  age: number; // 15 - 22
  sex: 'F' | 'M';
  school: 'GP' | 'MS';
  address: 'U' | 'R';
  famsize: 'LE3' | 'GT3';
  Pstatus: 'T' | 'A';
  Medu: number; // 0 - 4
  Fedu: number; // 0 - 4
  Mjob: 'teacher' | 'health' | 'services' | 'at_home' | 'other';
  Fjob: 'teacher' | 'health' | 'services' | 'at_home' | 'other';
  reason: 'home' | 'reputation' | 'course' | 'other';
  guardian: 'mother' | 'father' | 'other';
  traveltime: number; // 1 - 4

  // Support & Activities
  schoolsup: 'yes' | 'no';
  famsup: 'yes' | 'no';
  paid: 'yes' | 'no';
  activities: 'yes' | 'no';
  nursery: 'yes' | 'no';
  higher: 'yes' | 'no';
  internet: 'yes' | 'no';
  romantic: 'yes' | 'no';

  // Wellbeing & Social
  famrel: number; // 1 - 5
  freetime: number; // 1 - 5
  goout: number; // 1 - 5
  Dalc: number; // 1 - 5
  Walc: number; // 1 - 5
  health: number; // 1 - 5
}

export interface PredictionResult {
  id?: number;
  student_name?: string;
  student_id?: string;
  mode: PredictionMode;
  scale: ScaleMode;
  predicted_score_raw: number; // 0-20
  predicted_score_100: number; // 0-100
  display_score: number;
  display_scale: string;
  grade_letter: string;
  performance_category: 'Distinction' | 'First Class' | 'Second Class' | 'Pass' | 'At Risk / Fail';
  confidence_lower: number;
  confidence_upper: number;
  model_name: string;
  model_version: string;
  uncertainty_disclaimer: string;
  created_at: string;
  input_summary: Record<string, any>;
  risk_factors: string[];
  positive_factors: string[];
}

export interface ModelMetric {
  model_name: string;
  mae: number;
  rmse: number;
  r2: number;
  cv_mae_mean: number;
  cv_mae_std: number;
  cv_r2_mean: number;
  cv_r2_std: number;
  is_selected: boolean;
}

export interface ModeEvaluation {
  mode: PredictionMode;
  best_model: string;
  test_metrics: {
    mae: number;
    rmse: number;
    r2: number;
  };
  models_comparison: ModelMetric[];
  feature_importances?: { feature: string; importance: number }[];
  actual_vs_predicted?: { actual: number; predicted: number; residual: number }[];
  training_sample_count: number;
  test_sample_count: number;
  target_scale: string;
}

export interface SystemMetrics {
  total_predictions: number;
  average_predicted_score_100: number;
  pass_rate_percentage: number;
  high_risk_percentage: number;
  historical_evaluation: ModeEvaluation;
  early_evaluation: ModeEvaluation;
}

export interface DatasetInfo {
  filename: string;
  source: string;
  rows_count: number;
  columns_count: number;
  columns: string[];
  missing_values: Record<string, number>;
  data_preview: Record<string, any>[];
  target_distribution: {
    min: number;
    max: number;
    mean: number;
    median: number;
    std: number;
  };
}
