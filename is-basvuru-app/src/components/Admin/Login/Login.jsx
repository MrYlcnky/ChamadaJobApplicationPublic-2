import React from "react";
import backgroundImage from "../../../assets/Chamada_Hotels.png";
import LoginForm from "./LoginForm";
import hotelsLogo from "../../../assets/hotels.png";

export default function Login() {
  return (
    <main className="relative h-[100dvh] overflow-hidden bg-black">
      {/* =====================================================
          LOGIN ANİMASYONLARI
      ===================================================== */}
      <style>
        {`
          @keyframes loginBackgroundEnter {
            0% {
              opacity: 0;
              transform: scale(1.035);
            }

            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes loginFadeUp {
            0% {
              opacity: 0;
              transform: translateY(18px);
              filter: blur(4px);
            }

            100% {
              opacity: 1;
              transform: translateY(0);
              filter: blur(0);
            }
          }

          @keyframes loginFadeRight {
            0% {
              opacity: 0;
              transform: translateX(28px) scale(0.985);
              filter: blur(4px);
            }

            100% {
              opacity: 1;
              transform: translateX(0) scale(1);
              filter: blur(0);
            }
          }

          @keyframes loginGoldLine {
            0% {
              opacity: 0;
              transform: scaleX(0);
              transform-origin: left;
            }

            100% {
              opacity: 1;
              transform: scaleX(1);
              transform-origin: left;
            }
          }

          @keyframes loginGlowPulse {
            0%,
            100% {
              opacity: 0.45;
              transform: translateY(-50%) scale(0.92);
            }

            50% {
              opacity: 0.75;
              transform: translateY(-50%) scale(1.08);
            }
          }

          @keyframes loginGoldShimmer {
            0% {
              background-position: 200% center;
            }

            100% {
              background-position: -200% center;
            }
          }

          .login-background-enter {
            animation: loginBackgroundEnter 1.2s
              cubic-bezier(0.22, 1, 0.36, 1) both;
          }

          .login-line-enter {
            animation: loginGoldLine 0.9s
              cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
          }

          .login-brand-enter {
            animation: loginFadeUp 0.8s
              cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
          }

          .login-title-one-enter {
            animation: loginFadeUp 0.9s
              cubic-bezier(0.22, 1, 0.36, 1) 0.42s both;
          }

          .login-title-two-enter {
            animation: loginFadeUp 0.9s
              cubic-bezier(0.22, 1, 0.36, 1) 0.52s both;
          }

          .login-description-enter {
            animation: loginFadeUp 0.9s
              cubic-bezier(0.22, 1, 0.36, 1) 0.64s both;
          }

          .login-form-enter {
            animation: loginFadeRight 1s
              cubic-bezier(0.22, 1, 0.36, 1) 0.28s both;
          }

          .login-glow {
            animation: loginGlowPulse 6s ease-in-out infinite;
          }

          .login-gold-text {
            background:
              linear-gradient(
                90deg,
                #B98618 0%,
                #F1C75B 35%,
                #FFF1B4 50%,
                #E5B94B 65%,
                #B98618 100%
              );

            background-size: 220% auto;

            -webkit-background-clip: text;
            background-clip: text;

            color: transparent;

            animation: loginGoldShimmer 8s linear infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .login-background-enter,
            .login-line-enter,
            .login-brand-enter,
            .login-title-one-enter,
            .login-title-two-enter,
            .login-description-enter,
            .login-form-enter,
            .login-glow,
            .login-gold-text {
              animation: none !important;
            }
          }


          @keyframes hotelsLogoRotateY {
  0% {
    transform: perspective(900px) rotateY(0deg);
  }

  40% {
    transform: perspective(900px) rotateY(0deg);
  }

  100% {
    transform: perspective(900px) rotateY(360deg);
  }
}

.hotels-logo-rotate {
  transform-style: preserve-3d;
  backface-visibility: visible;

  animation:
    hotelsLogoRotateY
    7s
    cubic-bezier(0.45, 0, 0.2, 1)
    infinite;
}
        `}
      </style>

      {/* =====================================================
          BACKGROUND
      ===================================================== */}
      <div
        className="
          login-background-enter
          absolute
          inset-0
          bg-cover
          bg-center
          bg-no-repeat
        "
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      />

      {/* Genel karartma */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Sağ panel okunabilirliği */}
      <div
        className="
          absolute
          inset-0
          bg-gradient-to-r
          from-black/20
          via-black/30
          to-black/80
        "
      />

      {/* Alt sinematik gölge */}
      <div
        className="
          absolute
          inset-0
          bg-gradient-to-t
          from-black/75
          via-transparent
          to-black/15
        "
      />

      {/* Sol alt hafif atmosfer */}
      <div
        className="
          pointer-events-none
          absolute
          -bottom-40
          -left-40
          h-[450px]
          w-[450px]
          rounded-full
          bg-black/30
          blur-[140px]
        "
      />

      {/* Sağ altın glow */}
      <div
        className="
          login-glow
          pointer-events-none
          absolute
          -right-40
          top-1/2
          h-[460px]
          w-[460px]
          rounded-full
          bg-[#D6A632]/10
          blur-[150px]
        "
      />

      {/* Çok hafif orta altın ışık */}
      <div
        className="
          pointer-events-none
          absolute
          right-[22%]
          top-[35%]
          h-[220px]
          w-[220px]
          rounded-full
          bg-[#E4B544]/[0.025]
          blur-[100px]
        "
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}
      <div
        className="
          relative
          z-10
          mx-auto
          flex
          h-full
          w-full
          max-w-[1600px]
        "
      >
        {/* =================================================
    SOL TARAF
================================================= */}
        <section
          className="
    hidden
    flex-1
    flex-col
    px-12
    pt-10
    lg:flex
    xl:px-16
    xl:pt-12
  "
        >
          <div className="max-w-xl">
            {/* =================================================
        MARKA
    ================================================= */}
            <div className="flex items-center gap-4">
              <span
                className="
          login-line-enter
          h-px
          w-16
          bg-gradient-to-r
          from-[#B98618]
          via-[#F1C75B]
          to-[#E5B94B]
          shadow-[0_0_14px_rgba(214,166,50,0.45)]
        "
              />

              <span
                className="
          login-brand-enter
          login-gold-text
          text-[16px]
          font-bold
          uppercase
          tracking-[0.28em]
          xl:text-[18px]
        "
              >
                Chamada Hotels
              </span>
            </div>

            {/* =================================================
        BAŞLIK
    ================================================= */}
            <h1
              className="
        mt-7
        text-3xl
        font-semibold
        leading-tight
        tracking-tight
        text-white
        xl:text-4xl
      "
            >
              <span className="login-title-one-enter block">İş Başvuru</span>

              <span
                className="
          login-title-two-enter
          block
          font-light
          text-white/75
        "
              >
                Yönetim Sistemi
              </span>
            </h1>

            {/* =================================================
        AÇIKLAMA
    ================================================= */}
            <p
              className="
        login-description-enter
        mt-4
        max-w-md
        text-xs
        leading-6
        text-white/50
      "
            >
              Chamada Hotels işe alım süreçlerinin güvenli ve merkezi olarak
              yönetildiği yönetici portalı.
            </p>

            {/* =================================================
        ALT DETAY
    ================================================= */}
            <div
              className="
        login-description-enter
        mt-6
        flex
        items-center
        gap-2
      "
            ></div>
          </div>
        </section>

        {/* =================================================
            SAĞ TARAF
        ================================================= */}
        <section
          className="
            flex
            h-full
            w-full
            items-center
            justify-center
            px-4
            py-3
            sm:px-6
            lg:w-[500px]
            lg:px-7
            xl:w-[540px]
          "
        >
          <div className="login-form-enter w-full">
            <LoginForm />
          </div>
        </section>

        {/* =====================================================
    SOL ALT DÖNEN HOTELS LOGOSU
===================================================== */}
        <div
          className="
    pointer-events-none
    absolute
    bottom-4
    left-1
    z-20
    hidden
    lg:block
    xl:bottom-5
    xl:left-1
  "
        >
          <div
            className="
      relative
      flex
      h-[110px]
      w-[110px]
      items-center
      justify-center
    "
          >
            {/* Hafif Altın Atmosfer */}
            <div
              className="
        pointer-events-none
        absolute
        inset-2
        rounded-full
        bg-[#D6A632]/10
        blur-[24px]
      "
            />

            {/* Logo */}
            <img
              src={hotelsLogo}
              alt="Chamada Hotels"
              className="
        hotels-logo-rotate
        relative
        z-10
        h-[96px]
        w-[96px]
        object-contain
        opacity-80
        drop-shadow-[0_10px_24px_rgba(0,0,0,0.50)]
      "
            />
          </div>
        </div>
      </div>
    </main>
  );
}
