import React from 'react';
import { 
  GraduationCap, 
  Cpu, 
  Database, 
  GitBranch, 
  ShieldCheck, 
  Terminal, 
  Code2, 
  Layers, 
  CheckCircle2,
  BookOpen
} from 'lucide-react';

export const AboutProject: React.FC = () => {
  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Hero Card */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 p-8 sm:p-12 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-4 py-1.5 text-xs sm:text-sm font-bold text-cyan-300 border border-blue-400/30 mb-4">
          <GraduationCap className="h-5 w-5" />
          Final Year College ML Capstone Project
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
          EduPredict AI — Student Marks Prediction System
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed font-normal">
          An end-to-end educational data mining and machine learning engineering system that forecasts student final examination marks to empower mentors with early advisory interventions.
        </p>
      </div>

      {/* Project Objectives & Problem Statement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 font-bold text-slate-900 text-lg">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span>Problem Statement</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            In modern educational institutions, academic struggling is frequently recognized only after final examinations conclude, when remediation options are limited. Traditional advisory methods rely on informal impressions rather than objective multi-factor regression models incorporating study habits, attendance, socio-demographic indicators, and assessment history.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 font-bold text-slate-900 text-lg">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            <span>Project Objectives</span>
          </div>
          <ul className="text-sm text-slate-600 space-y-2.5 font-medium">
            <li className="flex items-start gap-2.5">
              <span className="h-2 w-2 rounded-full bg-blue-600 mt-2 shrink-0" />
              <span>Implement a genuine supervised regression pipeline with scikit-learn.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="h-2 w-2 rounded-full bg-blue-600 mt-2 shrink-0" />
              <span>Compare Dummy Baseline, Linear Regression, Random Forest, and Gradient Boosting.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="h-2 w-2 rounded-full bg-blue-600 mt-2 shrink-0" />
              <span>Prevent train/test leakage using 5-fold cross-validation on training data only.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="h-2 w-2 rounded-full bg-blue-600 mt-2 shrink-0" />
              <span>Deliver a high-performance FastAPI backend with SQLite persistence and a modern React dashboard.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Machine Learning Pipeline Architecture */}
      <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 font-bold text-slate-900 text-lg">
          <GitBranch className="h-6 w-6 text-blue-600" />
          <span>Supervised Machine Learning Architecture</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 space-y-1.5">
            <div className="font-bold text-blue-900 text-base">1. Ingestion</div>
            <p className="text-slate-600 font-medium">
              UCI Student Performance dataset (Portuguese cohort, 649 samples, 33 attributes).
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 space-y-1.5">
            <div className="font-bold text-blue-900 text-base">2. Preprocessing</div>
            <p className="text-slate-600 font-medium">
              ColumnTransformer: Median Imputer + StandardScaler; OneHotEncoder for categoricals.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 space-y-1.5">
            <div className="font-bold text-blue-900 text-base">3. 5-Fold CV</div>
            <p className="text-slate-600 font-medium">
              Evaluates MAE, RMSE, and R² exclusively on training split; model selected by lowest CV MAE.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 space-y-1.5">
            <div className="font-bold text-blue-900 text-base">4. Inference</div>
            <p className="text-slate-600 font-medium">
              Serialized joblib pipelines loaded via FastAPI, logging predictions to SQLite with CI bounds.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 font-bold text-slate-900 text-lg">
          <Layers className="h-6 w-6 text-blue-600" />
          <span>Technology Stack</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 text-base">Frontend Layer</h4>
            <p className="text-slate-600 font-medium">React 18 + Vite</p>
            <p className="text-slate-600 font-medium">TypeScript (Strict Mode)</p>
            <p className="text-slate-600 font-medium">Tailwind CSS (Responsive SaaS)</p>
            <p className="text-slate-600 font-medium">Recharts Visualization</p>
            <p className="text-slate-600 font-medium">Lucide React Icons</p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 text-base">Backend &amp; API</h4>
            <p className="text-slate-600 font-medium">Python 3.11</p>
            <p className="text-slate-600 font-medium">FastAPI Async Framework</p>
            <p className="text-slate-600 font-medium">Pydantic v2 Validation</p>
            <p className="text-slate-600 font-medium">Uvicorn ASGI Server</p>
            <p className="text-slate-600 font-medium">ReportLab PDF Generation</p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 text-base">ML &amp; Storage</h4>
            <p className="text-slate-600 font-medium">scikit-learn 1.9</p>
            <p className="text-slate-600 font-medium">pandas &amp; NumPy</p>
            <p className="text-slate-600 font-medium">joblib Serialization</p>
            <p className="text-slate-600 font-medium">SQLite Local Persistence</p>
            <p className="text-slate-600 font-medium">pytest Automated Test Suite</p>
          </div>
        </div>
      </div>

      {/* Dataset Attribution & Legal */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7 sm:p-8 text-sm text-slate-700 space-y-3">
        <h4 className="font-bold text-slate-900 text-base">Dataset Attribution &amp; Citation</h4>
        <p className="font-mono text-xs bg-white p-4 rounded-xl border border-slate-200 leading-relaxed">
          Cortez, P., &amp; Silva, A. (2008). Using data mining to predict secondary school student performance. In Proceedings of the 5th Annual Future Business Technology Conference (FUBUTEC 2008), pp. 5–12.
        </p>
        <p className="text-slate-500 font-medium text-xs">
          Available publicly via the UCI Machine Learning Repository (CC BY 4.0).
        </p>
      </div>
    </div>
  );
};
