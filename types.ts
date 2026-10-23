
export enum InspectionStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  NA = 'NA'
}

export interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  status?: InspectionStatus;
  comment?: string;
  inputType?: 'status' | 'date'; // New field to determine input type
  value?: string; // New field to store non-status values like dates
  photo?: string; // New field for photo evidence on checklist items
}

export interface Observation {
  id: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  location: string;
  timestamp: string;
  photo?: string; // Base64 string for photo evidence
}

export interface DailyReport {
  id: string;
  date: string;
  lpSupervisor?: string; // Nama LP Supervisor
  nik: string; // NIK
  store?: string; // Toko/store
  inspectorName?: string; // Kept for backward compatibility
  shift?: string; // Kept for backward compatibility
  items: ChecklistItem[];
  observations: Observation[];
  aiSummary?: string;
  complianceScore: number;
  googleSpreadsheetUrl?: string;
  googleSpreadsheetId?: string;
  googleDriveFolderUrl?: string;
  googleDriveFileUrl?: string;
  uploadedToDriveAt?: string;
}

export type Tab = 'dashboard' | 'inspect' | 'history' | 'pic-directory' | 'standalone-dashboard';

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  // Preopening
  { id: 'po1', category: 'Preopening', label: 'Observasi pagi dilakukan minimal 2 orang (SM/DSM + PS/SPV/SMT), tidak sendiri' },
  { id: 'po2', category: 'Preopening', label: 'Pintu karyawan dalam keadaan terkunci' },
  { id: 'po3', category: 'Preopening', label: 'Ruang kasir dalam keadaan terkunci' },
  { id: 'po4', category: 'Preopening', label: 'Rollingdoor dalam keadaan terkunci' },
  { id: 'po5', category: 'Preopening', label: 'Terdapat Greeter di Pintu Utama' },
  { id: 'po6', category: 'Preopening', label: 'Pengecekan barang keluar di entrance: scan QR Label PAID' },

  // Sistem Keselamatan
  { id: 'sk1', category: 'Sistem Keselamatan', label: 'Tekanan APAR (Fire Extinguisher)' },
  { id: 'sk2', category: 'Sistem Keselamatan', label: 'Tanggal Expired APAR (Fire Extinguisher)', inputType: 'date' },
  { id: 'sk3', category: 'Sistem Keselamatan', label: 'Hydrant Tidak Terhalang' },
  { id: 'sk4', category: 'Sistem Keselamatan', label: 'Kondisi Emergency Exit (Pintu & Jalur Evakuasi Bebas Hambatan)' },
  { id: 'sk5', category: 'Sistem Keselamatan', label: 'Lampu Emergency Exit & Petunjuk Evakuasi Berfungsi' },
  { id: 'sk6', category: 'Sistem Keselamatan', label: 'Emergency Lamp Berfungsi Dengan Baik' },
  { id: 'sk7', category: 'Sistem Keselamatan', label: 'Terdapat Assembly Point (Titik Kumpul)' },

  // Sistem Pengawasan
  { id: 'sp1', category: 'Sistem Pengawasan', label: 'Kamera CCTV Berfungsi' },
  { id: 'sp2', category: 'Sistem Pengawasan', label: 'DVR Berfungsi Dengan Baik' },
  { id: 'sp3', category: 'Sistem Pengawasan', label: 'Status Perekaman DVR/NVR Lebih Dari 30 Hari' },
  { id: 'sp4', category: 'Sistem Pengawasan', label: 'View Camera Baik / Tidak Terhalang' },
  { id: 'sp5', category: 'Sistem Pengawasan', label: 'Camera Tidak Buram & Jelas Pada Malam Hari' },
  { id: 'sp6', category: 'Sistem Pengawasan', label: 'AVD terkoneksi ke SCC & PIC store' },
  { id: 'sp7', category: 'Sistem Pengawasan', label: 'Bulgar Alarm , sirene dan Strobelight berfung' },
  { id: 'sp8', category: 'Sistem Pengawasan', label: 'Seluruh PIR/Sensor Magnetic aktif' },
  { id: 'sp9', category: 'Sistem Pengawasan', label: 'Pedestal berfungsi dengan baik' },
  { id: 'sp10', category: 'Sistem Pengawasan', label: 'Pemasangan Label/Tag sudah sesuai ketentuan' },

  // Fasilitas
  { id: 'fas1', category: 'Fasilitas', label: 'Kondisi Pencahayaan' },
  { id: 'fas2', category: 'Fasilitas', label: 'Kebersihan Toilet & Area Umum' },
  { id: 'fas3', category: 'Fasilitas', label: 'Kondisi Panel (Tidak terhalang barang)' },
  { id: 'fas4', category: 'Fasilitas', label: 'Kondisi Rollingdoor (bersih/kotor)' },
  { id: 'fas5', category: 'Fasilitas', label: 'Akses Control (selalu dalam kondisi tertutup)' },
  { id: 'fas6', category: 'Fasilitas', label: 'Loker dalam kondisi bersih tidak kotor' },
  { id: 'fas7', category: 'Fasilitas', label: 'Tidak ada kunci loker yang tergantung' },

  // Aktivitas
  { id: 'akt1', category: 'Aktivitas', label: 'Pengecekan Keluar/Masuk Barang' },
  { id: 'akt2', category: 'Aktivitas', label: 'Sidak Loker dilakukan minimal 2 kali dalam 1 bulan' },
  { id: 'akt3', category: 'Aktivitas', label: 'Cek Body dan Tas sudah sesuai prosedur' },
];
