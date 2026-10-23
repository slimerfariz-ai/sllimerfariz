import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DailyReport, InspectionStatus, ChecklistItem, Observation, Tab } from '../types';
import { BU_BANTEN_STORES, BU_BANTEN_SUPERVISORS } from '../data/buBantenStores';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  Users,
  Store,
  Calendar,
  CalendarDays,
  Clock,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  RefreshCw,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  Download,
  Printer,
  Copy,
  Check,
  Search,
  Filter,
  ArrowRight,
  Database,
  ArrowLeft,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Flame,
  Award,
  AlertOctagon,
  Eye,
  X,
  ClipboardCheck,
  History,
  LayoutDashboard
} from 'lucide-react';
import { AuthUser } from '../services/authService';

interface StandaloneDashboardPortalProps {
  reports: DailyReport[];
  onBackToApp?: () => void;
  onInspectStore?: (store: any) => void;
  onRefreshData?: () => void;
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
  currentUser?: AuthUser | null;
}

type DateRangeFilter = 'ALL' | 'TODAY' | '7DAYS' | '30DAYS' | 'THIS_MONTH';
type ComplianceFilter = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
type PortalViewTab = 'all' | 'overview' | 'stores' | 'supervisors' | 'feed' | 'log';

export const StandaloneDashboardPortal: React.FC<StandaloneDashboardPortalProps> = ({
  reports,
  onBackToApp,
  onInspectStore,
  onRefreshData,
  activeTab = 'standalone-dashboard',
  onTabChange,
  currentUser
}) => {
  // Theme & Display States
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('portal_theme') === 'dark';
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tab & View States for Standalone Portal
  const [activeViewTab, setActiveViewTab] = useState<PortalViewTab>('all');
  const [storeMatrixSearch, setStoreMatrixSearch] = useState('');
  const [storeMatrixBu, setStoreMatrixBu] = useState('ALL');

  // Filter States
  const [dateRange, setDateRange] = useState<DateRangeFilter>('ALL');
  const [selectedBu, setSelectedBu] = useState<string>('ALL');
  const [selectedSpv, setSelectedSpv] = useState<string>('ALL');
  const [complianceFilter, setComplianceFilter] = useState<ComplianceFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportForModal, setSelectedReportForModal] = useState<DailyReport | null>(null);

  // Presentation / Kiosk Auto-Scroll mode (useful for wall-mounted TV monitors)
  const [isKioskMode, setIsKioskMode] = useState(false);
  const kioskIntervalRef = useRef<number | null>(null);

  // Update live clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update theme in localStorage
  useEffect(() => {
    localStorage.setItem('portal_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Handle manual refresh
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setLastSyncTime(new Date());
    if (onRefreshData) {
      onRefreshData();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Copy portal direct URL
  const handleCopyLink = () => {
    const portalUrl = `${window.location.origin}${window.location.pathname}?view=standalone-dashboard`;
    navigator.clipboard.writeText(portalUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // Open in new tab
  const handleOpenInNewTab = () => {
    const portalUrl = `${window.location.origin}${window.location.pathname}?view=standalone-dashboard`;
    window.open(portalUrl, '_blank');
  };

  // Export reports to CSV
  const handleExportCsv = () => {
    if (reports.length === 0) {
      alert("Tidak ada data laporan untuk diekspor.");
      return;
    }

    const headers = [
      "ID",
      "Tanggal",
      "Kode Toko",
      "Nama Toko",
      "PIC LP Supervisor",
      "NIK",
      "Skor Kepatuhan (%)",
      "Status Kepatuhan",
      "Jumlah Ceklist FAIL",
      "Jumlah Observasi",
      "Temuan Kritis",
      "Link Spreadsheet/Drive",
      "Ringkasan AI"
    ];

    const rows = filteredReports.map(r => {
      const codeMatch = r.store ? r.store.match(/^([A-Za-z0-9-]+)\s*-\s*(.+)$/) : null;
      const storeCode = codeMatch ? codeMatch[1].trim() : '-';
      const storeName = codeMatch ? codeMatch[2].trim() : (r.store || '-');
      const failCount = (r.items || []).filter(i => i.status === InspectionStatus.FAIL).length;
      const obsCount = (r.observations || []).length;
      const critCount = (r.observations || []).filter(o => o.severity === 'Critical' || o.severity === 'High').length;
      const statusLabel = r.complianceScore >= 90 ? 'Prima (>=90%)' : r.complianceScore >= 75 ? 'Perhatian (75-89%)' : 'Kritis (<75%)';

      return [
        `"${r.id}"`,
        `"${new Date(r.date).toLocaleString('id-ID')}"`,
        `"${storeCode}"`,
        `"${storeName.replace(/"/g, '""')}"`,
        `"${(r.lpSupervisor || '-').replace(/"/g, '""')}"`,
        `"${r.nik || '-'}"`,
        r.complianceScore,
        `"${statusLabel}"`,
        failCount,
        obsCount,
        critCount,
        `"${r.googleSpreadsheetUrl || r.googleDriveFileUrl || '-'}"`,
        `"${(r.aiSummary || '').replace(/"/g, '""')}"`
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Audit_LP_BU_Banten_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Business Units list
  const businessUnits = useMemo(() => {
    const bus = new Set<string>();
    BU_BANTEN_STORES.forEach(s => {
      if (s.businessUnit) bus.add(s.businessUnit.toUpperCase());
    });
    return ['ALL', ...Array.from(bus).sort()];
  }, []);

  // Filtered reports calculation
  const filteredReports = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const q = searchQuery.toLowerCase().trim();

    return reports.filter(r => {
      const reportTime = new Date(r.date).getTime();

      // Date range filter
      if (dateRange === 'TODAY' && reportTime < todayStart) return false;
      if (dateRange === '7DAYS' && reportTime < sevenDaysAgo) return false;
      if (dateRange === '30DAYS' && reportTime < thirtyDaysAgo) return false;
      if (dateRange === 'THIS_MONTH' && reportTime < thisMonthStart) return false;

      // PIC Supervisor filter
      if (selectedSpv !== 'ALL') {
        const rSpv = (r.lpSupervisor || '').toUpperCase();
        if (!rSpv.includes(selectedSpv.toUpperCase())) return false;
      }

      // BU filter
      if (selectedBu !== 'ALL') {
        // match store code or business unit from BU_BANTEN_STORES
        const matchedStore = BU_BANTEN_STORES.find(s => 
          (r.store && (r.store.includes(s.code) || r.store.toUpperCase().includes(s.name.toUpperCase())))
        );
        if (matchedStore) {
          if (matchedStore.businessUnit.toUpperCase() !== selectedBu) return false;
        } else {
          // Fallback search in store string
          if (!r.store || !r.store.toUpperCase().includes(selectedBu)) return false;
        }
      }

      // Compliance filter
      if (complianceFilter === 'HIGH' && r.complianceScore < 90) return false;
      if (complianceFilter === 'MEDIUM' && (r.complianceScore < 75 || r.complianceScore >= 90)) return false;
      if (complianceFilter === 'LOW' && r.complianceScore >= 75) return false;

      // Search query
      if (q) {
        const inStore = (r.store || '').toLowerCase().includes(q);
        const inSpv = (r.lpSupervisor || '').toLowerCase().includes(q);
        const inNik = (r.nik || '').toLowerCase().includes(q);
        const inSummary = (r.aiSummary || '').toLowerCase().includes(q);
        const inObservations = (r.observations || []).some(o => 
          o.description.toLowerCase().includes(q) || o.location.toLowerCase().includes(q)
        );
        if (!inStore && !inSpv && !inNik && !inSummary && !inObservations) return false;
      }

      return true;
    });
  }, [reports, dateRange, selectedSpv, selectedBu, complianceFilter, searchQuery]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalReports = filteredReports.length;
    if (totalReports === 0) {
      return {
        totalReports: 0,
        avgScore: 0,
        totalIssues: 0,
        totalFails: 0,
        totalObservations: 0,
        criticalIssues: 0,
        storesAuditedCount: 0,
        storesAuditedPercentage: 0,
        passPercentage: 0,
        needingAttentionCount: 0,
        criticalStoresCount: 0,
        bestStore: null as { name: string; score: number } | null,
        worstStore: null as { name: string; score: number } | null
      };
    }

    let totalScore = 0;
    let totalFails = 0;
    let totalObservations = 0;
    let criticalIssues = 0;
    let needingAttentionCount = 0;
    let criticalStoresCount = 0;

    const auditedStoreCodes = new Set<string>();
    const storeScoresMap: Record<string, { total: number; count: number; name: string }> = {};

    filteredReports.forEach(r => {
      totalScore += r.complianceScore || 0;

      if (r.complianceScore < 75) {
        criticalStoresCount++;
      } else if (r.complianceScore < 90) {
        needingAttentionCount++;
      }

      const fails = (r.items || []).filter(i => i.status === InspectionStatus.FAIL).length;
      totalFails += fails;

      const obsList = r.observations || [];
      totalObservations += obsList.length;
      criticalIssues += obsList.filter(o => o.severity === 'Critical' || o.severity === 'High').length;

      if (r.store) {
        const storeKey = r.store.trim();
        auditedStoreCodes.add(storeKey);
        if (!storeScoresMap[storeKey]) {
          storeScoresMap[storeKey] = { total: 0, count: 0, name: r.store };
        }
        storeScoresMap[storeKey].total += r.complianceScore;
        storeScoresMap[storeKey].count += 1;
      }
    });

    const avgScore = Math.round(totalScore / totalReports);
    const totalIssues = totalFails + totalObservations;
    const storesAuditedCount = auditedStoreCodes.size;
    const totalRegisteredStores = BU_BANTEN_STORES.length || 147;
    const storesAuditedPercentage = Math.min(100, Math.round((storesAuditedCount / totalRegisteredStores) * 100));

    // Best & Worst Stores
    const storeAvgs = Object.values(storeScoresMap).map(s => ({
      name: s.name,
      score: Math.round(s.total / s.count)
    }));
    storeAvgs.sort((a, b) => b.score - a.score);

    return {
      totalReports,
      avgScore,
      totalIssues,
      totalFails,
      totalObservations,
      criticalIssues,
      storesAuditedCount,
      storesAuditedPercentage,
      passPercentage: Math.round((filteredReports.filter(r => r.complianceScore >= 90).length / totalReports) * 100),
      needingAttentionCount,
      criticalStoresCount,
      bestStore: storeAvgs.length > 0 ? storeAvgs[0] : null,
      worstStore: storeAvgs.length > 0 ? storeAvgs[storeAvgs.length - 1] : null
    };
  }, [filteredReports]);

  // Chart Data: Monthly Trends of Issues and Score (Last 6 Months)
  const monthlyTrendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const result: any[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      const monthKey = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
      const monthLabel = `${months[monthIdx]} ${year.toString().slice(-2)}`;

      const monthReports = filteredReports.filter(r => {
        const rDate = new Date(r.date);
        return rDate.getFullYear() === year && rDate.getMonth() === monthIdx;
      });

      let checklistFails = 0;
      let observationsCount = 0;
      let totalScore = 0;

      monthReports.forEach(r => {
        checklistFails += (r.items || []).filter(item => item.status === InspectionStatus.FAIL).length;
        observationsCount += (r.observations || []).length;
        totalScore += r.complianceScore || 0;
      });

      const avgScore = monthReports.length > 0 ? Math.round(totalScore / monthReports.length) : null;

      result.push({
        month: monthLabel,
        monthKey,
        auditCount: monthReports.length,
        checklistFails,
        observationsCount,
        totalIssues: checklistFails + observationsCount,
        avgScore: avgScore ?? 0
      });
    }

    return result;
  }, [filteredReports]);

  // Chart Data: Category Failure Breakdown
  const categoryFailureData = useMemo(() => {
    const catMap: Record<string, { pass: number; fail: number; na: number; total: number }> = {};

    filteredReports.forEach(r => {
      (r.items || []).forEach(item => {
        const cat = item.category || 'Lain-lain';
        if (!catMap[cat]) {
          catMap[cat] = { pass: 0, fail: 0, na: 0, total: 0 };
        }
        catMap[cat].total++;
        if (item.status === InspectionStatus.PASS) catMap[cat].pass++;
        else if (item.status === InspectionStatus.FAIL) catMap[cat].fail++;
        else catMap[cat].na++;
      });
    });

    const entries = Object.entries(catMap).map(([category, counts]) => {
      const assessed = counts.pass + counts.fail;
      const complianceRate = assessed > 0 ? Math.round((counts.pass / assessed) * 100) : 100;
      return {
        category,
        pass: counts.pass,
        fail: counts.fail,
        complianceRate
      };
    });

    entries.sort((a, b) => b.fail - a.fail);
    return entries;
  }, [filteredReports]);

  // Chart Data: Severity Breakdown of Observations
  const severityPieData = useMemo(() => {
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    filteredReports.forEach(r => {
      (r.observations || []).forEach(obs => {
        if (obs.severity === 'Critical') critical++;
        else if (obs.severity === 'High') high++;
        else if (obs.severity === 'Medium') medium++;
        else low++;
      });
    });

    const total = critical + high + medium + low;
    if (total === 0) return [];

    return [
      { name: 'Kritis (Critical)', value: critical, color: '#ef4444' },
      { name: 'Tinggi (High)', value: high, color: '#f97316' },
      { name: 'Sedang (Medium)', value: medium, color: '#eab308' },
      { name: 'Rendah (Low)', value: low, color: '#3b82f6' }
    ].filter(item => item.value > 0);
  }, [filteredReports]);

  // Chart Data: PIC Supervisor Performance Leaderboard
  const supervisorLeaderboard = useMemo(() => {
    const spvMap: Record<string, { count: number; totalScore: number; fails: number; obs: number; stores: Set<string> }> = {};

    filteredReports.forEach(r => {
      const spvName = r.lpSupervisor ? r.lpSupervisor.toUpperCase().trim() : 'BELUM DITENTUKAN';
      if (!spvMap[spvName]) {
        spvMap[spvName] = { count: 0, totalScore: 0, fails: 0, obs: 0, stores: new Set() };
      }
      spvMap[spvName].count++;
      spvMap[spvName].totalScore += (r.complianceScore || 0);
      spvMap[spvName].fails += (r.items || []).filter(i => i.status === InspectionStatus.FAIL).length;
      spvMap[spvName].obs += (r.observations || []).length;
      if (r.store) spvMap[spvName].stores.add(r.store);
    });

    const list = Object.entries(spvMap).map(([name, data]) => ({
      name,
      auditCount: data.count,
      avgScore: Math.round(data.totalScore / data.count),
      totalIssues: data.fails + data.obs,
      storeCoverage: data.stores.size
    }));

    list.sort((a, b) => b.auditCount - a.auditCount || b.avgScore - a.avgScore);
    return list;
  }, [filteredReports]);

  // Ranked Stores: Top 5 Highest vs Bottom 5 Lowest Compliance
  const { topStores, bottomStores } = useMemo(() => {
    const storeMap: Record<string, { totalScore: number; count: number; fails: number; obs: number; spv: string }> = {};

    filteredReports.forEach(r => {
      if (!r.store) return;
      const key = r.store.trim();
      if (!storeMap[key]) {
        storeMap[key] = { totalScore: 0, count: 0, fails: 0, obs: 0, spv: r.lpSupervisor || '-' };
      }
      storeMap[key].totalScore += r.complianceScore;
      storeMap[key].count += 1;
      storeMap[key].fails += (r.items || []).filter(i => i.status === InspectionStatus.FAIL).length;
      storeMap[key].obs += (r.observations || []).length;
    });

    const storeList = Object.entries(storeMap).map(([storeName, d]) => ({
      name: storeName,
      avgScore: Math.round(d.totalScore / d.count),
      auditCount: d.count,
      totalIssues: d.fails + d.obs,
      spv: d.spv
    }));

    storeList.sort((a, b) => b.avgScore - a.avgScore);
    const top = storeList.slice(0, 5);

    storeList.sort((a, b) => a.avgScore - b.avgScore);
    const bottom = storeList.slice(0, 5);

    return { topStores: top, bottomStores: bottom };
  }, [filteredReports]);

  // 147 Stores Matrix with latest audit status & score
  const storesMatrixData = useMemo(() => {
    return BU_BANTEN_STORES.map(store => {
      // Find all reports matching this store
      const storeReports = reports.filter(r => 
        r.store && (r.store.includes(store.code) || r.store.toUpperCase().includes(store.name.toUpperCase()))
      );
      
      const latestReport = storeReports.length > 0 
        ? [...storeReports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
        : null;

      const avgScore = storeReports.length > 0
        ? Math.round(storeReports.reduce((acc, r) => acc + (r.complianceScore || 0), 0) / storeReports.length)
        : null;

      const totalFails = storeReports.reduce((acc, r) => {
        return acc + (r.items || []).filter(i => i.status === InspectionStatus.FAIL).length;
      }, 0);

      const totalObs = storeReports.reduce((acc, r) => {
        return acc + (r.observations || []).length;
      }, 0);

      return {
        ...store,
        latestReport,
        auditCount: storeReports.length,
        latestScore: latestReport ? latestReport.complianceScore : null,
        avgScore,
        totalIssues: totalFails + totalObs,
        lastAuditDate: latestReport ? latestReport.date : null
      };
    });
  }, [reports]);

  // Filtered stores matrix based on search and business unit
  const filteredStoresMatrix = useMemo(() => {
    const q = storeMatrixSearch.toLowerCase().trim();
    return storesMatrixData.filter(st => {
      if (storeMatrixBu !== 'ALL' && st.businessUnit?.toUpperCase() !== storeMatrixBu) {
        return false;
      }
      if (q) {
        const inCode = st.code.toLowerCase().includes(q);
        const inName = st.name.toLowerCase().includes(q);
        const inPic = st.picSupervisor.toLowerCase().includes(q);
        const inBu = st.businessUnit?.toLowerCase().includes(q);
        if (!inCode && !inName && !inPic && !inBu) return false;
      }
      return true;
    });
  }, [storesMatrixData, storeMatrixSearch, storeMatrixBu]);

  // All observations collected from filtered reports for live observation feed
  const allObservationsList = useMemo(() => {
    const list: {
      id: string;
      description: string;
      severity: 'Low' | 'Medium' | 'High' | 'Critical';
      location: string;
      timestamp: string;
      photo?: string;
      store: string;
      date: string;
      spv: string;
      reportId: string;
      complianceScore: number;
    }[] = [];

    filteredReports.forEach(r => {
      (r.observations || []).forEach(obs => {
        list.push({
          ...obs,
          store: r.store || 'Unknown Store',
          date: r.date,
          spv: r.lpSupervisor || '-',
          reportId: r.id,
          complianceScore: r.complianceScore
        });
      });
    });

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [filteredReports]);

  // Color classes helper based on dark mode
  const bgMain = isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const bgCard = isDarkMode ? 'bg-slate-900 border-slate-800 shadow-lg' : 'bg-white border-slate-200 shadow-xs';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const textHeading = isDarkMode ? 'text-white' : 'text-slate-900';
  const borderSubtle = isDarkMode ? 'border-slate-800' : 'border-slate-200';

  return (
    <div className={`min-h-screen ${bgMain} font-sans transition-colors duration-200 pb-24 lg:pb-16`}>
      {/* Top Standalone Executive Command Bar */}
      <header className={`sticky top-0 z-50 backdrop-blur-md ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-200'} border-b px-3 sm:px-8 py-3 shadow-sm`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo & Portal Identity */}
          <div className="flex items-center justify-between gap-2.5 sm:gap-3 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {onBackToApp && (
                <button
                  onClick={onBackToApp}
                  title="Kembali ke Aplikasi Utama"
                  className={`p-2 rounded-xl border flex items-center gap-1 shrink-0 ${isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'} transition-all`}
                >
                  <ArrowLeft size={16} />
                  <span className="text-xs font-bold hidden sm:inline">Kembali</span>
                </button>
              )}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className={`text-sm sm:text-base md:text-xl font-extrabold tracking-tight truncate ${textHeading}`}>
                    DASBOR WEB EKSEKUTIF
                  </h1>
                  <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-600 border border-blue-500/20 shrink-0">
                    WEB TERPISAH
                  </span>
                </div>
                <p className={`text-[10px] sm:text-xs ${textMuted} flex items-center gap-1.5 truncate`}>
                  <span>Loss Prevention BU Banten (147 Toko)</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Realtime Cloud
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Mobile Back Button */}
            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="md:hidden px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold shrink-0 hover:bg-blue-100 transition-colors"
              >
                Ke App
              </button>
            )}
          </div>

          {/* Realtime Clock & Actions (horizontal scrolling on mobile/tablet) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto scrollbar-none shrink-0">
            {/* Live Clock */}
            <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono shrink-0 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
              <Clock size={13} className="text-blue-500" />
              <span>{currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              <span className="font-bold">{currentTime.toLocaleTimeString('id-ID')} WIB</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              title="Perbarui data dari Firestore"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border shrink-0 transition-all ${
                isDarkMode 
                  ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' 
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-blue-500' : ''} />
              <span>Refresh</span>
            </button>

            {/* Share / Copy Portal URL */}
            <button
              onClick={handleCopyLink}
              title="Salin link langsung dasbor web terpisah ini"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border shrink-0 transition-all ${
                copiedLink
                  ? 'bg-emerald-500 text-white border-emerald-600'
                  : isDarkMode
                  ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? 'Tersalin' : 'Salin Link'}</span>
            </button>

            {/* Open in New Tab */}
            <button
              onClick={handleOpenInNewTab}
              title="Buka Dasbor Web di Tab Browser Baru"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border shrink-0 transition-all ${
                isDarkMode 
                  ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' 
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ExternalLink size={14} />
              <span>Tab Baru</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              title="Ekspor Seluruh Data Audit ke CSV/Excel"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shrink-0 transition-all"
            >
              <Download size={14} />
              <span>CSV</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              className={`p-2 rounded-xl border shrink-0 ${isDarkMode ? 'border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'} transition-all`}
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh (TV / Command Center)'}
              className={`p-2 rounded-xl border shrink-0 ${isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'} transition-all`}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Banner Informational Bar */}
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-blue-950/60 to-indigo-950/40 border-blue-900/60' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-50/60 border-blue-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className={`text-sm font-bold ${isDarkMode ? 'text-blue-200' : 'text-blue-950'}`}>
                Dasbor Pemantauan Independen LP BU Banten (Kawan Lama Group)
              </h2>
              <p className={`text-xs mt-0.5 max-w-3xl ${isDarkMode ? 'text-blue-300/80' : 'text-blue-800/80'}`}>
                Halaman ini beroperasi secara terpisah sebagai portal command center eksekutif. Anda dapat memantau grafik tren, tingkat kepatuhan 147 toko, kinerja 19 LP Supervisor, serta sinkronisasi otomatis Google Drive/Sheets.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <span className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border ${isDarkMode ? 'bg-slate-900/80 border-slate-700 text-slate-400' : 'bg-white/80 border-blue-200 text-blue-900'}`}>
              Sync Terakhir: {lastSyncTime.toLocaleTimeString('id-ID')}
            </span>
          </div>
        </div>

        {/* Portal View Selection Tabs */}
        <div className={`p-1.5 rounded-2xl border ${bgCard} flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-xs`}>
          {[
            { id: 'all' as PortalViewTab, label: 'Tampilkan Semua', icon: LayoutDashboard },
            { id: 'overview' as PortalViewTab, label: 'Ikhtisar & Grafik', icon: TrendingUp },
            { id: 'stores' as PortalViewTab, label: `Matriks ${BU_BANTEN_STORES.length} Toko`, icon: Building2, count: BU_BANTEN_STORES.length },
            { id: 'supervisors' as PortalViewTab, label: `19 LP Supervisor`, icon: Users, count: BU_BANTEN_SUPERVISORS.length },
            { id: 'feed' as PortalViewTab, label: 'Feed Temuan & Bukti', icon: AlertTriangle, count: allObservationsList.length },
            { id: 'log' as PortalViewTab, label: 'Log Audit Lengkap', icon: Clock, count: filteredReports.length }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeViewTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveViewTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : isDarkMode
                    ? 'text-slate-300 hover:bg-slate-800/80'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Filter Bar */}
        <section className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
          <div className="flex items-center justify-between gap-2 border-b pb-3 border-inherit">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
              <SlidersHorizontal size={15} />
              <span>Filter & Parameter Analitik</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${textMuted}`}>
                Menampilkan <strong>{filteredReports.length}</strong> dari {reports.length} total laporan audit
              </span>
              {(dateRange !== 'ALL' || selectedBu !== 'ALL' || selectedSpv !== 'ALL' || complianceFilter !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => {
                    setDateRange('ALL');
                    setSelectedBu('ALL');
                    setSelectedSpv('ALL');
                    setComplianceFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold underline underline-offset-2 ml-2"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
              <input
                type="text"
                placeholder="Cari toko, NIK, temuan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs outline-none border focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Date Range Filter */}
            <div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRangeFilter)}
                className={`w-full py-2 px-3 rounded-xl text-xs outline-none border focus:ring-2 focus:ring-blue-500 font-medium ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="ALL">Semua Rentang Waktu</option>
                <option value="TODAY">Hari Ini</option>
                <option value="7DAYS">7 Hari Terakhir</option>
                <option value="30DAYS">30 Hari Terakhir</option>
                <option value="THIS_MONTH">Bulan Ini</option>
              </select>
            </div>

            {/* Business Unit Filter */}
            <div>
              <select
                value={selectedBu}
                onChange={(e) => setSelectedBu(e.target.value)}
                className={`w-full py-2 px-3 rounded-xl text-xs outline-none border focus:ring-2 focus:ring-blue-500 font-medium ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                {businessUnits.map(bu => (
                  <option key={bu} value={bu}>
                    {bu === 'ALL' ? 'Semua Unit Bisnis' : `Unit Bisnis: ${bu}`}
                  </option>
                ))}
              </select>
            </div>

            {/* PIC LP Supervisor Filter */}
            <div>
              <select
                value={selectedSpv}
                onChange={(e) => setSelectedSpv(e.target.value)}
                className={`w-full py-2 px-3 rounded-xl text-xs outline-none border focus:ring-2 focus:ring-blue-500 font-medium ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="ALL">Semua LP Supervisor ({BU_BANTEN_SUPERVISORS.length})</option>
                {BU_BANTEN_SUPERVISORS.map(spv => (
                  <option key={spv.name} value={spv.name}>
                    {spv.name} ({spv.totalStore} Toko)
                  </option>
                ))}
              </select>
            </div>

            {/* Compliance Level Filter */}
            <div>
              <select
                value={complianceFilter}
                onChange={(e) => setComplianceFilter(e.target.value as ComplianceFilter)}
                className={`w-full py-2 px-3 rounded-xl text-xs outline-none border focus:ring-2 focus:ring-blue-500 font-medium ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="ALL">Semua Skor Kepatuhan</option>
                <option value="HIGH">Prima: &gt;= 90% (Hijau)</option>
                <option value="MEDIUM">Perhatian: 75% - 89% (Kuning)</option>
                <option value="LOW">Kritis: &lt; 75% (Merah)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Executive KPI Cards & Analytical Charts */}
        {(activeViewTab === 'all' || activeViewTab === 'overview') && (
          <>
            {/* Executive KPI Cards Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Total Inspeksi */}
          <div className={`p-5 rounded-2xl border ${bgCard} flex flex-col justify-between relative overflow-hidden`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Total Audit Selesai</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className={`text-3xl sm:text-4xl font-extrabold ${textHeading}`}>
                {stats.totalReports}
              </span>
              <span className={`text-xs ${textMuted}`}>laporan terverifikasi</span>
            </div>
            <div className="mt-3 pt-3 border-t border-inherit flex items-center justify-between text-xs">
              <span className={textMuted}>Cakupan Audit Toko:</span>
              <span className="font-bold text-blue-600">
                {stats.storesAuditedCount} / {BU_BANTEN_STORES.length} Toko ({stats.storesAuditedPercentage}%)
              </span>
            </div>
          </div>

          {/* KPI 2: Rata-Rata Kepatuhan */}
          <div className={`p-5 rounded-2xl border ${bgCard} flex flex-col justify-between relative overflow-hidden`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Kepatuhan Wilayah Banten</span>
              <div className={`p-2 rounded-xl ${
                stats.avgScore >= 90 ? 'bg-emerald-500/10 text-emerald-600' : stats.avgScore >= 75 ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
              }`}>
                <Award size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className={`text-3xl sm:text-4xl font-extrabold ${
                stats.avgScore >= 90 ? 'text-emerald-500' : stats.avgScore >= 75 ? 'text-amber-500' : 'text-rose-500'
              }`}>
                {stats.avgScore}%
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                stats.avgScore >= 90 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : stats.avgScore >= 75 ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
              }`}>
                {stats.avgScore >= 90 ? 'Prima' : stats.avgScore >= 75 ? 'Waspada' : 'Kritis'}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-inherit">
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    stats.avgScore >= 90 ? 'bg-emerald-500' : stats.avgScore >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${stats.avgScore}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] mt-1 text-slate-400">
                <span>Target SOP: &ge; 90%</span>
                <span>{stats.passPercentage}% Toko Lulus</span>
              </div>
            </div>
          </div>

          {/* KPI 3: Total Temuan Masalah */}
          <div className={`p-5 rounded-2xl border ${bgCard} flex flex-col justify-between relative overflow-hidden`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Total Temuan Masalah</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <AlertTriangle size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className={`text-3xl sm:text-4xl font-extrabold text-amber-500`}>
                {stats.totalIssues}
              </span>
              <span className={`text-xs ${textMuted}`}>gap operasional</span>
            </div>
            <div className="mt-3 pt-3 border-t border-inherit flex items-center justify-between text-xs">
              <span className={textMuted}>FAIL Ceklist: <strong>{stats.totalFails}</strong></span>
              <span className="text-slate-300">|</span>
              <span className={textMuted}>Observasi: <strong>{stats.totalObservations}</strong></span>
            </div>
          </div>

          {/* KPI 4: Temuan Kritis (Critical & High) */}
          <div className={`p-5 rounded-2xl border ${bgCard} flex flex-col justify-between relative overflow-hidden`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Risiko Tinggi & Kritis</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                <AlertOctagon size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className={`text-3xl sm:text-4xl font-extrabold text-rose-500`}>
                {stats.criticalIssues}
              </span>
              <span className={`text-xs ${textMuted}`}>kejadian prioritas</span>
            </div>
            <div className="mt-3 pt-3 border-t border-inherit flex items-center justify-between text-xs">
              <span className="text-rose-500 font-semibold flex items-center gap-1">
                <Flame size={14} />
                {stats.criticalStoresCount} toko butuh pembinaan
              </span>
              <span className={`text-[11px] ${textMuted}`}>Perlu Tindak Lanjut Segera</span>
            </div>
          </div>
        </section>

        {/* Charts Row 1: Tren Bulanan (Recharts) & Distribusi Risiko Severity */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Trend Chart */}
          <div className={`lg:col-span-2 p-5 rounded-2xl border ${bgCard} flex flex-col justify-between`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className={`text-sm sm:text-base font-bold ${textHeading} flex items-center gap-2`}>
                  <TrendingUp size={18} className="text-blue-500" />
                  Tren Jumlah Temuan Masalah & Kepatuhan Per Bulan
                </h3>
                <p className={`text-xs ${textMuted} mt-0.5`}>
                  Grafik Recharts memantau perbaikan performa toko per bulan (Checklist FAIL vs Observasi Lapangan)
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-amber-500 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Ceklist FAIL
                </span>
                <span className="flex items-center gap-1 text-rose-500 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Observasi
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFails" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorObs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                  <XAxis 
                    dataKey="month" 
                    stroke={isDarkMode ? '#94a3b8' : '#64748b'} 
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke={isDarkMode ? '#94a3b8' : '#64748b'} 
                    fontSize={11}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                      borderRadius: '0.75rem',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      fontSize: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="checklistFails" 
                    name="Ceklist FAIL" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorFails)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="observationsCount" 
                    name="Observasi Lapangan" 
                    stroke="#f43f5e" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorObs)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 pt-3 border-t border-inherit flex flex-wrap items-center justify-between text-xs text-slate-400">
              <span>* Data diakumulasi secara otomatis dari rekaman inspeksi Firestore.</span>
              <span className="font-semibold text-blue-500">Target Tren: Menurun Setiap Bulan</span>
            </div>
          </div>

          {/* Severity Donut Chart */}
          <div className={`p-5 rounded-2xl border ${bgCard} flex flex-col justify-between`}>
            <div>
              <h3 className={`text-sm sm:text-base font-bold ${textHeading} flex items-center gap-2`}>
                <ShieldAlert size={18} className="text-rose-500" />
                Tingkat Keparahan Observasi
              </h3>
              <p className={`text-xs ${textMuted} mt-0.5`}>
                Distribusi risiko bahaya temuan observasi operasional toko
              </p>
            </div>

            <div className="h-56 w-full flex items-center justify-center my-2">
              {severityPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {severityPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                        borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                        borderRadius: '0.75rem',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-xs text-slate-400 py-8">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2 opacity-60" />
                  Belum ada temuan observasi pada filter ini
                </div>
              )}
            </div>

            {/* Severity Legend */}
            <div className="space-y-1.5 pt-2 border-t border-inherit text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className={textMuted}>Kritis (Critical):</span>
                </span>
                <span className="font-bold text-red-500">
                  {severityPieData.find(s => s.name.includes('Kritis'))?.value || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  <span className={textMuted}>Tinggi (High):</span>
                </span>
                <span className="font-bold text-orange-500">
                  {severityPieData.find(s => s.name.includes('Tinggi'))?.value || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className={textMuted}>Sedang (Medium):</span>
                </span>
                <span className="font-bold text-amber-500">
                  {severityPieData.find(s => s.name.includes('Sedang'))?.value || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className={textMuted}>Rendah (Low):</span>
                </span>
                <span className="font-bold text-blue-500">
                  {severityPieData.find(s => s.name.includes('Rendah'))?.value || 0}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Charts Row 2: Category Failure Breakdown & Supervisor Leaderboard */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Breakdown by Checklist Category */}
          <div className={`p-5 rounded-2xl border ${bgCard} flex flex-col justify-between`}>
            <div>
              <h3 className={`text-sm sm:text-base font-bold ${textHeading} flex items-center gap-2`}>
                <Layers size={18} className="text-indigo-500" />
                Analisis Kepatuhan per Pilar / Kategori SOP
              </h3>
              <p className={`text-xs ${textMuted} mt-0.5`}>
                Persentase kepatuhan dan jumlah item yang gagal memenuhi standar pada setiap kategori
              </p>
            </div>

            <div className="h-64 w-full mt-4">
              {categoryFailureData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryFailureData.slice(0, 6)} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} unit="%" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={11} />
                    <YAxis 
                      type="category" 
                      dataKey="category" 
                      stroke={isDarkMode ? '#94a3b8' : '#64748b'} 
                      fontSize={11} 
                      tickLine={false} 
                      width={110}
                    />
                    <Tooltip 
                      formatter={(val: any, name: string) => [name === 'complianceRate' ? `${val}%` : val, name === 'complianceRate' ? 'Kepatuhan' : name]}
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                        borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                        borderRadius: '0.75rem',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="complianceRate" name="Kepatuhan" fill="#3b82f6" radius={[0, 6, 6, 0]}>
                      {categoryFailureData.slice(0, 6).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.complianceRate >= 90 ? '#10b981' : entry.complianceRate >= 75 ? '#f59e0b' : '#ef4444'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Tidak ada data kategori
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-inherit flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> &ge;90% Prima
                <span className="w-2 h-2 rounded-full bg-amber-500 ml-2"></span> 75-89% Waspada
                <span className="w-2 h-2 rounded-full bg-rose-500 ml-2"></span> &lt;75% Kritis
              </span>
              <span>Diurutkan berdasarkan kepatuhan terendah</span>
            </div>
          </div>

          {/* Supervisor Audit Performance Leaderboard */}
          <div className={`p-5 rounded-2xl border ${bgCard} flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm sm:text-base font-bold ${textHeading} flex items-center gap-2`}>
                  <Users size={18} className="text-emerald-500" />
                  Kinerja Audit PIC LP Supervisor
                </h3>
                <p className={`text-xs ${textMuted} mt-0.5`}>
                  Jumlah toko yang diaudit & rata-rata skor kepatuhan per pengawas
                </p>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20">
                19 Supervisor
              </span>
            </div>

            <div className="mt-4 space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {supervisorLeaderboard.length > 0 ? (
                supervisorLeaderboard.slice(0, 7).map((spv, idx) => (
                  <div 
                    key={spv.name}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                      isDarkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        idx === 0 ? 'bg-amber-400 text-amber-950 font-extrabold' : idx === 1 ? 'bg-slate-300 text-slate-900' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <p className={`text-xs font-bold truncate ${textHeading}`}>
                          {spv.name}
                        </p>
                        <p className={`text-[10px] ${textMuted}`}>
                          {spv.storeCoverage} toko diaudit • {spv.totalIssues} total temuan
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className={`text-xs font-extrabold ${
                          spv.avgScore >= 90 ? 'text-emerald-500' : spv.avgScore >= 75 ? 'text-amber-500' : 'text-rose-500'
                        }`}>
                          {spv.avgScore}%
                        </span>
                        <p className={`text-[9px] uppercase font-semibold ${textMuted}`}>Skor Rata2</p>
                      </div>
                      <span className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-xs">
                        {spv.auditCount} audit
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  Belum ada data supervisor terdaftar pada filter ini
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-inherit flex items-center justify-between text-xs text-slate-400">
              <span>* Supervisor Murjani mengawasi 8 Toko (termasuk Neka Tiga Raksa Cisoka)</span>
              <span className="font-semibold text-blue-500">Live Leaderboard</span>
            </div>
          </div>
        </section>

        {/* Watchlist Section: Toko Terbaik vs Toko Butuh Pembinaan Khusus */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top 5 High Performers */}
          <div className={`p-5 rounded-2xl border ${bgCard}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <h4 className={`text-xs sm:text-sm font-bold ${textHeading}`}>
                  5 Toko dengan Kepatuhan Tertinggi (Benchmark)
                </h4>
                <p className={`text-[11px] ${textMuted}`}>Penerapan standar operasional dan keamanan terbaik</p>
              </div>
            </div>

            <div className="space-y-2 mt-3">
              {topStores.map((st, i) => (
                <div 
                  key={st.name} 
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    isDarkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className={`font-bold truncate ${textHeading}`}>{st.name}</p>
                    <p className={`text-[10px] ${textMuted}`}>PIC: {st.spv} • {st.auditCount} audit</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                      {st.avgScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom 5 Needing Attention */}
          <div className={`p-5 rounded-2xl border ${bgCard}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                <AlertTriangle size={16} />
              </div>
              <div>
                <h4 className={`text-xs sm:text-sm font-bold ${textHeading}`}>
                  5 Toko Prioritas Pembinaan Khusus (Watchlist)
                </h4>
                <p className={`text-[11px] ${textMuted}`}>Skor terendah dan frekuensi temuan masalah terbanyak</p>
              </div>
            </div>

            <div className="space-y-2 mt-3">
              {bottomStores.map((st, i) => (
                <div 
                  key={st.name} 
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    isDarkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className={`font-bold truncate ${textHeading}`}>{st.name}</p>
                    <p className={`text-[10px] ${textMuted}`}>PIC: {st.spv} • {st.totalIssues} temuan masalah</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                      st.avgScore < 75 
                        ? 'text-rose-500 bg-rose-500/10 border border-rose-500/20' 
                        : 'text-amber-500 bg-amber-500/10 border border-amber-500/20'
                    }`}>
                      {st.avgScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        </>
        )}

        {/* Matriks 147 Toko BU Banten */}
        {(activeViewTab === 'all' || activeViewTab === 'stores') && (
          <section className={`p-5 rounded-2xl border ${bgCard} space-y-4`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4 border-inherit">
              <div>
                <h3 className={`text-base font-bold ${textHeading} flex items-center gap-2`}>
                  <Building2 size={18} className="text-blue-500" />
                  Matriks Status Kepatuhan 147 Toko BU Banten
                </h3>
                <p className={`text-xs ${textMuted} mt-0.5`}>
                  Pemantauan status audit dan tingkat kepatuhan seluruh toko di wilayah kerja BU Banten
                </p>
              </div>

              {/* Store Matrix Quick Filter & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
                  <input
                    type="text"
                    placeholder="Cari kode/nama toko/SPV..."
                    value={storeMatrixSearch}
                    onChange={(e) => setStoreMatrixSearch(e.target.value)}
                    className={`pl-8 pr-3 py-1.5 rounded-xl text-xs outline-none border ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-100 border-slate-300 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                </div>
                <select
                  value={storeMatrixBu}
                  onChange={(e) => setStoreMatrixBu(e.target.value)}
                  className={`py-1.5 px-2.5 rounded-xl text-xs outline-none border font-semibold ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-800'
                  }`}
                >
                  {businessUnits.map(bu => (
                    <option key={bu} value={bu}>{bu === 'ALL' ? 'Semua Unit Bisnis' : bu}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Status Stats for Stores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                <span className="text-[10px] uppercase font-bold text-emerald-500 block">Kepatuhan Prima (&ge;90%)</span>
                <span className="text-xl font-extrabold">{storesMatrixData.filter(s => s.latestScore !== null && s.latestScore >= 90).length} Toko</span>
              </div>
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-amber-950/20 border-amber-900/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                <span className="text-[10px] uppercase font-bold text-amber-500 block">Perhatian (75-89%)</span>
                <span className="text-xl font-extrabold">{storesMatrixData.filter(s => s.latestScore !== null && s.latestScore >= 75 && s.latestScore < 90).length} Toko</span>
              </div>
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-rose-950/20 border-rose-900/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                <span className="text-[10px] uppercase font-bold text-rose-500 block">Kritis (&lt;75%)</span>
                <span className="text-xl font-extrabold">{storesMatrixData.filter(s => s.latestScore !== null && s.latestScore < 75).length} Toko</span>
              </div>
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800/60 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Belum Diaudit</span>
                <span className="text-xl font-extrabold">{storesMatrixData.filter(s => s.latestScore === null).length} Toko</span>
              </div>
            </div>

            {/* Stores Matrix Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[560px] overflow-y-auto pr-1">
              {filteredStoresMatrix.map((st) => {
                const hasAudit = st.latestScore !== null;
                const score = st.latestScore ?? 0;
                const statusColor = !hasAudit
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                  : score >= 90
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : score >= 75
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/30';

                return (
                  <div
                    key={st.code}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all hover:shadow-md ${
                      isDarkMode ? 'bg-slate-800/50 border-slate-700/80 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-mono text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                          {st.code}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${statusColor}`}>
                          {hasAudit ? `${score}%` : 'Belum Audit'}
                        </span>
                      </div>
                      <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${textHeading}`} title={st.name}>
                        {st.name}
                      </h4>
                      <div className="mt-2 space-y-1 text-[11px]">
                        <p className={`flex items-center justify-between ${textMuted}`}>
                          <span>Unit Bisnis:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{st.businessUnit}</span>
                        </p>
                        <p className={`flex items-center justify-between ${textMuted}`}>
                          <span>PIC SPV:</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[130px]">{st.picSupervisor}</span>
                        </p>
                        {hasAudit && st.lastAuditDate && (
                          <p className={`flex items-center justify-between ${textMuted}`}>
                            <span>Audit Terakhir:</span>
                            <span>{new Date(st.lastAuditDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-inherit flex items-center justify-between gap-2">
                      {st.latestReport ? (
                        <button
                          onClick={() => setSelectedReportForModal(st.latestReport)}
                          className={`text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer`}
                        >
                          <Eye size={13} />
                          <span>Lihat Hasil</span>
                        </button>
                      ) : (
                        <span className={`text-[10px] italic ${textMuted}`}>Belum ada data</span>
                      )}

                      {onInspectStore && (
                        <button
                          onClick={() => onInspectStore(st)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                          title={`Mulai inspeksi checklist untuk ${st.code} - ${st.name}`}
                        >
                          <ClipboardCheck size={12} />
                          <span>Inspeksi</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-inherit">
              <span>Menampilkan {filteredStoresMatrix.length} dari total {BU_BANTEN_STORES.length} toko terdaftar</span>
              <span className="text-blue-500 font-semibold">Loss Prevention BU Banten</span>
            </div>
          </section>
        )}

        {/* Tim 19 LP Supervisor Roster & Coverage */}
        {(activeViewTab === 'all' || activeViewTab === 'supervisors') && (
          <section className={`p-5 rounded-2xl border ${bgCard} space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4 border-inherit">
              <div>
                <h3 className={`text-base font-bold ${textHeading} flex items-center gap-2`}>
                  <Users size={18} className="text-emerald-500" />
                  Roster & Cakupan Tim 19 LP Supervisor BU Banten
                </h3>
                <p className={`text-xs ${textMuted} mt-0.5`}>
                  Distribusi wilayah pengawasan toko dan home base masing-masing LP Supervisor
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 self-start sm:self-auto">
                19 Supervisor Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
              {BU_BANTEN_SUPERVISORS.map((spv) => {
                const spvAudits = reports.filter(r => (r.lpSupervisor || '').toUpperCase().includes(spv.name.toUpperCase()));
                const spvFails = spvAudits.reduce((acc, r) => acc + (r.items || []).filter(i => i.status === InspectionStatus.FAIL).length, 0);
                const spvObs = spvAudits.reduce((acc, r) => acc + (r.observations || []).length, 0);
                const avgSpvScore = spvAudits.length > 0 
                  ? Math.round(spvAudits.reduce((acc, r) => acc + (r.complianceScore || 0), 0) / spvAudits.length)
                  : null;

                return (
                  <div
                    key={spv.nik}
                    className={`p-4 rounded-xl border flex flex-col justify-between ${
                      isDarkMode ? 'bg-slate-800/40 border-slate-700/80' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
                          }`}>
                            NIK: {spv.nik}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          {spv.totalStore} Toko
                        </span>
                      </div>

                      <h4 className={`text-sm font-bold ${textHeading}`}>
                        {spv.name}
                      </h4>
                      <p className={`text-xs ${textMuted} mt-0.5`}>
                        {spv.jabatan}
                      </p>
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
                        Base: {spv.homeBase}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-inherit grid grid-cols-3 gap-2 text-center text-xs">
                      <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-50'}`}>
                        <span className={`text-[10px] block ${textMuted}`}>Audit</span>
                        <span className="font-extrabold text-blue-600">{spvAudits.length}</span>
                      </div>
                      <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-50'}`}>
                        <span className={`text-[10px] block ${textMuted}`}>Temuan</span>
                        <span className="font-extrabold text-amber-500">{spvFails + spvObs}</span>
                      </div>
                      <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-50'}`}>
                        <span className={`text-[10px] block ${textMuted}`}>Skor Rata2</span>
                        <span className={`font-extrabold ${avgSpvScore === null ? 'text-slate-400' : avgSpvScore >= 90 ? 'text-emerald-500' : avgSpvScore >= 75 ? 'text-amber-500' : 'text-rose-500'}`}>
                          {avgSpvScore !== null ? `${avgSpvScore}%` : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Live Observation & Photo Evidence Feed */}
        {(activeViewTab === 'all' || activeViewTab === 'feed') && (
          <section className={`p-5 rounded-2xl border ${bgCard} space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4 border-inherit">
              <div>
                <h3 className={`text-base font-bold ${textHeading} flex items-center gap-2`}>
                  <AlertOctagon size={18} className="text-rose-500" />
                  Feed Temuan Lapangan & Bukti Foto Observasi
                </h3>
                <p className={`text-xs ${textMuted} mt-0.5`}>
                  Catatan observasi ketidaksesuaian SOP dan potensi bahaya yang ditemukan pengawas di lapangan
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 self-start sm:self-auto">
                {allObservationsList.length} Total Temuan
              </span>
            </div>

            {allObservationsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-1">
                {allObservationsList.map((obs, idx) => (
                  <div
                    key={`${obs.id}-${idx}`}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                      isDarkMode ? 'bg-slate-800/40 border-slate-700/80' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                          obs.severity === 'Critical' ? 'bg-rose-600 text-white' : obs.severity === 'High' ? 'bg-orange-500 text-white' : obs.severity === 'Medium' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                        }`}>
                          {obs.severity} Risk
                        </span>
                        <span className={`text-[10px] font-mono ${textMuted}`}>
                          {new Date(obs.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} • {obs.timestamp || 'WIB'}
                        </span>
                      </div>

                      <h4 className={`text-xs font-bold leading-tight ${textHeading} mb-1`} title={obs.store}>
                        {obs.store}
                      </h4>
                      <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 mb-2">
                        Lokasi: {obs.location}
                      </p>

                      <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {obs.description}
                      </p>

                      {obs.photo && (
                        <div className="mt-3">
                          <img
                            src={obs.photo}
                            alt="Bukti foto observasi"
                            className="w-full h-36 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs"
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-inherit flex items-center justify-between text-[11px]">
                      <span className={textMuted}>PIC: <strong>{obs.spv}</strong></span>
                      <button
                        onClick={() => {
                          const matched = reports.find(r => r.id === obs.reportId);
                          if (matched) setSelectedReportForModal(matched);
                        }}
                        className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>Laporan #{obs.reportId.slice(0, 8)}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle2 size={36} className="mx-auto mb-2 text-emerald-500 opacity-60" />
                <p className="font-semibold text-sm">Tidak ada temuan observasi yang tercatat</p>
                <p className="text-xs mt-1">Operasional toko terpantau memenuhi standar kepatuhan</p>
              </div>
            )}
          </section>
        )}

        {/* Real-time Audit Log Table & Inspection Inspector */}
        {(activeViewTab === 'all' || activeViewTab === 'log') && (
        <section className={`p-5 rounded-2xl border ${bgCard} space-y-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-inherit">
            <div>
              <h3 className={`text-base font-bold ${textHeading} flex items-center gap-2`}>
                <Clock size={18} className="text-blue-500" />
                Log Audit & Monitoring Realtime
              </h3>
              <p className={`text-xs ${textMuted} mt-0.5`}>
                Daftar rekaman inspeksi lapangan terintegrasi langsung secara otomatis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${textMuted}`}>
                Total: <strong>{filteredReports.length}</strong> Rekaman
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-inherit">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`${isDarkMode ? 'bg-slate-800/80 text-slate-300' : 'bg-slate-100 text-slate-700'} border-b border-inherit font-bold`}>
                  <th className="py-3 px-4">Waktu & Tanggal</th>
                  <th className="py-3 px-4">Toko / Store</th>
                  <th className="py-3 px-4">PIC Supervisor</th>
                  <th className="py-3 px-4 text-center">Skor Kepatuhan</th>
                  <th className="py-3 px-4 text-center">FAIL Item</th>
                  <th className="py-3 px-4 text-center">Observasi</th>
                  <th className="py-3 px-4 text-center">Cloud / Drive</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {filteredReports.length > 0 ? (
                  filteredReports.slice(0, 15).map((report) => {
                    const failCount = (report.items || []).filter(i => i.status === InspectionStatus.FAIL).length;
                    const obsCount = (report.observations || []).length;
                    const criticalObsCount = (report.observations || []).filter(o => o.severity === 'Critical' || o.severity === 'High').length;
                    
                    return (
                      <tr 
                        key={report.id}
                        className={`transition-colors hover:${isDarkMode ? 'bg-slate-800/40' : 'bg-slate-50'}`}
                      >
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold">{new Date(report.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                          <div className={`text-[10px] ${textMuted}`}>{new Date(report.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-bold truncate" title={report.store}>
                            {report.store || 'Toko Tanpa Nama'}
                          </div>
                          {report.shift && (
                            <div className={`text-[10px] ${textMuted}`}>Shift: {report.shift}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-blue-600 dark:text-blue-400">
                            {report.lpSupervisor || '-'}
                          </div>
                          <div className={`text-[10px] font-mono ${textMuted}`}>NIK: {report.nik || '-'}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-extrabold ${
                            report.complianceScore >= 90
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : report.complianceScore >= 75
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          }`}>
                            {report.complianceScore}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {failCount > 0 ? (
                            <span className="font-bold text-amber-500">{failCount} item</span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {obsCount > 0 ? (
                            <span className="flex items-center justify-center gap-1">
                              <span className="font-bold">{obsCount}</span>
                              {criticalObsCount > 0 && (
                                <span className="bg-rose-500 text-white text-[9px] px-1 rounded font-bold" title={`${criticalObsCount} temuan Kritis/Tinggi`}>
                                  !
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {report.googleSpreadsheetUrl || report.googleDriveFileUrl ? (
                            <a
                              href={report.googleSpreadsheetUrl || report.googleDriveFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800"
                            >
                              <FileSpreadsheet size={12} />
                              <span>Sheets</span>
                              <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400">Lokal</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedReportForModal(report)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 mx-auto transition-colors ${
                              isDarkMode
                                ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                                : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <Eye size={13} />
                            <span>Rincian</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Store size={36} className="mx-auto mb-2 opacity-50" />
                      <p className="font-semibold text-sm">Tidak ada laporan audit yang cocok dengan filter</p>
                      <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau tanggal</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredReports.length > 15 && (
            <p className={`text-center text-xs ${textMuted} pt-2`}>
              Menampilkan 15 laporan terbaru dari {filteredReports.length} laporan. Gunakan filter untuk menelusuri data lebih spesifik.
            </p>
          )}
        </section>
        )}
      </main>

      {/* Modal Detail Laporan Audit */}
      {selectedReportForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl ${bgCard} p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200`}>
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b pb-4 border-inherit">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-600 text-white font-bold">
                    {selectedReportForModal.id}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    selectedReportForModal.complianceScore >= 90
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : selectedReportForModal.complianceScore >= 75
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  }`}>
                    Skor: {selectedReportForModal.complianceScore}%
                  </span>
                </div>
                <h3 className={`text-lg font-bold mt-1.5 ${textHeading}`}>
                  {selectedReportForModal.store}
                </h3>
                <p className={`text-xs ${textMuted} mt-0.5`}>
                  {new Date(selectedReportForModal.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • Pukul {new Date(selectedReportForModal.date).toLocaleTimeString('id-ID')} WIB
                </p>
              </div>
              <button
                onClick={() => setSelectedReportForModal(null)}
                className={`p-2 rounded-xl border ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Supervisor Info */}
            <div className={`p-3.5 rounded-xl border grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div>
                <span className={textMuted}>PIC LP Supervisor:</span>
                <p className="font-bold text-blue-600 dark:text-blue-400">{selectedReportForModal.lpSupervisor || '-'}</p>
              </div>
              <div>
                <span className={textMuted}>NIK:</span>
                <p className="font-bold font-mono">{selectedReportForModal.nik || '-'}</p>
              </div>
              <div>
                <span className={textMuted}>Shift:</span>
                <p className="font-bold">{selectedReportForModal.shift || '-'}</p>
              </div>
            </div>

            {/* AI Summary (if any) */}
            {selectedReportForModal.aiSummary && (
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-blue-950/30 border-blue-900/60' : 'bg-blue-50/80 border-blue-200'}`}>
                <div className="flex items-center gap-1.5 font-bold text-xs text-blue-600 dark:text-blue-300 mb-1">
                  <Sparkles size={14} />
                  <span>Ringkasan Eksekutif & Analisis AI</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                  {selectedReportForModal.aiSummary}
                </p>
              </div>
            )}

            {/* FAIL Checklist Items */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2 flex items-center gap-1.5">
                <AlertTriangle size={14} />
                Item Ceklist Tidak Sesuai Standar (FAIL)
              </h4>
              {selectedReportForModal.items && selectedReportForModal.items.filter(i => i.status === InspectionStatus.FAIL).length > 0 ? (
                <div className="space-y-2">
                  {selectedReportForModal.items.filter(i => i.status === InspectionStatus.FAIL).map((item, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border border-amber-300/60 ${isDarkMode ? 'bg-amber-950/20' : 'bg-amber-50/40'} text-xs space-y-1`}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-amber-600 dark:text-amber-400">[{item.category}] {item.label}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white shrink-0">FAIL</span>
                      </div>
                      {item.comment && (
                        <p className={`text-[11px] italic ${textMuted}`}>Catatan: {item.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-500 italic flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  Seluruh item checklist berstatus OK (PASS)
                </p>
              )}
            </div>

            {/* Observations List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-2 flex items-center gap-1.5">
                <AlertOctagon size={14} />
                Temuan Observasi Lapangan
              </h4>
              {selectedReportForModal.observations && selectedReportForModal.observations.length > 0 ? (
                <div className="space-y-2">
                  {selectedReportForModal.observations.map((obs) => (
                    <div key={obs.id} className={`p-3 rounded-xl border border-rose-300/60 ${isDarkMode ? 'bg-rose-950/20' : 'bg-rose-50/40'} text-xs space-y-1.5`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-600 dark:text-rose-400">Lokasi: {obs.location}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          obs.severity === 'Critical' ? 'bg-rose-600 text-white' : obs.severity === 'High' ? 'bg-orange-500 text-white' : obs.severity === 'Medium' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                        }`}>
                          {obs.severity}
                        </span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200">{obs.description}</p>
                      {obs.photo && (
                        <div className="mt-2">
                          <img src={obs.photo} alt="Bukti Observasi" className="max-h-48 rounded-lg border object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Tidak ada catatan observasi lapangan</p>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-inherit flex flex-wrap items-center justify-between gap-3">
              <div>
                {selectedReportForModal.googleSpreadsheetUrl && (
                  <a
                    href={selectedReportForModal.googleSpreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                  >
                    <FileSpreadsheet size={14} />
                    <span>Buka Dokumen Google Spreadsheet</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
              <button
                onClick={() => setSelectedReportForModal(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border ${isDarkMode ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-white' : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'}`}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StandaloneDashboardPortal;
