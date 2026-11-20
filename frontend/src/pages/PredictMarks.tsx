import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  User,
  HeartHandshake
} from 'lucide-react';
import { api } from '../services/api';
import { StudentInput, PredictionResult, PredictionMode, ScaleMode } from '../types';

interface PredictMarksProps {
  scale: ScaleMode;
}

export const PredictMarks: React.FC<PredictMarksProps> = ({ scale }) => {
  const [mode, setMode] = useState<PredictionMode>('historical');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  // Form State with sensible defaults
  const [formData, setFormData] = useState<StudentInput>({
    student_name: '',
    student_id: '',
    mode: 'historical',
    scale: scale,
    studytime: 2,
    absences: 4,
    failures: 0,
    G1: 14,
    G2: 14,
    age: 17,
    sex: 'F',
    school: 'GP',
    address: 'U',
    famsize: 'GT3',
    Pstatus: 'T',
    Medu: 3,
    Fedu: 3,
    Mjob: 'services',
    Fjob: 'other',
    reason: 'course',
    guardian: 'mother',
    traveltime: 1,
    schoolsup: 'no',
    famsup: 'yes',
    paid: 'no',
    activities: 'yes',
    nursery: 'yes',
    higher: 'yes',
    internet: 'yes',
    romantic: 'no',
    famrel: 4,
    freetime: 3,
    goout: 3,
    Dalc: 1,
    Walc: 1,
    health: 4,
  });

  const handleModeChange = (newMode: PredictionMode) => {
    setMode(newMode);
    setFormData(prev => ({ ...prev, mode: newMode }));
    setResult(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const loadSampleProfile = (profile: 'high' | 'average' | 'at_risk') => {
    if (profile === 'high') {
      setFormData(prev => ({
        ...prev,
        student_name: 'Elena Rostova',
        student_id: 'TOP-2024',
        studytime: 4,
        absences: 1,
        failures: 0,
        G1: scale === '100' ? 85 : 17,
        G2: scale === '100' ? 90 : 18,
        higher: 'yes',
        internet: 'yes',
        Medu: 4,
        health: 5,
        famrel: 5
      }));
    } else if (profile === 'average') {
      setFormData(prev => ({
        ...prev,
        student_name: 'Marcus Vance',
        student_id: 'AVG-401',
        studytime: 2,
        absences: 5,
        failures: 0,
        G1: scale === '100' ? 60 : 12,
        G2: scale === '100' ? 62 : 12,
        higher: 'yes',
        internet: 'yes',
        Medu: 2,
        health: 4,
        famrel: 4
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        student_name: 'Jordan Brooks',
        student_id: 'RSK-990',
        studytime: 1,
        absences: 18,
        failures: 2,
        G1: scale === '100' ? 35 : 7,
        G2: scale === '100' ? 40 : 8,
        higher: 'no',
        internet: 'no',
        Medu: 1,
        health: 2,
        famrel: 2,
        Dalc: 3,
        Walc: 4
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: StudentInput = {
        ...formData,
        mode: mode,
        scale: scale,
        studytime: Number(formData.studytime),
        absences: Number(formData.absences),
        failures: Number(formData.failures),
        age: Number(formData.age),
        Medu: Number(formData.Medu),
        Fedu: Number(formData.Fedu),
        traveltime: Number(formData.traveltime),
        famrel: Number(formData.famrel),
        freetime: Number(formData.freetime),
        goout: Number(formData.goout),
        Dalc: Number(formData.Dalc),
        Walc: Number(formData.Walc),
        health: Number(formData.health),
        G1: mode === 'historical' ? Number(formData.G1) : undefined,
        G2: mode === 'historical' ? Number(formData.G2) : undefined,
      };

      const prediction = await api.predict(payload);
      setResult(prediction);
    } catch (err: any) {
      setError(err.message || 'Prediction failed. Please verify backend models.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Predict Student Final Marks
        </h2>
        <p className="mt-2 text-base text-slate-600 font-medium">
          Enter academic attributes and behavioral parameters to compute real machine learning regression inference.
        </p>
      </div>

      {/* Mode Selector & Quick Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 mr-1">Prediction Mode:</span>
          <button
            type="button"
            onClick={() => handleModeChange('historical')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              mode === 'historical'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Mode A: Historical Marks (with G1/G2)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('early')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              mode === 'early'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Mode B: Early Prediction (Pre-Exam)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold text-slate-400 mr-1">Profiles:</span>
          <button
            type="button"
            onClick={() => loadSampleProfile('high')}
            className="text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
          >
            High
          </button>
          <button
            type="button"
            onClick={() => loadSampleProfile('average')}
            className="text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
          >
            Average
          </button>
          <button
            type="button"
            onClick={() => loadSampleProfile('at_risk')}
            className="text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
          >
            At-Risk
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container (2 Cols) */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-7 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            {/* Student Identification */}
            <div>
              <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-slate-100 text-slate-900 font-bold text-base">
                <User className="h-5 w-5 text-blue-600" />
                <span>Student Details (Optional)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Student Name</label>
                  <input
                    type="text"
                    name="student_name"
                    value={formData.student_name}
                    onChange={handleChange}
                    placeholder="e.g., Alex Johnson"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Student ID / Roll No</label>
                  <input
                    type="text"
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleChange}
                    placeholder="e.g., STU-2024-042"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Historical Exam Marks (Mode A Only) */}
            {mode === 'historical' && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 space-y-4">
                <div className="flex items-center gap-2.5 text-blue-900 font-bold text-base">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span>Prior Period Exam Marks (Selected Scale: 0–{scale})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      1st Period Mark (G1)
                      <span className="text-slate-500 font-medium ml-1.5">[{scale === '100' ? '0–100%' : '0–20'}]</span>
                    </label>
                    <input
                      type="number"
                      name="G1"
                      required
                      min={0}
                      max={scale === '100' ? 100 : 20}
                      step={scale === '100' ? '1' : '0.5'}
                      value={formData.G1 ?? ''}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      Mid-Term Mark (G2)
                      <span className="text-slate-500 font-medium ml-1.5">[{scale === '100' ? '0–100%' : '0–20'}]</span>
                    </label>
                    <input
                      type="number"
                      name="G2"
                      required
                      min={0}
                      max={scale === '100' ? 100 : 20}
                      step={scale === '100' ? '1' : '0.5'}
                      value={formData.G2 ?? ''}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Academic Commitment & Attendance */}
            <div>
              <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-slate-100 text-slate-900 font-bold text-base">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Academic Habits & Attendance</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Weekly Study Time</label>
                  <select
                    name="studytime"
                    value={formData.studytime}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
                  >
                    <option value={1}>1: &lt; 2 hours / week</option>
                    <option value={2}>2: 2 to 5 hours / week</option>
                    <option value={3}>3: 5 to 10 hours / week</option>
                    <option value={4}>4: &gt; 10 hours / week</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Absences (0–93)</label>
                  <input
                    type="number"
                    name="absences"
                    min={0}
                    max={93}
                    value={formData.absences}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Past Failures</label>
                  <select
                    name="failures"
                    value={formData.failures}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
                  >
                    <option value={0}>0 failures (Clear record)</option>
                    <option value={1}>1 past failure</option>
                    <option value={2}>2 past failures</option>
                    <option value={3}>3 past failures</option>
                    <option value={4}>4+ failures</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Support & Educational Goals */}
            <div>
              <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-slate-100 text-slate-900 font-bold text-base">
                <HeartHandshake className="h-5 w-5 text-blue-600" />
                <span>Support & Educational Goals</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">Aims for Higher Ed</label>
                  <select
                    name="higher"
                    value={formData.higher}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 font-medium"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">Internet Access</label>
                  <select
                    name="internet"
                    value={formData.internet}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 font-medium"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">School Support</label>
                  <select
                    name="schoolsup"
                    value={formData.schoolsup}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 font-medium"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">Family Support</label>
                  <select
                    name="famsup"
                    value={formData.famsup}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 font-medium"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Demographics & Lifestyle */}
            <div>
              <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-slate-100 text-slate-900 font-bold text-base">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                <span>Demographics & Lifestyle</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    min={15}
                    max={22}
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">Sex</label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 font-medium"
                  >
                    <option value="F">Female</option>
                    <option value="M">Male</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">Health (1-5)</label>
                  <select
                    name="health"
                    value={formData.health}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 font-medium"
                  >
                    <option value={1}>1: Very Poor</option>
                    <option value={2}>2: Poor</option>
                    <option value={3}>3: Moderate</option>
                    <option value={4}>4: Good</option>
                    <option value={5}>5: Excellent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">Going Out (1-5)</label>
                  <select
                    name="goout"
                    value={formData.goout}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 font-medium"
                  >
                    <option value={1}>1: Very Low</option>
                    <option value={2}>2: Low</option>
                    <option value={3}>3: Average</option>
                    <option value={4}>4: High</option>
                    <option value={5}>5: Very High</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-800 border border-rose-200 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit & Reset Buttons */}
            <div className="flex items-center justify-end gap-4 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Clear Results
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2.5 rounded-2xl bg-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all disabled:opacity-50 hover:scale-105"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Running Inference...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>Generate ML Prediction</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Prediction Result Card (1 Col) */}
        <div className="lg:col-span-1">
          {result ? (
            <div className="sticky top-28 rounded-2xl border-2 border-blue-500/20 bg-white p-7 shadow-xl space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
                  {result.mode === 'historical' ? 'Historical Mode' : 'Early Mode'}
                </span>
                <span className="text-xs font-mono text-slate-400">Record #{result.id}</span>
              </div>

              {/* Big Score Display */}
              <div className="text-center py-3">
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-500">Predicted Final Marks</p>
                <div className="mt-3 flex items-baseline justify-center gap-1.5">
                  <span className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tight">
                    {result.display_score}
                  </span>
                  <span className="text-2xl font-bold text-slate-400">
                    /{scale === '100' ? '100' : '20'}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2.5">
                  <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-xl text-sm font-black bg-slate-900 text-white shadow-xs">
                    Grade {result.grade_letter}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-sm font-bold border ${
                    result.predicted_score_100 >= 50
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {result.performance_category}
                  </span>
                </div>
              </div>

              {/* Confidence Interval */}
              <div className="rounded-xl bg-slate-50 p-4 text-sm border border-slate-100 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>Confidence Range (80% CI):</span>
                  <span className="font-extrabold text-blue-700 text-base">
                    {result.confidence_lower} – {result.confidence_upper}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.max(0, result.predicted_score_100))}%` }}
                  />
                </div>
              </div>

              {/* Positive Factors */}
              {result.positive_factors && result.positive_factors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Key Strengths Identified
                  </h4>
                  <ul className="space-y-1.5">
                    {result.positive_factors.map((item, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2 font-medium">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Factors */}
              {result.risk_factors && result.risk_factors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Areas Requiring Advisory Support
                  </h4>
                  <ul className="space-y-1.5">
                    {result.risk_factors.map((item, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2 font-medium">
                        <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Metadata & Uncertainty Notice */}
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Model Engine:</span>
                  <span className="font-bold text-slate-800">{result.model_name} (v{result.model_version})</span>
                </div>
                <div className="rounded-xl bg-amber-50 p-3 text-amber-900 border border-amber-200/80 leading-relaxed text-xs font-medium">
                  <strong>Notice:</strong> {result.uncertainty_disclaimer}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center flex flex-col items-center justify-center min-h-[420px] shadow-xs">
              <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 shadow-xs">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Awaiting Student Parameters</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-[240px] leading-relaxed">
                Fill out the input form or choose a preset profile, then click "Generate ML Prediction".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
