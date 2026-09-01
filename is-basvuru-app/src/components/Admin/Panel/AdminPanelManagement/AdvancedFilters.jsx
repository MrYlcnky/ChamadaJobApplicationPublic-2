import React, { useEffect, useRef, useState } from "react";

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

// ========================================================
// STANDART INPUT
// ========================================================

export function FilterInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  ...props
}) {
  const commonClasses = `
    w-full
    appearance-none
    rounded-xl
    border
    border-slate-200
    bg-[#FAFBFC]
    px-3
    py-2.5
    text-xs
    font-semibold
    text-slate-700
    outline-none
    transition-all
    placeholder:text-slate-400

    hover:border-slate-300

    focus:border-[#D6A632]/60
    focus:bg-white
    focus:ring-4
    focus:ring-[#D6A632]/10
  `;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={name}
          className="
            block
            pl-0.5
            text-[9px]
            font-black
            uppercase
            tracking-[0.1em]
            text-slate-500
          "
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

// ========================================================
// CUSTOM SELECT
// ========================================================

function CustomSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Tümü",
}) {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (selectedValue) => {
    onChange({
      target: {
        name,
        value: selectedValue,
      },
    });

    setIsOpen(false);
  };

  const isAll = value === "all" || !value;

  const displayValue = isAll ? `-- TÜM ${placeholder.toUpperCase()} --` : value;

  return (
    <div className="flex w-full flex-col gap-1.5" ref={dropdownRef}>
      {label && (
        <label
          className="
            block
            pl-0.5
            text-[9px]
            font-black
            uppercase
            tracking-[0.1em]
            text-slate-500
          "
        >
          {label}
        </label>
      )}

      <div className="relative">
        {/* SELECT BUTTON */}
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className={`
            flex
            w-full
            items-center
            justify-between
            rounded-xl
            border
            px-3
            py-2.5
            text-left
            text-xs
            font-semibold
            transition-all
            duration-200

            ${
              isOpen
                ? `
                  border-[#D6A632]/60
                  bg-white
                  text-slate-800
                  ring-4
                  ring-[#D6A632]/10
                `
                : `
                  border-slate-200
                  bg-[#FAFBFC]
                  text-slate-700
                  hover:border-slate-300
                  hover:bg-white
                `
            }
          `}
        >
          <span
            className={`
              truncate
              ${isAll ? "text-slate-400" : ""}
            `}
          >
            {displayValue}
          </span>

          <FontAwesomeIcon
            icon={faChevronDown}
            className={`
              ml-3
              shrink-0
              text-[9px]
              transition-all
              duration-200

              ${isOpen ? "rotate-180 text-[#B98618]" : "text-slate-400"}
            `}
          />
        </button>

        {/* DROPDOWN */}
        {isOpen && (
          <div
            className="
              absolute
              left-0
              top-full
              z-[99999]
              mt-1.5
              w-full
              overflow-hidden
              rounded-xl
              border
              border-slate-200/80
              bg-white
              shadow-[0_18px_50px_rgba(15,23,42,0.14)]
              animate-in
              fade-in
              zoom-in-95
              duration-150
            "
          >
            <div
              className="
                max-h-48
                overflow-y-auto
                py-1.5
                custom-scrollbar
              "
            >
              {/* TÜMÜ */}
              <button
                type="button"
                onClick={() => handleSelect("all")}
                className={`
                  flex
                  w-full
                  items-center
                  justify-between
                  px-3
                  py-2
                  text-left
                  text-[11px]
                  font-bold
                  transition-colors

                  ${
                    isAll
                      ? `
                        bg-[#D6A632]/10
                        text-[#9C7316]
                      `
                      : `
                        text-slate-400
                        hover:bg-slate-50
                        hover:text-slate-600
                      `
                  }
                `}
              >
                <span>-- TÜM {placeholder.toUpperCase()} --</span>

                {isAll && (
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-[9px] text-[#B98618]"
                  />
                )}
              </button>

              {/* OPTIONS */}
              {options.map((option, index) => {
                const isSelected = value === option;

                return (
                  <button
                    type="button"
                    key={index}
                    onClick={() => handleSelect(option)}
                    className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      px-3
                      py-2
                      text-left
                      text-[11px]
                      font-semibold
                      transition-colors

                      ${
                        isSelected
                          ? `
                            bg-[#D6A632]/10
                            text-[#9C7316]
                          `
                          : `
                            text-slate-600
                            hover:bg-[#D6A632]/[0.045]
                            hover:text-slate-800
                          `
                      }
                    `}
                  >
                    <span className="truncate pr-2">{option}</span>

                    {isSelected && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-[9px] text-[#B98618]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ========================================================
// ANA COMPONENT
// ========================================================

export default function AdvancedFilters({
  filters,
  lookups,
  onFilterChange,
  onApply,
  onClear,
}) {
  const branchOptions = (lookups.subeler || []).flatMap((sube) => {
    const subeAdi = String(sube);
    const kisaAd = subeAdi.replace(/^Chamada\s+/i, "");

    return [`${kisaAd} Seçenler`, `Sadece ${kisaAd}`];
  });
  return (
    <div
      className="
        w-full
        overflow-hidden
        rounded-[18px]
        bg-white
        shadow-[0_20px_65px_rgba(15,23,42,0.18)]
        ring-1
        ring-black/[0.04]
        animate-in
        fade-in
        slide-in-from-top-2
        duration-200
      "
    >
      {/* Üst ince Chamada vurgusu */}
      <div
        className="
          pointer-events-none
          h-px
          w-full
          bg-gradient-to-r
          from-transparent
          via-[#D6A632]/40
          to-transparent
        "
      />

      {/* CONTENT */}
      <div
        className="
          flex
          max-h-[60vh]
          flex-col
          gap-6
          overflow-y-auto
          p-5
          custom-scrollbar
        "
      >
        {/* =================================================
            GRUP 1
        ================================================= */}
        <FilterSection icon={faBuildingUser} title="Pozisyon & Lokasyon">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CustomSelect
              label="Şube"
              name="branch"
              value={filters.branch}
              onChange={onFilterChange}
              options={branchOptions}
              placeholder="Şube Tercihi"
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
        </FilterSection>

        {/* =================================================
            GRUP 2
        ================================================= */}
        <FilterSection icon={faAddressCard} title="Aday Profili">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

            {/* YAŞ */}
            <div className="sm:col-span-2">
              <label
                className="
                  mb-1.5
                  block
                  pl-0.5
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.1em]
                  text-slate-500
                "
              >
                Yaş Aralığı
              </label>

              <div className="flex items-center gap-2">
                <FilterInput
                  name="ageMin"
                  value={filters.ageMin}
                  onChange={onFilterChange}
                  type="number"
                  placeholder="Min (18)"
                />

                <span className="text-slate-300">—</span>

                <FilterInput
                  name="ageMax"
                  value={filters.ageMax}
                  onChange={onFilterChange}
                  type="number"
                  placeholder="Maks (45)"
                />
              </div>
            </div>
          </div>
        </FilterSection>

        {/* =================================================
            GRUP 3
        ================================================= */}
        <FilterSection icon={faCalendarDay} title="Başvuru Tarihi">
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
        </FilterSection>
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <div
        className="
          flex
          items-center
          gap-3
          bg-[#FAFBFC]
          px-5
          py-4
          shadow-[inset_0_1px_0_#EEF0F3]
        "
      >
        {/* TEMİZLE */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClear();
          }}
          className="
    flex
    w-1/3
    items-center
    justify-center
    gap-2
    rounded-xl
    border
    border-slate-200
    bg-white
    py-2.5
    text-[11px]
    font-bold
    text-rose-500
    transition-all
    hover:border-rose-200
    hover:bg-rose-50
    hover:text-rose-600
    active:scale-[0.98]
  "
        >
          <FontAwesomeIcon icon={faEraser} className="text-[10px]" />

          <span>Temizle</span>
        </button>

        {/* UYGULA */}
        <button
          type="button"
          onClick={onApply}
          className="
            group
            relative
            flex
            w-2/3
            items-center
            justify-center
            gap-2
            overflow-hidden
            rounded-xl
            bg-gradient-to-r
            from-[#B98618]
            via-[#E4B544]
            to-[#B98618]
            py-2.5
            text-[10px]
            font-black
            uppercase
            tracking-[0.1em]
            text-[#171717]
            shadow-[0_8px_24px_rgba(214,166,50,0.18)]
            transition-all

            hover:brightness-105
            hover:shadow-[0_10px_28px_rgba(214,166,50,0.25)]

            active:scale-[0.98]
          "
        >
          {/* Parlama */}
          <span
            className="
              pointer-events-none
              absolute
              inset-y-0
              -left-1/3
              w-1/3
              skew-x-[-20deg]
              bg-white/20
              opacity-0
              blur-md
              transition-all
              duration-700

              group-hover:left-[110%]
              group-hover:opacity-100
            "
          />

          <FontAwesomeIcon icon={faSearch} className="relative text-[10px]" />

          <span className="relative">Sonuçları Getir</span>
        </button>
      </div>
    </div>
  );
}

// ========================================================
// SECTION COMPONENT
// ========================================================

function FilterSection({ icon, title, children }) {
  return (
    <section className="space-y-3">
      <div
        className="
          flex
          items-center
          gap-2
          border-b
          border-slate-100
          pb-2
        "
      >
        <div
          className="
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-lg
            bg-[#D6A632]/10
            text-[#B98618]
          "
        >
          <FontAwesomeIcon icon={icon} className="text-[10px]" />
        </div>

        <h4
          className="
            text-[9px]
            font-black
            uppercase
            tracking-[0.13em]
            text-slate-600
          "
        >
          {title}
        </h4>
      </div>

      {children}
    </section>
  );
}
