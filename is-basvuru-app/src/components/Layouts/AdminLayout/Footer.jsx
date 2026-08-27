import React from "react";

export default function Footer() {
  return (
    <footer
      className="
        mt-auto
        border-t
        border-white/[0.07]
        bg-[#09090B]/95
        px-4
        py-4
        text-white
        shadow-[0_-8px_30px_rgba(0,0,0,0.16)]
        backdrop-blur-xl
        sm:px-6
        lg:px-8
      "
    >
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-[1600px]
          flex-col
          items-center
          justify-between
          gap-2
          text-center
          sm:flex-row
          sm:text-left
        "
      >
        {/* SOL */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <p className="text-[10px] text-white/30">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-white/55">Chamada Hotels</span>.
            Tüm hakları saklıdır.
          </p>

          <span className="hidden text-white/10 sm:inline">•</span>

          <p className="text-[9px] text-white/25">
            Developed by{" "}
            <a
              href="https://chamadahotels.com/"
              target="_blank"
              rel="noreferrer"
              className="
                font-semibold
                text-white/45
                transition-colors
                hover:text-[#D6A632]
              "
            >
              CHAMADA IT
            </a>
          </p>
        </div>

        {/* SAĞ */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="
              text-[9px]
              font-medium
              text-white/25
              transition-colors
              hover:text-white/60
            "
          >
            Yardım
          </button>

          <span className="h-3 w-px bg-white/[0.08]" />

          <button
            type="button"
            className="
              text-[9px]
              font-medium
              text-white/25
              transition-colors
              hover:text-white/60
            "
          >
            Gizlilik
          </button>

          <span
            className="
              rounded-full
              border
              border-white/[0.08]
              bg-white/[0.04]
              px-2
              py-1
              text-[8px]
              font-semibold
              text-white/30
            "
          >
            v1.0.0
          </span>
        </div>
      </div>
    </footer>
  );
}
