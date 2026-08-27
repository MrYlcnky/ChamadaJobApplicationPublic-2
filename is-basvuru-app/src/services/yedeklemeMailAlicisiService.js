import axiosClient from "../api/axiosClient";

export const yedeklemeMailAlicisiService = {
  getAll: async () => {
    const response = await axiosClient.get("/YedeklemeMailAlicisi/GetAll");

    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(
      `/YedeklemeMailAlicisi/GetById/${id}`,
    );

    return response.data;
  },

  create: async (payload) => {
    const response = await axiosClient.post(
      "/YedeklemeMailAlicisi/Create",
      payload,
    );

    return response.data;
  },

  update: async (payload) => {
    const response = await axiosClient.put(
      "/YedeklemeMailAlicisi/Update",
      payload,
    );

    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(
      `/YedeklemeMailAlicisi/Delete/${id}`,
    );

    return response.data;
  },
};
