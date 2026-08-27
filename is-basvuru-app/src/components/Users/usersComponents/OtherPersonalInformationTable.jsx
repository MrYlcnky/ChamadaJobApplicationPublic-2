import { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import Select from "react-select";
import { useTranslation } from "react-i18next";

// React-Select Stilleri (Aynı kalıyor)
const rsClassNames = {
  control: ({ isFocused }) =>
    `w-full min-h-[100px] rounded-lg border px-3 bg-white shadow-none transition-colors cursor-pointer flex items-start py-2 ${
      isFocused
        ? "border-black ring-0 outline-none"
        : "border-gray-300 hover:border-black"
    }`,
  valueContainer: () => "p-0 gap-1",
  placeholder: () => "text-gray-500",
  input: () => "m-0 p-0 text-gray-900",
  singleValue: () => "text-gray-900",
  multiValue: () => "bg-gray-100 rounded-sm m-0.5",
  multiValueLabel: () => "text-xs px-1 text-gray-800",
  multiValueRemove: () =>
    "hover:bg-red-100 hover:text-red-500 rounded-r-sm px-1 cursor-pointer transition-colors",
  indicatorSeparator: () => "hidden",
  dropdownIndicator: () => "text-gray-400 p-0 hover:text-black",
  menu: () =>
    "mt-1 border border-gray-200 rounded-lg bg-white shadow-lg z-[9999] overflow-hidden",
  menuList: () => "p-0 max-h-60 overflow-y-auto",
  option: ({ isSelected, isFocused }) =>
    `px-3 py-2 cursor-pointer text-sm transition-colors ${
      isSelected
        ? "bg-gray-900 text-white"
        : isFocused
          ? "bg-gray-100 text-gray-900"
          : "text-gray-700"
    }`,
};

export default function OtherPersonalInformationTable({ definitions }) {
  const { t } = useTranslation();
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  const ehliyetListesi = useMemo(
    () => definitions?.ehliyetler ?? [],
    [definitions?.ehliyetler],
  );

  const kktcBelgeListesi = useMemo(
    () => definitions?.kktcBelgeler ?? [],
    [definitions?.kktcBelgeler],
  );

  const davaDurumu = useWatch({ name: "otherInfo.davaDurumu" });
  const kaliciRahatsizlik = useWatch({ name: "otherInfo.kaliciRahatsizlik" });
  const ehliyet = useWatch({ name: "otherInfo.ehliyet" });

  // ✅ DÜZELTME 1: Backend Enum Uyumlu Değerler (2=Evet, 1=Hayır)
  const yesNoOptions = [
    { value: "2", label: t("otherInfo.options.yesNo.yes") }, // Evet -> 2
    { value: "1", label: t("otherInfo.options.yesNo.no") }, // Hayır -> 1
  ];

  const kktcOptions = useMemo(() => {
    return kktcBelgeListesi.map((item) => ({
      value: String(item.id),
      label: item.belgeAdi,
    }));
  }, [kktcBelgeListesi]);

  const militaryOptions = [
    { value: "1", label: t("otherInfo.options.military.done") },
    { value: "2", label: t("otherInfo.options.military.notDone") },
    { value: "3", label: t("otherInfo.options.military.postponed") },
    { value: "4", label: t("otherInfo.options.military.exempt") },
  ];

  const ehliyetTurOptions = useMemo(() => {
    return ehliyetListesi.map((e) => ({
      value: String(e.id),
      label: e.ehliyetTuruAdi,
    }));
  }, [ehliyetListesi]);

  // ✅ DÜZELTME 2: Kontroller "2" (Evet) değerine göre yapılıyor
  const isLawsuitYes = String(davaDurumu) === "2";
  const isDiseaseYes = String(kaliciRahatsizlik) === "2";
  const isLicenseYes = String(ehliyet) === "2";

  // ✅ DÜZELTME 3: Handlers - Eğer "2" (Evet) değilse alanları temizle
  const handleDavaChange = (val, field) => {
    field.onChange(val);
    if (val !== "2") setValue("otherInfo.davaNedeni", "");
  };
  const handleDiseaseChange = (val, field) => {
    field.onChange(val);
    if (val !== "2") setValue("otherInfo.rahatsizlikAciklama", "");
  };
  const handleLicenseChange = (val, field) => {
    field.onChange(val);
    if (val !== "2") setValue("otherInfo.ehliyetTurleri", []);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-b-lg border-t border-gray-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* KKTC Belge */}
        <SelectController
          name="otherInfo.kktcGecerliBelge"
          label={t("otherInfo.labels.kktcDoc")}
          options={kktcOptions}
          control={control}
          error={errors.otherInfo?.kktcGecerliBelge}
          placeholder={t("personal.placeholders.select")}
        />

        {/* Dava Durumu */}
        <SelectController
          name="otherInfo.davaDurumu"
          label={t("otherInfo.labels.lawsuit")}
          options={yesNoOptions}
          control={control}
          onChangeCustom={handleDavaChange}
          error={errors.otherInfo?.davaDurumu}
          placeholder={t("personal.placeholders.select")}
        />

        {/* Dava Nedeni */}
        <InputField
          name="otherInfo.davaNedeni"
          label={t("otherInfo.labels.lawsuitReason")}
          disabled={!isLawsuitYes} // Evet (2) değilse disabled olur
          register={register}
          error={errors.otherInfo?.davaNedeni}
          placeholder={t("otherInfo.placeholders.lawsuitReason")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Sigara */}
          <SelectController
            name="otherInfo.sigara"
            label={t("otherInfo.labels.smoke")}
            options={yesNoOptions}
            control={control}
            error={errors.otherInfo?.sigara}
            placeholder={t("personal.placeholders.select")}
          />

          {/* Askerlik */}
          <SelectController
            name="otherInfo.askerlik"
            label={t("otherInfo.labels.military")}
            options={militaryOptions}
            control={control}
            error={errors.otherInfo?.askerlik}
            placeholder={t("personal.placeholders.select")}
          />
        </div>

        {/* Kalıcı Rahatsızlık */}
        <SelectController
          name="otherInfo.kaliciRahatsizlik"
          label={t("otherInfo.labels.permanentDisease")}
          options={yesNoOptions}
          control={control}
          onChangeCustom={handleDiseaseChange}
          error={errors.otherInfo?.kaliciRahatsizlik}
          placeholder={t("personal.placeholders.select")}
        />

        {/* Rahatsızlık Açıklama */}
        <InputField
          name="otherInfo.rahatsizlikAciklama"
          label={t("otherInfo.labels.diseaseDesc")}
          disabled={!isDiseaseYes} // Evet (2) değilse disabled olur
          register={register}
          error={errors.otherInfo?.rahatsizlikAciklama}
          placeholder={t("otherInfo.placeholders.diseaseDesc")}
        />

        {/* Ehliyet Var mı? */}
        <SelectController
          name="otherInfo.ehliyet"
          label={t("otherInfo.labels.license")}
          options={yesNoOptions}
          control={control}
          onChangeCustom={handleLicenseChange}
          error={errors.otherInfo?.ehliyet}
          placeholder={t("personal.placeholders.select")}
        />

        {/* Ehliyet Türleri */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            {t("otherInfo.labels.licenseTypes")}{" "}
            {isLicenseYes && <span className="text-red-500">*</span>}
          </label>
          <Controller
            name="otherInfo.ehliyetTurleri"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                isMulti
                unstyled
                options={ehliyetTurOptions}
                value={ehliyetTurOptions.filter((o) =>
                  (field.value || []).includes(o.value),
                )}
                onChange={(val) =>
                  field.onChange(val ? val.map((v) => v.value) : [])
                }
                isDisabled={!isLicenseYes} // Evet (2) değilse disabled olur
                placeholder={t("personal.placeholders.select")}
                classNames={rsClassNames}
                noOptionsMessage={() => "Seçenek yok"}
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
                menuPosition={"fixed"}
              />
            )}
          />
          {errors.otherInfo?.ehliyetTurleri && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              {errors.otherInfo.ehliyetTurleri.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Boy & Kilo */}
          <InputField
            name="otherInfo.boy"
            label={t("otherInfo.labels.height")}
            type="number"
            register={register}
            error={errors.otherInfo?.boy}
            placeholder="cm"
          />
          <InputField
            name="otherInfo.kilo"
            label={t("otherInfo.labels.weight")}
            type="number"
            register={register}
            error={errors.otherInfo?.kilo}
            placeholder="kg"
          />
        </div>
      </div>
    </div>
  );
}

