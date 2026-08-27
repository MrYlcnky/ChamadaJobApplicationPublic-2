import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faMagnifyingGlass,
  faSliders,
  faBuilding,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

import AdvancedFilters from "./AdvancedFilters";

export default function AdminPanelHeader({
  filteredDataLength,

  tab,
  setTab,

  branchFilter = "all",
  setBranchFilter,

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
  const hasAdvancedFilters =
    JSON.stringify(activeFilters) !== JSON.stringify(initialFilters);

  const statusTabs = [
    {
      id: "all",
      label: "TÜMÜ",
      activeClass: "bg-[#17171B] text-white shadow-sm",
    },
    {
      id: "new",
      label: "YENİ",
      activeClass: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/70",
    },
    {
      id: "pending",
      label: "SÜREÇTE",
      activeClass: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/70",
    },
    {
      id: "revision",
      label: "REVİZE",
      activeClass: "bg-purple-50 text-purple-700 ring-1 ring-purple-200/70",
    },
    {
      id: "approved",
      label: "ONAYLI",
      activeClass: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70",
    },
    {
      id: "rejected",
      label: "RED",
      activeClass: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/70",
    },
    {
      id: "completelyRejected",
      label: "TAMAMEN REDDEDİLEN",
      activeClass: "bg-red-50 text-red-700 ring-1 ring-red-200/70",
    },
    {
      id: "hasStartDate",
      label: "İŞ BAŞ. TARİH",
      activeClass: "bg-slate-100 text-slate-800 ring-1 ring-slate-200",
    },
  ];

  const stageTabs = [
    {
      id: "all",
      label: "TÜM AŞAMALAR",
    },
    {
      id: 1,
      label: "İK SEVK",
    },
    {
      id: 2,
      label: "DEP. MNG",
    },
    {
      id: 3,
      label: "İK SON KONTROL",
    },
    {
      id: 4,
      label: "GM",
    },
    {
      id: 5,
      label: "MALİ İŞLER",
    },
  ];

  const branchTabs = [
    {
      id: "all",
      label: "TÜM ŞUBELER",
    },
    {
      id: "GİRNE",
      label: "GİRNE",
    },
    {
      id: "PRESTİGE",
      label: "PRESTİGE",
    },
  ];

  return (
    <section
      className="
        relative
        rounded-[18px]
        bg-white
        p-4
        shadow-[0_8px_30px_rgba(15,23,42,0.055)]
        sm:p-5
      "
    >
      {/* Chamada üst vurgu */}
      <div
        className="
          pointer-events-none
          absolute
          left-10
          right-10
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-[#D6A632]/35
          to-transparent
        "
      />

      {/* =====================================================
          ÜST ALAN
      ===================================================== */}
      <div
        className="
          flex
          flex-col
          gap-5
          xl:flex-row
          xl:items-start
          xl:justify-between
        "
      >
        {/* =================================================
            SOL: BAŞLIK + ŞUBE
        ================================================= */}
        <div className="min-w-0">
          {/* Başlık */}
          <div>
            <div className="flex items-center gap-2.5">
              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#D6A632]/10
                  text-[#B98618]
                "
              >
                <FontAwesomeIcon icon={faUsers} className="text-[12px]" />
              </div>

              <div>
                <h1
                  className="
                    text-base
                    font-black
                    uppercase
                    tracking-tight
                    text-slate-800
                    sm:text-lg
                  "
                >
                  Başvuru Yönetimi
                </h1>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <span
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.1em]
                      text-slate-400
                    "
                  >
                    Toplam
                  </span>

                  <span
                    className="
                      rounded-md
                      bg-[#D6A632]/10
                      px-1.5
                      py-0.5
                      text-[9px]
                      font-black
                      text-[#A87913]
                    "
                  >
                    {filteredDataLength}
                  </span>

                  <span
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.1em]
                      text-slate-400
                    "
                  >
                    Başvuru
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Şube Filtresi */}
          {setBranchFilter && (
            <div
              className="
                mt-4
                inline-flex
                max-w-full
                items-center
                gap-1
                overflow-x-auto
                rounded-xl
                bg-slate-50
                p-1
                shadow-[inset_0_0_0_1px_rgba(226,232,240,0.8)]
                no-scrollbar
              "
            >
              <div
                className="
                  flex
                  h-7
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  text-slate-400
                "
              >
                <FontAwesomeIcon icon={faBuilding} className="text-[10px]" />
              </div>

              {branchTabs.map((branch) => {
                const isActive = branchFilter === branch.id;

                return (
                  <button
                    type="button"
                    key={branch.id}
                    onClick={() => setBranchFilter(branch.id)}
                    className={`
                      shrink-0
                      rounded-lg
                      px-3
                      py-1.5
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.08em]
                      transition-all
                      duration-200

                      ${
                        isActive
                          ? "bg-[#17171B] text-white shadow-sm"
                          : "text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm"
                      }
                    `}
                  >
                    {branch.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* =================================================
            SAĞ: DURUM + AŞAMA
        ================================================= */}
        <div
          className="
            flex
            w-full
            min-w-0
            flex-col
            gap-2.5
            xl:w-auto
            xl:items-end
          "
        >
          {/* DURUM FİLTRELERİ */}
          <div
            className="
              flex
              max-w-full
              gap-1
              overflow-x-auto
              rounded-xl
              bg-slate-50
              p-1
              shadow-[inset_0_0_0_1px_rgba(226,232,240,0.75)]
              no-scrollbar
              scroll-smooth
            "
          >
            {statusTabs.map((status) => {
              const isActive = tab === status.id;

              return (
                <button
                  type="button"
                  key={status.id}
                  onClick={() => setTab(status.id)}
                  className={`
                    shrink-0
                    whitespace-nowrap
                    rounded-lg
                    px-3
                    py-2
                    text-[9px]
                    font-black
                    tracking-[0.03em]
                    transition-all
                    duration-200

                    ${
                      isActive
                        ? status.activeClass
                        : "text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm"
                    }
                  `}
                >
                  {status.label}
                </button>
              );
            })}
          </div>

          {/* AŞAMA FİLTRELERİ */}
          {setStageFilter && (
            <div
              className="
                flex
                max-w-full
                gap-1
                overflow-x-auto
                rounded-xl
                bg-[#D6A632]/[0.045]
                p-1
                shadow-[inset_0_0_0_1px_rgba(214,166,50,0.13)]
                no-scrollbar
                scroll-smooth
              "
            >
              {stageTabs.map((stage) => {
                const isActive = stageFilter === stage.id;

                return (
                  <button
                    type="button"
                    key={stage.id}
                    onClick={() => setStageFilter(stage.id)}
                    className={`
                      shrink-0
                      whitespace-nowrap
                      rounded-lg
                      px-3
                      py-1.5
                      text-[9px]
                      font-black
                      tracking-[0.03em]
                      transition-all
                      duration-200

                      ${
                        isActive
                          ? "bg-[#D6A632] text-[#171717] shadow-[0_4px_12px_rgba(214,166,50,0.18)]"
                          : "text-[#8B6918] hover:bg-white hover:text-[#765710] hover:shadow-sm"
                      }
                    `}
                  >
                    {stage.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          ALT AYIRICI
      ===================================================== */}
      <div
        className="
          my-4
          h-px
          w-full
          bg-gradient-to-r
          from-transparent
          via-slate-200/90
          to-transparent
        "
      />

      {/* =====================================================
          ARAMA + GELİŞMİŞ FİLTRE
      ===================================================== */}
      <div className="relative flex gap-2">
        {/* ARAMA */}
        <div className="group relative flex-1">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="
              absolute
              left-3.5
              top-1/2
              -translate-y-1/2
              text-[11px]
              text-slate-400
              transition-colors
              group-focus-within:text-[#B98618]
            "
          />

          <input
            type="text"
            placeholder="İsim veya ID ile hızlı ara..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-[#FAFBFC]
              py-2.5
              pl-9
              pr-4
              text-[11px]
              font-semibold
              text-slate-700
              outline-none
              transition-all
              placeholder:font-medium
              placeholder:text-slate-400
              hover:border-slate-300
              focus:border-[#D6A632]/60
              focus:bg-white
              focus:ring-4
              focus:ring-[#D6A632]/10
            "
          />
        </div>

        {/* =================================================
            GELİŞMİŞ FİLTRE
        ================================================= */}
        <div className="relative" ref={filterPanelRef}>
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`
              relative
              flex
              h-full
              items-center
              gap-2
              rounded-xl
              border
              px-3.5
              text-[10px]
              font-bold
              transition-all
              duration-200
              sm:px-4

              ${
                isFilterOpen || hasAdvancedFilters
                  ? `
                    border-[#17171B]
                    bg-[#17171B]
                    text-white
                    shadow-[0_8px_20px_rgba(15,23,42,0.15)]
                  `
                  : `
                    border-slate-200
                    bg-white
                    text-slate-600
                    hover:border-[#D6A632]/30
                    hover:bg-[#D6A632]/[0.035]
                    hover:text-slate-800
                  `
              }
            `}
          >
            <FontAwesomeIcon
              icon={faSliders}
              className={
                isFilterOpen || hasAdvancedFilters
                  ? "text-[#E4B544]"
                  : "text-slate-400"
              }
            />

            <span className="hidden sm:inline">Gelişmiş Filtre</span>

            {/* Aktif filtre göstergesi */}
            {hasAdvancedFilters && (
              <span
                className="
                  absolute
                  -right-1
                  -top-1
                  h-2.5
                  w-2.5
                  rounded-full
                  border-2
                  border-white
                  bg-[#D6A632]
                  shadow-[0_0_8px_rgba(214,166,50,0.45)]
                "
              />
            )}
          </button>

          {/* Advanced Filter Dropdown */}
          {isFilterOpen && (
            <div
              className="
                absolute
                right-0
                top-full
                z-[60]
                mt-2
                w-[calc(100vw-2rem)]
                sm:w-80
                md:w-96
              "
            >
              <AdvancedFilters
                filters={filters}
                lookups={lookups}
                onFilterChange={(e) =>
                  setFilters({
                    ...filters,
                    [e.target.name]: e.target.value,
                  })
                }
                onApply={() => {
                  setActiveFilters({
                    ...filters,
                  });

                  setIsFilterOpen(false);
                }}
                onClear={() => {
                  const clearedFilters = {
                    ...initialFilters,
                  };

                  setFilters(clearedFilters);

                  setActiveFilters({
                    ...clearedFilters,
                  });
                }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
