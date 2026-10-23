import { DailyReport, INITIAL_CHECKLIST, InspectionStatus } from '../types';

const STORAGE_KEY = 'lp_daily_reports_v1';

const generateInitialReports = (): DailyReport[] => {
  const now = new Date();

  const getDateDaysAgo = (daysAgo: number, hour = 10, minute = 30) => {
    const d = new Date(now);
    d.setDate(now.getDate() - daysAgo);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  const sampleItems = INITIAL_CHECKLIST.map((item, idx) => ({
    ...item,
    status: idx === 3 ? InspectionStatus.FAIL : idx === 12 ? InspectionStatus.FAIL : InspectionStatus.PASS,
    comment: idx === 3 ? 'Kunci rolling door perlu perbaikan pelumasan' : undefined
  }));

  return [
    {
      id: 'demo-1',
      date: getDateDaysAgo(0, 9, 15),
      lpSupervisor: 'JAKA HARYADI',
      nik: '118843',
      store: 'A322 - AZKO LW ALSUT (HOME BASE)',
      inspectorName: '118843',
      shift: 'JAKA HARYADI',
      items: sampleItems,
      observations: [
        {
          id: 'obs-1',
          description: 'Penempatan APAR di area loading dock terhalang tumpukan palet',
          severity: 'Medium',
          location: 'Loading Dock',
          timestamp: '09:40'
        }
      ],
      complianceScore: 94,
      aiSummary: 'Inspeksi berjalan lancar dengan tingkat kepatuhan 94%. Catatan utama: pemindahan hambatan di depan APAR loading dock segera dilakukan.'
    },
    {
      id: 'demo-2',
      date: getDateDaysAgo(1, 14, 20),
      lpSupervisor: 'ASEP SUNANDAR',
      nik: '094848',
      store: 'A341 - AHI BINTARO (HOME BASE)',
      inspectorName: '094848',
      shift: 'ASEP SUNANDAR',
      items: sampleItems,
      observations: [],
      complianceScore: 96,
      aiSummary: 'Kondisi operasional dan keselamatan toko terpantau sangat baik dan memenuhi standar SOP LP.'
    },
    {
      id: 'demo-3',
      date: getDateDaysAgo(1, 16, 45),
      lpSupervisor: 'ASEP SUNANDAR',
      nik: '094848',
      store: 'F306 - CHATIME BINTARO',
      inspectorName: '094848',
      shift: 'ASEP SUNANDAR',
      items: INITIAL_CHECKLIST.map(item => ({ ...item, status: InspectionStatus.PASS })),
      observations: [],
      complianceScore: 100,
      aiSummary: 'Seluruh ceklist memenuhi standar keamanan 100% tanpa catatan kegagalan.'
    },
    {
      id: 'demo-4',
      date: getDateDaysAgo(3, 11, 0),
      lpSupervisor: 'IWAN HENDRA SAPUTRA',
      nik: '097485',
      store: 'PA31 - MALL LIVING WORLD ALAM SUTERA ( HOME BASE )',
      inspectorName: '097485',
      shift: 'IWAN HENDRA SAPUTRA',
      items: sampleItems,
      observations: [
        {
          id: 'obs-2',
          description: 'Lampu emergency exit di pintu barat redup dan baterai cadangan lemah',
          severity: 'High',
          location: 'Pintu Darurat Barat',
          timestamp: '11:25'
        }
      ],
      complianceScore: 89,
      aiSummary: 'Perlu penggantian unit emergency lamp pintu keluar barat sebelum operasional akhir pekan.'
    },
    {
      id: 'demo-5',
      date: getDateDaysAgo(4, 15, 10),
      lpSupervisor: 'ASEP SUNANDAR',
      nik: '094848',
      store: 'T327 - TOYS KINGDOME BINTARO',
      inspectorName: '094848',
      shift: 'ASEP SUNANDAR',
      items: sampleItems,
      observations: [],
      complianceScore: 92,
      aiSummary: 'Pemeriksaan rutin berjalan tertib, sistem alarm dan pedestal aktif normal.'
    },
    {
      id: 'demo-6',
      date: getDateDaysAgo(6, 10, 30),
      lpSupervisor: 'IWAN HENDRA SAPUTRA',
      nik: '097485',
      store: 'A546 - AZKO MALL CIPUTRA',
      inspectorName: '097485',
      shift: 'IWAN HENDRA SAPUTRA',
      items: sampleItems,
      observations: [],
      complianceScore: 90,
      aiSummary: 'Kondisi operasional toko aman dan terkelola dengan baik.'
    },
    // Historical Reports (1-5 bulan lalu) untuk menunjukkan tren perbaikan masalah toko
    {
      id: 'hist-1',
      date: getDateDaysAgo(32, 11, 0),
      lpSupervisor: 'JAKA HARYADI',
      nik: '118843',
      store: 'A322 - AZKO LW ALSUT (HOME BASE)',
      inspectorName: '118843',
      shift: 'JAKA HARYADI',
      items: INITIAL_CHECKLIST.map((item, idx) => ({
        ...item,
        status: (idx === 2 || idx === 7) ? InspectionStatus.FAIL : InspectionStatus.PASS
      })),
      observations: [
        {
          id: 'obs-h1',
          description: 'Kunci loker karyawan ditemukan tergantung di loker no. 14',
          severity: 'Low',
          location: 'Ruang Loker',
          timestamp: '11:15'
        }
      ],
      complianceScore: 91,
      aiSummary: 'Kepatuhan toko meningkat baik, hanya terdapat temuan minor kunci loker.'
    },
    {
      id: 'hist-2',
      date: getDateDaysAgo(65, 14, 0),
      lpSupervisor: 'ASEP SUNANDAR',
      nik: '094848',
      store: 'A341 - AHI BINTARO (HOME BASE)',
      inspectorName: '094848',
      shift: 'ASEP SUNANDAR',
      items: INITIAL_CHECKLIST.map((item, idx) => ({
        ...item,
        status: (idx === 1 || idx === 4 || idx === 8) ? InspectionStatus.FAIL : InspectionStatus.PASS
      })),
      observations: [
        {
          id: 'obs-h2',
          description: 'Akses control pintu gudang belum otomatis mengunci sempurna',
          severity: 'Medium',
          location: 'Gudang Utama',
          timestamp: '14:30'
        }
      ],
      complianceScore: 87,
      aiSummary: 'Pintu akses gudang perlu penyetelan hidrolik engsel penutup.'
    },
    {
      id: 'hist-3',
      date: getDateDaysAgo(95, 10, 30),
      lpSupervisor: 'IWAN HENDRA SAPUTRA',
      nik: '097485',
      store: 'PA31 - MALL LIVING WORLD ALAM SUTERA ( HOME BASE )',
      inspectorName: '097485',
      shift: 'IWAN HENDRA SAPUTRA',
      items: INITIAL_CHECKLIST.map((item, idx) => ({
        ...item,
        status: (idx === 1 || idx === 3 || idx === 5 || idx === 9) ? InspectionStatus.FAIL : InspectionStatus.PASS
      })),
      observations: [
        {
          id: 'obs-h3a',
          description: 'Kamera CCTV lorong B3 sudut tertutup banner promo musiman',
          severity: 'Medium',
          location: 'Aisle B3',
          timestamp: '10:45'
        },
        {
          id: 'obs-h3b',
          description: 'Hydrant indoor tertutup tumpukan kardus barang display',
          severity: 'High',
          location: 'Area Belakang',
          timestamp: '11:10'
        }
      ],
      complianceScore: 82,
      aiSummary: 'Temuan hambatan hydrant dan CCTV terhalang segera ditindaklanjuti.'
    },
    {
      id: 'hist-4',
      date: getDateDaysAgo(125, 13, 15),
      lpSupervisor: 'ASEP SUNANDAR',
      nik: '094848',
      store: 'T327 - TOYS KINGDOME BINTARO',
      inspectorName: '094848',
      shift: 'ASEP SUNANDAR',
      items: INITIAL_CHECKLIST.map((item, idx) => ({
        ...item,
        status: (idx === 0 || idx === 2 || idx === 4 || idx === 6 || idx === 11) ? InspectionStatus.FAIL : InspectionStatus.PASS
      })),
      observations: [
        {
          id: 'obs-h4a',
          description: 'Pintu emergency exit macet saat uji dorong pembukaan darurat',
          severity: 'High',
          location: 'Emergency Door 2',
          timestamp: '13:40'
        },
        {
          id: 'obs-h4b',
          description: 'Sidak loker belum terdokumentasi dalam buku kontrol bulanan',
          severity: 'Medium',
          location: 'Loker Staf',
          timestamp: '14:00'
        }
      ],
      complianceScore: 78,
      aiSummary: 'Catatan penting: perbaikan engsel pintu darurat dan penertiban buku sidak loker.'
    },
    {
      id: 'hist-5',
      date: getDateDaysAgo(155, 10, 0),
      lpSupervisor: 'JAKA HARYADI',
      nik: '118843',
      store: 'A322 - AZKO LW ALSUT (HOME BASE)',
      inspectorName: '118843',
      shift: 'JAKA HARYADI',
      items: INITIAL_CHECKLIST.map((item, idx) => ({
        ...item,
        status: (idx === 1 || idx === 2 || idx === 3 || idx === 5 || idx === 8 || idx === 10) ? InspectionStatus.FAIL : InspectionStatus.PASS
      })),
      observations: [
        {
          id: 'obs-h5a',
          description: 'Tekanan APAR nomor 04 di bawah batas normal indikator jarum merah',
          severity: 'High',
          location: 'Dekat Kasir Utama',
          timestamp: '10:20'
        },
        {
          id: 'obs-h5b',
          description: 'Pedestal sensor pintu keluar bunyi tanpa trigger barang (gangguan sensitivitas)',
          severity: 'Medium',
          location: 'Main Entrance',
          timestamp: '10:45'
        },
        {
          id: 'obs-h5c',
          description: 'Kunci rolling door tidak dipasang gembok kedua sesuai prosedur tutup toko',
          severity: 'Medium',
          location: 'Rolling Door Depan',
          timestamp: '11:15'
        }
      ],
      complianceScore: 73,
      aiSummary: 'Hasil compliance awal menunjukkan sejumlah gap prosedur keamanan yang membutuhkan pembinaan tim operasional.'
    }
  ];
};

import { 
  saveReportToFirestore, 
  getReportsFromFirestore, 
  subscribeToReportsFromFirestore, 
  deleteReportFromFirestore,
  clearAllReportsFromFirestore
} from './firebase';

export const saveReport = async (report: DailyReport): Promise<void> => {
  const existing = getReports();
  const updated = [report, ...existing.filter(r => r.id !== report.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Sync to Cloud Firestore Database
  try {
    await saveReportToFirestore(report);
  } catch (err) {
    console.warn("Laporan disimpan lokal, sinkronisasi Firestore tertunda:", err);
  }
};

export const getReports = (): DailyReport[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Fallback if parsing fails
    }
  }
  return [];
};

export const clearAllReports = async (): Promise<void> => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  try {
    await clearAllReportsFromFirestore();
  } catch (err) {
    console.warn("Gagal menghapus laporan dari Firestore:", err);
  }
};

