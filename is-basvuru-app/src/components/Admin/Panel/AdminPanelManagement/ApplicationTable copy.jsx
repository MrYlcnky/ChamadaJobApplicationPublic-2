import React, { useRef, useState } from "react";
import { flexRender } from "@tanstack/react-table";
import { createPortal } from "react-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faSort,
  faSortUp,
  faSortDown,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

// ========================================================
// PORTAL TOOLTIP
// ========================================================

const PortalTooltip = ({ children, coords, visible }) => {
  if (!visible) return null;

  return createPortal(
    <div
      className="
        fixed
        z-[9999]
        min-w-[200px]
        max-w-[300px]
        rounded-xl
        border
        border-slate-200/80
        bg-white
        p-3
        shadow-[0_18px_55px_rgba(15,23,42,0.16)]
        animate-in
        fade-in
        zoom-in-95
        duration-150
      "
      style={{
        top: coords.top + 10,
        left: coords.left - 10,
      }}
    >
      {/* Tooltip oku */}
      <div
        className="
          absolute
          -top-1.5
          left-4
          h-3
          w-3
          rotate-45
          border-l
          border-t
          border-slate-200/80
          bg-white
        "
      />

      {children}
    </div>,
    document.body,
  );
};

// ========================================================
// TRUNCATED LIST
// Şubeler, Alanlar, Departmanlar vb.
// ========================================================

