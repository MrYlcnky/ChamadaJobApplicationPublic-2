import axiosClient from "../api/axiosClient";

export const gorevAtamaService = {
  // Atama Detaylarını Getir
  getByPersonelId: (personelId) =>
    axiosClient.get(`/GorevAtamaDetay/GetByPersonelId/${personelId}`),

  getByMasterBasvuruId: (masterBasvuruId) =>
    axiosClient.get(`/GorevAtamaDetay/GetByMasterBasvuruId/${masterBasvuruId}`),

  create: (data) =>
    axiosClient.post(
      "/GorevAtamaDetay/Create",
      normalizeGorevAtamaPayload(data),
    ),

  update: (data) =>
    axiosClient.put(
      "/GorevAtamaDetay/Update",
      normalizeGorevAtamaPayload(data),
    ),

  // Select'leri doldurmak için gerekli Lookup (Master) veriler
  getMasterDepartmanlar: () => axiosClient.get("/MasterDepartman/GetAll"),

  getMasterGorevler: () => axiosClient.get("/MasterGorev/GetAll"),

  getGorevlerByMasterId: (masterGorevId) =>
    axiosClient.get(`/Gorev/GetByMasterGorevId/${masterGorevId}`),

  // Departman ID'sine göre o departmanın görevlerini getirir
  getGorevlerByDepartmanId: (masterDepartmanId) =>
    axiosClient.get(`/Gorev/GetByMasterDepartmanId/${masterDepartmanId}`),
};

const toNullableNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
};

const normalizeGorevAtamaPayload = (data) => ({
  ...data,

  pozisyonButcesiVarMi:
    data.pozisyonButcesiVarMi === "" ? null : data.pozisyonButcesiVarMi,

  aktifCalisanPersonel: toNullableNumber(data.aktifCalisanPersonel),

  pozisyondaCalismasiGerekenPersonelSayisi: toNullableNumber(
    data.pozisyondaCalismasiGerekenPersonelSayisi,
  ),

  totalPozisyonButcesi:
    data.pozisyonButcesiVarMi === true
      ? toNullableNumber(data.totalPozisyonButcesi)
      : null,

  calismaIzinBelgeTuruId: toNullableNumber(data.calismaIzinBelgeTuruId),
});
