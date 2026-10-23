
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChecklistItem, InspectionStatus, Observation, INITIAL_CHECKLIST, DailyReport } from '../types';
import { generateReportSummary } from '../services/geminiService';
import { BU_BANTEN_STORES, BUBantenStore, BU_BANTEN_SUPERVISORS, BUBantenSupervisor, getSupervisorNik, saveSupervisorNik, getHomeBaseStore, getStoresBySupervisor } from '../data/buBantenStores';
import { getAccessToken, googleSignIn } from '../services/googleAuth';
import { uploadInspectionToGoogleSheets } from '../services/googleSheetsService';
import { getOrCreateInspectionFolder, uploadReportSummaryToDrive, autoUploadInspectionToGoogleDrive } from '../services/googleDriveService';
import { Save, AlertCircle, Plus, Trash2, Loader2, Wand2, Clock, Lock, Info, Camera, X, Wifi, WifiOff, RefreshCw, UserCheck, Badge, Store, ChevronDown, Check, Building2, MapPin, CloudUpload, FileSpreadsheet, FolderGit2 } from 'lucide-react';

import { AuthUser } from '../services/authService';

interface InspectionFormProps {
  onSave: (report: DailyReport) => void;
  onCancel: () => void;
  existingReports: DailyReport[];
  onDirtyChange: (isDirty: boolean) => void;
  initialStore?: BUBantenStore | null;
  currentUser?: AuthUser | null;
}

type CameraTarget = { type: 'observation' } | { type: 'checklist'; itemId: string };

