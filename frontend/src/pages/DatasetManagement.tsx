import React, { useEffect, useState } from 'react';
import { 
  Database, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Table as TableIcon,
  HelpCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { DatasetInfo } from '../types';

export const DatasetManagement: React.FC = () => {
  const [datasetInfo, setDatasetInfo] = useState<DatasetInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [validating, setValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatasetInfo();
  }, []);

  const fetchDatasetInfo = async () => {
    try {
      setLoading(true);
      const data = await api.getDatasetInfo();
      setDatasetInfo(data);
    } catch (err) {
      console.error('Failed to load dataset metadata:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      setValidationResult(null);
      setUploadError(null);
    }
  };

  const handleValidateUpload = async () => {
    if (!uploadFile) return;
    try {
      setValidating(true);
      setUploadError(null);
      const res = await api.validateDataset(uploadFile);
      setValidationResult(res);
    } catch (err: any) {
      setUploadError(err.message || 'Validation request failed');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Dataset Management &amp; Schema
        </h2>
        <p className="mt-2 text-base text-slate-600 font-medium">
          Inspect training data provenance, examine schema parameters, and validate custom student records CSV files.
        </p>
      </div>

      {/* Dataset Provenance Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-50 p-3.5 text-blue-600 shadow-xs">
              <Database className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">UCI Student Performance Benchmark</h3>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                Cortez, P., &amp; Silva, A. (2008). Secondary Education Student Academic Performance (Portuguese Course)
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs sm:text-sm font-bold text-emerald-700 border border-emerald-200 self-start md:self-auto">
            <ShieldCheck className="h-4 w-4" />
            Verified &amp; Cleaned
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-5">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">Cohort Sample Size</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{datasetInfo?.rows_count || 649} rows</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">Feature Dimensions</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{datasetInfo?.columns_count || 33} columns</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">Target Variable (G3)</p>
            <p className="text-2xl sm:text-3xl font-black text-blue-700 mt-2">Scale 0–20</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">Cohort Mean Grade</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">{datasetInfo?.target_distribution?.mean || 11.9} / 20</p>
          </div>
        </div>
      </div>

      {/* CSV Upload & Validation Area */}
      <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-sm space-y-5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">Validate Custom Student Dataset (CSV)</h3>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Check external student datasets for schema consistency, missing columns, and value ranges before training.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
          />
          <button
            onClick={handleValidateUpload}
            disabled={!uploadFile || validating}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-500 transition-all disabled:opacity-50"
          >
            {validating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Validating...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Validate CSV</span>
              </>
            )}
          </button>
        </div>

        {uploadError && (
          <div className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-800 border border-rose-200 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
            <span>{uploadError}</span>
          </div>
        )}

        {validationResult && (
          <div className={`rounded-2xl p-5 border text-sm space-y-3 ${
            validationResult.is_valid 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-center gap-2 font-bold text-base">
              {validationResult.is_valid ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>Schema Validation Passed</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span>Validation Warnings Detected</span>
                </>
              )}
            </div>
            <p className="font-medium">{validationResult.message}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-semibold">
              <p>Rows Analyzed: <strong>{validationResult.row_count}</strong></p>
              <p>Columns Present: <strong>{validationResult.column_count}</strong></p>
              <p>Missing Required: <strong>{validationResult.missing_required_columns.length}</strong></p>
              <p>Empty Cells: <strong>{validationResult.total_missing_values}</strong></p>
            </div>
          </div>
        )}
      </div>

      {/* Dataset Preview Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900">Raw Dataset Inspection (Preview: First 8 Records)</h4>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">Representative samples demonstrating demographic, study, and examination columns</p>
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            Total: {datasetInfo?.rows_count || 649} samples
          </span>
        </div>

        {loading ? (
          <div className="flex h-52 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-xs border-y border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 font-bold">School</th>
                  <th className="py-3 px-3.5 font-bold">Sex</th>
                  <th className="py-3 px-3.5 font-bold">Age</th>
                  <th className="py-3 px-3.5 font-bold">Study Time</th>
                  <th className="py-3 px-3.5 font-bold">Absences</th>
                  <th className="py-3 px-3.5 font-bold">Failures</th>
                  <th className="py-3 px-3.5 font-bold">Higher Ed</th>
                  <th className="py-3 px-3.5 font-bold">G1 (Exam 1)</th>
                  <th className="py-3 px-3.5 font-bold">G2 (Exam 2)</th>
                  <th className="py-3 px-3.5 font-extrabold text-blue-700">G3 (Target)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {(datasetInfo?.data_preview || []).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3.5">{row.school}</td>
                    <td className="py-3 px-3.5">{row.sex}</td>
                    <td className="py-3 px-3.5">{row.age}</td>
                    <td className="py-3 px-3.5">{row.studytime}</td>
                    <td className="py-3 px-3.5">{row.absences}</td>
                    <td className="py-3 px-3.5">{row.failures}</td>
                    <td className="py-3 px-3.5">{row.higher}</td>
                    <td className="py-3 px-3.5">{row.G1}</td>
                    <td className="py-3 px-3.5">{row.G2}</td>
                    <td className="py-3 px-3.5 font-extrabold text-blue-700 text-sm">{row.G3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
