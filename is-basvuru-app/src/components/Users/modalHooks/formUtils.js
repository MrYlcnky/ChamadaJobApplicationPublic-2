export const isNil = (v) => v === null || v === undefined;

// GANO Düzeltmesi (Virgül -> Nokta ve Float dönüşümü)
// Hem virgülü hem noktayı kabul eder, sayıya çevirir.
export const toFloat = (value) => {
  if (!value) return 0;

  // 1. Eğer değer zaten sayıysa direkt döndür
  if (typeof value === "number") return value;

  // 2. String ise virgülü noktaya çevir (TR klavye desteği)
  const normalizedValue = value.toString().replace(",", ".");

  // 3. Sayıya çevir
  const number = parseFloat(normalizedValue);

  // 4. Eğer sonuç NaN ise (geçersizse) 0 döndür
  return isNaN(number) ? 0 : number;
};

// Dropdown/Select değerini güvenli şekilde sayıya çevirir
// { value: 1, label: '...' } nesnesinden 1'i alır.
export const getSafeValue = (val) => {
  if (isNil(val)) return 0;
  if (typeof val === "object" && val !== null) {
    if ("value" in val) return Number(val.value);
    if ("id" in val) return Number(val.id);
  }
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

// Sadece ID veya Value değerini çeker (Array işlemleri için)
export const pickIdValue = (x) => {
  if (isNil(x)) return null;
  if (typeof x === "object" && x !== null) {
    if (!isNil(x.value)) return x.value;
    if (!isNil(x.id)) return x.id;
  }
  return x;
};

//  Sayıya çevirir, 0 veya geçersizse NULL döner (FK hatası almamak için)
export const toIntOrNull = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const mapArrayToIntList = (arr) => {
  if (!arr || !Array.isArray(arr)) return [];
  return arr
    .flatMap((item) => String(item.value || item).split(",")) // "36,72" => ["36", "72"] yapar
    .map((v) => parseInt(v.trim(), 10)) // Sayıya çevirir
    .filter((n) => !isNaN(n)); // Hatalı olanları süzer
};

// Enum değerini güvenli sayıya çevirir (Varsayılan 0)
export const safeEnum = (val) => {
  if (val === "" || val === null || val === undefined) return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};
//  String ifadeyi güvenli hale getirir (Null check)
export const safeStr = (val) => (val ? String(val) : "");

export const toNumberOrNull = (v) => {
  const OTHER_VALUE = "__OTHER__";
  if (v == null || v === "" || v === OTHER_VALUE) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
export const toStr = (v) => (v == null ? "" : String(v));

export const toSalaryInt = (value) => {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.trunc(value) : 0;
  }

  const onlyDigits = String(value).replace(/[^\d]/g, "");

  if (!onlyDigits) return 0;

  const number = parseInt(onlyDigits, 10);

  return Number.isFinite(number) ? number : 0;
};