const InspectionForm: React.FC<InspectionFormProps> = ({ 
  onSave, 
  onCancel, 
  existingReports, 
  onDirtyChange, 
  initialStore,
  currentUser 
}) => {
  const [lpSupervisor, setLpSupervisor] = useState(currentUser?.name || '');
  const [isSpvDropdownOpen, setIsSpvDropdownOpen] = useState(false);
  const spvPickerRef = useRef<HTMLDivElement>(null);
  const [nik, setNik] = useState(currentUser?.nik || '');
  const [nikError, setNikError] = useState<string | null>(null);
  const [store, setStore] = useState('');
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [storeFilterBrand, setStoreFilterBrand] = useState('ALL');
  const [filterBySelectedSpv, setFilterBySelectedSpv] = useState(true);
  const storePickerRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [newObs, setNewObs] = useState<Partial<Observation>>({ severity: 'Medium' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadToGoogleSheets, setUploadToGoogleSheets] = useState(true);
  const [uploadProgressText, setUploadProgressText] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(INITIAL_CHECKLIST[0].category);

  // Connection State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnectionChecking, setIsConnectionChecking] = useState(false);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<CameraTarget | null>(null);
  const [tempObsImage, setTempObsImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Pantau apakah ada data yang berubah untuk mengaktifkan peringatan keluar
  useEffect(() => {
    const isDirty = 
      lpSupervisor.length > 0 || 
      nik.length > 0 || 
      store.length > 0 || 
      observations.length > 0 ||
      items.some(item => item.status !== undefined || (item.comment && item.comment.length > 0) || item.photo);
    
    onDirtyChange(isDirty);
  }, [lpSupervisor, nik, store, items, observations, onDirtyChange]);

  // Otomatis mengisi NIK setiap kali nama LP Supervisor diisi atau berubah
  useEffect(() => {
    if (!lpSupervisor) return;
    const autoNik = getSupervisorNik(lpSupervisor);
    if (autoNik) {
      setNik(autoNik);
      setNikError(null);
    }
  }, [lpSupervisor]);

  // Fungsi Pengecekan Koneksi Aktif (Ping)
  const checkRealConnection = async (): Promise<boolean> => {
    setIsConnectionChecking(true);
    if (!navigator.onLine) {
      setIsOnline(false);
      setIsConnectionChecking(false);
      return false;
    }

    try {
      // Mencoba fetch ke resource publik yang ringan & stabil (Google Favicon)
      await fetch(`https://www.google.com/favicon.ico?t=${new Date().getTime()}`, { 
        mode: 'no-cors', 
        cache: 'no-store' 
      });
      
      setIsOnline(true);
      setIsConnectionChecking(false);
      return true;
    } catch (error) {
      console.warn("Internet check failed:", error);
      setIsOnline(false);
      setIsConnectionChecking(false);
      return false;
    }
  };

  // Setup Listener & Polling untuk Koneksi
  useEffect(() => {
    checkRealConnection(); // Cek awal
    
    const interval = setInterval(checkRealConnection, 15000); // Cek otomatis tiap 15 detik

    const handleOnline = () => checkRealConnection();
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Tutup dropdown toko saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (storePickerRef.current && !storePickerRef.current.contains(event.target as Node)) {
        setIsStoreDropdownOpen(false);
      }
      if (spvPickerRef.current && !spvPickerRef.current.contains(event.target as Node)) {
        setIsSpvDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSupervisors = useMemo(() => {
    const q = lpSupervisor.toLowerCase().trim();
    if (!q) return BU_BANTEN_SUPERVISORS;
    return BU_BANTEN_SUPERVISORS.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.nik.toLowerCase().includes(q) ||
      (s.namaStore && s.namaStore.toLowerCase().includes(q)) ||
      (s.codeStore && s.codeStore.toLowerCase().includes(q)) ||
      (s.city && s.city.toLowerCase().includes(q)) ||
      (s.role && s.role.toLowerCase().includes(q))
    );
  }, [lpSupervisor]);

  const handleSelectSupervisor = (spv: BUBantenSupervisor) => {
    setLpSupervisor(spv.name);
    const autoNik = getSupervisorNik(spv.name) || spv.nik;
    if (autoNik) {
      setNik(autoNik);
      setNikError(null);
    }
    if (!store && spv.codeStore && spv.namaStore) {
      setStore(`${spv.codeStore} - ${spv.namaStore}`);
    }
    setIsSpvDropdownOpen(false);
  };

  const handleSupervisorInputChange = (val: string) => {
    setLpSupervisor(val);
    setIsSpvDropdownOpen(true);
    // Jika nama yang dimasukkan cocok dengan supervisor BU Banten, isi NIK otomatis
    const autoNik = getSupervisorNik(val);
    if (autoNik) {
      setNik(autoNik);
      setNikError(null);
    }
  };

  // Inisialisasi jika ada initialStore dari Direktori
  useEffect(() => {
    if (initialStore) {
      handleSelectStore(initialStore);
    }
  }, [initialStore]);

  // Daftar toko yang dipegang oleh PIC LP Supervisor terpilih
  const supervisorStores = useMemo(() => {
    if (!lpSupervisor) return [];
    return getStoresBySupervisor(lpSupervisor);
  }, [lpSupervisor]);

  const filteredStores = useMemo(() => {
    const q = store.toLowerCase().trim();
    return BU_BANTEN_STORES.filter(s => {
      // Filter khusus toko yang dipegang oleh supervisor yang sedang dipilih
      if (filterBySelectedSpv && lpSupervisor) {
        const sSpv = s.lpSpv.toLowerCase();
        const curSpv = lpSupervisor.toLowerCase();
        if (!sSpv.includes(curSpv) && !curSpv.includes(sSpv)) return false;
      }

      const matchBrand = storeFilterBrand === 'ALL' || s.businessUnit.toUpperCase() === storeFilterBrand;
      if (!matchBrand) return false;
      if (!q) return true;
      return (
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.businessUnit.toLowerCase().includes(q) ||
        (s.homeBase && s.homeBase.toLowerCase().includes(q)) ||
        s.lpSpv.toLowerCase().includes(q) ||
        s.nikSpv.toLowerCase().includes(q)
      );
    });
  }, [store, storeFilterBrand, filterBySelectedSpv, lpSupervisor]);

  const handleSelectStore = (s: BUBantenStore) => {
    setStore(`${s.code} - ${s.name}`);
    if (s.lpSpv) {
      setLpSupervisor(s.lpSpv);
      setNik(s.nikSpv || getSupervisorNik(s.lpSpv));
      setNikError(null);
    }
    setIsStoreDropdownOpen(false);
  };

  const categories = Array.from(new Set(INITIAL_CHECKLIST.map(i => i.category)));

  const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNik(value);
    if (nikError) setNikError(null);
    if (lpSupervisor && value) {
      saveSupervisorNik(lpSupervisor, value);
    }
  };

  const handleStatusChange = (id: string, status: InspectionStatus) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const handleValueChange = (id: string, value: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, value } : item));
  };

  const handleCommentChange = (id: string, comment: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, comment } : item));
  };

  const startCamera = async (target: CameraTarget) => {
    try {
      setCameraTarget(target);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      setIsCameraOpen(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = mediaStream; }, 100);
    } catch (err) {
      alert("Tidak dapat mengakses kamera.");
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
    setIsCameraOpen(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current && cameraTarget) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        const width = 640;
        const scaleFactor = width / video.videoWidth;
        const height = video.videoHeight * scaleFactor;
        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);
        const imageData = canvas.toDataURL('image/jpeg', 0.7);
        if (cameraTarget.type === 'checklist') {
            setItems(prev => prev.map(item => item.id === cameraTarget.itemId ? { ...item, photo: imageData } : item));
        } else {
            setTempObsImage(imageData);
        }
        stopCamera();
      }
    }
  };

  const addObservation = () => {
    if (!newObs.description || !newObs.location) return;
    setObservations([...observations, {
      id: Date.now().toString(),
      description: newObs.description!,
      location: newObs.location!,
      severity: newObs.severity as any,
      timestamp: new Date().toISOString(),
      photo: tempObsImage || undefined
    }]);
    setNewObs({ severity: 'Medium', description: '', location: '' });
    setTempObsImage(null);
  };

  const calculateScore = () => {
    const scoreableItems = items.filter(i => !i.inputType || i.inputType === 'status');
    const applicableItems = scoreableItems.filter(i => i.status !== InspectionStatus.NA && i.status !== undefined);
    if (applicableItems.length === 0) return 0;
    const passed = applicableItems.filter(i => i.status === InspectionStatus.PASS).length;
    return Math.round((passed / applicableItems.length) * 100);
  };

  const handleSubmit = async () => {
    // Validasi Akhir Koneksi Sebelum Submit
    const connected = await checkRealConnection();
    if (!connected) {
      alert("Koneksi internet tidak stabil atau terputus. Gagal menghubungkan ke server AI.");
      return;
    }

    if (!lpSupervisor.trim() || !nik.trim() || !store.trim()) {
      alert("Harap lengkapi Nama LP Supervisor, NIK, dan Toko/store.");
      return;
    }
    if (nik.trim().length < 3) {
      setNikError("NIK harus minimal 3 karakter.");
      return;
    }

    setIsGenerating(true);
    setUploadProgressText("Menganalisa inspeksi dengan AI...");

    const reportData: DailyReport = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      lpSupervisor: lpSupervisor.trim(),
      nik: nik.trim(),
      store: store.trim(),
      inspectorName: nik.trim(),
      shift: lpSupervisor.trim(),
      items,
      observations,
      complianceScore: calculateScore(),
      aiSummary: 'Sedang membuat...'
    };

    try {
      const summary = await generateReportSummary(reportData);
      reportData.aiSummary = summary;
    } catch (aiErr) {
      console.warn("AI summary error:", aiErr);
    }

    // Upload otomatis ke Google Drive (lpdareabanten@gmail.com) TANPA MEMINTA LOGIN
    if (uploadToGoogleSheets) {
      try {
        setUploadProgressText(`Mengunggah otomatis ke Google Drive LP Banten...`);
        const driveRes = await autoUploadInspectionToGoogleDrive(reportData);
        if (driveRes) {
          reportData.googleSpreadsheetUrl = driveRes.spreadsheetUrl;
          reportData.googleSpreadsheetId = driveRes.spreadsheetId;
          reportData.googleDriveFolderUrl = driveRes.driveFolderUrl;
          reportData.googleDriveFileUrl = driveRes.driveFileUrl || driveRes.spreadsheetUrl;
          reportData.uploadedToDriveAt = driveRes.uploadedAt;
          reportData.googleDriveSyncStatus = 'synced';
        } else {
          // Tidak ada token aktif saat ini; simpan ke cloud dan antrikan sinkronisasi tanpa mengganggu petugas
          reportData.googleDriveSyncStatus = 'pending';
        }
      } catch (gErr: any) {
        console.warn("Upload Google Drive ditunda (akan disinkronkan otomatis):", gErr);
        reportData.googleDriveSyncStatus = 'pending';
        reportData.googleDriveSyncError = gErr?.message || String(gErr);
      }
    }

    setIsGenerating(false);
    setUploadProgressText(null);
    onSave(reportData);
  };

  const isFormDisabled = !isOnline;

  return (
    <div className="max-w-4xl mx-auto pb-24 relative">
      {!isOnline && (
        <div className="mb-4 p-4 bg-red-600 text-white rounded-xl shadow-lg flex items-center gap-3 animate-pulse">
          <WifiOff size={24} />
          <div>
            <p className="font-bold">Koneksi Terputus!</p>
            <p className="text-sm">Aktifkan internet untuk mengakses fitur AI dan menyimpan data.</p>
          </div>
        </div>
      )}

      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col justify-center items-center">
             <div className="relative w-full h-full max-w-md bg-black flex flex-col">
                <video ref={videoRef} autoPlay playsInline className="flex-1 w-full object-cover"></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
                <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-t from-black/80 to-transparent">
                  <button onClick={stopCamera} className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full"><X size={24} /></button>
                  <button onClick={takePhoto} className="bg-white p-1 rounded-full border-4 border-slate-300 active:scale-95"><div className="w-16 h-16 bg-white rounded-full border-4 border-slate-900"></div></button>
                  <div className="w-12"></div>
                </div>
             </div>
        </div>
      )}

      <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-opacity ${isFormDisabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div className="bg-slate-800 p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Wand2 className="text-blue-400" /> Inspeksi Harian</h2>
            <p className="text-slate-300 text-sm mt-1">Ceklist LP & Ops</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
             {/* Indikator Koneksi Aktif dengan Tombol Refresh */}
             <button 
                onClick={() => checkRealConnection()}
                title="Klik untuk cek koneksi"
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-all ${isOnline ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}
             >
                {isConnectionChecking ? <Loader2 size={14} className="animate-spin"/> : (isOnline ? <Wifi size={14}/> : <WifiOff size={14}/>)}
                {isOnline ? 'ONLINE' : 'OFFLINE'}
                {!isConnectionChecking && <RefreshCw size={10} className="ml-1 opacity-50"/>}
             </button>
          </div>
        </div>

        {!isFormDisabled && (
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <UserCheck size={16} className="text-blue-600" />
                    Nama LP Supervisor <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="relative">
                  <select
                    className="w-full p-3 pr-9 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 font-semibold cursor-pointer shadow-xs appearance-none"
                    value={lpSupervisor}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      setLpSupervisor(selectedName);
                      const autoNik = getSupervisorNik(selectedName);
                      if (autoNik) {
                        setNik(autoNik);
                        setNikError(null);
                      }
                      const heldStores = getStoresBySupervisor(selectedName);
                      const homeBase = getHomeBaseStore(selectedName) || (heldStores.length > 0 ? heldStores[0] : undefined);
                      if (homeBase) {
                        setStore(`${homeBase.code} - ${homeBase.name}`);
                      } else {
                        setStore('');
                      }
                      setFilterBySelectedSpv(true);
                    }}
                  >
                    <option value="">-- Pilih Nama LP Supervisor --</option>
                    {BU_BANTEN_SUPERVISORS.map(spv => (
                      <option key={spv.name} value={spv.name}>
                        {spv.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <ChevronDown size={18} />
                  </div>
                </div>
                <div className="flex items-center justify-end text-[11px] text-slate-500 mt-1">
                  <span className="font-mono text-blue-600 font-medium">{BU_BANTEN_SUPERVISORS.length} Supervisor</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Badge size={16} className="text-blue-600" />
                    NIK <span className="text-red-500">*</span>
                  </label>
                  {nik ? (
                    <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium border border-emerald-200 flex items-center gap-1 font-mono">
                      <Check size={11} className="text-emerald-600" />
                      Auto: {nik}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Otomatis dari Supervisor
                    </span>
                  )}
                </div>
                <input 
                  type="text" 
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  data-lpignore="true"
                  className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono font-semibold ${nikError ? 'border-red-500 bg-red-50/30' : 'border-slate-300'}`} 
                  placeholder="NIK Supervisor" 
                  value={nik} 
                  onChange={handleNikChange} 
                />
                {nikError && <p className="text-red-500 text-xs mt-1 font-medium">{nikError}</p>}
              </div>
              <div className="relative" ref={storePickerRef}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Store size={16} className="text-blue-600" />
                    Toko/store <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {lpSupervisor && supervisorStores.length > 0 ? (
                      <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold border border-blue-200">
                        {supervisorStores.length} Toko PIC
                      </span>
                    ) : (
                      <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium border border-blue-200">
                        BU Banten ({BU_BANTEN_STORES.length})
                      </span>
                    )}
                  </div>
                </div>

                {lpSupervisor && supervisorStores.length > 0 ? (
                  /* Pilihan Langsung Toko yang Dipegang Supervisor */
                  <div>
                    <div className="relative">
                      <select
                        className="w-full p-3 pr-9 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 font-semibold cursor-pointer shadow-xs appearance-none"
                        value={store}
                        onChange={(e) => {
                          const chosenVal = e.target.value;
                          setStore(chosenVal);
                        }}
                      >
                        <option value="">-- Pilih Toko yang Dipegang {lpSupervisor} ({supervisorStores.length} Toko) --</option>
                        {supervisorStores.map(st => {
                          const val = `${st.code} - ${st.name}`;
                          return (
                            <option key={st.code + st.name} value={val}>
                              {st.code} - {st.name} ({st.businessUnit}){st.isHomeBase ? ' ★ HOME BASE' : ''}
                            </option>
                          );
                        })}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                    <div className="flex items-center justify-end text-[11px] text-slate-500 mt-1">
                      {store ? (
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <Check size={12} /> Toko terpilih
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium">Pilih salah satu toko</span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Input Pencarian Seluruh Toko BU Banten */
                  <div>
                    <div className="relative">
                      <input 
                        type="text" 
                        className="w-full p-3 pr-10 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
                        placeholder="Pilih / cari toko BU Banten..." 
                        value={store} 
                        onChange={(e) => {
                          setStore(e.target.value);
                          setIsStoreDropdownOpen(true);
                        }}
                        onFocus={() => setIsStoreDropdownOpen(true)}
                      />
                      <button 
                        type="button"
                        onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        title="Buka daftar toko BU Banten"
                      >
                        <ChevronDown size={18} className={`transition-transform duration-200 ${isStoreDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                      </button>
                    </div>

                    {/* Dropdown Pilihan Toko BU Banten */}
                    {isStoreDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden max-h-80 flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                            <Building2 size={14} className="text-blue-600" />
                            <span>Data Toko BU Banten ({filteredStores.length})</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setIsStoreDropdownOpen(false)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {/* Filter Khusus Toko PIC Supervisor */}
                        {lpSupervisor && (
                          <div className="px-3 py-1.5 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between text-xs">
                            <span className="text-blue-900 font-medium truncate">
                              Toko PIC: <strong>{lpSupervisor}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => setFilterBySelectedSpv(!filterBySelectedSpv)}
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                                filterBySelectedSpv 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-100'
                              }`}
                            >
                              {filterBySelectedSpv ? '✓ Toko PIC Saja' : 'Saring Toko PIC'}
                            </button>
                          </div>
                        )}

                        {/* Filter Brand Cepat */}
                        <div className="px-2.5 py-1.5 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                          {['ALL', 'AHI', 'HCIR', 'FBI', 'TGI', 'AGC', 'KLO', 'DC', '328'].map(b => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => setStoreFilterBrand(b)}
                              className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors font-medium ${
                                storeFilterBrand === b 
                                  ? 'bg-blue-600 text-white shadow-xs' 
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {b === 'ALL' ? 'Semua BU' : b}
                            </button>
                          ))}
                        </div>

                        {/* Daftar Toko */}
                        <div className="overflow-y-auto divide-y divide-slate-100 max-h-60">
                          {filteredStores.length > 0 ? (
                            filteredStores.map(s => {
                              const isSelected = store === `${s.code} - ${s.name}` || store === s.name;
                              return (
                                <button
                                  key={s.code + s.name}
                                  type="button"
                                  onClick={() => handleSelectStore(s)}
                                  className={`w-full text-left p-3 hover:bg-blue-50/80 transition-colors flex items-start justify-between gap-3 ${
                                    isSelected ? 'bg-blue-50/60' : ''
                                  }`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-slate-800 text-white rounded">
                                        {s.code}
                                      </span>
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded uppercase">
                                        {s.businessUnit}
                                      </span>
                                      {s.isHomeBase && (
                                        <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded font-bold">
                                          ★ HOME BASE
                                        </span>
                                      )}
                                    </div>
                                    <div className="font-semibold text-sm text-slate-800 mt-1 truncate">
                                      {s.name}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                                      {s.lpSpv && (
                                        <span className="text-blue-700 font-medium flex items-center gap-1">
                                          <UserCheck size={11} className="text-blue-600" />
                                          PIC: {s.lpSpv} (NIK: {s.nikSpv})
                                        </span>
                                      )}
                                      {s.homeBase && (
                                        <span className="text-slate-400">
                                          Base: {s.homeBase}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="text-blue-600 mt-1">
                                      <Check size={16} />
                                    </div>
                                  )}
                                </button>
                              );
                            })
                          ) : (
                            <div className="p-6 text-center text-slate-400 text-xs">
                              Tidak ditemukan toko dengan kata kunci "{store}". Anda dapat tetap mengetik nama toko manual.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-semibold text-slate-800">Item Ceklist</h3>
                 <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">Skor: {calculateScore()}%</div>
              </div>
              <div className="flex overflow-x-auto pb-2 mb-4 gap-2 no-scrollbar">
                {categories.map(cat => {
                  const catItems = items.filter(i => i.category === cat);
                  const filledCount = catItems.filter(i => i.status !== undefined || i.value).length;
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap shadow-xs ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {filledCount}/{catItems.length}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="space-y-3">
                {items.filter(i => i.category === activeCategory).map((item, idx) => {
                  return (
                    <div key={item.id} className="p-4 rounded-lg border transition-colors bg-slate-50">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-2.5">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="font-semibold text-slate-800 leading-snug">{item.label}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-2 ml-7.5">
                            {item.inputType === 'date' && (
                              <input 
                                type="date" 
                                className="text-sm p-2 border rounded outline-none bg-white text-slate-700"
                                value={item.value || ''}
                                onChange={(e) => handleValueChange(item.id, e.target.value)}
                              />
                            )}
                            <input type="text" placeholder="Komentar..." className="flex-1 min-w-[150px] text-sm p-2 border rounded outline-none" value={item.comment || ''} onChange={(e) => handleCommentChange(item.id, e.target.value)} />
                            {!item.photo ? (
                                <button onClick={() => startCamera({ type: 'checklist', itemId: item.id })} className="p-2 rounded border text-slate-600"><Camera size={18} /></button>
                            ) : (
                                <img src={item.photo} alt="Bukti" className="w-10 h-10 object-cover rounded border" />
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {[InspectionStatus.PASS, InspectionStatus.FAIL, InspectionStatus.NA].map(status => (
                            <button key={status} onClick={() => handleStatusChange(item.id, status)} className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border ${item.status === status ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border-slate-200'}`}>
                              {status === InspectionStatus.PASS ? 'OK' : status === InspectionStatus.FAIL ? 'NO' : 'N/A'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2"><AlertCircle className="text-amber-600" /> Observasi Lapangan</h3>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input type="text" placeholder="Lokasi" className="p-2 border border-slate-300 rounded outline-none" value={newObs.location} onChange={(e) => setNewObs({...newObs, location: e.target.value})} />
                  <select className="p-2 border border-slate-300 rounded outline-none" value={newObs.severity} onChange={(e) => setNewObs({...newObs, severity: e.target.value as any})}>
                    <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option>
                  </select>
                </div>
                <textarea placeholder="Temuan..." className="w-full p-2 border border-slate-300 rounded h-20 mb-3" value={newObs.description} onChange={(e) => setNewObs({...newObs, description: e.target.value})} />
                <div className="mb-3">
                  {tempObsImage ? (
                    <img src={tempObsImage} alt="Captured" className="h-20 rounded border" />
                  ) : (
                    <button onClick={() => startCamera({ type: 'observation' })} className="flex items-center gap-2 px-4 py-2 bg-slate-200 rounded-lg text-sm"><Camera size={16} /> Foto</button>
                  )}
                </div>
                <button onClick={addObservation} disabled={!newObs.description} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm w-full">Tambah Observasi</button>
              </div>
            </div>
          </div>
        )}

        {/* Opsi Upload Google Drive & Sheets */}
        <div className="bg-emerald-50/70 border-t border-emerald-200 p-4 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={uploadToGoogleSheets}
              onChange={(e) => setUploadToGoogleSheets(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer accent-emerald-600"
            />
            <div>
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-emerald-950">
                <CloudUpload size={16} className="text-emerald-700" />
                <span>Upload Otomatis ke Google Drive LP Banten - Tanpa Login</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Langsung tersimpan ke database & terunggah ke folder <strong>"Laporan Inspeksi LP BU Banten"</strong> di Google Drive secara otomatis tanpa meminta login/kata sandi.
              </p>
            </div>
          </label>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            {isGenerating && (
              <span className="flex items-center gap-2 font-semibold text-blue-700 animate-pulse">
                <Loader2 size={14} className="animate-spin" />
                {uploadProgressText || 'Memproses inspeksi...'}
              </span>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
            <button onClick={onCancel} className="px-6 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors text-slate-700 font-medium">Batal</button>
            <button onClick={handleSubmit} disabled={isGenerating || isFormDisabled} className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 disabled:opacity-50 shadow-sm transition-all">
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> 
                  <span>{uploadProgressText || 'Menyimpan...'}</span>
                </>
              ) : (
                <>
                  <Save size={18} /> 
                  <span>Simpan & Upload Laporan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionForm;
