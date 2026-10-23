import React, { useState } from 'react';
import { X, Smartphone, Download, CheckCircle2, Copy, Check, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';
import { usePWAInstall } from '../services/usePWAInstall';

interface ApkInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkInstallModal: React.FC<ApkInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-blue-700 via-blue-600 to-indigo-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner text-white">
              <Smartphone size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                Aplikasi Android (APK)
                <span className="text-[10px] uppercase tracking-wider bg-emerald-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full">
                  Mobile Ready
                </span>
              </h2>
              <p className="text-xs text-blue-100 font-medium">
                Loss Prevention Department Mobile App
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
          {/* Status if already installed */}
          {isInstalled || installSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle2 size={22} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900 text-sm">Aplikasi Sudah Terpasang!</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Aplikasi Loss Prevention sudah berjalan dalam mode mandiri (Standalone WebAPK) di perangkat Anda.
                </p>
              </div>
            </div>
          ) : null}

          {/* Direct Install CTA Button if browser prompt is ready */}
          {isInstallable && !isInstalled && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-blue-900 mb-2">
                ⚡ Pasang Otomatis ke HP (Satu Klik):
              </p>
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer"
              >
                <Download size={18} />
                <span>Pasang Aplikasi ke HP (WebAPK)</span>
              </button>
              <p className="text-[11px] text-blue-700 text-center mt-2">
                Akan otomatis membuat ikon aplikasi di layar beranda dan menu HP Android Anda.
              </p>
            </div>
          )}

          {/* Android Chrome Install Instructions */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
              <Smartphone size={16} className="text-blue-600" />
              Cara Pasang di HP Android (Google Chrome):
            </h3>
            <ol className="space-y-2.5 text-xs text-slate-600 leading-relaxed list-decimal list-inside pl-1">
              <li>
                Buka tautan aplikasi ini di browser <strong className="text-slate-800">Google Chrome</strong> pada HP Android Anda.
              </li>
              <li>
                Ketuk tombol <strong className="text-slate-800">Menu Titik Tiga (⋮)</strong> di pojok kanan atas layar browser Chrome.
              </li>
              <li>
                Pilih opsi <strong className="text-blue-600 font-bold">"Tambahkan ke Layar Utama"</strong> atau <strong className="text-blue-600 font-bold">"Instal Aplikasi"</strong> (Add to Home screen).
              </li>
              <li>
                Ketuk <strong className="text-slate-800">"Instal"</strong>. HP Android akan otomatis membuat berkas WebAPK dan aplikasi dapat dibuka langsung dari layar beranda tanpa address bar browser!
              </li>
            </ol>
          </div>

          {/* Standalone APK File Package Guide */}
          <div className="border border-indigo-100 bg-linear-to-br from-indigo-50/60 to-blue-50/60 rounded-2xl p-4">
            <h3 className="font-bold text-indigo-950 text-sm flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-indigo-600" />
              Ingin Berkas File Standalone (.APK)?
            </h3>
            <p className="text-xs text-indigo-900 leading-relaxed mb-3">
              Aplikasi ini telah dilengkapi konfigurasi PWA Manifest standar (WebAPK). Jika Anda membutuhkan berkas installer fisik berformat <strong>.apk</strong> untuk dikirim via file/flashdisk:
            </p>
            <div className="bg-white/80 rounded-xl p-3 border border-indigo-200/60 text-xs text-slate-700 space-y-1.5">
              <p className="font-semibold text-indigo-900">1. Gunakan PWABuilder (Resmi & Gratis):</p>
              <p className="text-[11px] text-slate-600">
                Kunjungi <strong className="text-slate-800">pwabuilder.com</strong>, tempelkan link aplikasi ini, lalu klik <span className="text-indigo-600 font-bold">"Package for Android"</span> untuk mengunduh berkas APK siap install.
              </p>
              <p className="font-semibold text-indigo-900 mt-2">2. Atau Gunakan Capacitor / Cordova:</p>
              <p className="text-[11px] text-slate-600">
                Ekspor build dengan perintah <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono text-[10px]">npx cap run android</code> untuk menghasilkan file <code className="text-[10px] font-mono">app-release.apk</code>.
              </p>
            </div>
          </div>

          {/* iOS Safari Fallback */}
          {isIOS && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
              <p className="font-bold mb-1">Pengguna iPhone / iPad (iOS):</p>
              <p>
                Tekan tombol <strong className="font-bold">Share (Bagikan)</strong> di bilah navigasi Safari, lalu pilih <strong className="font-bold">"Add to Home Screen (Tambah ke Layar Utama)"</strong>.
              </p>
            </div>
          )}

          {/* Share App Link */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tautan Aplikasi untuk Dibagikan ke Tim LP
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full text-xs font-mono bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-700 select-all"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer"
                title="Salin Tautan Aplikasi"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApkInstallModal;
