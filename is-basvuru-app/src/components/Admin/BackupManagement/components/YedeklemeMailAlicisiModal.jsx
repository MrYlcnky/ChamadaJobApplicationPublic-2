import React, { useEffect, useRef, useState } from "react";

import {
  Mail,
  X,
  Save,
  LoaderCircle,
  Check,
  Hash,
  BellRing,
  CircleAlert,
} from "lucide-react";

export default function YedeklemeMailAlicisiModal({
  open,
  kayit,
  loading,
  onClose,
  onSave,
  kullanilanSiraNolari = [],
}) {
  const [eposta, setEposta] = useState("");
  const [aktifMi, setAktifMi] = useState(true);
  const [siraNo, setSiraNo] = useState(1);

  const emailRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (kayit) {
      setEposta(kayit.eposta || "");
      setAktifMi(kayit.aktifMi ?? true);
      setSiraNo(kayit.siraNo ?? 1);
    } else {
      setEposta("");
      setAktifMi(true);
      setSiraNo(1);
    }

    const timer = setTimeout(() => {
      emailRef.current?.focus();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [open, kayit]);

  useEffect(() => {
    if (!open) {
      return;
    }

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

  const siraNoDegeri = Number(siraNo);

  const siraNoGecerliMi = Number.isInteger(siraNoDegeri) && siraNoDegeri >= 1;

  const siraNoCakisiyor =
    siraNoGecerliMi &&
    kullanilanSiraNolari.some(
      (x) =>
        Number(x.siraNo) === siraNoDegeri && Number(x.id) !== Number(kayit?.id),
    );

  const formGecerliMi =
    Boolean(eposta.trim()) && siraNoGecerliMi && !siraNoCakisiyor;

  const handleSubmit = (event) => {
    event.preventDefault();

    const temizEposta = eposta.trim();

    if (!temizEposta || !siraNoGecerliMi || siraNoCakisiyor) {
      return;
    }

    onSave({
      ...(kayit?.id
        ? {
            id: kayit.id,
          }
        : {}),

      eposta: temizEposta,
      aktifMi,
      siraNo: siraNoDegeri,
    });
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      {/* OVERLAY */}
      <div
        onClick={loading ? undefined : onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      {/* MODAL */}
      <div
        className="
          relative
          w-full
          max-w-[520px]
          overflow-hidden
          rounded-[24px]
          border
          border-white/70
          bg-white
          shadow-[0_30px_100px_rgba(15,23,42,0.30)]
        "
      >
        {/* HEADER */}
        <div className="relative px-6 pb-5 pt-6">
          <div
            className="
              pointer-events-none
              absolute
              right-0
              top-0
              h-40
              w-40
              -translate-y-1/3
              translate-x-1/3
              rounded-full
              bg-blue-100/70
              blur-3xl
            "
          />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-slate-950
                  text-white
                  shadow-sm
                "
              >
                <Mail className="h-5 w-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight text-slate-950">
                    {kayit ? "Mail Alıcısını Düzenle" : "Yeni Mail Alıcısı"}
                  </h2>

                  {kayit && (
                    <span
                      className="
                        rounded-full
                        bg-slate-100
                        px-2
                        py-1
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-slate-500
                      "
                    >
                      Düzenleme
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Backup bildirimlerinin gönderileceği alıcıyı yönetin.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                text-slate-400
                transition
                hover:bg-slate-100
                hover:text-slate-700
                disabled:pointer-events-none
                disabled:opacity-40
              "
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 px-6 py-6">
            {/* EMAIL */}
            <div>
              <label
                htmlFor="yedekleme-email"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                E-posta adresi
              </label>

              <div className="relative">
                <Mail
                  className="
                    absolute
                    left-4
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  ref={emailRef}
                  id="yedekleme-email"
                  type="email"
                  required
                  disabled={loading}
                  autoComplete="email"
                  value={eposta}
                  onChange={(event) => setEposta(event.target.value)}
                  placeholder="ornek@chamada.com"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    pl-11
                    pr-4
                    text-sm
                    font-medium
                    text-slate-900
                    outline-none
                    transition
                    placeholder:font-normal
                    placeholder:text-slate-400
                    hover:border-slate-300
                    focus:border-slate-400
                    focus:ring-4
                    focus:ring-slate-100
                    disabled:bg-slate-50
                  "
                />
              </div>
            </div>

            {/* ALT AYARLAR */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr]">
              {/* SIRA */}
              <div>
                <label
                  htmlFor="yedekleme-sira"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Sıra
                </label>

                <div className="relative">
                  <Hash
                    className={`
                      absolute
                      left-3.5
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      ${siraNoCakisiyor ? "text-red-400" : "text-slate-400"}
                    `}
                  />

                  <input
                    id="yedekleme-sira"
                    type="number"
                    min="1"
                    step="1"
                    required
                    disabled={loading}
                    value={siraNo}
                    onChange={(event) => setSiraNo(event.target.value)}
                    className={`
                      h-12
                      w-full
                      rounded-xl
                      border
                      bg-white
                      pl-10
                      pr-3
                      text-sm
                      font-semibold
                      text-slate-900
                      outline-none
                      transition
                      ${
                        siraNoCakisiyor
                          ? `
                            border-red-300
                            bg-red-50/30
                            focus:border-red-400
                            focus:ring-4
                            focus:ring-red-50
                          `
                          : `
                            border-slate-200
                            hover:border-slate-300
                            focus:border-slate-400
                            focus:ring-4
                            focus:ring-slate-100
                          `
                      }
                    `}
                  />
                </div>

                {siraNoCakisiyor ? (
                  <div className="mt-2 flex items-start gap-1.5 text-[11px] font-medium leading-4 text-red-600">
                    <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                    <span>
                      {siraNoDegeri}. sıra başka bir alıcı tarafından
                      kullanılıyor.
                    </span>
                  </div>
                ) : !siraNoGecerliMi ? (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-red-600">
                    <CircleAlert className="h-3.5 w-3.5" />
                    Sıra en az 1 olmalıdır.
                  </div>
                ) : (
                  <p className="mt-2 text-[11px] text-slate-400">
                    Her sıra yalnızca bir alıcıya atanabilir.
                  </p>
                )}
              </div>

              {/* AKTIFLIK */}
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  Bildirim durumu
                </p>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setAktifMi((current) => !current)}
                  className={`
                    flex
                    h-12
                    w-full
                    items-center
                    justify-between
                    rounded-xl
                    border
                    px-4
                    text-left
                    transition-all
                    ${
                      aktifMi
                        ? "border-emerald-200 bg-emerald-50/70"
                        : "border-slate-200 bg-slate-50"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-lg
                        ${
                          aktifMi
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 text-slate-500"
                        }
                      `}
                    >
                      {aktifMi ? (
                        <BellRing className="h-3.5 w-3.5" />
                      ) : (
                        <Mail className="h-3.5 w-3.5" />
                      )}
                    </div>

                    <div>
                      <p
                        className={`
                          text-xs
                          font-bold
                          ${aktifMi ? "text-emerald-800" : "text-slate-600"}
                        `}
                      >
                        {aktifMi ? "Aktif" : "Pasif"}
                      </p>

                      <p className="text-[10px] text-slate-500">
                        {aktifMi ? "Bildirim alacak" : "Bildirim almayacak"}
                      </p>
                    </div>
                  </div>

                  {/* SWITCH */}
                  <div
                    className={`
                      relative
                      h-6
                      w-11
                      rounded-full
                      transition-colors
                      ${aktifMi ? "bg-emerald-500" : "bg-slate-300"}
                    `}
                  >
                    <div
                      className={`
                        absolute
                        top-0.5
                        h-5
                        w-5
                        rounded-full
                        bg-white
                        shadow-sm
                        transition-transform
                        ${aktifMi ? "translate-x-[22px]" : "translate-x-0.5"}
                      `}
                    />
                  </div>
                </button>
              </div>
            </div>

            {/* INFO */}
            <div
              className="
                flex
                items-start
                gap-3
                rounded-xl
                border
                border-blue-100
                bg-blue-50/60
                px-4
                py-3.5
              "
            >
              <div
                className="
                  mt-0.5
                  flex
                  h-6
                  w-6
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-100
                  text-blue-600
                "
              >
                <Check className="h-3.5 w-3.5" />
              </div>

              <p className="text-xs leading-5 text-slate-600">
                Aktif alıcılar yedekleme sonuçlarından haberdar edilir. Geçmiş
                mail kayıtları, alıcı daha sonra değiştirilse veya silinse bile
                korunur.
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div
            className="
              flex
              flex-col-reverse
              gap-2
              border-t
              border-slate-100
              bg-slate-50/70
              px-6
              py-4
              sm:flex-row
              sm:items-center
              sm:justify-end
            "
          >
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="
                inline-flex
                h-10
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                bg-white
                px-4
                text-sm
                font-semibold
                text-slate-600
                transition
                hover:bg-slate-100
                hover:text-slate-900
                disabled:pointer-events-none
                disabled:opacity-40
              "
            >
              Vazgeç
            </button>

            <button
              type="submit"
              disabled={loading || !formGecerliMi}
              className="
                inline-flex
                h-10
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-slate-950
                px-5
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition-all
                hover:bg-slate-800
                hover:shadow-md
                active:scale-[0.98]
                disabled:pointer-events-none
                disabled:opacity-40
              "
            >
              {loading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              {loading
                ? "Kaydediliyor..."
                : kayit
                  ? "Değişiklikleri Kaydet"
                  : "Alıcıyı Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
