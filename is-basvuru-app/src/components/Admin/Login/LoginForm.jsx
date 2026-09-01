import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faEye,
  faEyeSlash,
  faLock,
  faRightToBracket,
  faShieldHalved,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

import { authService } from "../../../services/authService";
import chIcon from "../../../assets/ch.ico";

export default function LoginForm() {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      setError("Kullanıcı adı ve şifre alanları boş bırakılamaz.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      if (!recaptchaRef.current) {
        throw new Error("reCAPTCHA başlatılamadı.");
      }

      const recaptchaToken = await recaptchaRef.current.executeAsync();

      if (!recaptchaToken) {
        setError("Güvenlik doğrulaması gerçekleştirilemedi.");
        return;
      }

      const response = await authService.login(
        username.trim(),
        password,
        recaptchaToken,
      );

      if (response?.success) {
        const { userInfo } = response.data;

        toast.success(`Hoşgeldiniz, ${userInfo.adi} ${userInfo.soyadi}`);

        navigate("/admin/panel");
        return;
      }

      const failMessage =
        response?.message || "Giriş başarısız. Bilgilerinizi kontrol edin.";

      setError(failMessage);
      toast.error(failMessage);
    } catch (err) {
      console.error("Login hatası:", err);

      if (err.response?.status === 429) {
        const rateLimitMessage =
          "Çok fazla giriş denemesi yaptınız. Lütfen 1 dakika bekledikten sonra tekrar deneyin.";

        setError(rateLimitMessage);
        return;
      }

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Sunucu hatası. Lütfen internet bağlantınızı kontrol edin.";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      recaptchaRef.current?.reset();
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[405px]">
      <style>
        {`
          .grecaptcha-badge {
            visibility: hidden !important;
          }

          /* =====================================================
             TEMEL GİRİŞ ANİMASYONLARI
          ===================================================== */

          @keyframes loginFormFadeUp {
            0% {
              opacity: 0;
              transform: translateY(14px);
              filter: blur(3px);
            }

            100% {
              opacity: 1;
              transform: translateY(0);
              filter: blur(0);
            }
          }

          @keyframes loginFormLogoEnter {
            0% {
              opacity: 0;
              transform: translateY(-10px) scale(0.92);
              filter: blur(5px);
            }

            70% {
              opacity: 1;
              transform: translateY(1px) scale(1.025);
              filter: blur(0);
            }

            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0);
            }
          }

          @keyframes loginFormFieldEnter {
            0% {
              opacity: 0;
              transform: translateX(12px);
              filter: blur(3px);
            }

            100% {
              opacity: 1;
              transform: translateX(0);
              filter: blur(0);
            }
          }

          @keyframes loginFormButtonEnter {
            0% {
              opacity: 0;
              transform: translateY(12px) scale(0.97);
            }

            70% {
              opacity: 1;
              transform: translateY(-1px) scale(1.01);
            }

            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          /* =====================================================
             LOGO GLOW
          ===================================================== */

          @keyframes loginLogoGlowPulse {
            0%,
            100% {
              opacity: 0.45;
              scale: 0.92;
            }

            50% {
              opacity: 0.85;
              scale: 1.08;
            }
          }

          @keyframes loginLogoCorePulse {
            0%,
            100% {
              opacity: 0.4;
              scale: 0.94;
            }

            50% {
              opacity: 0.8;
              scale: 1.06;
            }
          }

          /* =====================================================
             GÜVENLİK İKONU
          ===================================================== */

          @keyframes loginShieldPulse {
            0%,
            100% {
              opacity: 0.75;
              transform: scale(1);
            }

            50% {
              opacity: 1;
              transform: scale(1.12);
            }
          }

          /* =====================================================
             HATA
          ===================================================== */

          @keyframes loginErrorEnter {
            0% {
              opacity: 0;
              transform: translateY(-5px) scale(0.985);
            }

            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          /* =====================================================
             ÜST ALTIN ÇİZGİ
          ===================================================== */

          @keyframes loginTopLine {
            0% {
              opacity: 0;
              transform: scaleX(0);
            }

            100% {
              opacity: 1;
              transform: scaleX(1);
            }
          }

          /* =====================================================
             STAGGER
          ===================================================== */

          .login-form-top-line {
            transform-origin: center;

            animation:
              loginTopLine
              0.9s
              cubic-bezier(0.22, 1, 0.36, 1)
              0.42s
              both;
          }

          .login-form-logo-enter {
            animation:
              loginFormLogoEnter
              0.9s
              cubic-bezier(0.22, 1, 0.36, 1)
              0.48s
              both;
          }

          .login-form-title-enter {
            animation:
              loginFormFadeUp
              0.75s
              cubic-bezier(0.22, 1, 0.36, 1)
              0.66s
              both;
          }

          .login-form-description-enter {
            animation:
              loginFormFadeUp
              0.75s
              cubic-bezier(0.22, 1, 0.36, 1)
              0.76s
              both;
          }

          .login-form-field-one {
            animation:
              loginFormFieldEnter
              0.75s
              cubic-bezier(0.22, 1, 0.36, 1)
              0.88s
              both;
          }

          .login-form-field-two {
            animation:
              loginFormFieldEnter
              0.75s
              cubic-bezier(0.22, 1, 0.36, 1)
              0.98s
              both;
          }

          .login-form-security-enter {
            animation:
              loginFormFadeUp
              0.7s
              cubic-bezier(0.22, 1, 0.36, 1)
              1.08s
              both;
          }

          .login-form-button-enter {
            animation:
              loginFormButtonEnter
              0.8s
              cubic-bezier(0.22, 1, 0.36, 1)
              1.16s
              both;
          }

          .login-form-recaptcha-enter {
            animation:
              loginFormFadeUp
              0.7s
              cubic-bezier(0.22, 1, 0.36, 1)
              1.28s
              both;
          }

          .login-form-footer-enter {
            animation:
              loginFormFadeUp
              0.7s
              cubic-bezier(0.22, 1, 0.36, 1)
              1.38s
              both;
          }

          .login-logo-glow {
            animation:
              loginLogoGlowPulse
              5s
              ease-in-out
              infinite;
          }

          .login-logo-core {
            animation:
              loginLogoCorePulse
              4s
              ease-in-out
              infinite;
          }

          .login-shield-pulse {
            animation:
              loginShieldPulse
              3s
              ease-in-out
              infinite;
          }

          .login-error-enter {
            animation:
              loginErrorEnter
              0.3s
              cubic-bezier(0.22, 1, 0.36, 1)
              both;
          }

input:-webkit-autofill,
input:-webkit-autofill:hover, 
input:-webkit-autofill:focus, 
input:-webkit-autofill:active {
    -webkit-text-fill-color: #ffffff !important;
    transition: background-color 5000s ease-in-out 0s !important;
}


          /* =====================================================
             ERİŞİLEBİLİRLİK
          ===================================================== */

          @media (prefers-reduced-motion: reduce) {
            .login-form-top-line,
            .login-form-logo-enter,
            .login-form-title-enter,
            .login-form-description-enter,
            .login-form-field-one,
            .login-form-field-two,
            .login-form-security-enter,
            .login-form-button-enter,
            .login-form-recaptcha-enter,
            .login-form-footer-enter,
            .login-logo-glow,
            .login-logo-core,
            .login-shield-pulse,
            .login-error-enter {
              animation: none !important;
            }
          }
        `}
      </style>

      <form
        onSubmit={handleLogin}
        className="
          relative
          overflow-hidden
          rounded-[24px]
          border
          border-white/[0.09]
          bg-[#09090B]/78
          p-5
          shadow-[0_30px_80px_rgba(0,0,0,0.60)]
          backdrop-blur-2xl
          sm:p-6
        "
      >
        {/* =====================================================
            ÜST ALTIN ÇİZGİ
        ===================================================== */}

        <div
          className="
            login-form-top-line
            pointer-events-none
            absolute
            left-0
            top-0
            z-20
            h-[1.5px]
            w-full
            bg-gradient-to-r
            from-[#9F7415]/70
            via-[#F1C75B]
            to-[#9F7415]/70
            shadow-[0_0_12px_rgba(214,166,50,0.28)]
          "
        />

        {/* =====================================================
            LOGO
        ===================================================== */}

        <div className="relative mb-5 text-center">
          <div
            className="
              login-form-logo-enter
              relative
              mx-auto
              flex
              h-[76px]
              w-[115px]
              items-start
              justify-center
            "
          >
            <div
              className="
                relative
                flex
                h-[58px]
                w-[58px]
                items-center
                justify-center
              "
            >
              {/* Geniş Glow */}
              <div
                className="
                  login-logo-glow
                  pointer-events-none
                  absolute
                  -inset-[18px]
                  rounded-full
                  bg-[#D6A632]/20
                  blur-[24px]
                "
              />

              {/* Orta Glow */}
              <div
                className="
                  login-logo-core
                  pointer-events-none
                  absolute
                  -inset-[7px]
                  rounded-full
                  bg-[#E7B84C]/28
                  blur-[14px]
                "
              />

              {/* Merkez Parlama */}
              <div
                className="
                  login-logo-core
                  pointer-events-none
                  absolute
                  inset-[6px]
                  rounded-full
                  bg-[#FFF0A6]/20
                  blur-[9px]
                "
              />

              {/* Chamada Icon */}
              <img
                src={chIcon}
                alt="Chamada Hotels"
                className="
                  relative
                  z-10
                  h-[58px]
                  w-[58px]
                  object-contain
                  drop-shadow-[0_0_12px_rgba(214,166,50,0.30)]
                "
              />
            </div>
          </div>

          {/* Başlık */}
          <h1
            className="
              login-form-title-enter
              text-[23px]
              font-semibold
              tracking-tight
              text-white
            "
          >
            Yönetici Girişi
          </h1>

          <p
            className="
              login-form-description-enter
              mt-1.5
              text-[11px]
              leading-5
              text-white/40
            "
          >
            Yönetim paneline erişmek için bilgilerinizi giriniz.
          </p>
        </div>

        <div className="space-y-3.5">
          {/* =================================================
              KULLANICI ADI
          ================================================= */}

          <div className="login-form-field-one">
            <label
              htmlFor="username"
              className="
                mb-1.5
                ml-1
                block
                text-[9px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-white/40
              "
            >
              Kullanıcı Adı
            </label>

            <div className="group relative">
              <FontAwesomeIcon
                icon={faUser}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-[11px]
                  text-white/25
                  transition-colors
                  group-focus-within:text-[#E1B044]
                "
              />

              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="Kullanıcı adınızı giriniz"
                autoComplete="username"
                autoFocus
                className="
                [color-scheme:dark]
                  block
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.045]
                  py-3
                  pl-11
                  pr-4
                  text-[13px]
                  font-medium
                  text-white
                  outline-none
                  transition-all
                  placeholder:text-white/20
                  hover:border-white/15
                  focus:border-[#D6A632]/70
                  focus:bg-white/[0.06]
                  focus:ring-4
                  focus:ring-[#D6A632]/10
                "
              />
            </div>
          </div>

          {/* =================================================
              ŞİFRE
          ================================================= */}

          <div className="login-form-field-two">
            <label
              htmlFor="password"
              className="
                mb-1.5
                ml-1
                block
                text-[9px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-white/40
              "
            >
              Şifre
            </label>

            <div className="group relative">
              <FontAwesomeIcon
                icon={faLock}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-[11px]
                  text-white/25
                  transition-colors
                  group-focus-within:text-[#E1B044]
                "
              />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                className="
                [color-scheme:dark]
                  block
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.045]
                  py-3
                  pl-11
                  pr-12
                  text-[13px]
                  font-medium
                  text-white
                  outline-none
                  transition-all
                  placeholder:text-white/20
                  hover:border-white/15
                  focus:border-[#D6A632]/70
                  focus:bg-white/[0.06]
                  focus:ring-4
                  focus:ring-[#D6A632]/10
                "
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                className="
                  absolute
                  right-0
                  top-0
                  flex
                  h-full
                  w-11
                  cursor-pointer
                  items-center
                  justify-center
                  text-white/30
                  transition-colors
                  hover:text-[#E1B044]
                  focus:outline-none
                "
              >
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  className="text-xs"
                />
              </button>
            </div>
          </div>

          {/* =================================================
              GÜVENLİK BİLGİSİ
          ================================================= */}

          <div
            className="
              login-form-security-enter
              flex
              items-center
              justify-center
              gap-2
              py-1
            "
          >
            <div className="relative flex items-center justify-center">
              <div
                className="
                  login-shield-pulse
                  absolute
                  h-5
                  w-5
                  rounded-full
                  bg-[#D6A632]/20
                  blur-md
                "
              />

              <FontAwesomeIcon
                icon={faShieldHalved}
                className="
                  login-shield-pulse
                  relative
                  text-[10px]
                  text-[#D6A632]
                "
              />
            </div>

            <span
              className="
                text-[8px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-white/25
              "
            >
              Güvenli Giriş Koruması
            </span>
          </div>

          {/* =================================================
              HATA MESAJI
          ================================================= */}

          {error && (
            <div
              aria-live="polite"
              className="
                login-error-enter
                rounded-xl
                border
                border-red-500/20
                bg-red-500/[0.08]
                px-3
                py-2.5
              "
            >
              <p className="text-center text-[11px] font-medium leading-5 text-red-300">
                {error}
              </p>
            </div>
          )}

          {/* =================================================
              GİRİŞ BUTONU
          ================================================= */}

          <button
            type="submit"
            disabled={isLoading}
            className="
              login-form-button-enter
              group
              relative
              flex
              w-full
              cursor-pointer
              items-center
              justify-center
              gap-3
              overflow-hidden
              rounded-xl
              bg-gradient-to-r
              from-[#B98618]
              via-[#E4B544]
              to-[#B98618]
              px-4
              py-3.5
              text-[11px]
              font-black
              uppercase
              tracking-[0.15em]
              text-[#141414]
              shadow-[0_10px_30px_rgba(214,166,50,0.16)]
              transition-all
              duration-300
              hover:-translate-y-[1px]
              hover:brightness-110
              hover:shadow-[0_14px_38px_rgba(214,166,50,0.30)]
              active:translate-y-0
              active:scale-[0.985]
              disabled:cursor-not-allowed
              disabled:opacity-50
              disabled:shadow-none
            "
          >
            {/* Hover Parlama */}
            <span
              className="
                pointer-events-none
                absolute
                inset-y-0
                -left-1/3
                w-1/3
                skew-x-[-20deg]
                bg-white/20
                opacity-0
                blur-md
                transition-all
                duration-700
                group-hover:left-[110%]
                group-hover:opacity-100
              "
            />

            {isLoading ? (
              <>
                <FontAwesomeIcon
                  icon={faCircleNotch}
                  className="animate-spin"
                />

                <span>Giriş Yapılıyor</span>
              </>
            ) : (
              <>
                <span>Giriş Yap</span>

                <FontAwesomeIcon
                  icon={faRightToBracket}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </>
            )}
          </button>

          {/* =================================================
              reCAPTCHA BİLGİLENDİRMESİ
          ================================================= */}

          <div
            className="
              login-form-recaptcha-enter
              px-4
              text-center
            "
          >
            <p className="text-[8px] leading-[14px] text-white/20">
              Bu site reCAPTCHA tarafından korunmaktadır. Google{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="
                  text-white/30
                  underline
                  decoration-white/10
                  underline-offset-2
                  transition-colors
                  hover:text-[#D6A632]
                "
              >
                Gizlilik Politikası
              </a>{" "}
              ve{" "}
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noreferrer"
                className="
                  text-white/30
                  underline
                  decoration-white/10
                  underline-offset-2
                  transition-colors
                  hover:text-[#D6A632]
                "
              >
                Hizmet Şartları
              </a>{" "}
              geçerlidir.
            </p>
          </div>

          {/* =================================================
              INVISIBLE reCAPTCHA
          ================================================= */}

          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY_INVISIBLE}
            size="invisible"
            badge="bottomright"
            hl="tr"
            onExpired={() => {
              recaptchaRef.current?.reset();
            }}
            onErrored={() => {
              setError("Güvenlik doğrulaması yüklenirken bir hata oluştu.");
            }}
          />
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div
          className="
            login-form-footer-enter
            mt-5
            border-t
            border-white/[0.06]
            pt-4
            text-center
          "
        >
          <p className="text-[9px] font-medium text-white/20">
            © {new Date().getFullYear()} Chamada Hotels. Tüm hakları saklıdır.
          </p>

          <p className="mt-1 text-[9px] text-white/20">
            Developed by{" "}
            <a
              href="https://chamadahotels.com/"
              target="_blank"
              rel="noreferrer"
              className="
                font-semibold
                text-white/35
                transition-colors
                hover:text-[#E1B044]
              "
            >
              CHAMADA IT
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
