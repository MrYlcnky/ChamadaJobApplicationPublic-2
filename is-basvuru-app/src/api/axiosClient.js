import axios from "axios";
import Swal from "sweetalert2";

const BASE_URL = import.meta.env.VITE_API_BASE_URL_API;

const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// YANIT KONTROLÜ
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";

    const isBasvuruAdayRequest =
      requestUrl.includes("/Personel/basvurumu-getir") ||
      requestUrl.includes("/Personel/Update") ||
      requestUrl.includes("/KimlikDogrulama/kod-gonder") ||
      requestUrl.includes("/KimlikDogrulama/kod-dogrula");

    if (error.response && error.response.status === 401) {
      console.warn("Yetkisiz erişim.");

      // Aday başvuru akışında 401 olursa admin login ekranına atma.
      if (isBasvuruAdayRequest) {
        sessionStorage.removeItem("basvuruToken");
        return Promise.reject(error);
      }

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      sessionStorage.removeItem("authUser");
      sessionStorage.removeItem("authToken");

      Swal.fire({
        icon: "warning",
        title:
          "<span class='font-black text-gray-800'>Oturum Süresi Doldu</span>",
        html: "<span class='text-gray-500 text-sm font-medium'>Güvenliğiniz için tekrar giriş yapmalısınız.</span>",
        confirmButtonText: "Tekrar Giriş Yap",
        confirmButtonColor: "#2563eb",
        background: "#ffffff",
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          popup: "rounded-3xl shadow-2xl border border-gray-100",
          confirmButton:
            "rounded-xl px-6 py-2.5 font-bold uppercase tracking-wide",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/login";
        }
      });
    }

    if (error.response && error.response.status === 403) {
      console.warn("Yetki yok.");

      if (isBasvuruAdayRequest) {
        return Promise.reject(error);
      }

      Swal.fire({
        icon: "error",
        title: "<span class='font-black text-gray-800'>Yetkiniz Yok</span>",
        html: "<span class='text-gray-500 text-sm font-medium'>Bu işlem için gerekli yetkiye sahip değilsiniz.</span>",
        confirmButtonText: "Tamam",
        confirmButtonColor: "#dc2626",
        background: "#ffffff",
        customClass: {
          popup: "rounded-3xl shadow-2xl border border-gray-100",
          confirmButton:
            "rounded-xl px-6 py-2.5 font-bold uppercase tracking-wide",
        },
      });
    }

    if (error.response && error.response.status === 429) {
      console.warn("Çok fazla istek gönderildi. Rate limit aşıldı.");

      Swal.fire({
        icon: "error",
        title: "<span class='font-black text-gray-800'>Güvenlik Kilidi</span>",
        html: "<span class='text-gray-500 text-sm font-medium'>Çok fazla başarısız deneme yaptınız. Sistemin güvenliği için girişiniz geçici olarak durduruldu.<br><br><b>Lütfen 1 dakika sonra tekrar deneyin.</b></span>",
        confirmButtonText: "Anladım",
        confirmButtonColor: "#dc2626",
        background: "#ffffff",
        allowOutsideClick: false,
        customClass: {
          popup: "rounded-3xl shadow-2xl border border-gray-100",
          confirmButton:
            "rounded-xl px-6 py-2.5 font-bold uppercase tracking-wide",
        },
      });
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
