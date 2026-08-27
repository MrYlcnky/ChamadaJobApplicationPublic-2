import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";

import MuiDateStringField from "../../../../../Users/Date/MuiDateStringField";
import DarkSelect from "./DarkSelect";

export default function JobOfferAssignmentFields({
  jobOfferData,
  setJobOfferData,
  handleInputChange,

  existingData,
  auth,

  availableDepartments = [],
  gorevler = [],

  canEditForm,
  canEditDepartmentFields,
  isSuperAdmin,

  today,
}) {
  const isYerineAlim = Number(jobOfferData.talepNedeni) === 2;

  const yerineAlimAlanlariDisabled = !canEditDepartmentFields || !isYerineAlim;

  const getInputClass = (disabled) =>
    `w-full rounded-lg border p-2.5 text-sm outline-none transition-all duration-200 ${
      disabled
        ? "cursor-not-allowed border-gray-700 bg-gray-900/40 text-gray-500 opacity-60"
        : "border-gray-600 bg-gray-900 text-white hover:border-sky-500/70 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
    }`;

  /*
   * Departman seçenekleri
   *
   * Daha önce atanmış departman, sevk listesinin içinde bulunmuyorsa
   * kaybolmaması için seçeneklere ayrıca eklenir.
   */
  const departmentOptions = [
    ...availableDepartments.map((departman) => ({
      value: departman.id,
      label: departman.adi,
    })),

    ...(existingData?.masterDepartmanId &&
    !availableDepartments.some(
      (departman) =>
        Number(departman.id) === Number(existingData.masterDepartmanId),
    )
      ? [
          {
            value: existingData.masterDepartmanId,
            label: existingData.masterDepartmanAdi || "Mevcut Departman",
          },
        ]
      : []),
  ];

  const selectedDepartment =
    departmentOptions.find(
      (option) =>
        Number(option.value) === Number(jobOfferData.masterDepartmanId),
    ) ?? null;

  /*
   * Görev seçenekleri
   */
  const gorevOptions = gorevler.map((gorev) => ({
    value: gorev.id,
    label: gorev.masterGorevAdi,
  }));

  const selectedGorev =
    gorevOptions.find(
      (option) => Number(option.value) === Number(jobOfferData.gorevId),
    ) ?? null;

  /*
   * Talep nedeni seçenekleri
   */
  const talepNedeniOptions = [
    {
      value: 1,
      label: "Yeni Kadro",
    },
    {
      value: 2,
      label: "Yerine Alım",
    },
  ];

  const selectedTalepNedeni =
    talepNedeniOptions.find(
      (option) => Number(option.value) === Number(jobOfferData.talepNedeni),
    ) ?? talepNedeniOptions[0];

  return (
    <div className="space-y-5">
      {/* 1. SATIR: 4 ALAN */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {/* Departman */}
        <div className="mt-1">
          <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
            Departman
          </label>

          {isSuperAdmin && canEditDepartmentFields ? (
            <DarkSelect
              options={departmentOptions}
              value={selectedDepartment}
              onChange={(selectedOption) => {
                setJobOfferData((prev) => ({
                  ...prev,
                  masterDepartmanId: selectedOption?.value ?? "",
                  gorevId: "",
                }));
              }}
              placeholder="Departman seçiniz..."
              isDisabled={!canEditDepartmentFields}
              isSearchable
            />
          ) : (
            <div className="flex min-h-[42px] w-full cursor-not-allowed items-center gap-2 rounded-lg border border-gray-700/50 bg-gray-900/50 p-2.5 text-gray-500 shadow-inner">
              <FontAwesomeIcon icon={faBuilding} className="text-gray-600" />

              <span className="truncate">
                {existingData?.masterDepartmanAdi ||
                  auth?.masterDepartmanAdi ||
                  "Departman Bilgisi Bekleniyor..."}
              </span>
            </div>
          )}
        </div>

        {/* Atanacak Görev */}
        <div className="mt-1">
          <label
            className={`mb-1 block text-xs font-semibold uppercase ${
              canEditDepartmentFields ? "text-sky-400" : "text-gray-500"
            }`}
          >
            Atanacak Görev
          </label>

          <DarkSelect
            options={gorevOptions}
            value={selectedGorev}
            onChange={(selectedOption) => {
              setJobOfferData((prev) => ({
                ...prev,
                gorevId: selectedOption?.value ?? "",
              }));
            }}
            placeholder={
              jobOfferData.masterDepartmanId
                ? "Görev seçiniz..."
                : "Önce departman seçiniz"
            }
            isDisabled={
              !canEditDepartmentFields ||
              !jobOfferData.masterDepartmanId ||
              gorevOptions.length === 0
            }
            isSearchable
            noOptionsMessage="Bu departmana ait görev bulunamadı"
          />
        </div>

        {/* Başlama Tarihi */}
        <div className="dark-date-picker">
          <MuiDateStringField
            label="Başlama Tarihi"
            variant="dark"
            name="baslangicTarihi"
            value={jobOfferData.baslangicTarihi}
            onChange={handleInputChange}
            displayFormat="dd.MM.yyyy"
            min={today}
            disabled={!canEditForm}
          />
        </div>

        {/* Talep Nedeni */}
        <div className="mt-1">
          <label
            className={`mb-1 block text-xs font-semibold uppercase ${
              canEditDepartmentFields ? "text-sky-400" : "text-gray-500"
            }`}
          >
            Talep Nedeni
          </label>

          <DarkSelect
            options={talepNedeniOptions}
            value={selectedTalepNedeni}
            onChange={(selectedOption) => {
              const yeniTalepNedeni = selectedOption?.value ?? 1;

              setJobOfferData((prev) => ({
                ...prev,
                talepNedeni: yeniTalepNedeni,

                ...(Number(yeniTalepNedeni) !== 2
                  ? {
                      yerineAlinacakKisiAdSoyad: "",
                      yerineAlinacakKisiCikisTarihi: "",
                    }
                  : {}),
              }));
            }}
            placeholder="Talep nedeni seçiniz..."
            isDisabled={!canEditDepartmentFields}
            isSearchable={false}
          />
        </div>
      </div>

      {/* 2. SATIR: 4 ALAN */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {/* Önerilen Net Ücret */}
        <div className="mt-1">
          <label
            className={`mb-1 block text-xs font-semibold uppercase ${
              canEditDepartmentFields ? "text-sky-400" : "text-gray-500"
            }`}
          >
            Önerilen Net Ücret (₺)
          </label>

          <input
            type="number"
            name="netUcret"
            min="0"
            step="1"
            placeholder="Örn: 45000"
            value={jobOfferData.netUcret ?? ""}
            onChange={handleInputChange}
            disabled={!canEditDepartmentFields}
            className={getInputClass(!canEditDepartmentFields)}
          />
        </div>

        {/* Pozisyon Standart Bütçesi */}
        <div className="mt-1">
          <label
            className={`mb-1 block text-xs font-semibold uppercase ${
              canEditDepartmentFields ? "text-sky-400" : "text-gray-500"
            }`}
          >
            Pozisyon Standart Bütçesi (₺)
          </label>

          <input
            type="number"
            name="talepEdilenGorevGenelButcesi"
            min="0"
            step="1"
            placeholder="Örn: 50000"
            value={jobOfferData.talepEdilenGorevGenelButcesi ?? ""}
            onChange={handleInputChange}
            disabled={!canEditDepartmentFields}
            className={getInputClass(!canEditDepartmentFields)}
          />
        </div>

        {/* Kimin Yerine Alınıyor */}
        <div className="mt-1">
          <label
            className={`mb-1 block text-xs font-semibold uppercase ${
              yerineAlimAlanlariDisabled ? "text-gray-500" : "text-amber-400"
            }`}
          >
            Kimin Yerine Alınıyor?
          </label>

          <input
            type="text"
            name="yerineAlinacakKisiAdSoyad"
            placeholder={
              isYerineAlim
                ? "Ayrılan personelin adı ve soyadı"
                : "Talep nedeni Yerine Alım olmalıdır"
            }
            value={jobOfferData.yerineAlinacakKisiAdSoyad ?? ""}
            onChange={handleInputChange}
            disabled={yerineAlimAlanlariDisabled}
            className={`${getInputClass(yerineAlimAlanlariDisabled)} ${
              !yerineAlimAlanlariDisabled
                ? "border-amber-500/50 focus:border-amber-400 focus:ring-amber-500/20"
                : ""
            }`}
          />
        </div>

        {/* Ayrılacak Kişi Çıkış Tarihi */}
        <div className="dark-date-picker">
          <MuiDateStringField
            label="Ayrılacak Kişi Çıkış Tarihi"
            variant="dark"
            name="yerineAlinacakKisiCikisTarihi"
            value={jobOfferData.yerineAlinacakKisiCikisTarihi}
            onChange={handleInputChange}
            displayFormat="dd.MM.yyyy"
            disabled={yerineAlimAlanlariDisabled}
          />
        </div>
      </div>
    </div>
  );
}
