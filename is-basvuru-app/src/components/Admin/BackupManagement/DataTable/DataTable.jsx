import React, { useState } from "react";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Database, Search } from "lucide-react";

import DataTableToolbar from "./DataTableToolbar";
import DataTablePagination from "./DataTablePagination";

export default function DataTable({
  columns,
  data = [],

  searchPlaceholder = "Kayıtlarda ara...",

  filters = [],

  actions = null,

  initialPageSize = 10,

  pageSizeOptions = [10, 20, 50],

  emptyTitle = "Kayıt bulunamadı.",

  emptyDescription = "Arama veya filtre kriterlerini değiştirmeyi deneyin.",

  loading = false,
}) {
  const [sorting, setSorting] = useState([]);

  const [columnFilters, setColumnFilters] = useState([]);

  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,

    state: {
      sorting,
      columnFilters,
      globalFilter,
    },

    onSortingChange: setSorting,

    onColumnFiltersChange: setColumnFilters,

    onGlobalFilterChange: setGlobalFilter,

    getCoreRowModel: getCoreRowModel(),

    getSortedRowModel: getSortedRowModel(),

    getFilteredRowModel: getFilteredRowModel(),

    getPaginationRowModel: getPaginationRowModel(),

    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
    },
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
        actions={actions}
      />

      <div
        className="
          overflow-hidden
          rounded-xl
          border
          border-gray-200
          bg-white
          shadow-sm
        "
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead
              className="
                border-b
                border-gray-200
                bg-gray-50/80
              "
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="
                              h-12
                              whitespace-nowrap
                              px-4
                              align-middle
                            "
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div
                        className="
                          mb-3
                          h-7
                          w-7
                          animate-spin
                          rounded-full
                          border-2
                          border-gray-200
                          border-t-gray-700
                        "
                      />

                      <span className="text-sm font-medium">
                        Kayıtlar yükleniyor...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="
                          transition-colors
                          hover:bg-gray-50/80
                        "
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="
                                  px-4
                                  py-3.5
                                  text-sm
                                  text-gray-700
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
                  <td colSpan={columns.length} className="h-52 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div
                        className="
                          mb-3
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-xl
                          bg-gray-100
                        "
                      >
                        <Database className="h-5 w-5 text-gray-400" />
                      </div>

                      <p className="text-sm font-bold text-gray-700">
                        {emptyTitle}
                      </p>

                      <p className="mt-1 max-w-sm text-xs text-gray-400">
                        {emptyDescription}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && (
          <DataTablePagination
            table={table}
            pageSizeOptions={pageSizeOptions}
          />
        )}
      </div>
    </div>
  );
}
