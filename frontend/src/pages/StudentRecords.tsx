import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Trash2, 
  Eye, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Database,
  Cloud
} from 'lucide-react';
import { api } from '../services/api';
import { PredictionResult, ScaleMode } from '../types';

interface StudentRecordsProps {
  scale: ScaleMode;
  onOpenDatabaseModal?: () => void;
}

export const StudentRecords: React.FC<StudentRecordsProps> = ({ scale, onOpenDatabaseModal }) => {
  const [records, setRecords] = useState<PredictionResult[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [modeFilter, setModeFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRecord, setSelectedRecord] = useState<PredictionResult | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    fetchRecords();
  }, [page, search, modeFilter]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.getPredictions({
        search: search || undefined,
        mode: modeFilter || undefined,
        page: page,
        limit: 10
      });
      setRecords(res.items || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (err) {
      console.error('Failed to load predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await api.deletePrediction(deleteId);
      setDeleteId(null);
      fetchRecords();
    } catch (err) {
      alert('Failed to delete record');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Student Prediction Records
          </h2>
          <p className="mt-2 text-base text-slate-600 font-medium">
            Real student dataset records & evaluations ({total} records in SQLite & Cloud Firestore).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onOpenDatabaseModal && (
            <button
              onClick={onOpenDatabaseModal}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-blue-50/50 hover:border-blue-400 hover:text-blue-700 transition-all hover:scale-105"
            >
              <Database className="h-4 w-4 text-blue-600" />
              <span>Database / Firebase Sync</span>
            </button>
          )}

          <button
            onClick={() => api.exportPredictionsAsCsv(records)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all hover:scale-105"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-300 pl-11 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-sm font-bold text-slate-600">Mode:</span>
          <select
            value={modeFilter}
            onChange={(e) => {
              setModeFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
          >
            <option value="">All Modes</option>
            <option value="historical">Historical Mode (with G1/G2)</option>
            <option value="early">Early Prediction Mode</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-72 items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          </div>
        ) : records.length === 0 ? (
          <div className="p-16 text-center">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-lg font-bold text-slate-800">No prediction records found</p>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria or create a new prediction.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-xs border-b border-slate-200">
                <tr>
                  <th className="py-4 px-5 font-bold">ID</th>
                  <th className="py-4 px-5 font-bold">Student Name</th>
                  <th className="py-4 px-5 font-bold">Student ID</th>
                  <th className="py-4 px-5 font-bold">Mode</th>
                  <th className="py-4 px-5 font-bold">Score (0–{scale})</th>
                  <th className="py-4 px-5 font-bold">Grade</th>
                  <th className="py-4 px-5 font-bold">Category</th>
                  <th className="py-4 px-5 font-bold">Model</th>
                  <th className="py-4 px-5 font-bold">Created</th>
                  <th className="py-4 px-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => {
                  const displayScore = scale === '100' ? `${r.predicted_score_100}%` : `${r.predicted_score_raw}/20`;
                  const isPassing = r.predicted_score_100 >= 50;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5 font-mono text-slate-400 font-semibold">#{r.id}</td>
                      <td className="py-4 px-5 font-bold text-slate-900">{r.student_name}</td>
                      <td className="py-4 px-5 font-mono text-slate-600">{r.student_id || '—'}</td>
                      <td className="py-4 px-5">
                        <span className="capitalize font-semibold text-slate-700">{r.mode}</span>
                      </td>
                      <td className="py-4 px-5 font-extrabold text-blue-700 text-base">{displayScore}</td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 font-black text-slate-900 text-sm">
                          {r.grade_letter}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                          isPassing 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {r.performance_category}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-600 truncate max-w-[140px] font-medium">{r.model_name}</td>
                      <td className="py-4 px-5 text-slate-400 text-xs">{r.created_at ? r.created_at.split(' ')[0] : '—'}</td>
                      <td className="py-4 px-5 text-right space-x-2">
                        <button
                          onClick={() => setSelectedRecord(r)}
                          title="View Details"
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(r.id || null)}
                          title="Delete Record"
                          className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-sm text-slate-600 font-medium">
          <div>
            Showing Page <span className="font-bold text-slate-900">{page}</span> of <span className="font-bold text-slate-900">{pages}</span> ({total} records)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white p-7 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{selectedRecord.student_name}</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">ID: {selectedRecord.student_id || 'N/A'} | Record #{selectedRecord.id}</p>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Predicted Score:</span>
                <p className="text-3xl font-black text-blue-700 mt-1">{selectedRecord.predicted_score_100}%</p>
                <p className="text-xs text-slate-500 font-medium">({selectedRecord.predicted_score_raw}/20 original scale)</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Classification:</span>
                <p className="text-2xl font-black text-slate-900 mt-1">Grade {selectedRecord.grade_letter}</p>
                <p className="text-xs text-slate-600 font-semibold">{selectedRecord.performance_category}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5 text-sm space-y-3">
              <p className="font-bold text-slate-900">Recorded Academic Parameters:</p>
              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <p>Study Time: <strong>{selectedRecord.input_summary?.studytime || '—'} / 4</strong></p>
                <p>Absences: <strong>{selectedRecord.input_summary?.absences ?? '—'} days</strong></p>
                <p>Past Failures: <strong>{selectedRecord.input_summary?.failures ?? '—'}</strong></p>
                <p>Higher Education: <strong>{selectedRecord.input_summary?.higher || '—'}</strong></p>
                {selectedRecord.mode === 'historical' && (
                  <>
                    <p>Exam G1 Mark: <strong>{selectedRecord.input_summary?.G1 ?? '—'}</strong></p>
                    <p>Exam G2 Mark: <strong>{selectedRecord.input_summary?.G2 ?? '—'}</strong></p>
                  </>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed bg-amber-50 p-4 rounded-xl border border-amber-200 font-medium">
              <strong>Notice:</strong> {selectedRecord.uncertainty_disclaimer}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="h-7 w-7" />
              <h3 className="text-lg font-extrabold text-slate-900">Delete Record #{deleteId}?</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Are you sure you want to permanently remove this student prediction from the database? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
