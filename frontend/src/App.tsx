import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DatabaseModal } from './components/DatabaseModal';
import { Dashboard } from './pages/Dashboard';
import { PredictMarks } from './pages/PredictMarks';
import { StudentRecords } from './pages/StudentRecords';
import { ModelPerformance } from './pages/ModelPerformance';
import { DatasetManagement } from './pages/DatasetManagement';
import { Reports } from './pages/Reports';
import { AboutProject } from './pages/AboutProject';
import { api } from './services/api';
import { ScaleMode } from './types';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [scale, setScale] = useState<ScaleMode>('100');
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState<boolean>(false);
  const [healthStatus, setHealthStatus] = useState<{ online: boolean; artifactsReady: boolean }>({
    online: false,
    artifactsReady: false,
  });

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const data = await api.getHealth();
      setHealthStatus({
        online: data.status === 'online',
        artifactsReady: data.artifacts_ready,
      });
    } catch {
      setHealthStatus({ online: false, artifactsReady: false });
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            scale={scale} 
            onNavigate={setCurrentPage} 
            onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
          />
        );
      case 'predict':
        return <PredictMarks scale={scale} />;
      case 'records':
        return (
          <StudentRecords 
            scale={scale} 
            onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
          />
        );
      case 'performance':
        return <ModelPerformance scale={scale} />;
      case 'dataset':
        return <DatasetManagement />;
      case 'reports':
        return <Reports scale={scale} />;
      case 'about':
        return <AboutProject />;
      default:
        return (
          <Dashboard 
            scale={scale} 
            onNavigate={setCurrentPage} 
            onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar Navigation (w-72) */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area (pl-72 on desktop) */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          scale={scale}
          onScaleChange={setScale}
          healthStatus={healthStatus}
          onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl 2xl:max-w-(--breakpoint-2xl) w-full mx-auto">
          {renderPage()}
        </main>

        <footer className="border-t border-slate-200/80 bg-white py-5 px-6 text-center text-xs sm:text-sm text-slate-500 print:hidden font-medium">
          <p>
            EduPredict AI &copy; {new Date().getFullYear()} — Machine Learning Student Marks Prediction System. Designed for academic advisory support.
          </p>
        </footer>
      </div>

      {/* Cloud & Database Management Modal */}
      <DatabaseModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
        onDataChanged={checkHealth}
      />
    </div>
  );
};

export default App;
