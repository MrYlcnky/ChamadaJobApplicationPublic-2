export const tarihFormatla = (tarih) => {
  if (!tarih) return "-";

  return new Date(tarih).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const boyutFormatla = (byte) => {
  if (byte === null || byte === undefined) {
    return "-";
  }

  if (byte === 0) {
    return "0 MB";
  }

  const mb = byte / 1024 / 1024;

  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }

  return `${mb.toFixed(2)} MB`;
};

export const yedeklemeDurumuMetni = (durum) => {
  switch (Number(durum)) {
    case 1:
      return "Devam Ediyor";

    case 2:
      return "Başarılı";

    case 3:
      return "Başarısız";

    default:
      return "Bilinmiyor";
  }
};

export const tetiklemeTipiMetni = (tip) => {
  switch (Number(tip)) {
    case 1:
      return "Manuel";

    case 2:
      return "Otomatik";

    default:
      return "-";
  }
};
