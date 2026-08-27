import axiosClient from "../api/axiosClient";

export const authService = {
  /**
   * Kullanıcı Giriş İşlemi
   * @param {string} username - Kullanıcı Adı
   * @param {string} password - Şifre
   */
  login: async (username, password, recaptchaToken) => {
    const loginPayload = {
      kullaniciAdi: username,
      kullaniciSifre: password,
      recaptchaToken: recaptchaToken,
    };

    try {
      const response = await axiosClient.post("/Auth/login", loginPayload);
      const apiResponse = response.data;

      // Yanıt başarılıysa ve data içeriği varsa
      if (apiResponse && apiResponse.success && apiResponse.data) {
        const { userInfo } = apiResponse.data;

        // Eski sistemden kalmış JWT varsa temizle.
        // Bundan sonra authentication HttpOnly cookie üzerinden çalışacak.
        localStorage.removeItem("token");

        if (userInfo) {
          sessionStorage.setItem("authUser", JSON.stringify(userInfo));

          if (userInfo.rolAdi) {
            localStorage.setItem("role", userInfo.rolAdi);
          }
        }
      }

      // Login.jsx içindeki 'if (response.success)' kontrolü için tüm apiResponse'u döndürüyoruz
      return apiResponse;
    } catch (error) {
      console.error("AuthService Login Error:", error);
      // Hatanın Login.jsx içindeki catch bloğuna düşmesi için fırlatıyoruz
      throw error;
    }
  },

  /**
   * Çıkış İşlemi
   */
  logout: async () => {
    try {
      // HttpOnly AuthToken cookie'sini backend üzerinden sil.
      await axiosClient.post("/Auth/logout");
    } catch (error) {
      console.error("Logout işlemi sırasında hata oluştu:", error);
    } finally {
      // Frontend'de tutulan sadece arayüz/oturum bilgilerini temizle.
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      sessionStorage.removeItem("authUser");
      sessionStorage.removeItem("authToken");

      window.location.href = "/login";
    }
  },

  /**
   * Şifre Sıfırlama Kodu Gönder
   */
  sendCode: async (eposta, isLoginCheck = false) => {
    const response = await axiosClient.post("/KimlikDogrulama/kod-gonder", {
      Eposta: eposta,
      kayitliKullaniciKontrolu: isLoginCheck,
    });
    return response.data;
  },

  /**
   * Gönderilen Kodu Doğrula
   */
  verifyCode: async (eposta, kod) => {
    const response = await axiosClient.post("/KimlikDogrulama/kod-dogrula", {
      Eposta: eposta,
      Kod: kod,
    });
    return response.data;
  },
};
