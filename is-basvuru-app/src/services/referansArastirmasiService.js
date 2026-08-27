import axiosClient from "../api/axiosClient"; // Kendi yoluna göre ayarlamayı unutma

const ENDPOINT = "/ReferansArastirmasi";

export const referansArastirmasiService = {
  // 1. Bir adaya (MasterBasvuruId) ait tüm referansları getir (Okuma Yetkisi: İK ve Yöneticiler)
  getByMasterBasvuruId: async (masterBasvuruId) => {
    return await axiosClient.get(
      `${ENDPOINT}/GetByMasterBasvuruId/${masterBasvuruId}`,
    );
  },

  // 2. Tek bir referans kaydının detayını getir (Okuma Yetkisi: İK ve Yöneticiler)
  getById: async (id) => {
    return await axiosClient.get(`${ENDPOINT}/GetById/${id}`);
  },

  // 3. Yeni referans araştırması ekle (Yazma Yetkisi: Sadece İK)
  create: async (data) => {
    return await axiosClient.post(`${ENDPOINT}/Create`, data);
  },

  // 4. Mevcut referans araştırmasını güncelle (Yazma Yetkisi: Sadece İK)
  update: async (data) => {
    return await axiosClient.put(`${ENDPOINT}/Update`, data);
  },

  // 5. Referans araştırmasını sil (Yazma Yetkisi: Sadece İK)
  delete: async (id) => {
    return await axiosClient.delete(`${ENDPOINT}/Delete/${id}`);
  },
};
