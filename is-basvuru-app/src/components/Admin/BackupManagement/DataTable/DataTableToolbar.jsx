import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function DataTableToolbar({
  table,
  globalFilter,
  setGlobalFilter,
  searchPlaceholder = "Ara...",
  filters = [],
  actions = null,
}) {
  const aktifFiltreVarMi =
    Boolean(globalFilter) || table.getState().columnFilters.length > 0;

  const aramaDegistir = (event) => {
    setGlobalFilter(event.target.value);
    table.setPageIndex(0);
  };

  const filtreDegistir = (columnId, value) => {
    const column = table.getColumn(columnId);

    if (!column) return;

    column.setFilterValue(value === "all" ? undefined : value);

    table.setPageIndex(0);
  };

  const filtreleriTemizle = () => {
    setGlobalFilter("");
    table.resetColumnFilters();
    table.setPageIndex(0);
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      {/* ARAMA */}
      <div className="relative w-full lg:max-w-md">
        <Search
          className="
            absolute
            left-3
            top-1/2
            h-4
            w-4
            -translate-y-1/2
            text-gray-400
          "
        />

        <input
          type="text"
          value={globalFilter ?? ""}
          onChange={aramaDegistir}
          placeholder={searchPlaceholder}
          className="
            h-10
            w-full
            rounded-lg
            border
            border-gray-200
            bg-white
            pl-10
            pr-10
            text-sm
            text-gray-800
            outline-none
            transition
            placeholder:text-gray-400
            focus:border-gray-400
            focus:ring-2
            focus:ring-gray-100
          "
        />

        {globalFilter && (
          <button
            type="button"
            onClick={() => {
              setGlobalFilter("");
              table.setPageIndex(0);
            }}
            className="
              absolute
              right-2
              top-1/2
              flex
              h-7
              w-7
              -translate-y-1/2
              items-center
              justify-center
              rounded-md
              text-gray-400
              transition
              hover:bg-gray-100
              hover:text-gray-700
            "
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* SAĞ TARAF */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.length > 0 && (
          <div className="hidden items-center gap-1.5 text-xs font-semibold text-gray-400 sm:flex">
            <SlidersHorizontal className="h-4 w-4" />
            Filtre
          </div>
        )}

        {filters.map((filter) => {
          const column = table.getColumn(filter.columnId);

          if (!column) {
            return null;
          }

          return (
            <select
              key={filter.columnId}
              value={column.getFilterValue() ?? "all"}
              onChange={(event) =>
                filtreDegistir(filter.columnId, event.target.value)
              }
              className="
                h-10
                min-w-36
                rounded-lg
                border
                border-gray-200
                bg-white
                px-3
                text-sm
                font-medium
                text-gray-700
                outline-none
                transition
                hover:bg-gray-50
                focus:border-gray-400
                focus:ring-2
                focus:ring-gray-100
              "
            >
              <option value="all">{filter.label}</option>

              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        })}

        {aktifFiltreVarMi && (
          <button
            type="button"
            onClick={filtreleriTemizle}
            className="
              inline-flex
              h-10
              items-center
              gap-1.5
              rounded-lg
              px-3
              text-sm
              font-medium
              text-gray-500
              transition
              hover:bg-gray-100
              hover:text-gray-900
            "
          >
            <X className="h-4 w-4" />
            Temizle
          </button>
        )}

        {actions}
      </div>
    </div>
  );
}
