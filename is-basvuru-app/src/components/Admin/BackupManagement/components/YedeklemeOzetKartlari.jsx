import React from "react";

import {
  Clock3,
  Database,
  CloudUpload,
  MailCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { tarihFormatla, boyutFormatla } from "../helpers/yedeklemeFormatters";

export default function YedeklemeOzetKartlari({ sonYedek }) {
  const driveBasarili = Boolean(sonYedek?.driveYuklendiMi);

  const mailBasarili = Boolean(sonYedek?.mailGonderildiMi);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <OzetKarti
        icon={Clock3}
        baslik="Son Başarılı Yedek"
        deger={sonYedek ? tarihFormatla(sonYedek.tamamlanmaTarihi) : "-"}
        aciklama={
          sonYedek?.tetiklemeTipi === 1
            ? "Manuel olarak oluşturuldu"
            : sonYedek?.tetiklemeTipi === 2
              ? "Otomatik olarak oluşturuldu"
              : "Henüz başarılı yedek yok"
        }
        iconClassName="bg-violet-50 text-violet-600 border-violet-100"
      />

      <OzetKarti
        icon={Database}
        baslik="Yedek Boyutu"
        deger={boyutFormatla(sonYedek?.zipBoyutuByte)}
        aciklama={`SQL: ${boyutFormatla(sonYedek?.sqlBoyutuByte)}`}
        iconClassName="bg-blue-50 text-blue-600 border-blue-100"
      />

      <OzetKarti
        icon={CloudUpload}
        baslik="Google Drive"
        deger={driveBasarili ? "Yüklendi" : "Yüklenmedi"}
        aciklama={
          driveBasarili
            ? "Bulut yedeği güvenli şekilde mevcut"
            : "Drive üzerinde yedek bulunamadı"
        }
        iconClassName={
          driveBasarili
            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
            : "bg-red-50 text-red-500 border-red-100"
        }
        durum={driveBasarili ? "success" : "error"}
      />

      <OzetKarti
        icon={MailCheck}
        baslik="Bilgilendirme Maili"
        deger={mailBasarili ? "Gönderildi" : "Gönderilmedi"}
        aciklama={
          mailBasarili
            ? sonYedek?.sqlMailEkiGonderildiMi
              ? "SQL dosyası mail ekine dahil edildi"
              : "Mail gönderildi, SQL eki eklenmedi"
            : "Bilgilendirme maili gönderilmedi"
        }
        iconClassName={
          mailBasarili
            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
            : "bg-amber-50 text-amber-600 border-amber-100"
        }
        durum={mailBasarili ? "success" : "warning"}
      />
    </div>
  );
}

function OzetKarti({
  icon: IconComponent,
  baslik,
  deger,
  aciklama,
  iconClassName,
  durum,
}) {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-5
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-gray-300
        hover:shadow-md
      "
    >
      {/* Hafif arka plan efekti */}
      <div
        className="
          pointer-events-none
          absolute
          -right-8
          -top-8
          h-24
          w-24
          rounded-full
          bg-gray-50
          opacity-0
          blur-2xl
          transition-opacity
          group-hover:opacity-100
        "
      />

      <div className="relative">
        {/* ÜST */}
        <div className="flex items-start justify-between gap-3">
          <div
            className={`
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              ${iconClassName}
            `}
          >
            {React.createElement(IconComponent, {
              className: "h-[18px] w-[18px]",
            })}
          </div>

          {durum && <DurumGostergesi durum={durum} />}
        </div>

        {/* İÇERİK */}
        <div className="mt-5">
          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-gray-400
            "
          >
            {baslik}
          </p>

          <p
            className="
              mt-1.5
              truncate
              text-lg
              font-bold
              tracking-tight
              text-gray-950
            "
            title={String(deger)}
          >
            {deger}
          </p>

          <p
            className="
              mt-1.5
              min-h-[32px]
              text-xs
              leading-5
              text-gray-500
            "
          >
            {aciklama}
          </p>
        </div>

        {/* ALT ÇİZGİ */}
        <div
          className="
            mt-4
            h-px
            w-full
            bg-gradient-to-r
            from-gray-200
            via-gray-100
            to-transparent
          "
        />
      </div>
    </div>
  );
}

function DurumGostergesi({ durum }) {
  if (durum === "success") {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1
          rounded-full
          border
          border-emerald-200
          bg-emerald-50
          px-2
          py-1
          text-[10px]
          font-semibold
          text-emerald-700
        "
      >
        <CheckCircle2 className="h-3 w-3" />
        Başarılı
      </span>
    );
  }

  if (durum === "error") {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1
          rounded-full
          border
          border-red-200
          bg-red-50
          px-2
          py-1
          text-[10px]
          font-semibold
          text-red-700
        "
      >
        <XCircle className="h-3 w-3" />
        Hata
      </span>
    );
  }

  return (
    <span
      className="
        inline-flex
        items-center
        gap-1
        rounded-full
        border
        border-amber-200
        bg-amber-50
        px-2
        py-1
        text-[10px]
        font-semibold
        text-amber-700
      "
    >
      <XCircle className="h-3 w-3" />
      Bekliyor
    </span>
  );
}
