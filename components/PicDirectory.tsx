import React, { useState, useMemo } from 'react';
import { BU_BANTEN_STORES, BU_BANTEN_SUPERVISORS, BUBantenStore, BUBantenSupervisor } from '../data/buBantenStores';
import { Building2, UserCheck, Search, Filter, Store, Badge, CheckCircle2, ArrowRight, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

interface PicDirectoryProps {
  onSelectStoreForInspection?: (store: BUBantenStore) => void;
}

const PicDirectory: React.FC<PicDirectoryProps> = ({ onSelectStoreForInspection }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpv, setSelectedSpv] = useState<string>('ALL');
  const [selectedBu, setSelectedBu] = useState<string>('ALL');

  // Business Units list
  const businessUnits = useMemo(() => {
    const bus = new Set<string>();
    BU_BANTEN_STORES.forEach(s => {
      if (s.businessUnit) bus.add(s.businessUnit);
    });
    return ['ALL', ...Array.from(bus).sort()];
  }, []);

  // Filtered stores
  const filteredStores = useMemo(() => {
    return BU_BANTEN_STORES.filter(s => {
      const matchSpv = selectedSpv === 'ALL' || s.lpSpv.toUpperCase() === selectedSpv.toUpperCase();
      const matchBu = selectedBu === 'ALL' || s.businessUnit.toUpperCase() === selectedBu.toUpperCase();
      
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.lpSpv.toLowerCase().includes(q) ||
        s.nikSpv.toLowerCase().includes(q) ||
        (s.homeBase && s.homeBase.toLowerCase().includes(q)) ||
        s.businessUnit.toLowerCase().includes(q);

      return matchSpv && matchBu && matchQuery;
    });
  }, [searchQuery, selectedSpv, selectedBu]);

  // Selected supervisor details
  const activeSupervisor = useMemo(() => {
    if (selectedSpv === 'ALL') return null;
    return BU_BANTEN_SUPERVISORS.find(spv => spv.name.toUpperCase() === selectedSpv.toUpperCase());
  }, [selectedSpv]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck size={16} />
              <span>Database Resmi Wilayah Banten</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Direktori Toko & PIC LP Supervisor</h1>
            <p className="text-blue-200 text-xs sm:text-sm mt-1 max-w-2xl">
              Daftar pemetaan resmi {BU_BANTEN_STORES.length} toko dan PIC LP Supervisor BU Banten lengkap dengan Home Base, Unit Bisnis, dan NIK.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/15">
            <div className="text-center px-2">
              <div className="text-2xl font-extrabold">{BU_BANTEN_STORES.length}</div>
              <div className="text-[10px] text-blue-200 uppercase font-medium">Total Toko</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center px-2">
              <div className="text-2xl font-extrabold">{BU_BANTEN_SUPERVISORS.length}</div>
              <div className="text-[10px] text-blue-200 uppercase font-medium">Supervisor</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari toko, kode, supervisor, NIK, atau BU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Reset
              </button>
            )}
          </div>

          {/* Supervisor Filter */}
          <div className="w-full sm:w-64">
            <select
              value={selectedSpv}
              onChange={(e) => setSelectedSpv(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-700"
            >
              <option value="ALL">Semua Supervisor ({BU_BANTEN_SUPERVISORS.length})</option>
              {BU_BANTEN_SUPERVISORS.map(spv => (
                <option key={spv.name} value={spv.name}>
                  {spv.name} ({spv.totalStore} Toko)
                </option>
              ))}
            </select>
          </div>

          {/* Business Unit Filter */}
          <div className="w-full sm:w-44">
            <select
              value={selectedBu}
              onChange={(e) => setSelectedBu(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-700"
            >
              {businessUnits.map(bu => (
                <option key={bu} value={bu}>
                  {bu === 'ALL' ? 'Semua BU' : `BU: ${bu}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Supervisor Highlight Card when selected */}
        {activeSupervisor && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <UserCheck size={18} className="text-blue-600" />
              <div>
                <span className="font-bold text-slate-900 text-sm">{activeSupervisor.name}</span>
                <span className="text-slate-500 ml-2 font-mono">NIK: {activeSupervisor.nik}</span>
                <span className="ml-2 px-1.5 py-0.5 bg-blue-200 text-blue-800 rounded font-semibold text-[10px]">
                  {activeSupervisor.jabatan}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-600">
              <span>Home Base: <strong className="text-slate-900">{activeSupervisor.homeBase}</strong></span>
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                {activeSupervisor.totalStore} Toko PIC
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Grid of Stores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredStores.map(store => (
          <div
            key={store.no + store.code + store.name}
            className={`p-4 bg-white rounded-xl border transition-all duration-150 flex flex-col justify-between ${
              store.isHomeBase 
                ? 'border-amber-300 bg-amber-50/20 shadow-xs' 
                : 'border-slate-200 hover:border-blue-300 hover:shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-800 text-white rounded">
                    {store.code || 'NO-KODE'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded uppercase">
                    {store.businessUnit}
                  </span>
                </div>
                {store.isHomeBase && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded font-bold">
                    ★ HOME BASE
                  </span>
                )}
              </div>

              <h3 className="font-bold text-sm text-slate-800 leading-snug mb-2 line-clamp-2">
                {store.name}
              </h3>

              <div className="text-xs text-slate-600 space-y-1 mb-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 font-medium text-blue-900">
                  <UserCheck size={13} className="text-blue-600 shrink-0" />
                  <span>PIC: <strong>{store.lpSpv}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                  <Badge size={13} className="text-slate-400 shrink-0" />
                  <span>NIK: {store.nikSpv}</span>
                  {store.jabatan && <span className="text-slate-400 font-sans">• {store.jabatan}</span>}
                </div>
                {store.homeBase && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Store size={12} className="text-slate-400 shrink-0" />
                    <span>Base: {store.homeBase}</span>
                  </div>
                )}
              </div>
            </div>

            {onSelectStoreForInspection && (
              <button
                type="button"
                onClick={() => onSelectStoreForInspection(store)}
                className="w-full mt-2 py-2 px-3 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-blue-200 hover:border-blue-600"
              >
                <span>Mulai Inspeksi Toko Ini</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Store size={36} className="text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">Tidak ada toko yang sesuai</h3>
          <p className="text-xs text-slate-500 mt-1">Coba gunakan kata kunci pencarian atau filter yang berbeda.</p>
        </div>
      )}
    </div>
  );
};

export default PicDirectory;
