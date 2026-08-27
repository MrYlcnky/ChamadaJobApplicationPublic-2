import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faSliders,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import AdvancedFilters from "./AdvancedFilters";

export default function AdminPanelHeader({
  filteredDataLength,
  tab,
  setTab,
  branchFilter = "all",
  setBranchFilter,
  // 🎯 YENİ PROPLAR EKLENDİ
  stageFilter = "all",
  setStageFilter,
  globalFilter,
  setGlobalFilter,
  filterPanelRef,
  isFilterOpen,
  setIsFilterOpen,
  filters,
  setFilters,
  lookups,
  initialFilters,
  activeFilters,
  setActiveFilters,
}) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4">
      {/* Üst Başlık ve Sekmeler Alanı */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
        {/* Sol Taraf (Başlık ve Şube Filtresi) */}
        <div className="w-full lg:w-auto">
          <h1 className="text-lg sm:text-xl font-black text-gray-800 tracking-tight uppercase">
            BAŞVURU YÖNETİMİ
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              TOPLAM <span className="text-sky-600">{filteredDataLength}</span>{" "}
              BAŞVURU
            </p>
          </div>

          {setBranchFilter && (
            <div className="flex items-center gap-1 mt-3 bg-gray-50 p-1 rounded-lg w-fit border border-gray-200/60 shadow-inner">
              <div className="pl-2 pr-1 text-gray-400">
                <FontAwesomeIcon icon={faBuilding} className="text-[10px]" />
              </div>
              {[
                { id: "all", label: "TÜM ŞUBELER" },
                { id: "GİRNE", label: "GİRNE" },
                { id: "PRESTİGE", label: "PRESTİGE" },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBranchFilter(b.id)}
                  className={`px-3 py-1.5 text-[9px] font-black rounded-md uppercase transition-all duration-200 tracking-wider ${
                    branchFilter === b.id
                      ? "bg-gray-800 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-200/50 hover:text-gray-700"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 🎯 SAĞ TARAF: ALT ALTA İKİ FİLTRE SATIRI (DURUM VE AŞAMA) */}
        <div className="flex flex-col gap-2 w-full lg:w-auto items-end">
          {/* 1. Satır: Durum Sekmeleri (Yeni, Süreçte vs.) */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-full lg:w-auto overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap shadow-inner">
            {[
              { id: "all", label: "TÜMÜ" },
              { id: "new", label: "YENİ" },
              { id: "pending", label: "SÜREÇTE" },
              { id: "revision", label: "REVİZE" },
              { id: "approved", label: "ONAYLI" },
              { id: "rejected", label: "RED" },
              { id: "completelyRejected", label: "TAMAMEN REDDEDİLEN" },
              { id: "hasStartDate", label: "İŞ BAS. TARİH" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 lg:flex-none px-3 py-2 text-[10px] font-black rounded-lg transition-all duration-200 ${
                  tab === t.id
                    ? "bg-white shadow-sm text-blue-600 scale-[1.02]"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* 🎯 2. Satır: YENİ Aşama Sekmeleri */}
          {setStageFilter && (
            <div className="flex gap-1 bg-sky-50/50 border border-sky-100 p-1 rounded-xl w-full lg:w-auto overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap">
              {[
                { id: "all", label: "TÜM AŞAMALAR" },
                { id: 1, label: "İK SEVK" },
                { id: 2, label: "DEP. MNG" },
                { id: 3, label: "İK SON KONTROL" },
                { id: 4, label: "GM" },
                { id: 5, label: "MALİ İŞLER" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStageFilter(s.id)}
                  className={`flex-1 lg:flex-none px-3 py-1.5 text-[9px] font-black rounded-lg transition-all duration-200 ${
                    stageFilter === s.id
                      ? "bg-sky-500 shadow-sm text-white scale-[1.02]"
                      : "text-sky-700 hover:bg-sky-100 hover:text-sky-800"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Arama ve Gelişmiş Filtre Satırı */}
      <div className="flex flex-row gap-2 relative">
        <div className="relative flex-1">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
          />
          <input
            type="text"
            placeholder="İsim veya ID ile hızlı ara..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 text-xs font-bold transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Filtre Butonu ve Paneli */}
        <div className="relative" ref={filterPanelRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`h-full px-3 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              isFilterOpen ||
              JSON.stringify(activeFilters) !== JSON.stringify(initialFilters)
                ? "bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/20"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <FontAwesomeIcon icon={faSliders} />
            <span className="hidden sm:inline">Gelişmiş Filtre</span>
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-2 z-60 w-[calc(100vw-2rem)] sm:w-80 md:w-96 shadow-2xl">
              <AdvancedFilters
                filters={filters}
                lookups={lookups}
                onFilterChange={(e) =>
                  setFilters({ ...filters, [e.target.name]: e.target.value })
                }
                onApply={() => {
                  setActiveFilters(filters);
                  setIsFilterOpen(false);
                }}
                onClear={() => {
                  setFilters(initialFilters);
                  setActiveFilters(initialFilters);
                  setIsFilterOpen(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
