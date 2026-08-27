import React, { useMemo } from "react";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export default function DataTablePagination({
  table,
  pageSizeOptions = [10, 20, 50],
}) {
  const pageIndex = table.getState().pagination.pageIndex;

  const pageCount = table.getPageCount();

  const toplamKayit = table.getFilteredRowModel().rows.length;

  const sayfalar = useMemo(() => {
    if (pageCount <= 1) {
      return [];
    }

    const maxGorunen = 5;

    let baslangic = Math.max(0, pageIndex - Math.floor(maxGorunen / 2));

    let bitis = Math.min(pageCount, baslangic + maxGorunen);

    if (bitis - baslangic < maxGorunen) {
      baslangic = Math.max(0, bitis - maxGorunen);
    }

    return Array.from(
      {
        length: bitis - baslangic,
      },
      (_, index) => baslangic + index,
    );
  }, [pageCount, pageIndex]);

  return (
    <div
      className="
        flex
        flex-col
        gap-4
        border-t
        border-gray-200
        bg-gray-50/50
        px-4
        py-3
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      {/* SOL */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">
          Toplam{" "}
          <strong className="font-bold text-gray-700">{toplamKayit}</strong>{" "}
          kayıt
        </span>

        <select
          value={table.getState().pagination.pageSize}
          onChange={(event) => table.setPageSize(Number(event.target.value))}
          className="
            h-8
            rounded-md
            border
            border-gray-200
            bg-white
            px-2
            text-xs
            text-gray-600
            outline-none
          "
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} / sayfa
            </option>
          ))}
        </select>
      </div>

      {/* SAYFALAR */}
      <div className="flex flex-wrap items-center gap-1">
        <PaginationButton
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.setPageIndex(0)}
          title="İlk Sayfa"
        >
          <ChevronsLeft className="h-4 w-4" />
        </PaginationButton>

        <PaginationButton
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          <ChevronLeft className="h-4 w-4" />

          <span className="hidden sm:inline">Önceki</span>
        </PaginationButton>

        {sayfalar.map((sayfa) => (
          <button
            type="button"
            key={sayfa}
            onClick={() => table.setPageIndex(sayfa)}
            className={`
                flex
                h-9
                min-w-9
                items-center
                justify-center
                rounded-md
                border
                px-2
                text-xs
                font-bold
                transition
                ${
                  pageIndex === sayfa
                    ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }
              `}
          >
            {sayfa + 1}
          </button>
        ))}

        <PaginationButton
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          <span className="hidden sm:inline">Sonraki</span>

          <ChevronRight className="h-4 w-4" />
        </PaginationButton>

        <PaginationButton
          disabled={!table.getCanNextPage()}
          onClick={() => {
            if (pageCount > 0) {
              table.setPageIndex(pageCount - 1);
            }
          }}
          title="Son Sayfa"
        >
          <ChevronsRight className="h-4 w-4" />
        </PaginationButton>
      </div>
    </div>
  );
}

function PaginationButton({ children, disabled, onClick, title }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="
        inline-flex
        h-9
        items-center
        justify-center
        gap-1
        rounded-md
        border
        border-gray-200
        bg-white
        px-2.5
        text-xs
        font-medium
        text-gray-600
        transition
        hover:bg-gray-100
        hover:text-gray-900
        disabled:pointer-events-none
        disabled:opacity-40
      "
    >
      {children}
    </button>
  );
}
