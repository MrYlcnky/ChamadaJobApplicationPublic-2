import React, { useMemo } from "react";

import { Archive } from "lucide-react";

import DataTable from "../DataTable/DataTable";

import { yedeklemeColumns } from "../columns/yedeklemeColumns";

export default function YedeklemeTablosu({ yedekler, loading, onDetayAc }) {
  const columns = useMemo(
    () =>
      yedeklemeColumns({
        onDetayAc,
      }),
    [onDetayAc],
  );

  return (
    <section
      className="
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-5
        shadow-sm
        sm:p-6
      "
    >
      {/* HEADER */}
      <div
        className="
          mb-5
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="flex items-start gap-3">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-gray-100
              text-gray-600
            "
          >
            <Archive className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-bold text-gray-900">
              Yedekleme Geçmişi
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Manuel ve otomatik oluşturulan sistem yedekleri.
            </p>
          </div>
        </div>

        <div
          className="
            rounded-full
            bg-gray-100
            px-3
            py-1
            text-xs
            font-semibold
            text-gray-600
          "
        >
          {yedekler?.length || 0} kayıt
        </div>
      </div>

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={yedekler || []}
        loading={loading}
        searchPlaceholder="Dosya adı, kullanıcı veya yedek bilgilerinde ara..."
        initialPageSize={10}
        pageSizeOptions={[10, 20, 50]}
        filters={[
          {
            columnId: "durum",

            label: "Tüm Durumlar",

            options: [
              {
                label: "Devam Ediyor",
                value: "1",
              },
              {
                label: "Başarılı",
                value: "2",
              },
              {
                label: "Başarısız",
                value: "3",
              },
            ],
          },

          {
            columnId: "tetiklemeTipi",

            label: "Tüm Türler",

            options: [
              {
                label: "Manuel",
                value: "1",
              },
              {
                label: "Otomatik",
                value: "2",
              },
            ],
          },
        ]}
        emptyTitle="Yedekleme kaydı bulunamadı."
        emptyDescription="Henüz sistem yedeği oluşturulmamış veya seçtiğiniz filtrelere uygun kayıt bulunmuyor."
      />
    </section>
  );
}