// Yardımcılar (Değişmedi)
function InputField({
  label,
  name,
  type = "text",
  disabled = false,
  register,
  error,
  placeholder,
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1">
        {label} {/* Disabled değilse ve açıklama alanları ise * göster */}
        {!disabled &&
          name !== "otherInfo.davaNedeni" &&
          name !== "otherInfo.rahatsizlikAciklama" && (
            <span className="text-red-500">*</span>
          )}
      </label>
      <input
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        {...register(name)}
        className={`block w-full h-10.75 rounded-lg border px-3 py-2 focus:outline-none transition ${
          disabled
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-white border-gray-300 hover:border-black text-gray-900"
        }`}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1 font-medium">{error.message}</p>
      )}
    </div>
  );
}

function SelectController({
  name,
  label,
  options = [],
  control,
  error,
  placeholder,
  onChangeCustom,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState(null);

  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);

  const updateDropdownPosition = () => {
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const shouldOpenUp = spaceBelow < 280 && spaceAbove > spaceBelow;
    const maxHeight = Math.min(
      260,
      shouldOpenUp ? spaceAbove - 16 : spaceBelow - 16,
    );

    setDropdownStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      top: shouldOpenUp ? "auto" : rect.bottom + 8,
      bottom: shouldOpenUp ? window.innerHeight - rect.top + 8 : "auto",
      maxHeight: Math.max(maxHeight, 180),
      zIndex: 99999,
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    updateDropdownPosition();

    const handleClickOutside = (event) => {
      const clickedInsideButton = wrapperRef.current?.contains(event.target);
      const clickedInsideDropdown = dropdownRef.current?.contains(event.target);

      if (!clickedInsideButton && !clickedInsideDropdown) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleReposition = () => {
      updateDropdownPosition();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-bold text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const selectedOption = options.find(
            (o) => String(o.value) === String(field.value),
          );

          const selectedLabel = selectedOption?.label || placeholder;

          const handleSelect = (option) => {
            const val = String(option.value);

            if (onChangeCustom) {
              onChangeCustom(val, field);
            } else {
              field.onChange(val);
            }

            setIsOpen(false);
          };

          const handleClear = () => {
            if (onChangeCustom) {
              onChangeCustom("", field);
            } else {
              field.onChange("");
            }

            setIsOpen(false);
          };

          return (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsOpen((prev) => !prev);
                  setTimeout(updateDropdownPosition, 0);
                }}
                onBlur={field.onBlur}
                className={`w-full h-[43px] rounded-lg border px-3 bg-white text-left text-sm transition-all flex items-center justify-between gap-2 shadow-sm
                  ${
                    error
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 hover:border-black focus:border-black"
                  }
                  focus:outline-none focus:ring-1 focus:ring-black/10`}
              >
                <span
                  className={`block truncate ${
                    selectedOption ? "text-gray-900" : "text-gray-400"
                  }`}
                  title={selectedLabel}
                >
                  {selectedLabel}
                </span>

                <span
                  className={`text-gray-400 text-xs transition-transform shrink-0 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {isOpen &&
                dropdownStyle &&
                createPortal(
                  <div
                    ref={dropdownRef}
                    style={dropdownStyle}
                    className="rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
                  >
                    <div
                      className="overflow-y-auto custom-scrollbar py-1"
                      style={{
                        maxHeight: dropdownStyle.maxHeight,
                      }}
                    >
                      <button
                        type="button"
                        onClick={handleClear}
                        className="w-full text-left px-3 py-2.5 text-sm text-gray-400 hover:bg-gray-100 transition truncate"
                        title={placeholder}
                      >
                        {placeholder}
                      </button>

                      {options.map((option) => {
                        const isSelected =
                          String(option.value) === String(field.value);

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option)}
                            title={option.label}
                            className={`w-full text-left px-3 py-2.5 text-sm transition flex items-center justify-between gap-3
                              ${
                                isSelected
                                  ? "bg-sky-50 text-sky-700 font-bold"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                          >
                            <span className="block truncate leading-5">
                              {option.label}
                            </span>

                            {isSelected && (
                              <span className="text-sky-600 shrink-0">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>,
                  document.body,
                )}
            </>
          );
        }}
      />

      {error && (
        <p className="text-xs text-red-600 mt-1 font-medium">{error.message}</p>
      )}
    </div>
  );
}
