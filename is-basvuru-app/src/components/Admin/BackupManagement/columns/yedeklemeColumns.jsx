import React from "react";

import {
  CheckCircle2,
  XCircle,
  LoaderCircle,
  HardDrive,
  Mail,
  MailX,
  Eye,
  ExternalLink,
  UserRound,
} from "lucide-react";
import DurumBadge from "../components/DurumBadge";
import DataTableSortHeader from "../DataTable/DataTableSortHeader";

import {
  tarihFormatla,
  boyutFormatla,
  tetiklemeTipiMetni,
} from "../helpers/yedeklemeFormatters";

export const yedeklemeColumns = ({ onDetayAc }) => [
  {
    accessorKey: "baslamaTarihi",

    header: ({ column }) => (
      <DataTableSortHeader column={column} title="Tarih" />
    ),

    cell: ({ row }) => {
      const yedek = row.original;

      return (
        <div className="min-w-[150px]">
          <p className="font-semibold text-gray-800">
            {tarihFormatla(yedek.tamamlanmaTarihi || yedek.baslamaTarihi)}
          </p>

          {yedek.tamamlanmaTarihi && yedek.baslamaTarihi && (
            <p className="mt-1 text-[11px] text-gray-400">
              Başlangıç: {tarihFormatla(yedek.baslamaTarihi)}
            </p>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "zipDosyaAdi",

    header: ({ column }) => (
      <DataTableSortHeader column={column} title="Yedek Dosyası" />
    ),

    cell: ({ row }) => {
      const yedek = row.original;

      return (
        <div className="min-w-[190px]">
          <div className="flex items-center gap-2">
            <div
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-gray-100
              "
            >
              <HardDrive className="h-4 w-4 text-gray-500" />
            </div>

            <div className="min-w-0">
              <p
                className="
                  max-w-[220px]
                  truncate
                  font-semibold
                  text-gray-800
                "
                title={yedek.zipDosyaAdi}
              >
                {yedek.zipDosyaAdi || "-"}
              </p>

              <p className="mt-0.5 text-[11px] text-gray-400">
                {boyutFormatla(yedek.zipBoyutuByte)}
              </p>
            </div>
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "tetiklemeTipi",

    header: ({ column }) => <DataTableSortHeader column={column} title="Tür" />,

    filterFn: (row, columnId, filterValue) =>
      String(row.getValue(columnId)) === String(filterValue),

    cell: ({ row }) => {
      const tip = Number(row.getValue("tetiklemeTipi"));

      return (
        <span
          className={`
            inline-flex
            items-center
            rounded-full
            border
            px-2.5
            py-1
            text-xs
            font-semibold
            ${
              tip === 1
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-violet-200 bg-violet-50 text-violet-700"
            }
          `}
        >
          {tetiklemeTipiMetni(tip)}
        </span>
      );
    },
  },

  {
    accessorKey: "durum",

    header: ({ column }) => (
      <DataTableSortHeader column={column} title="Durum" />
    ),

    filterFn: (row, columnId, filterValue) =>
      String(row.getValue(columnId)) === String(filterValue),

    cell: ({ row }) => {
      const durum = Number(row.getValue("durum"));

      if (durum === 2) {
        return (
          <DurumBadge
            icon={CheckCircle2}
            text="Başarılı"
            className="border-emerald-200 bg-emerald-50 text-emerald-700"
          />
        );
      }

      if (durum === 3) {
        return (
          <DurumBadge
            icon={XCircle}
            text="Başarısız"
            className="border-red-200 bg-red-50 text-red-700"
          />
        );
      }

      return (
        <DurumBadge
          icon={LoaderCircle}
          text="Devam Ediyor"
          iconClassName="animate-spin"
          className="border-amber-200 bg-amber-50 text-amber-700"
        />
      );
    },
  },

  {
    accessorKey: "driveYuklendiMi",

    header: ({ column }) => (
      <DataTableSortHeader column={column} title="Drive" />
    ),

    cell: ({ row }) => {
      const yedek = row.original;

      if (!yedek.driveYuklendiMi || !yedek.driveLink) {
        return (
          <span className="text-xs font-medium text-gray-400">Yüklenmedi</span>
        );
      }

      return (
        <a
          href={yedek.driveLink}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-lg
            px-2.5
            py-1.5
            text-xs
            font-semibold
            text-blue-600
            transition
            hover:bg-blue-50
            hover:text-blue-700
          "
        >
          Drive
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      );
    },
  },

  {
    accessorKey: "mailGonderildiMi",

    header: ({ column }) => (
      <DataTableSortHeader column={column} title="Mail" />
    ),

    cell: ({ row }) => {
      const yedek = row.original;

      return yedek.mailGonderildiMi ? (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-emerald-500" />

          <div>
            <p className="text-xs font-semibold text-emerald-700">Gönderildi</p>

            <p className="text-[10px] text-gray-400">
              {yedek.sqlMailEkiGonderildiMi ? "SQL eki dahil" : "SQL eki yok"}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <MailX className="h-4 w-4 text-gray-400" />

          <span className="text-xs font-medium text-gray-400">
            Gönderilmedi
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "baslatanKullaniciAdi",

    header: ({ column }) => (
      <DataTableSortHeader column={column} title="Başlatan" />
    ),

    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <UserRound className="h-4 w-4 text-gray-400" />

        <span className="text-sm font-medium text-gray-600">
          {row.getValue("baslatanKullaniciAdi") || "-"}
        </span>
      </div>
    ),
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

    cell: ({ row }) => (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onDetayAc(row.original.id)}
          className="
            inline-flex
            h-9
            items-center
            gap-2
            rounded-lg
            border
            border-gray-200
            bg-white
            px-3
            text-xs
            font-semibold
            text-gray-600
            transition
            hover:border-gray-300
            hover:bg-gray-50
            hover:text-gray-900
          "
        >
          <Eye className="h-4 w-4" />
          Detay
        </button>
      </div>
    ),
  },
];
