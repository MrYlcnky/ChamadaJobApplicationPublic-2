import axiosClient from "../api/axiosClient";

export const yedeklemeService = {
  getAll: async () => {
    const response = await axiosClient.get("/Yedekleme/GetAll");

    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/Yedekleme/GetById/${id}`);

    return response.data;
  },

  getSonBasarili: async () => {
    const response = await axiosClient.get("/Yedekleme/GetSonBasarili");

    return response.data;
  },

  olustur: async () => {
    const response = await axiosClient.post("/Yedekleme/Olustur");

    return response.data;
  },
};
