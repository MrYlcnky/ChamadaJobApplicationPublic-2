import * as React from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import trLocale from "date-fns/locale/tr";
import { isValid, format } from "date-fns";

// Helper: String formatını (YYYY-MM-DD) Date objesine çevirir
function strToDate(str) {
  if (!str) return null;
  const d = new Date(str + "T00:00:00");
  return isValid(d) ? d : null;
}

// Helper: Date objesini String formatına (YYYY-MM-DD) çevirir
function dateToStr(d) {
  if (!d || !isValid(d)) return "";
  return format(d, "yyyy-MM-dd");
}

export default function MuiDateStringField({
  label = "Tarih",
  name = "tarih",
  value,
  onChange,
  required = false,
  error,
  min,
  max,
  disabled = false,
  readOnly = false,
  displayFormat = "dd.MM.yyyy",
  variant = "light", // "light" veya "dark"
}) {
  const isDark = variant === "dark";
  const dateVal = React.useMemo(() => strToDate(value), [value]);

  const handleMuiChange = (date) => {
    // 1. Silme işlemi (Kullanıcı inputu tamamen temizlerse)
    if (date === null) {
      onChange?.({ target: { name, value: "" } });
      return;
    }

    // 2. Geçerli bir tarih girildiyse (Eksik yazımlar 0002 gibi de olsa geçerlidir!)
    if (isValid(date)) {
      // DİKKAT: Burada minDate kontrolü yapıp return ETME!
      // Eğer edersen, kullanıcı "2000" yazarken sistem "0002"yi reddeder
      // ve inputu boşaltıp "gg.aa.yyyy" şekline döndürür.
      onChange?.({ target: { name, value: dateToStr(date) } });
    }

    // 3. Eğer tarih geçersizse (Invalid Date - klavyeden yazarken henüz eksikse)
    // Hiçbir şey yapma (return). MUI kendi iç state'inde tutmaya devam eder.
  };

  return (
    <div className="mt-1">
      <label
        htmlFor={name}
        className={`block text-sm font-bold text-gray-700 ${
          isDark
            ? "text-xs text-sky-400 font-semibold mb-1 uppercase"
            : " text-gray-700"
        }`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <LocalizationProvider
        dateAdapter={AdapterDateFns}
        adapterLocale={trLocale}
      >
        <DatePicker
          value={dateVal}
          onChange={handleMuiChange}
          format={displayFormat}
          minDate={strToDate(min)}
          maxDate={strToDate(max)}
          disabled={disabled}
          disableOpenPicker={disabled}
          reduceAnimations
          disableHighlightToday
          slotProps={{
            textField: {
              color: "inherit",
              id: name,
              name,
              variant: "outlined",
              fullWidth: true,
              size: "small",
              required,
              error: Boolean(error),
              helperText: error || "",

              FormHelperTextProps: {
                sx: {
                  color: "#DC2626",
                  fontWeight: 500,
                  ml: 0,
                },
              },

              disabled,

              inputProps: {
                placeholder: "GG.AA.YYYY",
                readOnly,
                autoComplete: "off",
              },

              sx: {
                /*
                 * Ana kutu
                 */
                "& .MuiOutlinedInput-root, & .MuiInputBase-root, & .MuiPickersInputBase-root":
                  {
                    height: 43,
                    borderRadius: "0.5rem",

                    backgroundColor: isDark
                      ? "#111827 !important"
                      : "#ffffff !important",

                    color: isDark ? "#ffffff !important" : "#111827 !important",

                    alignItems: "center",
                    boxShadow: "none !important",
                    outline: "none !important",
                  },

                /*
                 * Normal sınır
                 */
                "& .MuiOutlinedInput-root fieldset": {
                  borderColor: isDark
                    ? "rgba(14, 165, 233, 0.3) !important"
                    : "#D1D5DB !important",
                },

                /*
                 * Hover sınırı
                 */
                "& .MuiOutlinedInput-root:hover fieldset": {
                  borderColor: isDark
                    ? "#38bdf8 !important"
                    : "#000000 !important",
                },

                /*
                 * Focus sınırı
                 */
                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                  borderColor: isDark
                    ? "#38bdf8 !important"
                    : "#000000 !important",
                },

                /*
                 * Hata durumu
                 */
                "&& .MuiOutlinedInput-root.Mui-error fieldset": {
                  borderColor: isDark
                    ? "rgba(14, 165, 233, 0.3) !important"
                    : "#DC2626 !important",
                },

                /*
                 * Klasik input metni
                 */
                "& .MuiInputBase-input": {
                  paddingTop: 8,
                  paddingBottom: 8,
                  paddingLeft: 12,
                  paddingRight: 36,

                  fontSize: "0.875rem",

                  color: isDark ? "#ffffff !important" : "#111827 !important",

                  WebkitTextFillColor: isDark
                    ? "#ffffff !important"
                    : "#111827 !important",
                },

                /*
                 * Yeni MUI DatePicker sürümlerindeki
                 * seçili tarih bölümünün metni
                 */
                "& .MuiPickersSectionList-root": {
                  color: isDark ? "#ffffff !important" : "#111827 !important",

                  WebkitTextFillColor: isDark
                    ? "#ffffff !important"
                    : "#111827 !important",
                },

                "& .MuiPickersSectionList-sectionContent, & .MuiPickersInputBase-sectionContent":
                  {
                    color: isDark ? "#ffffff !important" : "#111827 !important",

                    WebkitTextFillColor: isDark
                      ? "#ffffff !important"
                      : "#111827 !important",

                    fontSize: "0.875rem",
                    lineHeight: "1.25rem",
                  },

                /*
                 * Tarih metni için genel güvenlik kuralı
                 */
                "& input": {
                  color: isDark ? "#ffffff !important" : "#111827 !important",

                  WebkitTextFillColor: isDark
                    ? "#ffffff !important"
                    : "#111827 !important",
                },

                /*
                 * Disabled klasik input metni
                 */
                "& .MuiInputBase-input.Mui-disabled": {
                  color: isDark ? "#d1d5db !important" : "#4b5563 !important",

                  WebkitTextFillColor: isDark
                    ? "#d1d5db !important"
                    : "#4b5563 !important",

                  opacity: 1,
                },

                /*
                 * Disabled yeni MUI tarih metni
                 */
                "& .Mui-disabled .MuiPickersSectionList-sectionContent, & .Mui-disabled .MuiPickersInputBase-sectionContent":
                  {
                    color: isDark ? "#d1d5db !important" : "#4b5563 !important",

                    WebkitTextFillColor: isDark
                      ? "#d1d5db !important"
                      : "#4b5563 !important",

                    opacity: 1,
                  },

                "& .MuiPickersSectionList-root.Mui-disabled": {
                  color: isDark ? "#d1d5db !important" : "#4b5563 !important",

                  WebkitTextFillColor: isDark
                    ? "#d1d5db !important"
                    : "#4b5563 !important",

                  opacity: 1,
                },

                /*
                 * Disabled kutu
                 */
                "& .MuiOutlinedInput-root.Mui-disabled, & .MuiPickersInputBase-root.Mui-disabled":
                  {
                    backgroundColor: isDark
                      ? "#111827 !important"
                      : "#f3f4f6 !important",

                    color: isDark ? "#d1d5db !important" : "#4b5563 !important",

                    opacity: 1,
                  },

                /*
                 * Disabled sınır
                 */
                "& .MuiOutlinedInput-root.Mui-disabled fieldset": {
                  borderColor: isDark
                    ? "#374151 !important"
                    : "#d1d5db !important",
                },

                /*
                 * Placeholder
                 */
                "& .MuiInputBase-input::placeholder": {
                  color: isDark ? "#6b7280" : "#9CA3AF",
                  WebkitTextFillColor: isDark ? "#6b7280" : "#9CA3AF",
                  opacity: 1,
                },

                "& .MuiPickersSectionList-sectionContent.MuiPickersSectionList-sectionContent-placeholder":
                  {
                    color: isDark ? "#6b7280 !important" : "#9CA3AF !important",

                    WebkitTextFillColor: isDark
                      ? "#6b7280 !important"
                      : "#9CA3AF !important",
                  },

                /*
                 * Takvim ikonu
                 */
                "& .MuiSvgIcon-root": {
                  color: isDark ? "#38bdf8" : "#6B7280",
                },

                "& .Mui-disabled .MuiSvgIcon-root": {
                  color: isDark ? "#6b7280 !important" : "#9ca3af !important",
                },
              },
            },

            popper: {
              placement: "bottom-start",

              sx: {
                zIndex: 10000,

                "& .MuiPaper-root": {
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",

                  color: isDark ? "#ffffff" : "inherit",

                  border: isDark ? "1px solid #374151" : "none",

                  "& .MuiTypography-root, & .MuiButtonBase-root": {
                    color: isDark ? "#ffffff" : "inherit",
                  },

                  "& .MuiPickersDay-root:hover": {
                    backgroundColor: isDark ? "#374151" : undefined,
                  },

                  "& .MuiPickersDay-root.Mui-selected": {
                    backgroundColor: "#0284c7 !important",
                    color: "#ffffff !important",
                  },

                  "& .MuiPickersDay-root.Mui-selected:hover": {
                    backgroundColor: "#0369a1 !important",
                  },

                  "& .MuiPickersDay-root.Mui-disabled": {
                    color: isDark ? "#6b7280 !important" : undefined,
                  },
                },
              },
            },

            desktopPaper: {
              sx: {
                borderRadius: "0.75rem",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.35)",
              },
            },
          }}
        />
      </LocalizationProvider>
    </div>
  );
}
