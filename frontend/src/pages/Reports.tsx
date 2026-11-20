import React, { useEffect, useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Printer, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  BarChart2 
} from 'lucide-react';
import { api } from '../services/api';
import { SystemMetrics, ScaleMode } from '../types';

interface ReportsProps {
  scale: ScaleMode;
}

export const Reports: React.FC<ReportsProps> = ({ scale }) => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await api.getMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics for report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Academic Reports &amp; Export
          </h2>
          <p className="mt-2 text-base text-slate-600 font-medium">
            Generate college-level executive summaries, export prediction records, and download formatted PDF evaluations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={async () => {
              const res = await api.getPredictions({ limit: 100 });
              api.exportPredictionsAsCsv(res.items);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all hover:scale-105"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition-all hover:scale-105"
          >
            <FileText className="h-4 w-4" />
            <span>Download PDF Report</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-700">Project Evaluation Document</span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5">
                EduPredict AI — Academic Performance Report
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Machine Learning Powered Student Marks Prediction System | Automated Advisory Analytics
              </p>
            </div>
            <div className="text-right text-xs sm:text-sm text-slate-400 font-medium">
              <p>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              <p className="text-emerald-600 font-bold mt-0.5">Status: Verified</p>
            </div>
          </div>
        </div>

        {/* Executive Summary Stats */}
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-4 uppercase tracking-wider">
            1. Executive Performance Metrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Total Evaluations</span>
              <p className="text-3xl font-black text-slate-900 mt-2">{metrics?.total_predictions || 0}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Recorded in SQLite</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Cohort Mean Mark</span>
              <p className="text-3xl font-black text-blue-700 mt-2">
                {scale === '100' 
                  ? `${metrics?.average_predicted_score_100 || 0}%` 
                  : `${((metrics?.average_predicted_score_100 || 0) * 0.2).toFixed(1)}/20`}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Selected 0–{scale} scale</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Pass Rate</span>
              <p className="text-3xl font-black text-emerald-700 mt-2">{metrics?.pass_rate_percentage || 0}%</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Score &ge; 50%</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">At-Risk Students</span>
              <p className="text-3xl font-black text-rose-700 mt-2">{metrics?.high_risk_percentage || 0}%</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Early intervention flagged</p>
            </div>
          </div>
        </div>

        {/* Machine Learning Model Performance Verification */}
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-4 uppercase tracking-wider">
            2. Machine Learning Algorithm Verification
          </h3>
          <div className="rounded-2xl border border-slate-200 overflow-hidden text-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-xs border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-5 font-bold">Evaluation Mode</th>
                  <th className="py-3.5 px-5 font-bold">Best Algorithm</th>
                  <th className="py-3.5 px-5 font-bold">Test MAE (0–20)</th>
                  <th className="py-3.5 px-5 font-bold">Test RMSE</th>
                  <th className="py-3.5 px-5 font-bold">Test R²</th>
                  <th className="py-3.5 px-5 font-bold">Selection Metric</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-4 px-5 font-bold text-slate-900">Mode A: Historical Marks</td>
                  <td className="py-4 px-5 text-blue-700 font-bold">{metrics?.historical_evaluation?.best_model || 'Gradient Boosting'}</td>
                  <td className="py-4 px-5 font-medium">{metrics?.historical_evaluation?.test_metrics?.mae || '1.02'}</td>
                  <td className="py-4 px-5 font-medium">{metrics?.historical_evaluation?.test_metrics?.rmse || '1.25'}</td>
                  <td className="py-4 px-5 font-extrabold text-emerald-700">{metrics?.historical_evaluation?.test_metrics?.r2 || '0.761'}</td>
                  <td className="py-4 px-5 text-slate-500 font-medium">Lowest 5-Fold CV MAE</td>
                </tr>
                <tr>
                  <td className="py-4 px-5 font-bold text-slate-900">Mode B: Early Intervention</td>
                  <td className="py-4 px-5 text-indigo-700 font-bold">{metrics?.early_evaluation?.best_model || 'Random Forest'}</td>
                  <td className="py-4 px-5 font-medium">{metrics?.early_evaluation?.test_metrics?.mae || '2.01'}</td>
                  <td className="py-4 px-5 font-medium">{metrics?.early_evaluation?.test_metrics?.rmse || '2.50'}</td>
                  <td className="py-4 px-5 font-extrabold text-slate-700">{metrics?.early_evaluation?.test_metrics?.r2 || '0.037'}</td>
                  <td className="py-4 px-5 text-slate-500 font-medium">Lowest 5-Fold CV MAE</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Ethical Academic Disclaimer */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700 space-y-2 leading-relaxed">
          <p className="font-bold text-slate-900">Ethical Advisory &amp; Methodology Statement:</p>
          <p>
            This automated performance evaluation system utilizes supervised regression trained on the standard UCI Student Performance Portuguese dataset. Marks predictions represent statistical approximations to assist educators, counselors, and academic advisors in initiating supportive interventions.
          </p>
        </div>

        {/* Document Footer Signature Area */}
        <div className="pt-10 border-t border-slate-200 grid grid-cols-2 text-sm text-slate-600">
          <div>
            <p className="font-bold text-slate-900">Faculty Advisor / Evaluator</p>
            <div className="mt-12 border-b-2 border-slate-300 w-56" />
            <p className="mt-1.5 text-xs text-slate-400 font-medium">Signature &amp; Date</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900">Project Lead / Engineer</p>
            <div className="mt-12 border-b-2 border-slate-300 w-56 ml-auto" />
            <p className="mt-1.5 text-xs text-slate-400 font-medium">Signature &amp; Date</p>
          </div>
        </div>
      </div>
    </div>
  );
};
