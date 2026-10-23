import React, { useMemo, useState } from 'react';
import { DailyReport } from '../types';
import { BU_BANTEN_STORES } from '../data/buBantenStores';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import { 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  TrendingUp, 
  Clock, 
  Store, 
  UserCheck, 
  Building2, 
  ArrowRight,
  Calendar,
  BarChart3,
  CalendarDays,
  Flame,
  TrendingDown,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  ShieldAlert,
  Layers,
  Sparkles,
  LayoutDashboard,
  ExternalLink
} from 'lucide-react';
import { AuthUser } from '../services/authService';

interface DashboardProps {
  reports: DailyReport[];
  onCreateNew: () => void;
  onOpenDirectory?: () => void;
  onInspectStore?: (store: any) => void;
  currentUser?: AuthUser | null;
  onOpenLogin?: () => void;
  onLogout?: () => void;
}

const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700/80 text-xs min-w-[210px] z-50">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2">
          <span className="font-semibold text-slate-200">{data.fullDate}</span>
          {data.isToday && (
            <span className="bg-blue-500/20 text-blue-300 text-[10px] px-1.5 py-0.5 rounded font-medium border border-blue-400/40">
              Hari Ini
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-4 py-1">
          <span className="text-slate-400">Audit Selesai:</span>
          <span className="text-sm font-bold text-blue-400">{data.count} audit</span>
        </div>
        {data.stores && data.stores.length > 0 ? (
          <div className="mt-2 pt-2 border-t border-slate-800">
            <p className="text-[10px] text-slate-400 mb-1 font-medium">Toko yang diinspeksi:</p>
            <ul className="space-y-1 text-[11px] text-slate-300">
              {data.stores.slice(0, 3).map((st: string, idx: number) => (
                <li key={idx} className="truncate max-w-[220px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                  <span className="truncate">{st}</span>
                </li>
              ))}
              {data.stores.length > 3 && (
                <li className="text-[10px] text-slate-400 italic pl-3">
                  +{data.stores.length - 3} toko lainnya
                </li>
              )}
            </ul>
          </div>
        ) : (
          <p className="text-[10px] text-slate-500 mt-1 italic">Tidak ada audit selesai pada tanggal ini</p>
        )}
      </div>
    );
  }
  return null;
};

const CustomMonthlyTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isImproved = data.momChange !== null && data.momChange < 0;
    const isIncreased = data.momChange !== null && data.momChange > 0;

    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700/80 text-xs min-w-[240px] z-50">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2">
          <span className="font-semibold text-slate-100 text-sm">{data.fullMonth}</span>
          <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700">
            {data.auditCount} inspeksi
          </span>
        </div>

        <div className="space-y-1.5 py-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total Temuan Masalah:</span>
            <span className="text-base font-bold text-rose-400">{data.totalIssues} temuan</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300 pl-2 border-l-2 border-amber-500/60">
            <span>• Item Ceklist (FAIL):</span>
            <span className="font-semibold text-amber-300">{data.checklistFails}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300 pl-2 border-l-2 border-purple-500/60">
            <span>• Observasi Lapangan:</span>
            <span className="font-semibold text-purple-300">{data.observations}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-slate-400">
            <span>Rata-rata per Audit:</span>
            <span className="font-medium text-slate-200">{data.avgPerAudit} / audit</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Skor Kepatuhan Rata-rata:</span>
            <span className={`font-semibold ${data.avgScore >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {data.avgScore}%
            </span>
          </div>
        </div>

        {data.momChange !== null && (
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Perubahan MoM:</span>
            <span className={`font-bold flex items-center gap-0.5 ${isImproved ? 'text-emerald-400' : isIncreased ? 'text-rose-400' : 'text-slate-300'}`}>
              {isImproved ? `▼ ${Math.abs(data.momChange)}% (Membaik)` : isIncreased ? `▲ +${data.momChange}% (Naik)` : 'Stabil'}
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ 
  reports, 
  onCreateNew, 
  onOpenDirectory, 
  onInspectStore,
  currentUser,
  onOpenLogin,
  onLogout
}) => {
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('ALL');
  const [monthlyViewMode, setMonthlyViewMode] = useState<'total' | 'breakdown'>('total');
  
  const stats = useMemo(() => {
    const totalReports = reports.length;
    const avgScore = totalReports > 0 
      ? Math.round(reports.reduce((acc, r) => acc + r.complianceScore, 0) / totalReports) 
      : 0;
    
    // Count total issues across all reports
    const totalIssues = reports.reduce((acc, r) => {
      return acc + r.items.filter(i => i.status === 'FAIL').length + r.observations.length;
    }, 0);

    return { totalReports, avgScore, totalIssues };
  }, [reports]);

  // Aggregate completed audits count over the last 7 days
  const last7DaysStats = useMemo(() => {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const days: {
      dateKey: string;
      shortDay: string;
      dateLabel: string;
      dayNumber: number;
      fullDate: string;
      count: number;
      stores: string[];
      isToday: boolean;
    }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayMidnight);
      d.setDate(todayMidnight.getDate() - i);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateKey = `${yyyy}-${mm}-${dd}`;

      const shortDay = d.toLocaleDateString('id-ID', { weekday: 'short' });
      const dayNumber = d.getDate();
      const dateLabel = `${shortDay} (${dayNumber})`;
      const fullDate = d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      days.push({
        dateKey,
        shortDay,
        dateLabel,
        dayNumber,
        fullDate,
        count: 0,
        stores: [],
        isToday: i === 0
      });
    }

    let totalLast7Days = 0;

    reports.forEach(report => {
      if (!report.date) return;
      const rDate = new Date(report.date);
      if (isNaN(rDate.getTime())) return;

      const yyyy = rDate.getFullYear();
      const mm = String(rDate.getMonth() + 1).padStart(2, '0');
      const dd = String(rDate.getDate()).padStart(2, '0');
      const rKey = `${yyyy}-${mm}-${dd}`;

      const match = days.find(d => d.dateKey === rKey);
      if (match) {
        match.count += 1;
        totalLast7Days += 1;
        if (report.store) {
          match.stores.push(report.store);
        }
      }
    });

    const maxCount = Math.max(...days.map(d => d.count), 0);
    const peakDay = days.find(d => d.count === maxCount && maxCount > 0);
    const avgPerDay = (totalLast7Days / 7).toFixed(1);

    return {
      days,
      totalLast7Days,
      maxCount,
      peakDay,
      avgPerDay
    };
  }, [reports]);

  const trendData = useMemo(() => {
    // Sort reports by date ascending for the line chart
    const sorted = [...reports].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.map(r => ({
      date: new Date(r.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      score: r.complianceScore,
      fullDate: new Date(r.date).toLocaleDateString('id-ID'),
      shift: r.shift
    }));
  }, [reports]);
  
  // Store options for filter dropdown
  const storeOptions = useMemo(() => {
    const set = new Set<string>();
    reports.forEach(r => {
      if (r.store) set.add(r.store);
    });
    return Array.from(set).sort();
  }, [reports]);

  // Aggregate monthly issues/problem findings (last 6 months) to track store performance improvement
  const monthlyFindings = useMemo(() => {
    const now = new Date();
    const monthsList: {
      monthKey: string;
      monthLabel: string;
      fullMonth: string;
      totalIssues: number;
      checklistFails: number;
      observations: number;
      auditCount: number;
      avgScore: number;
      storesWithIssues: { name: string; count: number }[];
    }[] = [];

    // Generate 6 months sequence up to current month (e.g. 5 months ago to this month)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const monthKey = `${yyyy}-${mm}`;
      const monthName = d.toLocaleDateString('id-ID', { month: 'short' });
      const fullMonth = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      const yearShort = String(yyyy).slice(-2);

      monthsList.push({
        monthKey,
        monthLabel: `${monthName} '${yearShort}`,
        fullMonth,
        totalIssues: 0,
        checklistFails: 0,
        observations: 0,
        auditCount: 0,
        avgScore: 0,
        storesWithIssues: []
      });
    }

    const filtered = selectedStoreFilter === 'ALL'
      ? reports
      : reports.filter(r => r.store === selectedStoreFilter);

    filtered.forEach(report => {
      if (!report.date) return;
      const rDate = new Date(report.date);
      if (isNaN(rDate.getTime())) return;

      const yyyy = rDate.getFullYear();
      const mm = String(rDate.getMonth() + 1).padStart(2, '0');
      const key = `${yyyy}-${mm}`;

      const targetMonth = monthsList.find(m => m.monthKey === key);
      if (targetMonth) {
        const fails = report.items.filter(i => i.status === 'FAIL').length;
        const obs = report.observations.length;
        const total = fails + obs;

        targetMonth.totalIssues += total;
        targetMonth.checklistFails += fails;
        targetMonth.observations += obs;
        targetMonth.auditCount += 1;
        targetMonth.avgScore += report.complianceScore;

        if (total > 0 && report.store) {
          const existing = targetMonth.storesWithIssues.find(s => s.name === report.store);
          if (existing) {
            existing.count += total;
          } else {
            targetMonth.storesWithIssues.push({ name: report.store, count: total });
          }
        }
      }
    });

    const enriched = monthsList.map((m, idx, arr) => {
      const avgScore = m.auditCount > 0 ? Math.round(m.avgScore / m.auditCount) : 0;
      const avgPerAudit = m.auditCount > 0 ? Number((m.totalIssues / m.auditCount).toFixed(1)) : 0;

      let momChange: number | null = null;
      if (idx > 0) {
        const prev = arr[idx - 1];
        if (prev.totalIssues > 0) {
          momChange = Math.round(((m.totalIssues - prev.totalIssues) / prev.totalIssues) * 100);
        } else if (m.totalIssues > 0) {
          momChange = 100;
        } else {
          momChange = 0;
        }
      }

      return {
        ...m,
        avgScore,
        avgPerAudit,
        momChange
      };
    });

    const firstMonthWithIssues = enriched.find(m => m.totalIssues > 0) || enriched[0];
    const latestMonth = enriched[enriched.length - 1];
    const prevMonth = enriched.length > 1 ? enriched[enriched.length - 2] : null;

    let overallImprovement: number | null = null;
    if (firstMonthWithIssues.totalIssues > 0) {
      overallImprovement = Math.round(((firstMonthWithIssues.totalIssues - latestMonth.totalIssues) / firstMonthWithIssues.totalIssues) * 100);
    }

    const totalIssues6Months = enriched.reduce((acc, m) => acc + m.totalIssues, 0);
    const avgMonthlyIssues = (totalIssues6Months / enriched.length).toFixed(1);
    const maxIssuesMonth = Math.max(...enriched.map(m => m.totalIssues), 0);

    return {
      data: enriched,
      latestMonth,
      prevMonth,
      firstMonthWithIssues,
      overallImprovement,
      totalIssues6Months,
      avgMonthlyIssues,
      maxIssuesMonth
    };
  }, [reports, selectedStoreFilter]);

  const pieData = [
    { name: 'Sesuai (Compliance)', value: stats.avgScore },
    { name: 'Gap (Non-Compliance)', value: 100 - stats.avgScore }
  ];
  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dasbor LP</h1>
          <p className="text-slate-500 text-sm">
            {currentUser ? (
              <span>
                Selamat bertugas, <strong className="text-blue-700 font-bold">{currentUser.name}</strong> ({currentUser.jabatan} • NIK: <span className="font-mono">{currentUser.nik}</span>)
              </span>
            ) : (
              'Ringkasan Performa & Audit Harian BU Banten'
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onOpenDirectory && (
            <button 
              onClick={onOpenDirectory}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-lg font-semibold shadow-xs transition-all flex items-center gap-2 text-sm cursor-pointer"
            >
              <Building2 size={16} className="text-blue-600" />
              <span>Direktori {BU_BANTEN_STORES.length} Toko</span>
            </button>
          )}
          <button 
            onClick={onCreateNew}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-all flex items-center gap-2 text-sm cursor-pointer"
          >
            <TrendingUp size={16} />
            Inspeksi Baru
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Laporan</p>
            <p className="text-2xl font-bold text-slate-800">{stats.totalReports}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <CalendarDays size={24} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm text-slate-500 font-medium">Audit 7 Hari</p>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-semibold border border-indigo-200">
                Mingguan
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-slate-800">{last7DaysStats.totalLast7Days}</p>
              <span className="text-xs text-slate-400">({last7DaysStats.avgPerDay}/hari)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Rata-rata Kepatuhan</p>
            <p className="text-2xl font-bold text-slate-800">{stats.avgScore}%</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Temuan</p>
            <p className="text-2xl font-bold text-slate-800">{stats.totalIssues}</p>
          </div>
        </div>
      </div>

      {/* Empty State Banner when Dashboard is cleared */}
      {reports.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50/70 via-slate-50 to-indigo-50/70 border border-blue-200/80 rounded-2xl p-6 sm:p-8 text-center shadow-xs">
          <div className="w-14 h-14 bg-white border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs text-blue-600">
            <Sparkles size={28} />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
            Dasbor Siap Digunakan
          </h3>
          <p className="text-sm text-slate-600 max-w-lg mx-auto mb-5 leading-relaxed">
            Belum ada laporan inspeksi tersimpan. Mulai inspeksi ceklist baru untuk mencatat kepatuhan dan temuan operasional toko di wilayah BU Banten.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onCreateNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all flex items-center gap-2 text-sm cursor-pointer"
            >
              <TrendingUp size={16} />
              Mulai Inspeksi Baru
            </button>
            {onOpenDirectory && (
              <button
                onClick={onOpenDirectory}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-xl font-semibold shadow-xs transition-all flex items-center gap-2 text-sm cursor-pointer"
              >
                <Building2 size={16} className="text-blue-600" />
                Lihat Direktori {BU_BANTEN_STORES.length} Toko PIC
              </button>
            )}
          </div>
        </div>
      )}

      {/* Monthly Findings Trend Section (Recharts AreaChart) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span>Tren Jumlah Temuan Masalah per Bulan</span>
                  {monthlyFindings.overallImprovement !== null && monthlyFindings.overallImprovement > 0 && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Performa Membaik
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monitoring penurunan temuan untuk evaluasi perbaikan performa toko secara berkala
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Store Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
              <Filter size={14} className="text-slate-500 shrink-0" />
              <span className="text-slate-500 font-medium">Toko:</span>
              <select
                value={selectedStoreFilter}
                onChange={(e) => setSelectedStoreFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer pr-1 max-w-[210px] truncate"
              >
                <option value="ALL">Semua Toko ({storeOptions.length} Toko)</option>
                {storeOptions.map((storeName) => (
                  <option key={storeName} value={storeName}>
                    {storeName}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle: Total vs Breakdown */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setMonthlyViewMode('total')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  monthlyViewMode === 'total'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Total Temuan
              </button>
              <button
                onClick={() => setMonthlyViewMode('breakdown')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
                  monthlyViewMode === 'breakdown'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers size={13} />
                Rincian Kategori
              </button>
            </div>
          </div>
        </div>

        {/* Insight Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <p className="text-[11px] font-medium text-slate-500">Temuan Bulan Ini</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-800">
                {monthlyFindings.latestMonth.totalIssues}
              </span>
              <span className="text-xs text-slate-400">masalah</span>
            </div>
            {monthlyFindings.latestMonth.momChange !== null && (
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold">
                {monthlyFindings.latestMonth.momChange <= 0 ? (
                  <span className="text-emerald-600 flex items-center gap-0.5">
                    <TrendingDown size={13} />
                    {Math.abs(monthlyFindings.latestMonth.momChange)}% vs bln lalu
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center gap-0.5">
                    <TrendingUp size={13} />
                    +{monthlyFindings.latestMonth.momChange}% vs bln lalu
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <p className="text-[11px] font-medium text-slate-500">Tingkat Perbaikan (6 Bulan)</p>
            <div className="flex items-baseline gap-2 mt-1">
              {monthlyFindings.overallImprovement !== null ? (
                <>
                  <span className={`text-2xl font-bold ${monthlyFindings.overallImprovement >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {monthlyFindings.overallImprovement >= 0 ? `▼ ${monthlyFindings.overallImprovement}%` : `▲ +${Math.abs(monthlyFindings.overallImprovement)}%`}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-slate-700">Stabil</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {monthlyFindings.overallImprovement !== null && monthlyFindings.overallImprovement > 0
                ? 'Temuan berkurang konsisten'
                : 'Performa stabil'}
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <p className="text-[11px] font-medium text-slate-500">Rata-rata Temuan</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-800">
                {monthlyFindings.latestMonth.avgPerAudit}
              </span>
              <span className="text-xs text-slate-400">per audit</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Target toleransi: &le; 2.0 / audit
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <p className="text-[11px] font-medium text-slate-500">Evaluasi Status Toko</p>
            <div className="mt-1 flex items-center gap-1.5">
              {monthlyFindings.overallImprovement !== null && monthlyFindings.overallImprovement > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 size={13} />
                  Performa Meningkat
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  <AlertTriangle size={13} />
                  Dalam Pantauan
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {selectedStoreFilter === 'ALL' ? 'Akumulasi Seluruh Toko' : selectedStoreFilter}
            </p>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyFindings.data}
              margin={{ top: 15, right: 15, bottom: 5, left: -15 }}
            >
              <defs>
                <linearGradient id="totalIssuesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="checklistGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="obsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />
              <YAxis
                allowDecimals={false}
                domain={[0, Math.max(monthlyFindings.maxIssuesMonth + 2, 6)]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomMonthlyTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                height={32}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
              />

              {monthlyViewMode === 'total' ? (
                <Area
                  type="monotone"
                  dataKey="totalIssues"
                  name="Total Temuan Masalah"
                  stroke="#e11d48"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#totalIssuesGradient)"
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#e11d48' }}
                  activeDot={{ r: 7, stroke: '#be123c', strokeWidth: 2, fill: '#fff' }}
                />
              ) : (
                <>
                  <Area
                    type="monotone"
                    dataKey="checklistFails"
                    name="Item Ceklist (FAIL)"
                    stroke="#d97706"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#checklistGradient)"
                    dot={{ r: 3.5, strokeWidth: 2, fill: '#fff', stroke: '#d97706' }}
                    activeDot={{ r: 6 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="observations"
                    name="Observasi Lapangan"
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#obsGradient)"
                    dot={{ r: 3.5, strokeWidth: 2, fill: '#fff', stroke: '#7c3aed' }}
                    activeDot={{ r: 6 }}
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer Interpretation & Action Guidance for LP Supervisor */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-slate-700">
              Analisis Tren LP:
            </span>
            <span>
              {monthlyFindings.overallImprovement !== null && monthlyFindings.overallImprovement > 0
                ? `Temuan berkurang ${monthlyFindings.overallImprovement}% selama 6 bulan terakhir. Program perbaikan SOP dan corrective action berhasil.`
                : 'Pertahankan sidak berkala dan pastikan temuan APAR, CCTV, serta akses darurat diselesaikan tuntas.'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Data tren diperbarui otomatis dari riwayat hasil audit</span>
          </div>
        </div>
      </div>

      {/* Primary Analytics Section: 7-Day Audit Count & Compliance Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Summary Chart: Count of completed audits over the last 7 days */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-blue-600" />
                  <h3 className="font-semibold text-slate-800">Audit Selesai (7 Hari Terakhir)</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Jumlah audit LP yang terselesaikan tiap hari</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  Total {last7DaysStats.totalLast7Days} Selesai
                </span>
                {last7DaysStats.peakDay && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <Flame size={12} className="text-amber-500" />
                    Puncak: {last7DaysStats.peakDay.shortDay} ({last7DaysStats.maxCount})
                  </span>
                )}
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={last7DaysStats.days} 
                  margin={{ top: 12, right: 10, bottom: 5, left: -20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="dateLabel" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={8}
                  />
                  <YAxis 
                    allowDecimals={false}
                    domain={[0, Math.max(last7DaysStats.maxCount + 1, 4)]}
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip 
                    content={<CustomBarTooltip />}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={42}
                  >
                    {last7DaysStats.days.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isToday ? '#2563eb' : entry.count > 0 ? '#3b82f6' : '#e2e8f0'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mt-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span>
                <span>Hari Ini</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-400"></span>
                <span>Ada Audit</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-200"></span>
                <span>0 Audit</span>
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              Rata-rata: {last7DaysStats.avgPerDay} audit/hari
            </span>
          </div>
        </div>

        {/* Trend Chart: Compliance Score Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-blue-600" />
                  <h3 className="font-semibold text-slate-800">Tren Skor Kepatuhan</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Perkembangan persentase skor hasil audit</p>
              </div>
              {stats.totalReports > 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                  Rata-rata {stats.avgScore}%
                </span>
              )}
            </div>

            <div className="h-64 w-full">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 12, right: 10, bottom: 5, left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      axisLine={false}
                      tickLine={false} 
                      dy={8}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`${value}%`, 'Skor']}
                      labelStyle={{ color: '#64748b', marginBottom: '0.25rem', fontSize: '11px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#2563eb" 
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#2563eb' }}
                      activeDot={{ r: 6, fill: '#2563eb' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Belum ada data yang cukup untuk menampilkan tren.
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
            <span>Target Kepatuhan Minimum: 85%</span>
            <span className={`font-semibold ${stats.avgScore >= 85 ? 'text-green-600' : 'text-amber-600'}`}>
              Status: {stats.avgScore >= 85 ? 'Memenuhi Target' : 'Perlu Perhatian'}
            </span>
          </div>
        </div>

      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-1">Skor Kepatuhan Rata-rata</h3>
          <p className="text-xs text-slate-500 mb-4">Perbandingan item sesuai standar vs non-compliance</p>
          <div className="h-64 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
             </ResponsiveContainer>
          </div>
          <p className="text-center text-sm text-slate-500 mt-2">Berdasarkan seluruh data historis</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-slate-800">Aktivitas Terakhir</h3>
            <span className="text-xs text-slate-400">Terbaru</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">Catatan inspeksi terbaru yang tercatat</p>
          <div className="space-y-4">
            {reports.slice(0, 3).map((report) => (
              <div key={report.id} className="flex items-start gap-3 border-b border-slate-50 pb-3 last:border-0">
                <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${report.complianceScore >= 90 ? 'bg-green-500' : report.complianceScore >= 75 ? 'bg-amber-500' : 'bg-red-500'}`} />
                <div className="w-full">
                  <div className="flex justify-between items-start w-full">
                     <p className="text-sm font-medium text-slate-800">
                      {new Date(report.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${report.complianceScore >= 90 ? 'bg-green-100 text-green-700' : report.complianceScore >= 75 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {report.complianceScore}%
                    </span>
                  </div>
                  {(report.store || report.shift) && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Store size={12} className="text-blue-500 shrink-0" />
                      <p className="text-xs font-semibold text-slate-700 truncate max-w-[280px]">
                        {report.store ? report.store : report.shift}
                        {report.lpSupervisor ? ` • Spv: ${report.lpSupervisor}` : ''}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    NIK: {report.nik || report.inspectorName || '-'} | Temuan: {report.observations.length + report.items.filter(i => i.status === 'FAIL').length} isu
                  </p>
                </div>
              </div>
            ))}
            {reports.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">Belum ada laporan inspeksi tersimpan.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
