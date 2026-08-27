import React, { useState, useEffect, useCallback, useRef } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

// --- CUSTOM HOOKS ---
import useAdminPanelLogic from "./AdminPanelManagement/useAdminPanelLogic";
import useAdminPanelColumns from "./AdminPanelManagement/useAdminPanelColumns";

// --- COMPONENTS ---
import AdminPanelHeader from "./AdminPanelManagement/AdminPanelHeader";
import ApplicationTable from "./AdminPanelManagement/ApplicationTable";
import ApplicationModal from "./ApplicationModal";
import CVViewModal from "./AdminPanelManagement/CVPdfSablon/CVViewModal";
import SevkPopupModal from "./AdminPanelManagement/SevkPopupModal";

// --- UTILS & SERVICES ---
import { tanimlamalarService } from "../../../services/tanimlamalarService";
import { mapDtoToCvFormat } from "./AdminPanelManagement/TableUtils";

export default function AdminPanel() {
  // =====================================================
  // 1. İŞ MANTIĞI
  // =====================================================

  const {
    applicationData,
    filteredData,
    loading,

    tab,
    setTab,

    branchFilter,
    setBranchFilter,

    stageFilter,
    setStageFilter,

    filters,
    setFilters,

    activeFilters,
    setActiveFilters,

    lookups,
    auth,
    isIKGroup,

    fetchData,
    initialFilters,
  } = useAdminPanelLogic();

  // =====================================================
  // 2. UI STATE
  // =====================================================

  const [globalFilter, setGlobalFilter] = useState("");

  const [sorting, setSorting] = useState([
    {
      id: "date",
      desc: true,
    },
  ]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [pageInput, setPageInput] = useState(1);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterPanelRef = useRef(null);

  const [openModal, setOpenModal] = useState(false);

  const [activeRow, setActiveRow] = useState(null);

  const [lightboxImage, setLightboxImage] = useState(null);

  const [showCvModal, setShowCvModal] = useState(false);

  const [selectedCvData, setSelectedCvData] = useState(null);

  // =====================================================
  // Filtre Paneli Dışına Tıklama
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(e.target)
      ) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =====================================================
  // SEVK POPUP
  // =====================================================

  const [sevkPopupState, setSevkPopupState] = useState({
    isOpen: false,
    row: null,
    selectedIds: [],
    departmanlar: [],
    subeAlanlari: [],
    isProcessing: false,
  });

  const handleSendToDepartment = useCallback(
    async (id) => {
      const row = applicationData.find((item) => item.id === id);

      if (!row) return;

      let depts = sevkPopupState.departmanlar;
      let areas = sevkPopupState.subeAlanlari;

      if (depts.length === 0 || !areas || areas.length === 0) {
        try {
          const [depRes, areaRes] = await Promise.all([
            tanimlamalarService.getDepartmanlar(),
            tanimlamalarService.getSubeAlanlar(),
          ]);

          depts = depRes.data || [];
          areas = areaRes.data || [];
        } catch (error) {
          console.error("Veriler çekilemedi", error);
        }
      }

      const isBasvuruDetay =
        row.originalData?.personel?.isBasvuruDetay ||
        row.originalData?.Personel?.IsBasvuruDetay ||
        {};

      const defaultIds = (
        isBasvuruDetay.basvuruDepartmanlar ||
        isBasvuruDetay.BasvuruDepartmanlar ||
        []
      ).map((d) => Number(d.departmanId || d.DepartmanId || d.id || d.Id));

      setSevkPopupState({
        isOpen: true,
        row,
        selectedIds: defaultIds,
        departmanlar: depts,
        subeAlanlari: areas || [],
        isProcessing: false,
      });
    },
    [applicationData, sevkPopupState.departmanlar, sevkPopupState.subeAlanlari],
  );

  // =====================================================
  // 3. COLUMNS
  // =====================================================

  const columns = useAdminPanelColumns({
    auth,
    isIKGroup,
    handleSendToDepartment,
    setLightboxImage,
    setSelectedCvData,
    setShowCvModal,
    setActiveRow,
    setOpenModal,
    mapDtoToCvFormat,
  });

  // =====================================================
  // 4. TABLE
  // =====================================================

  const table = useReactTable({
    data: filteredData,
    columns,

    state: {
      globalFilter,
      sorting,
      pagination,
    },

    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,

    getCoreRowModel: getCoreRowModel(),

    getFilteredRowModel: getFilteredRowModel(),

    getSortedRowModel: getSortedRowModel(),

    getPaginationRowModel: getPaginationRowModel(),
  });

  const { pageIndex } = table.getState().pagination;

  useEffect(() => {
    setPageInput(pageIndex + 1);
  }, [pageIndex]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[60vh]
          items-center
          justify-center
        "
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              border-[#D6A632]/20
              bg-white
              shadow-sm
            "
          >
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="text-xl text-[#B98618]"
            />
          </div>

          <div className="text-center">
            <p className="text-xs font-semibold text-gray-700">
              Başvurular yükleniyor
            </p>

            <p className="mt-1 text-[10px] text-gray-400">
              Lütfen kısa bir süre bekleyiniz.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // VIEW
  // =====================================================

  return (
    <div
      className="
        w-full
        space-y-4
        font-sans
        sm:space-y-5
      "
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <AdminPanelHeader
        filteredDataLength={filteredData.length}
        tab={tab}
        setTab={setTab}
        branchFilter={branchFilter}
        setBranchFilter={setBranchFilter}
        stageFilter={stageFilter}
        setStageFilter={setStageFilter}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        filterPanelRef={filterPanelRef}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        filters={filters}
        setFilters={setFilters}
        lookups={lookups}
        initialFilters={initialFilters}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
      />

      {/* =================================================
          TABLE
      ================================================= */}

      <section
        className="
    relative
    overflow-hidden
    rounded-[18px]
    bg-white
    shadow-[0_8px_30px_rgba(15,23,42,0.06)]
  "
      >
        {/* Chamada ince üst vurgu */}
        <div
          className="
      pointer-events-none
      absolute
      left-10
      right-10
      top-0
      z-10
      h-px
      bg-gradient-to-r
      from-transparent
      via-[#D6A632]/30
      to-transparent
    "
        />

        <ApplicationTable
          table={table}
          pageInput={pageInput}
          setPageInput={setPageInput}
          handleGoToPage={(e) => {
            if (e.key !== "Enter") return;

            const p = pageInput ? Number(pageInput) - 1 : 0;

            if (p >= 0 && p < table.getPageCount()) {
              table.setPageIndex(p);
            } else {
              setPageInput(table.getState().pagination.pageIndex + 1);
            }
          }}
        />
      </section>
      {/* =================================================
          APPLICATION MODAL
      ================================================= */}

      {openModal && activeRow && (
        <ApplicationModal
          data={{
            ...mapDtoToCvFormat(activeRow.originalData),

            id: activeRow.id,

            date: activeRow.date,

            status: activeRow.status,

            originalData: activeRow.originalData,

            approvalStage: activeRow.approvalStage,

            statusId: activeRow.statusId,
          }}
          auth={auth}
          onClose={() => {
            setOpenModal(false);
            setActiveRow(null);
          }}
          onAction={fetchData}
        />
      )}

      {/* =================================================
          CV MODAL
      ================================================= */}

      {showCvModal && selectedCvData && (
        <CVViewModal
          applicationData={selectedCvData}
          onClose={() => {
            setShowCvModal(false);

            setSelectedCvData(null);
          }}
        />
      )}

      {/* =================================================
          SEVK MODAL
      ================================================= */}

      <SevkPopupModal
        state={sevkPopupState}
        setState={setSevkPopupState}
        onSuccess={fetchData}
        auth={auth}
      />

      {/* =================================================
          LIGHTBOX
      ================================================= */}

      {lightboxImage && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/90
            p-4
            backdrop-blur-sm
          "
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt="Başvuru görseli"
            onClick={(e) => e.stopPropagation()}
            className="
              max-h-[90vh]
              max-w-full
              rounded-xl
              border
              border-white/10
              object-contain
              shadow-2xl
            "
          />

          <button
            type="button"
            aria-label="Görseli kapat"
            onClick={() => setLightboxImage(null)}
            className="
              absolute
              right-5
              top-5
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-black/40
              text-lg
              text-white/60
              backdrop-blur-md
              transition-all
              hover:bg-white/10
              hover:text-white
            "
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}
    </div>
  );
}
