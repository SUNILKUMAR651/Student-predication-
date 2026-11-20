import React from 'react';
import { Menu, Activity, ShieldCheck, Sparkles, Database, Cloud } from 'lucide-react';
import { ScaleMode } from '../types';

interface NavbarProps {
  onToggleSidebar: () => void;
  scale: ScaleMode;
  onScaleChange: (scale: ScaleMode) => void;
  healthStatus: { online: boolean; artifactsReady: boolean };
  onOpenDatabaseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  scale,
  onScaleChange,
  healthStatus,
  onOpenDatabaseModal
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-8 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden border border-slate-200"
          aria-label="Toggle sidebar menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Academic Advisory ML
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden sm:inline text-sm font-semibold text-slate-600">
              Predict Performance. Improve Learning.
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Database & Cloud Status Badge / Button */}
        <button
          onClick={onOpenDatabaseModal}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-emerald-800 hover:bg-emerald-100 transition-all shadow-xs"
          title="Google Cloud Firebase Database Connected"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <Database className="h-4 w-4 text-emerald-600" />
          <span className="hidden sm:inline">Firebase:</span>
          <span className="text-emerald-700 font-extrabold">Connected (aaaa-22366)</span>
        </button>

        {/* Scale Toggle Widget */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-1 shadow-xs">
          <button
            onClick={() => onScaleChange('100')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              scale === '100'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            0–100%
          </button>
          <button
            onClick={() => onScaleChange('20')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              scale === '20'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            0–20
          </button>
        </div>

        {/* System Health Badge */}
        <div className="hidden lg:flex items-center gap-2.5 rounded-full border border-slate-200 px-3.5 py-1.5 bg-white text-xs sm:text-sm shadow-xs">
          <span className={`h-2.5 w-2.5 rounded-full ${healthStatus.online && healthStatus.artifactsReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="font-semibold text-slate-700">
            {healthStatus.online && healthStatus.artifactsReady ? 'Models Ready' : 'Connecting'}
          </span>
        </div>
      </div>
    </header>
  );
};
