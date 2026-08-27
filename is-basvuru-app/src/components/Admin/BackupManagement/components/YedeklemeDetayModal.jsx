import React, { useEffect } from "react";

import {
  Archive,
  Check,
  CircleAlert,
  CircleX,
  Cloud,
  Database,
  ExternalLink,
  FileArchive,
  LoaderCircle,
  Mail,
  Paperclip,
  UserRound,
  X,
} from "lucide-react";

import {
  tarihFormatla,
  boyutFormatla,
  tetiklemeTipiMetni,
  yedeklemeDurumuMetni,
} from "../helpers/yedeklemeFormatters";

export default function YedeklemeDetayModal({ open, loading, yedek, onClose }) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, loading, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-5">
      {/* BACKDROP */}
      <div
        onClick={loading ? undefined : onClose}
        className={`
          absolute
          inset-0
          bg-slate-950/65
          backdrop-blur-[3px]
          ${loading ? "" : "cursor-pointer"}
        `}
      />

      {/* MODAL */}
      <div
        className="
          relative
          flex
          max-h-[92vh]
          w-full
          max-w-5xl
          flex-col
          overflow-hidden
          rounded-[22px]
          bg-white
          shadow-[0_32px_100px_rgba(15,23,42,0.35)]
        "
      >
        {/* HEADER */}
        <header
          className="
            flex
            shrink-0
            items-start
            justify-between
            gap-5
            border-b
            border-slate-100
            px-6
            py-5
            sm:px-7
          "
        >
          <div className="flex min-w-0 items-start gap-4">
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-slate-950
                text-white
              "
            >
              <Archive className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">
                  Yedekleme Detayı
                </h2>

                {!loading && yedek && <DurumRozeti durum={yedek.durum} />}
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Yedekleme işleminin teknik ve gönderim bilgileri
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              flex
              h-9
              w-9
              shrink-0
              cursor-pointer
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* BODY */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <LoadingState />
          ) : !yedek ? (
            <EmptyState />
          ) : (
            <div className="p-6 sm:p-7">
              {/* ANA GRID */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_310px]">
                {/* SOL TARAF */}
                <div className="min-w-0 space-y-8">
                  {/* TEMEL BİLGİLER */}
                  <section>
                    <SectionTitle
                      title="Temel Bilgiler"
                      description="Yedekleme işlemine ait kayıt bilgileri"
                    />

                    <dl
                      className="
                        mt-4
                        divide-y
                        divide-slate-100
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                      "
                    >
                      <BilgiSatiri
                        label="Başlangıç"
                        value={tarihFormatla(yedek.baslamaTarihi)}
                      />

                      <BilgiSatiri
                        label="Tamamlanma"
                        value={tarihFormatla(yedek.tamamlanmaTarihi)}
                      />

                      <BilgiSatiri
                        label="Durum"
                        value={yedeklemeDurumuMetni(yedek.durum)}
                      />

                      <BilgiSatiri
                        label="Tetikleme"
                        value={tetiklemeTipiMetni(yedek.tetiklemeTipi)}
                      />

                      <BilgiSatiri
                        label="Başlatan"
                        value={yedek.baslatanKullaniciAdi || "-"}
                        icon={<UserRound className="h-3.5 w-3.5" />}
                      />

                      <BilgiSatiri
                        label="ZIP Dosyası"
                        value={yedek.zipDosyaAdi || "-"}
                        mono
                      />
                    </dl>
                  </section>

                  {/* DOSYA BOYUTLARI */}
                  <section>
                    <SectionTitle
                      title="Yedek İçeriği"
                      description="Oluşturulan dosyaların boyut bilgileri"
                    />

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <DosyaSatiri
                        icon={<Database className="h-4 w-4" />}
                        title="SQL Yedeği"
                        value={boyutFormatla(yedek.sqlBoyutuByte)}
                        description="MariaDB veritabanı dump dosyası"
                      />

                      <DosyaSatiri
                        icon={<FileArchive className="h-4 w-4" />}
                        title="ZIP Paketi"
                        value={boyutFormatla(yedek.zipBoyutuByte)}
                        description="SQL + wwwroot içeriği"
                      />
                    </div>
                  </section>

                  {/* MAIL KAYITLARI */}
                  <section>
                    <div className="flex items-end justify-between gap-4">
                      <SectionTitle
                        title="Mail Gönderimleri"
                        description="Bu yedekleme sırasında kullanılan alıcılar"
                      />

                      <span
                        className="
                          shrink-0
                          rounded-full
                          bg-slate-100
                          px-2.5
                          py-1
                          text-[11px]
                          font-semibold
                          text-slate-500
                        "
                      >
                        {yedek.mailGonderimleri?.length || 0} alıcı
                      </span>
                    </div>

                    <div
                      className="
                        mt-4
                        overflow-hidden
                        rounded-xl
                        border
                        border-slate-200
                      "
                    >
                      {!yedek.mailGonderimleri ||
                      yedek.mailGonderimleri.length === 0 ? (
                        <div className="px-6 py-10 text-center">
                          <Mail className="mx-auto h-6 w-6 text-slate-300" />

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            Mail gönderim kaydı yok
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Eski yedeklerde alıcı geçmişi bulunmayabilir.
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {yedek.mailGonderimleri.map((mail) => (
                            <MailSatiri key={mail.id} mail={mail} />
                          ))}
                        </div>
                      )}
                    </div>
                  </section>

                  {/* HATA */}
                  {yedek.hataMesaji && (
                    <div
                      className="
                        flex
                        items-start
                        gap-3
                        rounded-xl
                        border
                        border-red-200
                        bg-red-50
                        p-4
                      "
                    >
                      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

                      <div>
                        <p className="text-xs font-semibold text-red-700">
                          İşlem Mesajı
                        </p>

                        <p className="mt-1 break-words text-sm leading-5 text-red-700">
                          {yedek.hataMesaji}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* SAĞ TARAF */}
                <aside className="space-y-5">
                  <div>
                    <SectionTitle
                      title="İşlem Özeti"
                      description="Yedekleme servislerinin durumu"
                    />

                    <div
                      className="
                        mt-4
                        overflow-hidden
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                      "
                    >
                      <ServisSatiri
                        icon={<Cloud className="h-4 w-4" />}
                        title="Google Drive"
                        success={yedek.driveYuklendiMi}
                        successText="Yüklendi"
                        failText="Yüklenmedi"
                      />

                      <ServisSatiri
                        icon={<Mail className="h-4 w-4" />}
                        title="Bilgilendirme Maili"
                        success={yedek.mailGonderildiMi}
                        successText="Gönderildi"
                        failText="Gönderilmedi"
                      />

                      <ServisSatiri
                        icon={<Paperclip className="h-4 w-4" />}
                        title="SQL Mail Eki"
                        success={yedek.sqlMailEkiGonderildiMi}
                        successText="Eklendi"
                        failText="Eklenmedi"
                        last
                      />
                    </div>
                  </div>

                  {yedek.driveYuklendiMi && yedek.driveLink && (
                    <div
                      className="
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50/70
                        p-4
                      "
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-white
                            text-slate-600
                            shadow-sm
                          "
                        >
                          <Cloud className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            Drive Yedeği
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            Bulut kopyası mevcut
                          </p>
                        </div>
                      </div>

                      <a
                        href={yedek.driveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="
                          mt-4
                          inline-flex
                          h-10
                          w-full
                          cursor-pointer
                          items-center
                          justify-center
                          gap-2
                          rounded-lg
                          bg-slate-950
                          px-4
                          text-xs
                          font-semibold
                          text-white
                          transition
                          hover:bg-slate-800
                          active:scale-[0.99]
                        "
                      >
                        Drive'da Aç
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}
                </aside>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {!loading && (
          <footer
            className="
              flex
              shrink-0
              items-center
              justify-between
              border-t
              border-slate-100
              bg-slate-50/60
              px-6
              py-3.5
            "
          >
            <span className="hidden text-[11px] text-slate-400 sm:block">
              ESC ile kapatabilirsiniz
            </span>

            <button
              type="button"
              onClick={onClose}
              className="
                ml-auto
                inline-flex
                h-9
                cursor-pointer
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                bg-white
                px-4
                text-xs
                font-semibold
                text-slate-600
                transition
                hover:bg-slate-100
                hover:text-slate-900
              "
            >
              Kapat
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ title, description }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>

      {description && (
        <p className="mt-0.5 text-xs text-slate-400">{description}</p>
      )}
    </div>
  );
}

function BilgiSatiri({ label, value, icon, mono = false }) {
  return (
    <div
      className="
        grid
        grid-cols-[120px_minmax(0,1fr)]
        items-center
        gap-4
        px-4
        py-3.5
        sm:grid-cols-[150px_minmax(0,1fr)]
      "
    >
      <dt className="text-xs font-medium text-slate-400">{label}</dt>

      <dd
        className={`
          flex
          min-w-0
          items-center
          gap-2
          text-sm
          font-semibold
          text-slate-800
          ${mono ? "break-all font-mono text-[12px]" : ""}
        `}
      >
        {icon && <span className="shrink-0 text-slate-400">{icon}</span>}

        {value}
      </dd>
    </div>
  );
}

function DosyaSatiri({ icon, title, value, description }) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-xl
        border
        border-slate-200
        bg-white
        p-4
      "
    >
      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-slate-100
          text-slate-600
        "
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{title}</p>

        <p className="mt-0.5 text-base font-bold text-slate-900">{value}</p>

        <p className="mt-0.5 text-[11px] text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function ServisSatiri({
  icon,
  title,
  success,
  successText,
  failText,
  last = false,
}) {
  return (
    <div
      className={`
        flex
        items-center
        justify-between
        gap-3
        px-4
        py-3.5
        ${last ? "" : "border-b border-slate-100"}
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-slate-400">{icon}</span>

        <span className="text-xs font-semibold text-slate-700">{title}</span>
      </div>

      <div className="flex items-center gap-1.5">
        {success ? (
          <Check className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <CircleX className="h-3.5 w-3.5 text-slate-300" />
        )}

        <span
          className={`
            text-xs
            font-semibold
            ${success ? "text-emerald-600" : "text-slate-400"}
          `}
        >
          {success ? successText : failText}
        </span>
      </div>
    </div>
  );
}

function MailSatiri({ mail }) {
  return (
    <div
      className="
        flex
        flex-col
        gap-3
        px-4
        py-3.5
        transition
        hover:bg-slate-50/70
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            ${
              mail.gonderildiMi
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-500"
            }
          `}
        >
          {mail.gonderildiMi ? (
            <Check className="h-4 w-4" />
          ) : (
            <CircleX className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0">
          <p className="break-all text-sm font-semibold text-slate-800">
            {mail.eposta}
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            {mail.gonderildiMi
              ? tarihFormatla(mail.gonderimTarihi)
              : "Gönderilemedi"}
          </p>

          {mail.hataMesaji && (
            <p className="mt-1 text-xs text-red-600">{mail.hataMesaji}</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <MailDurumu
          success={mail.gonderildiMi}
          text={mail.gonderildiMi ? "Mail gönderildi" : "Mail başarısız"}
        />

        <MailDurumu
          success={mail.sqlEkiGonderildiMi}
          text={mail.sqlEkiGonderildiMi ? "SQL ekli" : "SQL eksiz"}
          neutral={!mail.sqlEkiGonderildiMi}
        />
      </div>
    </div>
  );
}

function MailDurumu({ success, text, neutral = false }) {
  return (
    <span
      className={`
        rounded-md
        px-2
        py-1
        text-[10px]
        font-semibold
        ${
          success
            ? "bg-emerald-50 text-emerald-700"
            : neutral
              ? "bg-slate-100 text-slate-500"
              : "bg-red-50 text-red-600"
        }
      `}
    >
      {text}
    </span>
  );
}

function DurumRozeti({ durum }) {
  const value = Number(durum);

  if (value === 2) {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-full
          bg-emerald-50
          px-2.5
          py-1
          text-[10px]
          font-semibold
          text-emerald-700
        "
      >
        <Check className="h-3 w-3" />
        Başarılı
      </span>
    );
  }

  if (value === 3) {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-full
          bg-red-50
          px-2.5
          py-1
          text-[10px]
          font-semibold
          text-red-700
        "
      >
        <CircleX className="h-3 w-3" />
        Başarısız
      </span>
    );
  }

  return (
    <span
      className="
        inline-flex
        items-center
        gap-1.5
        rounded-full
        bg-amber-50
        px-2.5
        py-1
        text-[10px]
        font-semibold
        text-amber-700
      "
    >
      <LoaderCircle className="h-3 w-3 animate-spin" />
      Devam Ediyor
    </span>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center">
      <LoaderCircle className="h-7 w-7 animate-spin text-slate-500" />

      <p className="mt-4 text-sm font-semibold text-slate-700">
        Detaylar yükleniyor...
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center">
      <CircleX className="h-7 w-7 text-slate-300" />

      <p className="mt-3 text-sm font-semibold text-slate-700">
        Yedekleme detayı bulunamadı.
      </p>
    </div>
  );
}
