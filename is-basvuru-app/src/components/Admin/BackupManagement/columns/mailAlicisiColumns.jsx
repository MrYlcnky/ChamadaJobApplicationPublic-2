import React from "react";

import { CheckCircle2, CircleOff, Mail, Pencil, Trash2 } from "lucide-react";

import DataTableSortHeader from "../DataTable/DataTableSortHeader";

export const mailAlicisiColumns = ({
  onDuzenle,
  onSil,
  onAktiflikDegistir,
}) => [
  {
    accessorKey: "siraNo",

    header: ({ column }) => (
      <DataTableSortHeader column={column} title="Sıra" />
    ),

    cell: ({ row }) => (
      <div
        className="
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-lg
          bg-gray-100
          text-xs
          font-bold
          text-gray-600
        "
      >
        {row.getValue("siraNo")}
      </div>
    ),
  },

  {
    accessorKey: "eposta",

    header: ({ column }) => (
      <DataTableSortHeader column={column} title="E-posta" />
    ),

    cell: ({ row }) => (
      <div className="flex min-w-[230px] items-center gap-3">
        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-blue-50
            text-blue-600
          "
        >
          <Mail className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p
            className="
              truncate
              font-semibold
              text-gray-800
            "
            title={row.getValue("eposta")}
          >
            {row.getValue("eposta")}
          </p>

          <p className="mt-0.5 text-[11px] text-gray-400">
            Yedekleme bildirimi alıcısı
          </p>
        </div>
      </div>
    ),
  },

  {
    accessorKey: "aktifMi",

    header: ({ column }) => (
      <DataTableSortHeader column={column} title="Durum" />
    ),

    filterFn: (row, columnId, filterValue) =>
      String(row.getValue(columnId)) === String(filterValue),

    cell: ({ row }) => {
      const kayit = row.original;

      return (
        <button
          type="button"
          onClick={() => onAktiflikDegistir(kayit)}
          className={`
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            px-2.5
            py-1
            text-xs
            font-semibold
            transition
            ${
              kayit.aktifMi
                ? `
                  border-emerald-200
                  bg-emerald-50
                  text-emerald-700
                  hover:bg-emerald-100
                `
                : `
                  border-gray-200
                  bg-gray-50
                  text-gray-500
                  hover:bg-gray-100
                `
            }
          `}
        >
          {kayit.aktifMi ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <CircleOff className="h-3.5 w-3.5" />
          )}

          {kayit.aktifMi ? "Aktif" : "Pasif"}
        </button>
      );
    },
  },

  {
    id: "actions",

    enableSorting: false,
    enableGlobalFilter: false,

    header: () => (
      <div className="text-right text-xs font-bold uppercase tracking-wide text-gray-600">
        İşlem
      </div>
    ),

    cell: ({ row }) => {
      const kayit = row.original;

      return (
        <div className="flex justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onDuzenle(kayit)}
            title="Düzenle"
            className="
              inline-flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              border
              border-gray-200
              bg-white
              text-gray-500
              transition
              hover:border-blue-200
              hover:bg-blue-50
              hover:text-blue-600
            "
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onSil(kayit)}
            title="Sil"
            className="
              inline-flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              border
              border-gray-200
              bg-white
              text-gray-500
              transition
              hover:border-red-200
              hover:bg-red-50
              hover:text-red-600
            "
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      );
    },
  },
];
