import React from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  LineChart, 
  Database, 
  FileSpreadsheet, 
  Info,
  ChevronRight,
  X
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  isOpen,
  onClose
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'predict', label: 'Predict Marks', icon: GraduationCap },
    { id: 'records', label: 'Student Records', icon: Users },
    { id: 'performance', label: 'Model Performance', icon: LineChart },
    { id: 'dataset', label: 'Dataset Management', icon: Database },
    { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
    { id: 'about', label: 'About Project', icon: Info },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                EduPredict <span className="text-cyan-400 text-xs font-bold px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-800">AI</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Student Marks Predictor</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <p className="px-3 pb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  onClose();
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold' 
                    : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'}
                `}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-300'}`} />
                  <span className="text-sm">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-white/90" />}
              </button>
            );
          })}
        </nav>

        {/* Footer info in sidebar */}
        <div className="p-5 border-t border-slate-800 text-xs text-slate-400 bg-slate-950/40">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-slate-300">Active Engine</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              FastAPI + ML
            </span>
          </div>
          <p className="text-slate-500 font-medium">UCI Portuguese Dataset (N=649)</p>
        </div>
      </aside>
    </>
  );
};
