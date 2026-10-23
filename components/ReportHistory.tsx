
import React, { useState, useEffect, useRef } from 'react';
import { DailyReport, InspectionStatus } from '../types';
import { ChevronDown, ChevronUp, FileText, Calendar, User, CheckCircle, XCircle, Clock, Badge, Loader2, Camera, Image as ImageIcon, Mail, FileDown, Check, X, Minus, Store, UserCheck, CloudUpload, FileSpreadsheet, ExternalLink, Trash2, Folder, FolderOpen, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { getAccessToken, googleSignIn, getEffectiveDriveToken, getEffectiveWebhookUrl } from '../services/googleAuth';
import { uploadInspectionToGoogleSheets } from '../services/googleSheetsService';
import { getOrCreateInspectionFolder, uploadReportSummaryToDrive, autoUploadInspectionToGoogleDrive } from '../services/googleDriveService';
import { updateReport, deleteReport } from '../services/storageService';

interface ReportHistoryProps {
  reports: DailyReport[];
}

const ReportHistory: React.FC<ReportHistoryProps> = ({ reports }) => {
  const [localReports, setLocalReports] = useState<DailyReport[]>(reports);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [uploadingSheetsId, setUploadingSheetsId] = useState<string | null>(null);
  const [openingFolder, setOpeningFolder] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState<string | null>(null);
  const isAutoSyncingRef = useRef(false);

  useEffect(() => {
    setLocalReports(reports);
  }, [reports]);

  // Background Auto-Sync: Jika token aktif tersedia, otomatis upload laporan yang belum tersinkron
  useEffect(() => {
    const runAutoSync = async () => {
      if (isAutoSyncingRef.current) return;
      const token = await getEffectiveDriveToken();
      if (!token) return;

      const unsynced = localReports.filter(r => !r.googleSpreadsheetUrl);
      if (unsynced.length === 0) return;

      isAutoSyncingRef.current = true;
      for (const report of unsynced) {
        try {
          const res = await autoUploadInspectionToGoogleDrive(report);
          if (res) {
            const updated: DailyReport = {
              ...report,
              googleSpreadsheetUrl: res.spreadsheetUrl,
              googleSpreadsheetId: res.spreadsheetId,
              googleDriveFolderUrl: res.driveFolderUrl,
              googleDriveFileUrl: res.driveFileUrl || res.spreadsheetUrl,
              uploadedToDriveAt: res.uploadedAt,
              googleDriveSyncStatus: 'synced',
            };
            await updateReport(updated);
            setLocalReports(prev => prev.map(r => r.id === report.id ? updated : r));
          }
        } catch (e) {
          console.warn(`Gagal auto-sync laporan ${report.id}:`, e);
        }
      }
      isAutoSyncingRef.current = false;
    };

    runAutoSync();
  }, [localReports]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleOpenDriveFolder = async () => {
    setOpeningFolder(true);
    try {
      let token = await getEffectiveDriveToken();
      if (!token) {
        const authRes = await googleSignIn();
        if (authRes) token = authRes.accessToken;
      }
      if (!token) {
        alert('Silakan hubungkan akun Google Drive LP Banten terlebih dahulu.');
        return;
      }
      const folderRes = await getOrCreateInspectionFolder(token);
      if (folderRes.webViewLink) {
        window.open(folderRes.webViewLink, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      console.error("Gagal membuka folder Google Drive:", err);
      alert("Gagal membuka folder Google Drive: " + (err.message || 'Error'));
    } finally {
      setOpeningFolder(false);
    }
  };

  const handleUploadToSheets = async (e: React.MouseEvent, report: DailyReport) => {
    e.stopPropagation();
    setUploadingSheetsId(report.id);
    try {
      // 1. Coba upload otomatis tanpa login popup
      const driveRes = await autoUploadInspectionToGoogleDrive(report);
      if (driveRes) {
        const updated: DailyReport = {
          ...report,
          googleSpreadsheetUrl: driveRes.spreadsheetUrl,
          googleSpreadsheetId: driveRes.spreadsheetId,
          googleDriveFolderUrl: driveRes.driveFolderUrl,
          googleDriveFileUrl: driveRes.driveFileUrl || driveRes.spreadsheetUrl,
          uploadedToDriveAt: driveRes.uploadedAt,
          googleDriveSyncStatus: 'synced',
        };
        await updateReport(updated);
        setLocalReports((prev) => prev.map((r) => (r.id === report.id ? updated : r)));
        if (driveRes.driveFileUrl) {
          window.open(driveRes.driveFileUrl, '_blank', 'noopener,noreferrer');
        }
        return;
      }

      // 2. Jika token belum ada sama sekali, minta login manual
      const confirmed = window.confirm(
        'Belum ada sesi Google Drive aktif. Hubungkan Google Drive LP Banten sekarang untuk mengunggah laporan ini?'
      );
      if (!confirmed) return;

      const authRes = await googleSignIn();
      if (!authRes?.accessToken) return;

      const sheetRes = await uploadInspectionToGoogleSheets(report, authRes.accessToken);
      const updated: DailyReport = {
        ...report,
        googleSpreadsheetUrl: sheetRes.spreadsheetUrl,
        googleSpreadsheetId: sheetRes.spreadsheetId,
        googleDriveFolderUrl: sheetRes.folderUrl,
        googleDriveFileUrl: sheetRes.driveViewUrl || sheetRes.spreadsheetUrl,
        uploadedToDriveAt: new Date().toISOString(),
        googleDriveSyncStatus: 'synced',
      };
      await updateReport(updated);
      setLocalReports((prev) => prev.map((r) => (r.id === report.id ? updated : r)));
      window.open(sheetRes.driveViewUrl || sheetRes.spreadsheetUrl, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      console.error("Gagal upload Google Drive:", err);
      alert("Gagal mengunggah ke Google Drive: " + (err.message || 'Terjadi kesalahan'));
    } finally {
      setUploadingSheetsId(null);
    }
  };

  const handleSyncAllPending = async () => {
    const unsynced = localReports.filter((r) => !r.googleSpreadsheetUrl);
    if (unsynced.length === 0) return;

    let token = await getEffectiveDriveToken();
    const webhook = await getEffectiveWebhookUrl();
    if (!token && !webhook) {
      const authRes = await googleSignIn();
      if (authRes) token = authRes.accessToken;
      if (!token && !(await getEffectiveWebhookUrl())) return;
    }

    setIsSyncingAll(true);
    let successCount = 0;
    for (let i = 0; i < unsynced.length; i++) {
      const rep = unsynced[i];
      setSyncStatusText(`Mengunggah ${i + 1}/${unsynced.length}: ${rep.store || 'Toko'}...`);
      try {
        const driveRes = await autoUploadInspectionToGoogleDrive(rep);
        if (driveRes) {
          const updated: DailyReport = {
            ...rep,
            googleSpreadsheetUrl: driveRes.spreadsheetUrl,
            googleSpreadsheetId: driveRes.spreadsheetId,
            googleDriveFolderUrl: driveRes.driveFolderUrl,
            googleDriveFileUrl: driveRes.driveFileUrl || driveRes.spreadsheetUrl,
            uploadedToDriveAt: driveRes.uploadedAt,
            googleDriveSyncStatus: 'synced',
          };
          await updateReport(updated);
          setLocalReports((prev) => prev.map((r) => (r.id === rep.id ? updated : r)));
          successCount++;
        }
      } catch (err) {
        console.warn(`Gagal mengunggah laporan ${rep.id}:`, err);
      }
    }

    setIsSyncingAll(false);
    setSyncStatusText(null);
    alert(`Sinkronisasi selesai! Berhasil mengunggah ${successCount} laporan ke Google Drive.`);
  };

  const handleDeleteReport = async (e: React.MouseEvent, report: DailyReport) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus laporan "${report.store || 'Toko'}" dari database?`);
    if (!confirmed) return;

    try {
      await deleteReport(report.id);
      setLocalReports(prev => prev.filter(r => r.id !== report.id));
    } catch (err) {
      console.error("Gagal menghapus laporan:", err);
      alert("Gagal menghapus laporan dari database.");
    }
  };

  const handleEmailReport = (e: React.MouseEvent, report: DailyReport) => {
    e.stopPropagation();
    const locationInfo = report.store || report.shift || 'Store';
    const subject = `Laporan LP - ${locationInfo} - ${new Date(report.date).toLocaleDateString('id-ID')}`;
    const body = `Yth. Pimpinan (hasanfariz123@gmail.com),

Berikut adalah ringkasan laporan inspeksi:

Tanggal: ${new Date(report.date).toLocaleDateString('id-ID')}
Nama LP Supervisor: ${report.lpSupervisor || report.shift || '-'}
NIK: ${report.nik || report.inspectorName || '-'}
Toko/store: ${report.store || '-'}
Skor Kepatuhan: ${report.complianceScore}%

Ringkasan AI:
${report.aiSummary || '-'}

Mohon cek lampiran file PDF (jika ada) untuk detail lengkap.

Terima kasih.`;

    const mailtoLink = `mailto:hasanfariz123@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const handleDownloadPDF = async (e: React.MouseEvent, report: DailyReport) => {
    e.stopPropagation();
    setDownloadingId(report.id);

    try {
      const input = document.getElementById(`report-content-${report.id}`);
      
      if (input) {
        // Use html2canvas to capture the specific report element
        const canvas = await html2canvas(input, {
          scale: 2, // Improve quality
          useCORS: true, // Handle images
          logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        
        // Create PDF (A4 size)
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        // Calculate aspect ratio to fit width
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 0.95; // 0.95 for margin
        
        const imgX = (pdfWidth - (imgWidth * ratio)) / 2;
        const imgY = 10; // Top margin

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        
        // Generate File Name
        const safeDate = new Date(report.date).toLocaleDateString('id-ID').replace(/\//g, '-');
        const safeName = (report.store || report.shift || 'Inspeksi').replace(/[^a-zA-Z0-9]/g, '_');
        
        pdf.save(`Laporan_LP_${safeName}_${safeDate}.pdf`);
      } else {
        alert("Gagal menemukan konten laporan untuk dicetak. Pastikan laporan terbuka.");
      }
    } catch (error) {
      console.error("Gagal membuat PDF:", error);
      alert("Terjadi kesalahan saat membuat file PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Helper to group items by category
  const getGroupedItems = (items: DailyReport['items']) => {
    const groups: { [key: string]: DailyReport['items'] } = {};
    items.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    // Order categories if needed, or rely on insertion order (usually matches INITIAL_CHECKLIST order if not messed with)
    return groups;
  };

  if (reports.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <FileText className="text-slate-400" size={32} />
        </div>
        <h3 className="text-lg font-medium text-slate-800">Belum Ada Laporan</h3>
        <p className="text-slate-500">Inspeksi yang telah selesai akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-emerald-50/80 border border-emerald-200 rounded-xl p-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Riwayat Inspeksi</h2>
          <p className="text-xs text-emerald-800 mt-0.5 flex items-center gap-1.5 font-medium">
            <CloudUpload size={14} className="text-emerald-600" />
            Upload Otomatis Aktif ke Google Drive LP Banten
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {localReports.some(r => !r.googleSpreadsheetUrl) && (
            <button
              onClick={handleSyncAllPending}
              disabled={isSyncingAll}
              className="flex items-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Sinkronkan seluruh laporan tertunda langsung ke Google Drive LP Banten"
            >
              {isSyncingAll ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              <span>
                {isSyncingAll
                  ? (syncStatusText || 'Menyinkronkan...')
                  : `Sinkronkan ${localReports.filter(r => !r.googleSpreadsheetUrl).length} Laporan`}
              </span>
            </button>
          )}
          <button
            onClick={handleOpenDriveFolder}
            disabled={openingFolder}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Buka folder 'Laporan Inspeksi LP BU Banten' di Google Drive"
          >
            {openingFolder ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <FolderOpen size={15} />
            )}
            <span>Folder Google Drive</span>
          </button>
        </div>
      </div>

      {localReports.map((report) => (
        <div key={report.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-200">
          <div 
            onClick={() => toggleExpand(report.id)}
            className="p-5 cursor-pointer hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative"
          >
            <div className="flex items-start gap-4">
              <div className={`mt-1 p-2 rounded-lg ${report.complianceScore >= 90 ? 'bg-green-100 text-green-700' : report.complianceScore >= 75 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                <span className="font-bold text-lg">{report.complianceScore}%</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-600 font-medium">
                    {new Date(report.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 my-1">
                  {(report.store || report.shift) && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      <Store size={12} />
                      <span>{report.store ? `Toko: ${report.store}` : report.shift}</span>
                    </div>
                  )}
                  {report.lpSupervisor && (
                    <div className="flex items-center gap-1 text-xs text-slate-700 font-medium">
                      <UserCheck size={12} className="text-slate-400" />
                      <span>Spv: {report.lpSupervisor}</span>
                    </div>
                  )}
                  {(report.nik || report.inspectorName) && (
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <Badge size={12} className="text-slate-400" />
                      <span>NIK: {report.nik || report.inspectorName}</span>
                    </div>
                  )}
                  {(report.googleDriveFileUrl || report.googleSpreadsheetUrl) && (
                    <a
                      href={report.googleDriveFileUrl || report.googleSpreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded border border-emerald-300 transition-colors"
                      title="File tersimpan di Google Drive LP Banten"
                    >
                      <CloudUpload size={12} className="text-emerald-700" />
                      <span>Google Drive</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                  {report.googleSpreadsheetUrl && (
                    <a
                      href={report.googleSpreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
                      title="Buka Google Spreadsheet"
                    >
                      <FileSpreadsheet size={12} className="text-emerald-700" />
                      <span>Sheet</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                  {!report.googleSpreadsheetUrl && (
                    <button
                      onClick={(e) => handleUploadToSheets(e, report)}
                      disabled={uploadingSheetsId === report.id}
                      className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-300 transition-colors cursor-pointer"
                      title="Sinkronkan laporan ini ke Google Drive LP Banten"
                    >
                      {uploadingSheetsId === report.id ? (
                        <Loader2 size={11} className="animate-spin text-amber-700" />
                      ) : (
                        <CloudUpload size={11} className="text-amber-700" />
                      )}
                      <span>Sync ke Drive</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <div className="flex gap-4 text-sm text-slate-500 mr-2">
                   <span className="flex items-center gap-1"><XCircle size={14} className="text-red-500"/> {report.items.filter(i => i.status === InspectionStatus.FAIL).length} Gagal</span>
                   <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500"/> {report.items.filter(i => i.status === InspectionStatus.PASS).length} OK</span>
                </div>
                {expandedId === report.id ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
            </div>
          </div>

          {expandedId === report.id && (
            <div className="border-t border-slate-100 bg-slate-50 p-6 relative">
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 mb-4">
                  {report.googleDriveFileUrl || report.googleSpreadsheetUrl ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={report.googleDriveFileUrl || report.googleSpreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        <CloudUpload size={16} />
                        Buka di Google Drive
                        <ExternalLink size={13} className="opacity-80" />
                      </a>
                      {report.googleSpreadsheetUrl && (
                        <a
                          href={report.googleSpreadsheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors"
                        >
                          <FileSpreadsheet size={15} />
                          Spreadsheet
                        </a>
                      )}
                      {report.googleDriveFolderUrl && (
                        <a
                          href={report.googleDriveFolderUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                        >
                          <Folder size={15} />
                          Folder Drive
                        </a>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleUploadToSheets(e, report)}
                      disabled={uploadingSheetsId === report.id}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors"
                    >
                      {uploadingSheetsId === report.id ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Mengunggah ke Drive...
                        </>
                      ) : (
                        <>
                          <CloudUpload size={16} className="text-emerald-700" />
                          Upload ke Google Drive
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={(e) => handleEmailReport(e, report)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    <Mail size={16} />
                    Lapor Email
                  </button>

                  <button
                    onClick={(e) => handleDownloadPDF(e, report)}
                    disabled={downloadingId === report.id}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    {downloadingId === report.id ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Memproses PDF...
                        </>
                    ) : (
                        <>
                            <FileDown size={16} />
                            Unduh PDF
                        </>
                    )}
                  </button>

                  <button
                    onClick={(e) => handleDeleteReport(e, report)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-sm font-medium hover:bg-rose-100 transition-colors"
                    title="Hapus laporan dari database"
                  >
                    <Trash2 size={15} />
                    <span>Hapus</span>
                  </button>
              </div>

              {/* Printable Content Area */}
              <div id={`report-content-${report.id}`} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                  {/* PDF Header */}
                  <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-end">
                      <div>
                          <h1 className="text-xl font-bold text-slate-900 uppercase tracking-wide">Laporan Harian LP</h1>
                          <p className="text-xs text-slate-500 mt-1">Loss Prevention & Operasional Store</p>
                      </div>
                      <div className="text-right">
                          <p className="text-sm font-bold text-slate-800">{report.store ? `Toko: ${report.store}` : (report.shift || '')}</p>
                          <p className="text-xs text-slate-500">{new Date(report.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm bg-slate-50 p-4 rounded border border-slate-100">
                      <div>
                          <p className="text-slate-500 text-xs">Nama LP Supervisor</p>
                          <p className="font-semibold text-slate-800">{report.lpSupervisor || report.shift || '-'}</p>
                      </div>
                      <div>
                          <p className="text-slate-500 text-xs">NIK</p>
                          <p className="font-semibold text-slate-800">{report.nik || report.inspectorName || '-'}</p>
                      </div>
                      <div>
                          <p className="text-slate-500 text-xs">Toko/store</p>
                          <p className="font-semibold text-slate-800">{report.store || '-'}</p>
                      </div>
                      <div>
                          <p className="text-slate-500 text-xs">Skor Kepatuhan</p>
                          <p className={`font-bold ${report.complianceScore >= 90 ? 'text-green-600' : 'text-red-600'}`}>{report.complianceScore}%</p>
                      </div>
                  </div>

                  {/* AI Summary Section */}
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
                    <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">
                      Ringkasan Eksekutif AI
                    </h4>
                    <div className="prose prose-sm text-slate-700 max-w-none text-xs leading-relaxed">
                      <ReactMarkdown>{report.aiSummary || "Ringkasan tidak tersedia."}</ReactMarkdown>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {/* Details Items Grouped by Category */}
                    <div>
                      <h4 className="font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2 text-sm">
                        Detail Pengecekan
                      </h4>
                      
                      <div className="space-y-4">
                        {Object.entries(getGroupedItems(report.items)).map(([category, items]) => (
                          <div key={category} className="break-inside-avoid">
                             <h5 className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide pl-1">{category}</h5>
                             <div className="border border-slate-200 rounded-lg overflow-hidden">
                                {items.map((item, idx) => (
                                   <div key={item.id} className={`p-3 flex items-start justify-between gap-4 ${idx !== items.length - 1 ? 'border-b border-slate-100' : ''} ${item.status === InspectionStatus.FAIL ? 'bg-red-50' : 'bg-white'}`}>
                                      
                                      <div className="flex-1">
                                         <p className={`text-sm font-medium ${item.status === InspectionStatus.FAIL ? 'text-red-900' : 'text-slate-700'}`}>
                                            {item.label}
                                         </p>
                                         {item.comment && (
                                            <p className="text-xs text-slate-500 mt-1 italic">
                                               "{item.comment}"
                                            </p>
                                         )}
                                         {item.photo && (
                                            <div className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                               <ImageIcon size={10} />
                                               Bukti Foto Terlampir
                                               {/* Optional: Show small thumb if needed for print */}
                                               <img src={item.photo} alt="Bukti" className="h-6 w-6 ml-1 rounded object-cover border border-blue-200" />
                                            </div>
                                         )}
                                      </div>

                                      <div className="flex-shrink-0 text-right">
                                         {item.inputType === 'date' ? (
                                            <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                               {item.value ? new Date(item.value).toLocaleDateString('id-ID') : '-'}
                                            </span>
                                         ) : (
                                            <div className="flex items-center gap-1">
                                               {item.status === InspectionStatus.PASS && (
                                                  <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">
                                                     <Check size={12} /> OK
                                                  </span>
                                               )}
                                               {item.status === InspectionStatus.FAIL && (
                                                  <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded border border-red-200">
                                                     <X size={12} /> NO
                                                  </span>
                                               )}
                                               {item.status === InspectionStatus.NA && (
                                                  <span className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                                                     <Minus size={12} /> N/A
                                                  </span>
                                               )}
                                            </div>
                                         )}
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Observations */}
                    <div>
                      <h4 className="font-bold text-amber-800 mb-3 border-b border-amber-200 pb-2 text-sm mt-4">
                        Observasi Lapangan
                      </h4>
                      {report.observations.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                          {report.observations.map(obs => (
                            <div key={obs.id} className="bg-amber-50 p-3 rounded border border-amber-100 text-xs break-inside-avoid">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-amber-900 uppercase">
                                  {obs.severity === 'Critical' ? 'KRITIS' : obs.severity === 'High' ? 'TINGGI' : obs.severity === 'Medium' ? 'SEDANG' : 'RENDAH'}
                                </span>
                                <span className="text-amber-800">{obs.location}</span>
                              </div>
                              <p className="text-slate-800 mb-2">{obs.description}</p>
                              {obs.photo && (
                                <div className="mt-2 border rounded overflow-hidden bg-white inline-block">
                                  <img 
                                    src={obs.photo} 
                                    alt="Bukti Temuan" 
                                    className="h-32 w-auto object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">Tidak ada observasi tambahan.</p>
                      )}
                    </div>
                  </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReportHistory;
