import React from "react";

import {
  DatabaseBackup,
  CloudUpload,
  MailCheck,
  RotateCw,
  ShieldCheck,
} from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { yedeklemeService } from "../../../../services/yedeklemeService";

export default function YedeklemeHeader({
  yedekAliniyor,
  setYedekAliniyor,
  onRefresh,
}) {
  const yedekAl = async () => {
    const result = await Swal.fire({
      icon: "question",
      title: "Yeni yedek oluşturulsun mu?",
      html: `
        <div style="
          font-size:14px;
          line-height:1.7;
          color:#64748b;
          text-align:left;
        ">
          Veritabanı ve <strong>wwwroot</strong> dosyaları yedeklenecek,
          Google Drive'a yüklenecek ve aktif alıcılara bilgilendirme
          maili gönderilecektir.
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Yedeklemeyi Başlat",
      cancelButtonText: "Vazgeç",
      confirmButtonColor: "#111827",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setYedekAliniyor(true);

      const response = await yedeklemeService.olustur();

      if (!response?.success) {
        throw new Error(response?.message || "Yedekleme işlemi başarısız.");
      }

      toast.success(response.message || "Yedekleme başarıyla tamamlandı.");

      await onRefresh();
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Yedekleme sırasında hata oluştu.",
      );
    } finally {
      setYedekAliniyor(false);
    }
  };

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-sm
      "
    >
      {/* Hafif arka plan efekti */}
      <div
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-56
          w-56
          rounded-full
          bg-blue-50
          blur-3xl
        "
      />

      <div
        className="
          relative
          flex
          flex-col
          gap-6
          p-5
          sm:p-6
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        {/* SOL */}
        <div className="flex items-start gap-4">
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-blue-100
              bg-blue-50
              text-blue-600
            "
          >
            <DatabaseBackup className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1
                className="
                  text-xl
                  font-bold
                  tracking-tight
                  text-gray-950
                  sm:text-2xl
                "
              >
                Yedekleme Yönetimi
              </h1>

              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-emerald-200
                  bg-emerald-50
                  px-2.5
                  py-1
                  text-[11px]
                  font-semibold
                  text-emerald-700
                "
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Aktif
              </span>
            </div>

            <p
              className="
                mt-1.5
                max-w-2xl
                text-sm
                leading-6
                text-gray-500
              "
            >
              Veritabanı ve uygulama dosyalarını güvenli şekilde yedekleyin,
              Google Drive kayıtlarını ve mail bildirimlerini tek ekrandan
              yönetin.
            </p>

            {/* Alt özellikler */}
            <div
              className="
                mt-4
                flex
                flex-wrap
                items-center
                gap-x-5
                gap-y-2
                text-xs
                font-medium
                text-gray-500
              "
            >
              <div className="flex items-center gap-1.5">
                <DatabaseBackup className="h-3.5 w-3.5 text-gray-400" />
                SQL + wwwroot
              </div>

              <div className="flex items-center gap-1.5">
                <CloudUpload className="h-3.5 w-3.5 text-gray-400" />
                Google Drive
              </div>

              <div className="flex items-center gap-1.5">
                <MailCheck className="h-3.5 w-3.5 text-gray-400" />
                Mail bildirimi
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ */}
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            disabled={yedekAliniyor}
            onClick={yedekAl}
            className="
              inline-flex
              h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-gray-950
              px-5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              hover:bg-gray-800
              hover:shadow-md
              active:scale-[0.98]
              disabled:pointer-events-none
              disabled:opacity-60
              sm:w-auto
            "
          >
            <RotateCw
              className={`h-4 w-4 ${yedekAliniyor ? "animate-spin" : ""}`}
            />

            {yedekAliniyor ? "Yedekleme Yapılıyor..." : "Şimdi Yedek Al"}
          </button>
        </div>
      </div>
    </section>
  );
}
