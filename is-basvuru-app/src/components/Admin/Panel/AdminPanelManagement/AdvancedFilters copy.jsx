import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEraser,
  faSearch,
  faChevronDown,
  faBuildingUser,
  faAddressCard,
  faCalendarDay,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { EGITIM_SEVIYELERI } from "./TableUtils";

// 🎯 1. STANDART İNPUTLAR İÇİN (Text, Date, Number)
export function FilterInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  ...props
}) {
  const commonClasses =
    "w-full appearance-none bg-slate-50/80 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-2.5 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all hover:border-slate-300 placeholder:text-slate-400 shadow-sm";

  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <label
          htmlFor={name}
          className="block text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={commonClasses}
        {...props}
      />
    </div>
  );
}

// 🎯 2. MODERN, ÖZEL TASARIM (CUSTOM) SELECT BİLEŞENİ
function CustomSelect({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Tümü",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Menü dışına tıklanınca kapanması için
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (selectedValue) => {
    onChange({ target: { name, value: selectedValue } }); // Ana sisteme sahte event gönderiyoruz
    setIsOpen(false);
  };

  const isAll = value === "all" || !value;
  const displayValue = isAll ? `-- TÜM ${placeholder.toUpperCase()} --` : value;

  return (
    <div className="w-full flex flex-col gap-1" ref={dropdownRef}>
      {label && (
        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Seçim Kutusu (Tıklanabilir Alan) */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex justify-between items-center bg-slate-50/80 border text-xs font-bold rounded-lg px-3 py-2.5 cursor-pointer transition-all shadow-sm select-none ${
            isOpen
              ? "border-indigo-400 ring-4 ring-indigo-500/10 bg-white text-indigo-700"
              : "border-slate-200 text-slate-700 hover:border-slate-300"
          }`}
        >
          <span
            className={`truncate ${isAll && !isOpen ? "text-slate-400" : ""}`}
          >
            {displayValue}
          </span>
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`text-[10px] transition-transform duration-300 ${isOpen ? "rotate-180 text-indigo-500" : "text-slate-400"}`}
          />
        </div>

        {/* Açılan Modern Liste */}
        {isOpen && (
          <div className="absolute z-[99999] top-full left-0 w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="max-h-48 overflow-y-auto custom-scrollbar py-1.5">
              {/* "Tümü" Seçeneği */}
              <div
                onClick={() => handleSelect("all")}
                className={`px-3 py-2 text-xs font-bold cursor-pointer transition-colors flex items-center justify-between ${
                  isAll
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                }`}
              >
                <span>-- TÜM {placeholder.toUpperCase()} --</span>
                {isAll && (
                  <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                )}
              </div>

              {/* Dinamik Seçenekler */}
              {options.map((opt, idx) => {
                const isSelected = value === opt;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelect(opt)}
                    className={`px-3 py-2 text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-600 hover:bg-indigo-50/50 hover:text-indigo-600"
                    }`}
                  >
                    <span className="truncate pr-2">{opt}</span>
                    {isSelected && (
                      <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 🎯 ANA BİLEŞEN
export default function AdvancedFilters({
  filters,
  lookups,
  onFilterChange,
  onApply,
  onClear,
}) {
  return (
    <div className="absolute top-full right-0 mt-3 w-[calc(100vw-2rem)] sm:w-[400px] lg:w-[450px] z-[9999] bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="p-5 max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col gap-6 pb-12">
        {/* GRUP 1: POZİSYON */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 border-b border-indigo-50 pb-1.5">
            <FontAwesomeIcon
              icon={faBuildingUser}
              className="text-indigo-400"
            />
            Pozisyon & Lokasyon
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CustomSelect
              label="Şube"
              name="branch"
              value={filters.branch}
              onChange={onFilterChange}
              options={lookups.subeler}
              placeholder="Şubeler"
            />
            <CustomSelect
              label="Alan"
              name="area"
              value={filters.area}
              onChange={onFilterChange}
              options={lookups.alanlar}
              placeholder="Alanlar"
            />
            <CustomSelect
              label="Departman"
              name="department"
              value={filters.department}
              onChange={onFilterChange}
              options={lookups.departmanlar}
              placeholder="Departmanlar"
            />
            <CustomSelect
              label="Pozisyon"
              name="role"
              value={filters.role}
              onChange={onFilterChange}
              options={lookups.pozisyonlar}
              placeholder="Pozisyonlar"
            />
          </div>
        </div>

        {/* GRUP 2: ADAY BİLGİLERİ */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 border-b border-emerald-50 pb-1.5">
            <FontAwesomeIcon
              icon={faAddressCard}
              className="text-emerald-400"
            />
            Aday Profili
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CustomSelect
              label="Cinsiyet"
              name="gender"
              value={filters.gender}
              onChange={onFilterChange}
              options={["Erkek", "Kadın"]}
              placeholder="Cinsiyet"
            />

            <CustomSelect
              label="Eğitim Seviyesi"
              name="education"
              value={filters.education}
              onChange={onFilterChange}
              options={Object.values(EGITIM_SEVIYELERI)}
              placeholder="Seviyeler"
            />

            <div className="sm:col-span-2">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5 mb-1">
                Yaş Aralığı
              </label>
              <div className="flex items-center gap-2">
                <FilterInput
                  label=""
                  name="ageMin"
                  value={filters.ageMin}
                  onChange={onFilterChange}
                  type="number"
                  placeholder="Min (18)"
                />
                <div className="text-slate-300 font-bold">-</div>
                <FilterInput
                  label=""
                  name="ageMax"
                  value={filters.ageMax}
                  onChange={onFilterChange}
                  type="number"
                  placeholder="Maks (45)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* GRUP 3: TARİH */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5 border-b border-amber-50 pb-1.5">
            <FontAwesomeIcon icon={faCalendarDay} className="text-amber-400" />
            Başvuru Tarihi
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <FilterInput
              label="Başlangıç"
              name="startDate"
              value={filters.startDate}
              onChange={onFilterChange}
              type="date"
            />
            <FilterInput
              label="Bitiş"
              name="endDate"
              value={filters.endDate}
              onChange={onFilterChange}
              type="date"
            />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
        <button
          onClick={onClear}
          className="w-1/3 py-2.5 bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200 rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-2 shadow-sm"
        >
          <FontAwesomeIcon icon={faEraser} />
          Temizle
        </button>

        <button
          onClick={onApply}
          className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] flex justify-center items-center gap-2"
        >
          <FontAwesomeIcon icon={faSearch} />
          Sonuçları Getir
        </button>
      </div>
    </div>
  );
}
