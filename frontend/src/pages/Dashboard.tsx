import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Cpu, 
  ArrowUpRight,
  Sparkles,
  Database,
  Cloud
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ScatterChart, 
  Scatter 
} from 'recharts';
import { MetricCard } from '../components/MetricCard';
import { api } from '../services/api';
import { SystemMetrics, ScaleMode } from '../types';

interface DashboardProps {
  scale: ScaleMode;
  onNavigate: (page: string) => void;
  onOpenDatabaseModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ scale, onNavigate, onOpenDatabaseModal }) => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [recentPredictions, setRecentPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [metricsData, predictionsData] = await Promise.all([
        api.getMetrics(),
        api.getPredictions({ limit: 6 })
      ]);
      setMetrics(metricsData);
      setRecentPredictions(predictionsData.items || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const histEval = metrics?.historical_evaluation;
  const earlyEval = metrics?.early_evaluation;

  // Actual vs Predicted sample data for chart
  const scatterData = (histEval?.actual_vs_predicted || []).map((pt, idx) => ({
    id: idx + 1,
    actual: scale === '100' ? Math.round((pt.actual / 20) * 100) : pt.actual,
    predicted: scale === '100' ? Math.round((pt.predicted / 20) * 100) : pt.predicted,
    residual: pt.residual
  }));

  // Marks Distribution mock/dataset bins
  const distributionData = [
    { range: scale === '100' ? '0–39% (Fail)' : '0–7 (Fail)', count: 28 },
    { range: scale === '100' ? '40–49% (Pass)' : '8–9 (Pass)', count: 64 },
    { range: scale === '100' ? '50–59% (2nd Cl)' : '10–11 (2nd)', count: 184 },
    { range: scale === '100' ? '60–74% (1st Cl)' : '12–14 (1st)', count: 236 },
    { range: scale === '100' ? '75–100% (Dist)' : '15–20 (Dist)', count: 137 },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          <p className="text-base font-semibold text-slate-600">Loading EduPredict analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8 text-rose-900 shadow-sm">
        <div className="flex items-center gap-4">
          <AlertTriangle className="h-8 w-8 text-rose-600 shrink-0" />
          <div>
            <h3 className="text-lg font-bold">Unable to Load Dashboard Data</h3>
            <p className="text-sm mt-1 text-rose-700">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-colors shadow-sm"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const avgDisplayScore = scale === '100'
    ? `${metrics?.average_predicted_score_100 || 0}%`
    : `${((metrics?.average_predicted_score_100 || 0) * 0.2).toFixed(1)}/20`;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-cyan-300 border border-blue-400/30">
              <Sparkles className="h-4 w-4" />
              Supervised Machine Learning Dashboard
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              EduPredict AI Analytics Overview
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Real-time student performance monitoring, regression model benchmarks, and proactive academic risk indicators calibrated against the UCI Portuguese Educational Dataset.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3.5 self-start lg:self-auto shrink-0">
            {onOpenDatabaseModal && (
              <button
                onClick={onOpenDatabaseModal}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-3.5 text-sm sm:text-base font-bold text-white shadow-md transition-all hover:scale-105 backdrop-blur-xs"
                title="Manage Real Database & Connect Firebase"
              >
                <Database className="h-5 w-5 text-cyan-300" />
                <span>Database / Firebase</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('predict')}
              className="inline-flex items-center gap-2.5 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all shrink-0 hover:scale-105"
            >
              <span>Predict Student Marks</span>
              <ArrowUpRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        <MetricCard
          title="Total Predictions"
          value={metrics?.total_predictions || 0}
          subtitle="Real student records"
          icon={Users}
          badge="Real Data / SQLite + Firebase"
          badgeColor="blue"
        />
        <MetricCard
          title="Avg Predicted Score"
          value={avgDisplayScore}
          subtitle={`On selected 0–${scale} scale`}
          icon={Award}
          badge="Cohort Mean"
          badgeColor="green"
        />
        <MetricCard
          title="Predicted Pass Rate"
          value={`${metrics?.pass_rate_percentage || 0}%`}
          subtitle="Scores >= 50% threshold"
          icon={TrendingUp}
          badge="Satisfactory"
          badgeColor="green"
        />
        <MetricCard
          title="At Risk / Need Support"
          value={`${metrics?.high_risk_percentage || 0}%`}
          subtitle="Scores < 50% threshold"
          icon={AlertTriangle}
          badge="Advisory Flag"
          badgeColor="amber"
        />
      </div>

      {/* Model Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Historical Mode Model */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Cpu className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900">Mode A: Historical Performance Model</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Evaluates G1, G2 assessment marks + habits</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Best
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 text-center bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Model</p>
              <p className="text-sm sm:text-base font-bold text-slate-900 mt-1 truncate">{histEval?.best_model || 'Gradient Boosting'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Test MAE</p>
              <p className="text-sm sm:text-base font-bold text-blue-700 mt-1">
                {histEval?.test_metrics ? `${histEval.test_metrics.mae} / 20` : '1.02'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Test R²</p>
              <p className="text-sm sm:text-base font-bold text-emerald-600 mt-1">
                {histEval?.test_metrics ? `${histEval.test_metrics.r2}` : '0.761'}
              </p>
            </div>
          </div>
        </div>

        {/* Early Prediction Model */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900">Mode B: Early Intervention Model</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Pre-exam: study time, absences, demographics</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
              Pre-Exam Mode
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 text-center bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Model</p>
              <p className="text-sm sm:text-base font-bold text-slate-900 mt-1 truncate">{earlyEval?.best_model || 'Random Forest'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Test MAE</p>
              <p className="text-sm sm:text-base font-bold text-blue-700 mt-1">
                {earlyEval?.test_metrics ? `${earlyEval.test_metrics.mae} / 20` : '2.01'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Test R²</p>
              <p className="text-sm sm:text-base font-bold text-slate-700 mt-1">
                {earlyEval?.test_metrics ? `${earlyEval.test_metrics.r2}` : '0.037'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Actual vs Predicted on Test Set */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900">Actual vs. Predicted Marks (Test Set)</h4>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Evaluating fitted regressor against holdout data (N=40 sample)</p>
            </div>
            <span className="text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
              Scale: 0–{scale}
            </span>
          </div>

          <div className="h-80 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 25, bottom: 25, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  dataKey="actual" 
                  name="Actual Marks" 
                  domain={[0, scale === '100' ? 100 : 20]} 
                  label={{ value: 'Actual Exam Mark', position: 'insideBottom', offset: -15, fontSize: 13, fill: '#475569', fontWeight: 600 }}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="predicted" 
                  name="Predicted Marks" 
                  domain={[0, scale === '100' ? 100 : 20]}
                  label={{ value: 'Predicted Exam Mark', angle: -90, position: 'insideLeft', offset: -5, fontSize: 13, fill: '#475569', fontWeight: 600 }}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl bg-slate-900 px-4 py-3 text-xs sm:text-sm text-white shadow-xl space-y-1">
                          <p className="font-bold text-cyan-300">Student Record #{data.id}</p>
                          <p className="text-slate-300">Actual: <span className="font-extrabold text-white">{data.actual}</span></p>
                          <p className="text-slate-300">Predicted: <span className="font-extrabold text-cyan-300">{data.predicted}</span></p>
                          <p className="text-slate-400 text-xs">Error Residual: {data.residual}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Predictions" data={scatterData} fill="#2563eb" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Marks Distribution Histogram */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900">Student Grade Category Distribution</h4>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Benchmark breakdown across Portuguese academic bands</p>
            </div>
            <span className="text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
              Cohort: 649
            </span>
          </div>

          <div className="h-80 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 15, right: 15, bottom: 25, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '13px' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="count" name="Students" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Predictions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h4 className="text-lg font-bold text-slate-900">Recent Student Predictions</h4>
            <p className="text-sm text-slate-500 font-medium">Latest recorded academic evaluations in SQLite</p>
          </div>
          <button
            onClick={() => onNavigate('records')}
            className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline self-start sm:self-auto"
          >
            View All Records &rarr;
          </button>
        </div>

        {recentPredictions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">
            <p className="text-base font-semibold text-slate-600">No predictions recorded yet.</p>
            <button
              onClick={() => onNavigate('predict')}
              className="mt-3 text-sm font-bold text-blue-600 hover:underline"
            >
              Run the first prediction now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-xs border-y border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Student Name / ID</th>
                  <th className="py-3.5 px-4 font-bold">Mode</th>
                  <th className="py-3.5 px-4 font-bold">Predicted Score</th>
                  <th className="py-3.5 px-4 font-bold">Grade</th>
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold">Model Used</th>
                  <th className="py-3.5 px-4 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPredictions.map((r) => {
                  const scoreDisplay = scale === '100' 
                    ? `${r.predicted_score_100}%` 
                    : `${r.predicted_score_raw}/20`;
                  const isPassing = r.predicted_score_100 >= 50;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900">{r.student_name}</span>
                        {r.student_id && <span className="ml-2 text-slate-400 font-mono text-xs">({r.student_id})</span>}
                      </td>
                      <td className="py-4 px-4">
                        <span className="capitalize text-slate-700 font-semibold">{r.mode}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-extrabold text-blue-700 text-base">{scoreDisplay}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 font-black text-slate-900 text-sm">
                          {r.grade_letter}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                          isPassing 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {isPassing ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                          {r.performance_category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600 truncate max-w-[160px] font-medium">
                        {r.model_name}
                      </td>
                      <td className="py-4 px-4 text-slate-400 text-xs">
                        {r.created_at ? r.created_at.split(' ')[0] : 'Today'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