export const seedSampleReports = (): DailyReport[] => {
  const initial = generateInitialReports();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const getReportById = (id: string): DailyReport | undefined => {
  return getReports().find(r => r.id === id);
};

export const updateReport = async (report: DailyReport): Promise<void> => {
  const existing = getReports();
  const updated = existing.map(r => r.id === report.id ? report : r);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  try {
    await saveReportToFirestore(report);
  } catch (err) {
    console.warn("Pembaruan disimpan lokal, sinkronisasi Firestore tertunda:", err);
  }
};

export const deleteReport = async (id: string): Promise<void> => {
  const existing = getReports();
  const updated = existing.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  try {
    await deleteReportFromFirestore(id);
  } catch (err) {
    console.warn("Hapus laporan lokal berhasil, sinkronisasi Firestore tertunda:", err);
  }
};

/**
 * Subscribe to real-time updates from Firestore database with local cache fallback
 */
export const subscribeToReports = (onUpdate: (reports: DailyReport[]) => void): (() => void) => {
  // Initial broadcast from local cache immediately
  onUpdate(getReports());

  // Listen to Firestore real-time updates
  try {
    const unsubscribe = subscribeToReportsFromFirestore(
      (firestoreReports) => {
        const reportsList = firestoreReports || [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reportsList));
        onUpdate(reportsList);
      },
      (err) => {
        console.warn("Langganan Firestore terganggu, menggunakan database lokal:", err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn("Gagal menginisialisasi listener Firestore:", err);
    return () => {};
  }
};

