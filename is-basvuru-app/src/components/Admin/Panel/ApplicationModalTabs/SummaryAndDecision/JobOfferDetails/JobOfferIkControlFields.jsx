import DarkSelect from "./DarkSelect";

export default function JobOfferIkControlFields({
  jobOfferData,
  setJobOfferData,
  handleInputChange,
  canEditIkFields,
  totalPozisyonButcesiDisabled,
  calismaIzinBelgeTurleri,
}) {
  const butceDurumuOptions = [
    {
      value: true,
      label: "Evet",
    },
    {
      value: false,
      label: "Hayır",
    },
  ];

  const calismaIzinBelgeOptions = calismaIzinBelgeTurleri.map((belge) => ({
    value: belge.id ?? belge.Id,
    label: belge.belgeAdi ?? belge.BelgeAdi,
  }));

  const selectedButceDurumu =
    jobOfferData.pozisyonButcesiVarMi === true
      ? butceDurumuOptions[0]
      : jobOfferData.pozisyonButcesiVarMi === false
        ? butceDurumuOptions[1]
        : null;

  const selectedCalismaIzinBelgesi =
    calismaIzinBelgeOptions.find(
      (option) =>
        Number(option.value) === Number(jobOfferData.calismaIzinBelgeTuruId),
    ) ?? null;

  const getInputClass = (disabled) =>
    `w-full rounded-lg border p-2.5 text-sm outline-none transition-all duration-200 ${
      disabled
        ? "cursor-not-allowed border-gray-700 bg-gray-900/40 text-gray-500 opacity-60"
        : "border-gray-600 bg-gray-900 text-white hover:border-sky-500/70 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
    }`;

  return (
    <div className="space-y-5">
      {/* İK KONTROL ALANLARI: 4 ALAN */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {/* Pozisyon Bütçesi Var mı */}
        <div>
          <label
            className={`mb-1 block text-xs font-semibold uppercase ${
              canEditIkFields ? "text-sky-400" : "text-gray-500"
            }`}
          >
            Pozisyon Bütçesi Var mı?
          </label>

          <DarkSelect
            options={butceDurumuOptions}
            value={selectedButceDurumu}
            onChange={(selectedOption) => {
              const yeniDeger = selectedOption?.value ?? "";

              setJobOfferData((prev) => ({
                ...prev,
                pozisyonButcesiVarMi: yeniDeger,

                ...(yeniDeger !== true
                  ? {
                      totalPozisyonButcesi: "",
                    }
                  : {}),
              }));
            }}
            placeholder="Seçiniz..."
            isDisabled={!canEditIkFields}
            isSearchable={false}
          />
        </div>

        {/* Pozisyonda Olması Gereken Personel */}
        <div>
          <label
            className={`mb-1 block text-[11px]  font-semibold uppercase ${
              canEditIkFields ? "text-sky-400" : "text-gray-500"
            }`}
          >
            Pozisyonda Olması Gereken Personel Sayısı
          </label>

          <input
            type="number"
            name="pozisyondaCalismasiGerekenPersonelSayisi"
            min="0"
            step="1"
            placeholder="Örn: 10"
            value={jobOfferData.pozisyondaCalismasiGerekenPersonelSayisi ?? ""}
            onChange={handleInputChange}
            disabled={!canEditIkFields}
            className={getInputClass(!canEditIkFields)}
          />
        </div>

        {/* Aktif Çalışan Personel */}
        <div>
          <label
            className={`mb-1 block text-xs font-semibold uppercase ${
              canEditIkFields ? "text-sky-400" : "text-gray-500"
            }`}
          >
            Aktif Çalışan Personel Sayısı
          </label>

          <input
            type="number"
            name="aktifCalisanPersonel"
            min="0"
            step="1"
            placeholder="Örn: 7"
            value={jobOfferData.aktifCalisanPersonel ?? ""}
            onChange={handleInputChange}
            disabled={!canEditIkFields}
            className={getInputClass(!canEditIkFields)}
          />
        </div>

        {/* Toplam Pozisyon Bütçesi */}
        <div>
          <label
            className={`mb-1 block text-xs font-semibold uppercase ${
              !totalPozisyonButcesiDisabled ? "text-sky-400" : "text-gray-500"
            }`}
          >
            Toplam Pozisyon Bütçesi (₺)
          </label>

          <input
            type="number"
            name="totalPozisyonButcesi"
            min="1"
            step="1"
            placeholder={
              jobOfferData.pozisyonButcesiVarMi === true
                ? "Örn: 250000"
                : "Önce bütçe durumunu Evet seçiniz"
            }
            value={jobOfferData.totalPozisyonButcesi ?? ""}
            onChange={handleInputChange}
            disabled={totalPozisyonButcesiDisabled}
            className={getInputClass(totalPozisyonButcesiDisabled)}
          />
        </div>
      </div>

      {/* ÇALIŞMA İZİN BELGE TÜRÜ: 1 ALAN */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label
            className={`mb-1 block text-xs font-semibold uppercase ${
              canEditIkFields ? "text-sky-400" : "text-gray-500"
            }`}
          >
            Çalışma İzin Belge Türü
          </label>

          <DarkSelect
            options={calismaIzinBelgeOptions}
            value={selectedCalismaIzinBelgesi}
            onChange={(selectedOption) => {
              setJobOfferData((prev) => ({
                ...prev,
                calismaIzinBelgeTuruId: selectedOption?.value ?? "",
              }));
            }}
            placeholder="Belge türü seçiniz..."
            isDisabled={!canEditIkFields}
            isSearchable
            isMulti={false}
          />
        </div>
      </div>
    </div>
  );
}
