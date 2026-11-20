import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Cloud, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Upload, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({ isOpen, onClose, onDataChanged }) => {
  const [firebaseStatus, setFirebaseStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const status = await api.getFirebaseStatus();
      setFirebaseStatus(status);
    } catch {
      setFirebaseStatus({
        connected: false,
        provider: 'Local SQLite (Firebase Ready)',
        project_id: 'Not Configured',
        collection: 'student_predictions',
        message: 'Running in local SQLite mode.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setJsonInput(content);
      };
      reader.readAsText(file);
    }
  };

  const handleConnectFirebase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonInput.trim()) return;

    try {
      setSubmitting(true);
      setMessage(null);
      const res = await api.configureFirebase(jsonInput);
      setMessage({ type: 'success', text: res.message || 'Connected to Firebase successfully!' });
      setJsonInput('');
      loadStatus();
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to connect Firebase.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      setMessage(null);
      const res = await api.seedRealData(35);
      setMessage({ type: 'success', text: res.message || 'Successfully loaded real student records!' });
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to seed records.' });
    } finally {
      setSeeding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600 shadow-xs">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Database & Cloud Storage Center</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Dual-Storage Architecture: SQLite Local Persistence & Google Cloud Firestore (Firebase)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Current Database Status Banner */}
        <div className={`rounded-2xl p-5 border text-sm space-y-2 ${
          firebaseStatus?.connected 
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : 'bg-blue-50/70 border-blue-200 text-blue-950'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-base">
              {firebaseStatus?.connected ? (
                <>
                  <Cloud className="h-5 w-5 text-emerald-600" />
                  <span>Google Cloud Firestore Connected</span>
                </>
              ) : (
                <>
                  <Database className="h-5 w-5 text-blue-600" />
                  <span>Active Database: Local SQLite (Firebase Cloud Ready)</span>
                </>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              firebaseStatus?.connected 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-blue-100 text-blue-800 border-blue-300'
            }`}>
              {firebaseStatus?.connected ? 'Cloud Synced' : 'Ready for Cloud'}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 font-medium">{firebaseStatus?.message}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider">Project ID:</span>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{firebaseStatus?.project_id || 'Not configured'}</p>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider">Collection:</span>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{firebaseStatus?.collection || 'student_predictions'}</p>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider">Storage Mode:</span>
              <p className="font-bold text-blue-700 mt-0.5">{firebaseStatus?.connected ? 'Realtime Dual Sync' : 'SQLite Local Engine'}</p>
            </div>
          </div>
        </div>

        {/* Alert / Notification Feedback */}
        {message && (
          <div className={`rounded-xl p-4 text-sm font-semibold border flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Section 1: Connect Your Firebase Account */}
        <div className="space-y-4 rounded-2xl border border-slate-200 p-5 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-600" />
                Connect Your Google Firebase Project
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Paste or upload your Firebase Service Account Private Key JSON to enable live Cloud Firestore sync.
              </p>
            </div>
          </div>

          <form onSubmit={handleConnectFirebase} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Service Account JSON (serviceAccountKey.json)
                </label>
                <label className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
                  <Upload className="h-3.5 w-3.5" />
                  Upload JSON File
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <textarea
                rows={4}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='Paste your Firebase Service Account JSON here (e.g. { "type": "service_account", "project_id": "...", "private_key": "..." })'
                className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
              >
                Open Firebase Console <ExternalLink className="h-3 w-3" />
              </a>
              <button
                type="submit"
                disabled={submitting || !jsonInput.trim()}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-500 transition-all disabled:opacity-50"
              >
                {submitting ? 'Connecting...' : 'Connect to Cloud Firestore'}
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Real Data Population */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-600" />
                Populate Real Student Cohort Data
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Instantly load 35+ authentic student observations from the UCI Portuguese dataset into your database.
              </p>
            </div>
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${seeding ? 'animate-spin' : ''}`} />
              <span>{seeding ? 'Seeding Records...' : 'Load Real Student Data'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
