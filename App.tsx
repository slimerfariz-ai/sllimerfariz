
import React, { useState, useEffect } from 'react';
import { Tab, DailyReport } from './types';
import Dashboard from './components/Dashboard';
import InspectionForm from './components/InspectionForm';
import ReportHistory from './components/ReportHistory';
import PicDirectory from './components/PicDirectory';
import StandaloneDashboardPortal from './components/StandaloneDashboardPortal';
import { getReports, saveReport, subscribeToReports, clearAllReports } from './services/storageService';
import { LayoutDashboard, ClipboardCheck, History, ShieldCheck, Building2, ExternalLink, LogOut, User, LogIn, Smartphone } from 'lucide-react';
import { BUBantenStore } from './data/buBantenStores';
import LoginScreen from './components/LoginScreen';
import ApkInstallModal from './components/ApkInstallModal';
import { getCurrentUser, logout as authLogout, AuthUser } from './services/authService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getCurrentUser);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  // Check if opened directly via URL as standalone web dashboard (e.g. ?view=standalone-dashboard)
  const getInitialTab = (): Tab => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get('view') === 'standalone-dashboard' ||
        params.get('portal') === 'true' ||
        window.location.hash === '#dashboard-portal' ||
        window.location.pathname === '/dashboard'
      ) {
        return 'standalone-dashboard';
      }
    }
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<Tab>(getInitialTab);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [selectedStoreForInspection, setSelectedStoreForInspection] = useState<BUBantenStore | null>(null);

  // Sync URL query when browser back/forward buttons are clicked
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get('view') === 'standalone-dashboard' ||
        params.get('portal') === 'true' ||
        window.location.hash === '#dashboard-portal' ||
        window.location.pathname === '/dashboard'
      ) {
        setActiveTab('standalone-dashboard');
      } else {
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Bersihkan data sampel/demo lama sesuai permintaan pengguna untuk mengosongkan dasbor
  useEffect(() => {
    const existing = localStorage.getItem('lp_daily_reports_v1');
    if (existing && existing.includes('demo-')) {
      clearAllReports().then(() => {
        setReports([]);
      });
    }
  }, []);

  // Real-time synchronization with Firestore Cloud Database
  useEffect(() => {
    const unsubscribe = subscribeToReports((updatedReports) => {
      setReports(updatedReports);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Proteksi menutup tab browser atau refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty && activeTab === 'inspect') {
        const message = "Data yang Anda masukkan belum disimpan. Apakah Anda yakin ingin keluar?";
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFormDirty, activeTab]);

  const handleTabChange = (newTab: Tab) => {
    if (activeTab === 'inspect' && isFormDirty && newTab !== 'inspect') {
      const confirmLeave = window.confirm("Ada perubahan yang belum disimpan. Tinggalkan halaman formulir?");
      if (!confirmLeave) return;
    }
    
    // Reset dirty state saat pindah tab (jika user setuju leave)
    if (activeTab === 'inspect' && newTab !== 'inspect') {
      setIsFormDirty(false);
    }

    // Update browser URL query to allow bookmarking / sharing standalone dashboard URL
    if (newTab === 'standalone-dashboard') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('view', 'standalone-dashboard');
        window.history.pushState(null, '', url.toString());
      } catch {
        // ignore
      }
    } else if (activeTab === 'standalone-dashboard') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('view');
        url.searchParams.delete('portal');
        window.history.pushState(null, '', url.pathname + (url.search ? url.search : ''));
      } catch {
        // ignore
      }
    }
    
    setActiveTab(newTab);
  };

  const handleSaveReport = (report: DailyReport) => {
    saveReport(report);
    setReports(getReports());
    setIsFormDirty(false); // Reset dirty state setelah berhasil simpan
    setActiveTab('history');
  };

  const handleCancelInspect = () => {
    if (isFormDirty) {
      const confirmLeave = window.confirm("Batalkan pengisian formulir? Data yang sudah diisi akan hilang.");
      if (!confirmLeave) return;
    }
    setIsFormDirty(false);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    authLogout();
    setCurrentUser(null);
    setIsGuestMode(false);
    setIsLoginModalOpen(false);
    setActiveTab('dashboard');
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      url.searchParams.delete('portal');
      if (window.location.hash === '#dashboard-portal') {
        window.location.hash = '';
      }
      window.history.pushState(null, '', url.pathname + (url.search ? url.search : ''));
    } catch {
      // ignore
    }
  };

  // Render Standalone Dashboard in dedicated web portal format directly (accessible without login)
  if (activeTab === 'standalone-dashboard') {
    return (
      <StandaloneDashboardPortal
        reports={reports}
        onBackToApp={() => handleTabChange('dashboard')}
        onInspectStore={(st) => {
          setSelectedStoreForInspection(st);
          handleTabChange('inspect');
        }}
        onRefreshData={() => {
          setReports(getReports());
        }}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        currentUser={currentUser}
      />
    );
  }

  // Tampilan awal login NIK dan Password jika belum login
  if (!currentUser && !isGuestMode) {
    return (
      <LoginScreen 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsGuestMode(false);
        }}
        onContinueAsGuest={() => setIsGuestMode(true)}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            reports={reports} 
            onCreateNew={() => {
              setSelectedStoreForInspection(null);
              handleTabChange('inspect');
            }} 
            onOpenDirectory={() => handleTabChange('pic-directory')}
            onInspectStore={(st) => {
              setSelectedStoreForInspection(st);
              setActiveTab('inspect');
            }}
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onLogout={handleLogout}
          />
        );
      case 'inspect':
        return (
          <InspectionForm 
            onSave={handleSaveReport} 
            onCancel={handleCancelInspect} 
            existingReports={reports}
            onDirtyChange={setIsFormDirty}
            initialStore={selectedStoreForInspection}
            currentUser={currentUser}
          />
        );
      case 'history':
        return <ReportHistory reports={reports} />;
      case 'pic-directory':
        return (
          <PicDirectory 
            onSelectStoreForInspection={(st) => {
              setSelectedStoreForInspection(st);
              setActiveTab('inspect');
            }} 
          />
        );
      default:
        return (
          <Dashboard 
            reports={reports} 
            onCreateNew={() => {
              setSelectedStoreForInspection(null);
              handleTabChange('inspect');
            }} 
            onOpenDirectory={() => handleTabChange('pic-directory')}
            onInspectStore={(st) => {
              setSelectedStoreForInspection(st);
              setActiveTab('inspect');
            }}
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 lg:pb-16">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          {/* Logo & Responsive Title */}
          <div className="flex items-center gap-2 text-blue-700 min-w-0">
            <ShieldCheck size={28} className="shrink-0 text-blue-700" />
            <div className="min-w-0">
              <span className="text-xs sm:text-base md:text-lg font-extrabold tracking-tight block truncate text-blue-600" title="LOSS PREVENTION DEPARTMENT">
                LOSS PREVENTION DEPARTMENT
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Tombol Pasang APK di Header Atas */}
            <button
              onClick={() => setIsApkModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              title="Pasang aplikasi APK di HP Android"
            >
              <Smartphone size={14} className="text-emerald-600" />
              <span className="hidden xs:inline sm:inline">Pasang APK</span>
            </button>

            {/* Tombol Logout & User Profile */}
            <div className="flex items-center gap-2">
              {currentUser ? (
                <>
                  <div className="hidden md:flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]" title={currentUser.name}>
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono leading-tight">
                      NIK: {currentUser.nik}
                    </span>
                  </div>

                  {/* Tombol Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white transition-all text-xs font-bold shadow-xs cursor-pointer"
                    title={`Logout dari akun ${currentUser.name} (NIK: ${currentUser.nik})`}
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                /* Tombol Login saat belum login */
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer animate-pulse"
                  title="Masuk dengan NIK dan Password"
                >
                  <LogIn size={14} />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto p-3 sm:p-6">
        {renderContent()}

        {/* Footer info */}
        <div className="text-center text-xs text-blue-600 font-bold py-6 mt-8 border-t border-slate-200">
          Loss Prevention Department
        </div>
      </main>

      {/* Bottom Mobile & Tablet Navigation (visible on screens < 1024px) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3 flex justify-around items-center lg:hidden shadow-2xl z-50">
        <button 
          onClick={() => handleTabChange('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all ${activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <LayoutDashboard size={18} />
          <span>Dasbor</span>
        </button>
        <button 
          onClick={() => handleTabChange('pic-directory')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all ${activeTab === 'pic-directory' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Building2 size={18} />
          <span>Direktori</span>
        </button>
        <button 
          onClick={() => handleTabChange('inspect')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all ${activeTab === 'inspect' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className="bg-blue-600 text-white p-2.5 rounded-full -mt-6 border-4 border-slate-50 shadow-lg">
             <ClipboardCheck size={18} />
          </div>
          <span>Ceklist</span>
        </button>
        <button 
          onClick={() => handleTabChange('history')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all ${activeTab === 'history' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <History size={18} />
          <span>Riwayat</span>
        </button>
      </div>
      
      {/* Desktop Sidebar/Tabs (only on screens >= 1024px) */}
      <div className="hidden lg:flex fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-2 rounded-full shadow-2xl border border-slate-200 z-40 gap-1.5 items-center">
         <button 
            onClick={() => handleTabChange('dashboard')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
         >
           Dasbor
         </button>
         <button 
            onClick={() => handleTabChange('pic-directory')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'pic-directory' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
         >
           <Building2 size={16} />
           Direktori Toko PIC
         </button>
         <button 
            onClick={() => handleTabChange('inspect')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'inspect' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
         >
           Inspeksi Baru
         </button>
         <button 
            onClick={() => handleTabChange('history')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'history' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
         >
           Riwayat
         </button>
      </div>

      {/* Modal Pasang APK */}
      <ApkInstallModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      {/* Modal Tombol Login */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <LoginScreen
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setIsLoginModalOpen(false);
              setIsGuestMode(false);
            }}
            onClose={() => setIsLoginModalOpen(false)}
          />
        </div>
      )}

    </div>
  );
};

export default App;
