import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  CloudUpload,
  Smartphone,
  ExternalLink,
  LayoutDashboard
} from 'lucide-react';
import { 
  loginWithNikAndPassword, 
  findSupervisorByNik, 
  getRememberedNik, 
  AuthUser 
} from '../services/authService';
import { BUBantenSupervisor } from '../data/buBantenStores';
import ApkInstallModal from './ApkInstallModal';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
  onClose?: () => void;
  onContinueAsGuest?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLoginSuccess, 
  onClose,
  onContinueAsGuest
}) => {
  const [nik, setNik] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showApkModal, setShowApkModal] = useState<boolean>(false);

  // Load remembered NIK on mount
  useEffect(() => {
    const remembered = getRememberedNik();
    if (remembered) {
      setNik(remembered);
    }
  }, []);

  // Detect supervisor details live as NIK is entered
  const detectedSupervisor: BUBantenSupervisor | undefined = findSupervisorByNik(nik);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!nik.trim()) {
      setErrorMessage('Silakan masukkan NIK.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Silakan masukkan password.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate quick secure check
      await new Promise(resolve => setTimeout(resolve, 300));
      const user = await loginWithNikAndPassword(nik, password, rememberMe);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal masuk. Periksa kembali NIK dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-between text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl"></div>
      </div>

      {/* Top Brand Bar */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-400 shadow-inner">
            <ShieldCheck size={26} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-wide uppercase text-blue-400">
              Loss Prevention Department
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowApkModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 hover:text-white border border-emerald-400/40 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Pasang aplikasi APK di HP Android"
          >
            <Smartphone size={16} className="text-emerald-400" />
            <span>Pasang APK</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-bold px-2.5"
              title="Tutup Login"
            >
              Tutup
            </button>
          )}
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-white/95 backdrop-blur-xl text-slate-800 rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8">
          
          {/* Card Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-tr from-blue-700 to-blue-500 text-white shadow-lg shadow-blue-500/30 mb-3">
              <Lock size={26} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              LOGIN
            </h2>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-shake">
              <AlertCircle size={18} className="shrink-0 text-rose-500 mt-0.5" />
              <div>
                <p className="font-semibold">Login Gagal</p>
                <p className="text-rose-600">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input NIK */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                NIK
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={nik}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setNik(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Contoh: 094826"
                  required
                  autoFocus
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all uppercase"
                />
              </div>

              {/* Live Detection Badge if valid supervisor NIK detected */}
              {detectedSupervisor && (
                <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  <div className="min-w-0">
                    <p className="font-bold truncate">
                      {detectedSupervisor.name}
                    </p>
                    <p className="text-[11px] text-emerald-700 truncate">
                      {detectedSupervisor.jabatan} • Base: {detectedSupervisor.homeBase}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Masukkan password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-medium">Ingat NIK saya</span>
              </label>
            </div>

            {/* Submit Button (Tombol Login Background Biru) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 text-sm sm:text-base tracking-wide active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} className="stroke-[2.5]" />
                  <span>LOGIN</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sync Notice */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs text-blue-200/90 bg-blue-900/40 backdrop-blur-md px-3 py-1 rounded-full border border-blue-400/20">
            <CloudUpload size={13} className="text-emerald-400" />
            <span>Sinkronisasi Google Drive LP: <strong>Aktif Otomatis</strong></span>
          </div>
        </div>
      </main>

      {/* Footer Notice */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center text-xs text-slate-400 py-3 border-t border-slate-800">
        <p className="text-[11px]">
          © {new Date().getFullYear()} PT. Home Center Indonesia & Retail Group • <span className="text-blue-400 font-bold">Loss Prevention Department</span>
        </p>
      </footer>

      {/* Modal Pasang APK */}
      <ApkInstallModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
      />
    </div>
  );
};

export default LoginScreen;
