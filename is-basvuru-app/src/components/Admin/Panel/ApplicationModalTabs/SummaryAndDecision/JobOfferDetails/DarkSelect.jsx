import Select from "react-select";

const darkSelectStyles = {
  container: (base) => ({
    ...base,
    width: "100%",
    fontFamily: "inherit",
  }),

  control: (base, state) => ({
    ...base,

    minHeight: "43px",
    height: "45px",

    backgroundColor: "#111827",
    borderColor: state.isFocused ? "#38bdf8" : "rgba(14, 165, 233, 0.3)",

    borderRadius: "0.5rem",
    boxSizing: "border-box",

    boxShadow: state.isFocused ? "0 0 0 1px #38bdf8" : "none",

    cursor: state.isDisabled ? "not-allowed" : "pointer",

    opacity: state.isDisabled ? 0.55 : 1,
    transition: "all 150ms ease",

    "&:hover": {
      borderColor: state.isDisabled ? "rgba(14, 165, 233, 0.3)" : "#38bdf8",
    },
  }),

  valueContainer: (base) => ({
    ...base,

    height: "41px",
    minHeight: "41px",

    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: "12px",
    paddingRight: "8px",

    display: "flex",
    alignItems: "center",
  }),

  singleValue: (base) => ({
    ...base,

    margin: 0,
    color: "#ffffff",

    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: "1.25rem",
  }),

  placeholder: (base) => ({
    ...base,

    margin: 0,
    color: "#6b7280",

    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: "1.25rem",
  }),

  input: (base) => ({
    ...base,

    margin: 0,
    padding: 0,
    color: "#ffffff",

    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  }),

  indicatorsContainer: (base) => ({
    ...base,

    height: "41px",
    minHeight: "41px",

    display: "flex",
    alignItems: "center",
  }),

  dropdownIndicator: (base, state) => ({
    ...base,

    height: "41px",
    padding: "0 10px",

    display: "flex",
    alignItems: "center",

    color: state.isFocused ? "#38bdf8" : "#38bdf8",

    "& svg": {
      width: "18px",
      height: "18px",
    },

    "&:hover": {
      color: "#38bdf8",
    },
  }),

  clearIndicator: (base) => ({
    ...base,

    height: "41px",
    padding: "0 5px",

    display: "flex",
    alignItems: "center",

    color: "#9ca3af",

    "& svg": {
      width: "15px",
      height: "15px",
    },

    "&:hover": {
      color: "#f87171",
    },
  }),

  indicatorSeparator: () => ({
    display: "none",
  }),

  menu: (base) => ({
    ...base,

    zIndex: 100,
    overflow: "hidden",
    marginTop: "5px",

    backgroundColor: "#111827",
    border: "1px solid #374151",
    borderRadius: "0.5rem",

    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.45)",
  }),

  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),

  menuList: (base) => ({
    ...base,

    padding: "4px",
    maxHeight: "210px",

    scrollbarWidth: "thin",
    scrollbarColor: "#4b5563 #111827",
  }),

  option: (base, state) => ({
    ...base,

    marginBottom: "2px",
    padding: "8px 12px",

    borderRadius: "0.375rem",

    backgroundColor: state.isSelected
      ? "#0369a1"
      : state.isFocused
        ? "#1f2937"
        : "#111827",

    color: state.isSelected ? "#ffffff" : "#d1d5db",

    fontSize: "0.875rem",
    fontWeight: state.isSelected ? 600 : 400,
    lineHeight: "1.25rem",

    cursor: "pointer",
    transition: "background-color 120ms ease",

    "&:active": {
      backgroundColor: "#075985",
    },

    "&:last-child": {
      marginBottom: 0,
    },
  }),

  noOptionsMessage: (base) => ({
    ...base,

    padding: "8px 12px",
    color: "#9ca3af",

    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  }),

  loadingMessage: (base) => ({
    ...base,

    padding: "8px 12px",
    color: "#9ca3af",

    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  }),
};

export default function DarkSelect({
  options = [],
  value = null,
  onChange,
  placeholder = "Seçiniz...",
  isDisabled = false,
  isSearchable = false,
  isClearable = false,
  noOptionsMessage = "Seçenek bulunamadı",
  menuPortalTarget,
  ...props
}) {
  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isSearchable={isSearchable}
      isClearable={isClearable}
      styles={darkSelectStyles}
      menuPortalTarget={
        menuPortalTarget ??
        (typeof document !== "undefined" ? document.body : undefined)
      }
      menuPosition="fixed"
      noOptionsMessage={() => noOptionsMessage}
      {...props}
    />
  );
}
