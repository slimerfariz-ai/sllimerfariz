import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout, getEffectiveDriveToken, getStoredWebhookUrl, saveStoredWebhookUrl } from '../services/googleAuth';
import { LogOut, CheckCircle2, Loader2, CloudUpload, Settings, Key, Check, Copy } from 'lucide-react';

interface GoogleAuthButtonProps {
  onAuthStateChange?: (user: User | null, token: string | null) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ onAuthStateChange }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSharedToken, setHasSharedToken] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);

  useEffect(() => {
    const checkTokenStatus = async () => {
      const activeToken = await getEffectiveDriveToken();
      const wh = getStoredWebhookUrl();
      if (activeToken || wh) {
        setHasSharedToken(true);
      }
      if (wh) {
        setWebhookUrl(wh);
      }
    };
    checkTokenStatus();

    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setHasSharedToken(true);
        if (onAuthStateChange) onAuthStateChange(currentUser, accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
        checkTokenStatus();
        if (onAuthStateChange) onAuthStateChange(null, null);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [onAuthStateChange]);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setHasSharedToken(true);
        if (onAuthStateChange) onAuthStateChange(res.user, res.accessToken);
      }
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setHasSharedToken(false);
    if (onAuthStateChange) onAuthStateChange(null, null);
  };

  const handleSaveWebhook = async () => {
    setIsSavingWebhook(true);
    await saveStoredWebhookUrl(webhookUrl);
    setHasSharedToken(true);
    setIsSavingWebhook(false);
    setIsModalOpen(false);
    alert('Webhook Google Drive berhasil disimpan! Upload otomatis aktif 24/7 tanpa perlu login.');
  };

  const appsScriptCode = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var report = data.report || data;
    var folderName = "Laporan Inspeksi LP BU Banten";
    
    // Cari / buat folder
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    
    // Buat Spreadsheet
    var cleanDate = (report.date || new Date().toISOString()).substring(0, 10);
    var title = "Laporan LP - " + (report.store || "Toko BU Banten") + " - " + cleanDate;
    var ss = SpreadsheetApp.create(title);
    var file = DriveApp.getFileById(ss.getId());
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
    
    // Sheet 1: Ringkasan
    var s1 = ss.getActiveSheet();
    s1.setName("Ringkasan Laporan");
    s1.appendRow(["LAPORAN INSPEKSI LOSS PREVENTION BU BANTEN", ""]);
    s1.appendRow(["Toko / Store", report.store || "-"]);
    s1.appendRow(["Tanggal Inspeksi", report.date || "-"]);
    s1.appendRow(["Nama Supervisor", report.lpSupervisor || "-"]);
    s1.appendRow(["NIK Supervisor", report.nik || "-"]);
    s1.appendRow(["Skor Kepatuhan", (report.complianceScore || 0) + "%"]);
    s1.appendRow(["Ringkasan AI", report.aiSummary || "-"]);
    s1.appendRow(["Waktu Simpan", new Date().toLocaleString("id-ID")]);
    
    // Sheet 2: Ceklist
    if (report.items && report.items.length > 0) {
      var s2 = ss.insertSheet("Data Ceklist");
      s2.appendRow(["No", "Kategori", "Item Pemeriksaan", "Status", "Catatan"]);
      for (var i = 0; i < report.items.length; i++) {
        var it = report.items[i];
        s2.appendRow([i + 1, it.category || "-", it.label || "-", it.status || "-", it.comment || it.value || "-"]);
      }
    }
    
    // Sheet 3: Observasi
    if (report.observations && report.observations.length > 0) {
      var s3 = ss.insertSheet("Temuan Observasi");
      s3.appendRow(["No", "Lokasi", "Tingkat Risiko", "Waktu", "Deskripsi"]);
      for (var j = 0; j < report.observations.length; j++) {
        var obs = report.observations[j];
        s3.appendRow([j + 1, obs.location || "-", obs.severity || "-", obs.timestamp || "-", obs.description || "-"]);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      spreadsheetUrl: ss.getUrl(),
      spreadsheetId: ss.getId(),
      folderUrl: folder.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  return (
    <>
      <div className="flex items-center gap-1.5">
        {user || hasSharedToken ? (
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 py-1 px-2.5 rounded-full text-xs" title="Otomatisasi Google Drive Aktif">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-800">
              Auto Drive
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              title="Pengaturan Otomatisasi Google Drive"
              className="text-slate-400 hover:text-emerald-700 p-0.5 transition-colors cursor-pointer"
            >
              <Settings size={13} />
            </button>
            <button
              onClick={handleSignOut}
              title="Putuskan koneksi Google Drive"
              className="text-slate-400 hover:text-red-600 p-0.5 ml-0.5 transition-colors cursor-pointer"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white py-1.5 px-2.5 sm:px-3 rounded-lg text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              title="Hubungkan akun Google Drive agar seluruh anggota dapat upload otomatis tanpa login"
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin text-white" />
              ) : (
                <CloudUpload size={14} />
              )}
              <span>Auto Drive</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              title="Opsi Webhook Apps Script (Tanpa Login 24/7)"
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-300 transition-colors"
            >
              <Settings size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Modal Pengaturan Otomatisasi Drive */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CloudUpload className="text-emerald-600" size={20} />
                <h3 className="font-bold text-slate-900 text-base">Otomatisasi Google Drive</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
              <p className="font-bold">✓ Target: Google Drive LP BU Banten</p>
              <p className="text-emerald-800">
                Laporan inspeksi dari seluruh penginput akan otomatis tersimpan ke folder <strong>"Laporan Inspeksi LP BU Banten"</strong> di Google Drive LP tanpa meminta login kepada setiap penginput.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Opsi 1: Hubungkan Akun Sekali Klik</h4>
              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                <span>{hasSharedToken ? 'Perbarui Otorisasi Google Drive LP Banten' : 'Hubungkan Akun Google Drive LP Banten'}</span>
              </button>
              <p className="text-[11px] text-slate-500">
                Token otorisasi akan otomatis dibagikan melalui database Firestore sehingga seluruh anggota tidak perlu login.
              </p>
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Opsi 2: Webhook Google Apps Script (Permanen 24/7)</h4>
              <p className="text-xs text-slate-600">
                Jika ingin upload tanpa token OAuth (tidak pernah kedaluwarsa), Anda dapat memasukkan URL Web App Google Apps Script dari akun Google Drive LP Banten:
              </p>
              <input
                type="text"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleSaveWebhook}
                  disabled={isSavingWebhook || !webhookUrl}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                >
                  Simpan Webhook URL
                </button>
              </div>

              <details className="mt-2 text-[11px] text-slate-600 bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                <summary className="font-semibold cursor-pointer text-slate-700">Kode Google Apps Script (Klik untuk melihat)</summary>
                <div className="mt-2 relative">
                  <pre className="p-2 bg-slate-900 text-slate-100 rounded text-[10px] overflow-x-auto max-h-40">
                    {appsScriptCode}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(appsScriptCode);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="mt-1 px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold flex items-center gap-1"
                  >
                    {isCopied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                    <span>{isCopied ? 'Tersalin!' : 'Salin Kode Script'}</span>
                  </button>
                </div>
              </details>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