export const TruncatedList = ({ items, colorClass, maxVisible = 1 }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
  });

  const badgeRef = useRef(null);

  if (!items || items.length === 0) {
    return <span className="text-[10px] text-slate-300">-</span>;
  }

  const handleMouseEnter = () => {
    if (!badgeRef.current) return;

    const rect = badgeRef.current.getBoundingClientRect();

    setCoords({
      top: rect.bottom,
      left: rect.left,
    });

    setShowTooltip(true);
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      {items.slice(0, maxVisible).map((item, idx) => (
        <span
          key={idx}
          className={`
              whitespace-nowrap
              rounded-md
              border
              px-1.5
              py-0.5
              text-[9px]
              font-bold
              uppercase
              ${colorClass}
            `}
        >
          {item}
        </span>
      ))}

      {items.length > maxVisible && (
        <>
          <span
            ref={badgeRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setShowTooltip(false)}
            className="
              cursor-help
              rounded-md
              border
              border-slate-200
              bg-slate-50
              px-1.5
              py-0.5
              text-[9px]
              font-black
              text-slate-500
              transition-all
              hover:border-[#D6A632]/25
              hover:bg-[#D6A632]/5
              hover:text-[#A87913]
            "
          >
            +{items.length - maxVisible}
          </span>

          <PortalTooltip coords={coords} visible={showTooltip}>
            <div
              className="
                mb-2
                border-b
                border-slate-100
                pb-2
                text-[9px]
                font-black
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              Tüm Liste ({items.length})
            </div>

            <div className="flex flex-wrap gap-1.5">
              {items.map((item, idx) => (
                <span
                  key={idx}
                  className={`
                    rounded-md
                    border
                    px-2
                    py-0.5
                    text-[10px]
                    font-bold
                    uppercase
                    ${colorClass}
                  `}
                >
                  {item}
                </span>
              ))}
            </div>
          </PortalTooltip>
        </>
      )}
    </div>
  );
};

// ========================================================
// STATUS BADGE
// ========================================================

export function StatusBadge({ status, statusId }) {
  const map = {
    // Yeni Başvuru
    1: `
      border-blue-200/80
      bg-blue-50
      text-blue-700
    `,

    // Devam Ediyor
    2: `
      border-amber-200/80
      bg-amber-50
      text-amber-700
    `,

    // Onaylandı
    3: `
      border-emerald-200/80
      bg-emerald-50
      text-emerald-700
    `,

    // Reddedildi
    4: `
      border-rose-200/80
      bg-rose-50
      text-rose-700
    `,

    // Revize Talebi
    5: `
      border-purple-200/80
      bg-purple-50
      text-purple-700
    `,
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        whitespace-nowrap
        rounded-full
        border
        px-2
        py-1
        text-[9px]
        font-bold
        uppercase
        tracking-[0.04em]
        ${map[statusId] || "border-slate-200 bg-slate-50 text-slate-600"}
      `}
    >
      {status}
    </span>
  );
}

// ========================================================
// ANA TABLO
// ========================================================

export default function ApplicationTable({
  table,
  pageInput,
  setPageInput,
  handleGoToPage,
}) {
  const rows = table.getRowModel().rows;

  return (
    /*
      DİKKAT:
      Burada artık border / rounded / shadow YOK.

      Bunları AdminPanel.jsx içindeki parent
      <section> yönetiyor.
    */
    <div className="flex w-full flex-col bg-white">
      {/* =================================================
          TABLE
      ================================================= */}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          {/* HEADER */}
          <thead
            className="
              border-b
              border-slate-200/70
              bg-[#F8F9FB]
            "
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const centered = [
                    "profile",
                    "status",
                    "stage",
                    "actions",
                  ].includes(header.id);

                  const isSorted = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`
                            group
                            whitespace-nowrap
                            px-4
                            py-3.5
                            text-[9px]
                            font-black
                            uppercase
                            tracking-[0.12em]
                            text-slate-500
                            transition-colors
                            ${
                              header.column.getCanSort()
                                ? "cursor-pointer hover:bg-slate-100/70"
                                : ""
                            }
                            ${centered ? "text-center" : "text-left"}
                          `}
                    >
                      <div
                        className={`
                              flex
                              items-center
                              gap-1.5
                              ${centered ? "justify-center" : ""}
                            `}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}

                        {header.column.getCanSort() && (
                          <span
                            className={`
                                  flex
                                  h-4
                                  w-4
                                  items-center
                                  justify-center
                                  transition-colors
                                  ${
                                    isSorted
                                      ? "text-[#B98618]"
                                      : "text-slate-300 group-hover:text-slate-400"
                                  }
                                `}
                          >
                            {isSorted === "asc" ? (
                              <FontAwesomeIcon
                                icon={faSortUp}
                                className="text-[9px]"
                              />
                            ) : isSorted === "desc" ? (
                              <FontAwesomeIcon
                                icon={faSortDown}
                                className="text-[9px]"
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon={faSort}
                                className="text-[8px]"
                              />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-slate-100/90">
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="
                    group
                    bg-white
                    transition-colors
                    duration-150
                    hover:bg-[#D6A632]/[0.035]
                  "
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="
                          px-4
                          py-3
                          align-middle
                          text-[11px]
                          text-slate-600
                        "
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={table.getVisibleLeafColumns().length}
                  className="
                    px-6
                    py-16
                    text-center
                  "
                >
                  <div className="flex flex-col items-center">
                    <div
                      className="
                        mb-3
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        text-slate-300
                      "
                    >
                      —
                    </div>

                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                      Kayıt bulunamadı
                    </p>

                    <p className="mt-1 text-[9px] text-slate-300">
                      Seçtiğiniz filtrelere uygun kayıt bulunamadı.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =================================================
          PAGINATION
      ================================================= */}

      {rows.length > 0 && (
        <div
          className="
            flex
            flex-col
            items-center
            justify-between
            gap-3
            border-t
            border-slate-100
            bg-[#FAFBFC]
            px-4
            py-3
            select-none
            sm:flex-row
          "
        >
          {/* SATIR SAYISI */}
          <div className="flex items-center gap-2">
            <span
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.08em]
                text-slate-400
              "
            >
              Satır Sayısı
            </span>

            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="
                cursor-pointer
                rounded-lg
                border
                border-slate-200
                bg-white
                px-2.5
                py-1.5
                text-[10px]
                font-bold
                text-slate-600
                shadow-sm
                outline-none
                transition-all
                hover:border-slate-300
                focus:border-[#D6A632]/60
                focus:ring-2
                focus:ring-[#D6A632]/10
              "
            >
              {[5, 10, 20, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

          {/* SAYFA NAVİGASYONU */}
          <div
            className="
              flex
              items-center
              gap-1
              rounded-xl
              border
              border-slate-200/80
              bg-white
              p-1
              shadow-sm
            "
          >
            {/* Önceki */}
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Önceki sayfa"
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                text-slate-400
                transition-all
                hover:bg-[#D6A632]/10
                hover:text-[#A87913]
                disabled:cursor-not-allowed
                disabled:opacity-25
                disabled:hover:bg-transparent
                disabled:hover:text-slate-400
              "
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-[9px]" />
            </button>

            {/* Sayfa */}
            <div
              className="
                flex
                items-center
                gap-1.5
                border-x
                border-slate-100
                px-3
              "
            >
              <span className="text-[9px] font-semibold text-slate-400">
                Sayfa
              </span>

              <input
                type="number"
                min="1"
                max={table.getPageCount()}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onKeyDown={handleGoToPage}
                className="
                  h-6
                  w-9
                  rounded-md
                  border
                  border-slate-200
                  bg-slate-50
                  text-center
                  text-[10px]
                  font-bold
                  text-slate-700
                  outline-none
                  transition-all
                  focus:border-[#D6A632]/60
                  focus:bg-white
                  focus:ring-2
                  focus:ring-[#D6A632]/10
                "
              />

              <span className="text-[9px] font-semibold text-slate-400">
                / {table.getPageCount()}
              </span>
            </div>

            {/* Sonraki */}
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Sonraki sayfa"
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                text-slate-400
                transition-all
                hover:bg-[#D6A632]/10
                hover:text-[#A87913]
                disabled:cursor-not-allowed
                disabled:opacity-25
                disabled:hover:bg-transparent
                disabled:hover:text-slate-400
              "
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
            </button>
          </div>

          {/* TOPLAM */}
          <div
            className="
              flex
              items-center
              gap-1.5
              text-[9px]
              font-bold
              uppercase
              tracking-[0.06em]
              text-slate-400
            "
          >
            <span>Toplam</span>

            <span
              className="
                rounded-md
                bg-slate-100
                px-2
                py-1
                text-[9px]
                font-black
                text-slate-700
              "
            >
              {table.getFilteredRowModel().rows.length}
            </span>

            <span>Kayıt</span>
          </div>
        </div>
      )}
    </div>
  );
}
