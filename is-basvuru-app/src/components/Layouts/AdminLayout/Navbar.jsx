import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faBell,
  faUserCircle,
  faSignOutAlt,
  faKey,
  faClipboardList,
  faUsers,
  faCaretDown,
  faChevronRight,
  faUserShield,
  faTools,
  faBuilding,
  faGlobe,
  faHome,
  faListCheck,
  faTrashCan,
  faBars,
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";

import { authService } from "../../../services/authService";
import { basvuruService } from "../../../services/basvuruService";

import ChangePasswordModal from "./ChangePasswordModal";
import Sidebar from "./Sidebar";

import logo from "../../../assets/ch.ico";

export default function Navbar() {
  const navigate = useNavigate();

  const [auth, setAuth] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogMenuOpen, setIsLogMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isSuperAdminMenuOpen, setIsSuperAdminMenuOpen] = useState(false);

  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);

  const bellRef = useRef(null);
  const userMenuRef = useRef(null);
  const logMenuRef = useRef(null);
  const adminMenuRef = useRef(null);
  const superAdminMenuRef = useRef(null);

  // ========================================================
  // MENÜ KAPATMA
  // ========================================================

  const closeDesktopMenus = () => {
    setIsBellOpen(false);
    setIsUserMenuOpen(false);
    setIsLogMenuOpen(false);
    setIsAdminMenuOpen(false);
    setIsSuperAdminMenuOpen(false);
  };

  const toggleBell = () => {
    const nextValue = !isBellOpen;

    closeDesktopMenus();
    setIsBellOpen(nextValue);
  };

  const toggleUserMenu = () => {
    const nextValue = !isUserMenuOpen;

    closeDesktopMenus();
    setIsUserMenuOpen(nextValue);
  };

  const toggleAdminMenu = () => {
    const nextValue = !isAdminMenuOpen;

    closeDesktopMenus();
    setIsAdminMenuOpen(nextValue);
  };

  const toggleSuperAdminMenu = () => {
    const nextValue = !isSuperAdminMenuOpen;

    closeDesktopMenus();
    setIsSuperAdminMenuOpen(nextValue);
  };

  const toggleLogMenu = () => {
    const nextValue = !isLogMenuOpen;

    closeDesktopMenus();
    setIsLogMenuOpen(nextValue);
  };

  // ========================================================
  // LOGO / ANA SAYFA
  // ========================================================

  const handleGoHome = () => {
    closeDesktopMenus();

    navigate("/admin/panel");
  };

  // ========================================================
  // DROPDOWN DIŞINA TIKLAMA
  // ========================================================

  useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsBellOpen(false);
      }

      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }

      if (logMenuRef.current && !logMenuRef.current.contains(event.target)) {
        setIsLogMenuOpen(false);
      }

      if (
        adminMenuRef.current &&
        !adminMenuRef.current.contains(event.target)
      ) {
        setIsAdminMenuOpen(false);
      }

      if (
        superAdminMenuRef.current &&
        !superAdminMenuRef.current.contains(event.target)
      ) {
        setIsSuperAdminMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ========================================================
  // AUTH
  // ========================================================

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("authUser");

      setAuth(raw ? JSON.parse(raw) : null);
    } catch {
      setAuth(null);
    }
  }, []);

  // ========================================================
  // BİLDİRİMLER
  // ========================================================

  useEffect(() => {
    if (!auth) return;

    const fetchNotifications = async () => {
      try {
        const res = await basvuruService.getNotifications();

        const formatted = (res?.data || []).map((n) => ({
          id: n.basvuruId,
          basvuruId: n.basvuruId,

          ad: `${n.personelAd} ${n.personelSoyad}`,

          tarih: new Date(n.basvuruTarihi).toLocaleDateString("tr-TR"),

          mesaj: "Yeni onay bekleyen başvuru.",
        }));

        setNotifications(formatted);
      } catch (err) {
        console.error("Bildirim alınamadı:", err);
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 60000);

    return () => clearInterval(interval);
  }, [auth]);

  // ========================================================
  // YETKİLER
  // ========================================================

  const roleName = auth?.rolAdi;
  const roleId = auth?.rolId;

  const canViewLogs =
    ["SuperAdmin", "Admin", "IkAdmin"].includes(roleName) ||
    [1, 2, 3].includes(roleId);

  const canManageUsers =
    ["SuperAdmin", "Admin"].includes(roleName) || [1, 2].includes(roleId);

  const isSuperAdmin = roleName === "SuperAdmin" || roleId === 1;

  const displayNotifications = notifications.slice(0, 2);

  const extraCount = notifications.length > 2 ? notifications.length - 2 : 0;

  // ========================================================
  // ORTAK TASARIM
  // ========================================================

  const dropdownBaseStyle = `
    absolute
    right-0
    mt-3
    origin-top-right
    overflow-hidden
    rounded-2xl
    border
    border-white/[0.09]
    bg-[#121216]/97
    shadow-[0_25px_70px_rgba(0,0,0,0.62)]
    backdrop-blur-2xl
    z-50
  `;

  const desktopMenuBase = `
    flex
    items-center
    gap-2
    rounded-xl
    border
    px-3.5
    py-2.5
    text-[13px]
    font-semibold
    whitespace-nowrap
    transition-all
    duration-200
  `;

  const desktopMenuPassive = `
    border-transparent
    text-white/65
    hover:border-white/[0.08]
    hover:bg-white/[0.055]
    hover:text-white
  `;

  const desktopMenuActive = `
    border-[#D6A632]/25
    bg-[#D6A632]/10
    text-[#E8BD50]
    shadow-[0_8px_25px_rgba(214,166,50,0.08)]
  `;

  return (
    <>
      {/* ====================================================
          NAVBAR ÖZEL EFEKTLER
      ==================================================== */}

      <style>
        {`
          @keyframes chamadaNavbarGlow {
            0%,
            100% {
              opacity: 0.45;
              transform: translateX(-50%) scaleX(0.88);
            }

            50% {
              opacity: 0.85;
              transform: translateX(-50%) scaleX(1.08);
            }
          }

          @keyframes chamadaNavbarGlowCore {
            0%,
            100% {
              opacity: 0.35;
            }

            50% {
              opacity: 0.75;
            }
          }

          .chamada-navbar-glow {
            animation:
              chamadaNavbarGlow
              4.5s
              ease-in-out
              infinite;
          }

          .chamada-navbar-glow-core {
            animation:
              chamadaNavbarGlowCore
              4.5s
              ease-in-out
              infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .chamada-navbar-glow,
            .chamada-navbar-glow-core {
              animation: none !important;
            }
          }
        `}
      </style>

      <nav
        className="
          sticky
          top-0
          z-40
          flex
          h-[76px]
          items-center
          border-b
          border-white/[0.07]
          bg-[#09090B]/96
          text-left
          shadow-[0_10px_40px_rgba(0,0,0,0.26)]
          backdrop-blur-xl
        "
      >
        <div
          className="
            mx-auto
            flex
            w-full
            max-w-[1600px]
            items-center
            justify-between
            px-4
            sm:px-6
            lg:px-8
          "
        >
          {/* =================================================
              SOL TARAF
          ================================================= */}

          <div className="flex min-w-0 items-center gap-5 xl:gap-6">
            {/* =================================================
                LOGO / MARKA
            ================================================= */}

            <button
              type="button"
              onClick={handleGoHome}
              title="Ana sayfaya dön"
              aria-label="Chamada ana sayfasına dön"
              className="
                group
                flex
                shrink-0
                cursor-pointer
                items-center
                gap-3
                rounded-xl
                py-1
                pr-1
                text-left
                outline-none
              "
            >
              {/* LOGO */}
              <div
                className="
                  relative
                  flex
                  h-[54px]
                  w-[52px]
                  shrink-0
                  items-start
                  justify-center
                "
              >
                {/* Geniş Glow */}
                <div
                  className="
                    chamada-navbar-glow
                    pointer-events-none
                    absolute
                    bottom-[1px]
                    left-1/2
                    h-[25px]
                    w-[56px]
                    -translate-x-1/2
                    rounded-full
                    bg-[#D6A632]/25
                    blur-[18px]
                  "
                />

                {/* Merkez Glow */}
                <div
                  className="
                    chamada-navbar-glow-core
                    pointer-events-none
                    absolute
                    bottom-[5px]
                    left-1/2
                    h-[12px]
                    w-[38px]
                    -translate-x-1/2
                    rounded-full
                    bg-[#F1C75B]/40
                    blur-[8px]
                  "
                />

                {/* Işık Zemini */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    bottom-[6px]
                    left-1/2
                    h-[3px]
                    w-[40px]
                    -translate-x-1/2
                    rounded-full
                    bg-[#D6A632]/45
                    blur-[3px]
                  "
                />

                {/* İnce Altın Çizgi */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    bottom-[7px]
                    left-1/2
                    h-px
                    w-[43px]
                    -translate-x-1/2
                    bg-gradient-to-r
                    from-transparent
                    via-[#F1C75B]
                    to-transparent
                  "
                />

                <img
                  src={logo}
                  alt="Chamada Hotels"
                  className="
                    relative
                    z-10
                    h-[39px]
                    w-[39px]
                    object-contain
                    drop-shadow-[0_5px_12px_rgba(214,166,50,0.22)]
                    transition-all
                    duration-300
                    group-hover:-translate-y-[1px]
                    group-hover:scale-105
                    group-hover:drop-shadow-[0_7px_16px_rgba(214,166,50,0.34)]
                  "
                />
              </div>

              {/* MARKA YAZILARI */}
              <div className="hidden flex-col xl:flex">
                <span
                  className="
                    text-[12px]
                    font-bold
                    leading-none
                    tracking-[0.16em]
                    text-white
                    transition-colors
                    group-hover:text-[#F0C456]
                  "
                >
                  CHAMADA HOTELS
                </span>

                <span
                  className="
                    mt-1.5
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.13em]
                    text-white/40
                    transition-colors
                    group-hover:text-white/55
                  "
                >
                  İş Başvuru Yönetimi
                </span>
              </div>
            </button>

            {/* Ayırıcı */}
            <div
              className="
                hidden
                h-8
                w-px
                bg-gradient-to-b
                from-transparent
                via-white/[0.10]
                to-transparent
                xl:block
              "
            />

            {/* =================================================
                MASAÜSTÜ MENÜ
            ================================================= */}

            <div className="hidden items-center gap-1 lg:flex">
              {/* ANA SAYFA */}
              <NavLink
                to="/admin/panel"
                end
                onClick={closeDesktopMenus}
                className={({ isActive }) =>
                  `${desktopMenuBase} ${
                    isActive ? desktopMenuActive : desktopMenuPassive
                  }`
                }
              >
                <FontAwesomeIcon icon={faHome} className="text-[12px]" />

                <span>Başvuru Yönetimi</span>
              </NavLink>

              {/* =================================================
                  SUPER ADMIN
              ================================================= */}

              {isSuperAdmin && (
                <div className="relative" ref={superAdminMenuRef}>
                  <button
                    type="button"
                    onClick={toggleSuperAdminMenu}
                    className={`${desktopMenuBase} ${
                      isSuperAdminMenuOpen
                        ? desktopMenuActive
                        : desktopMenuPassive
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={faUserShield}
                      className="text-[12px]"
                    />

                    <span>Süper Admin</span>

                    <FontAwesomeIcon
                      icon={faCaretDown}
                      className={`
                        text-[9px]
                        transition-transform
                        duration-200
                        ${isSuperAdminMenuOpen ? "rotate-180" : ""}
                      `}
                    />
                  </button>

                  {isSuperAdminMenuOpen && (
                    <div className={`${dropdownBaseStyle} w-[310px]`}>
                      <div className="p-2">
                        <DesktopSubLink
                          to="/admin/approval-logs"
                          icon={faListCheck}
                          label="KVKK & IP Logları"
                          sub="Onay geçmişi ve IP kayıtları"
                          onClick={() => setIsSuperAdminMenuOpen(false)}
                        />

                        <DesktopSubLink
                          to="/admin/applications"
                          icon={faTrashCan}
                          label="Başvuruları Yönet"
                          sub="Başvuru kayıtlarını yönetin"
                          onClick={() => setIsSuperAdminMenuOpen(false)}
                        />

                        <DesktopSubLink
                          to="/admin/backups"
                          icon={faDatabase}
                          label="Yedekleme Yönetimi"
                          sub="Sistem yedeklerini ve mail alıcılarını yönet"
                          onClick={() => setIsSuperAdminMenuOpen(false)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* =================================================
                  YÖNETİCİ
              ================================================= */}

              {canManageUsers && (
                <div className="relative" ref={adminMenuRef}>
                  <button
                    type="button"
                    onClick={toggleAdminMenu}
                    className={`${desktopMenuBase} ${
                      isAdminMenuOpen ? desktopMenuActive : desktopMenuPassive
                    }`}
                  >
                    <FontAwesomeIcon icon={faTools} className="text-[12px]" />

                    <span>Yönetici İşlemleri</span>

                    <FontAwesomeIcon
                      icon={faCaretDown}
                      className={`
                        text-[9px]
                        transition-transform
                        duration-200
                        ${isAdminMenuOpen ? "rotate-180" : ""}
                      `}
                    />
                  </button>

                  {isAdminMenuOpen && (
                    <div className={`${dropdownBaseStyle} w-[310px]`}>
                      <div className="p-2">
                        <DesktopSubLink
                          to="/admin/users"
                          icon={faUsers}
                          label="Personel Yönetimi"
                          sub="Yetkili kullanıcıları yönet"
                          onClick={() => setIsAdminMenuOpen(false)}
                        />

                        <DesktopSubLink
                          to="/admin/definitions"
                          icon={faBuilding}
                          label="Şirket Tanımları"
                          sub="Birim ve organizasyon ayarları"
                          onClick={() => setIsAdminMenuOpen(false)}
                        />

                        <DesktopSubLink
                          to="/admin/form-definitions"
                          icon={faGlobe}
                          label="Form Tanımları"
                          sub="Ülke, şehir ve dil ayarları"
                          onClick={() => setIsAdminMenuOpen(false)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* =================================================
                  LOGLAR
              ================================================= */}

              {canViewLogs && (
                <div className="relative" ref={logMenuRef}>
                  <button
                    type="button"
                    onClick={toggleLogMenu}
                    className={`${desktopMenuBase} ${
                      isLogMenuOpen ? desktopMenuActive : desktopMenuPassive
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={faClipboardList}
                      className="text-[12px]"
                    />

                    <span>Loglar</span>

                    <FontAwesomeIcon
                      icon={faCaretDown}
                      className={`
                        text-[9px]
                        transition-transform
                        duration-200
                        ${isLogMenuOpen ? "rotate-180" : ""}
                      `}
                    />
                  </button>

                  {isLogMenuOpen && (
                    <div className={`${dropdownBaseStyle} w-[310px]`}>
                      <div className="p-2">
                        <DesktopSubLink
                          to="/admin/logs"
                          icon={faClipboardList}
                          label="İK İşlem Logları"
                          sub="Başvuru işlem tarihçesi"
                          onClick={() => setIsLogMenuOpen(false)}
                        />

                        <DesktopSubLink
                          to="/admin/user-logs"
                          icon={faUsers}
                          label="Kullanıcı Logları"
                          sub="Sisteme giriş kayıtları"
                          onClick={() => setIsLogMenuOpen(false)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              SAĞ TARAF
          ================================================= */}

          <div className="flex shrink-0 items-center gap-2">
            {/* =================================================
                BİLDİRİMLER
            ================================================= */}

            <div className="relative" ref={bellRef}>
              <button
                type="button"
                onClick={toggleBell}
                aria-label="Bildirimler"
                className={`
                  relative
                  flex
                  h-10
                  w-10
                  cursor-pointer
                  items-center
                  justify-center
                  rounded-xl
                  border
                  transition-all
                  duration-200

                  ${
                    isBellOpen
                      ? "border-[#D6A632]/25 bg-[#D6A632]/10 text-[#E8BD50]"
                      : "border-transparent text-white/55 hover:border-white/[0.08] hover:bg-white/[0.055] hover:text-white"
                  }
                `}
              >
                <FontAwesomeIcon icon={faBell} className="text-[15px]" />

                {notifications.length > 0 && (
                  <span
                    className="
                      absolute
                      -right-1
                      -top-1
                      flex
                      min-h-[18px]
                      min-w-[18px]
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      border-[#09090B]
                      bg-red-500
                      px-1
                      text-[8px]
                      font-black
                      leading-none
                      text-white
                    "
                  >
                    {notifications.length > 99 ? "99+" : notifications.length}
                  </span>
                )}
              </button>

              {isBellOpen && (
                <div
                  className={`
                    ${dropdownBaseStyle}
                    -right-12
                    flex
                    max-h-[65vh]
                    w-[300px]
                    flex-col
                    sm:right-0
                    sm:w-[350px]
                  `}
                >
                  {/* HEADER */}
                  <div
                    className="
                      flex
                      shrink-0
                      items-center
                      justify-between
                      border-b
                      border-white/[0.08]
                      px-4
                      py-3.5
                    "
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Bildirimler
                      </p>

                      <p className="mt-1 text-[9px] text-white/40">
                        Onay bekleyen başvurular
                      </p>
                    </div>

                    <span
                      className="
                        rounded-full
                        border
                        border-red-500/20
                        bg-red-500/10
                        px-2
                        py-1
                        text-[9px]
                        font-bold
                        text-red-400
                      "
                    >
                      {notifications.length} Yeni
                    </span>
                  </div>

                  {/* İÇERİK */}
                  <div className="flex-1 overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div className="p-2">
                        {displayNotifications.map((notification) => (
                          <button
                            type="button"
                            key={notification.id}
                            onClick={() => {
                              navigate(
                                `/admin/panel?openId=${notification.basvuruId}`,
                              );

                              setIsBellOpen(false);
                            }}
                            className="
                                group
                                flex
                                w-full
                                items-center
                                gap-3
                                rounded-xl
                                px-3
                                py-3
                                text-left
                                transition-colors
                                hover:bg-white/[0.055]
                              "
                          >
                            <div
                              className="
                                  flex
                                  h-9
                                  w-9
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-xl
                                  border
                                  border-[#D6A632]/20
                                  bg-[#D6A632]/10
                                  text-[10px]
                                  font-black
                                  text-[#E4B544]
                                "
                            >
                              {notification.ad.substring(0, 2).toUpperCase()}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <span
                                  className="
                                      truncate
                                      text-[12px]
                                      font-semibold
                                      text-white/85
                                      transition-colors
                                      group-hover:text-white
                                    "
                                >
                                  {notification.ad}
                                </span>

                                <span className="shrink-0 text-[8px] text-white/35">
                                  {notification.tarih}
                                </span>
                              </div>

                              <p className="mt-1 truncate text-[10px] text-white/45">
                                {notification.mesaj}
                              </p>
                            </div>
                          </button>
                        ))}

                        {extraCount > 0 && (
                          <div
                            className="
                              mt-1
                              border-t
                              border-white/[0.07]
                              px-3
                              py-3
                              text-center
                              text-[9px]
                              font-bold
                              uppercase
                              tracking-[0.12em]
                              text-white/35
                            "
                          >
                            + {extraCount} diğer bekleyen başvuru
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="px-6 py-10 text-center">
                        <div
                          className="
                            mx-auto
                            mb-3
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-full
                            bg-white/[0.05]
                            text-white/30
                          "
                        >
                          <FontAwesomeIcon icon={faBell} />
                        </div>

                        <p className="text-xs text-white/40">
                          Yeni bildiriminiz bulunmuyor.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* AYIRICI */}
            <div
              className="
                hidden
                h-8
                w-px
                bg-gradient-to-b
                from-transparent
                via-white/[0.10]
                to-transparent
                lg:block
              "
            />

            {/* =================================================
                KULLANICI
            ================================================= */}

            <div className="relative hidden lg:block" ref={userMenuRef}>
              <button
                type="button"
                onClick={toggleUserMenu}
                className={`
                  flex
                  cursor-pointer
                  items-center
                  gap-3
                  rounded-xl
                  border
                  py-1.5
                  pl-1.5
                  pr-3
                  transition-all
                  duration-200

                  ${
                    isUserMenuOpen
                      ? "border-[#D6A632]/25 bg-[#D6A632]/10"
                      : "border-transparent hover:border-white/[0.08] hover:bg-white/[0.055]"
                  }
                `}
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-[#D6A632]/20
                    bg-[#D6A632]/10
                    text-[#E4B544]
                  "
                >
                  <FontAwesomeIcon
                    icon={faUserCircle}
                    className="text-[15px]"
                  />
                </div>

                <div className="flex max-w-[170px] flex-col text-left">
                  <span
                    className="
                      truncate
                      text-[11px]
                      font-semibold
                      leading-none
                      text-white/90
                    "
                  >
                    {auth
                      ? `${auth.adi ?? ""} ${auth.soyadi ?? ""}`
                      : "Kullanıcı"}
                  </span>

                  <span
                    className="
                      mt-1.5
                      truncate
                      text-[8px]
                      font-medium
                      uppercase
                      tracking-[0.08em]
                      text-white/40
                    "
                  >
                    {auth?.masterDepartmanAdi}
                  </span>
                </div>

                <FontAwesomeIcon
                  icon={faCaretDown}
                  className={`
                    text-[8px]
                    text-white/35
                    transition-transform
                    ${isUserMenuOpen ? "rotate-180" : ""}
                  `}
                />
              </button>

              {isUserMenuOpen && (
                <div className={`${dropdownBaseStyle} w-[270px]`}>
                  {/* KULLANICI BİLGİSİ */}
                  <div className="border-b border-white/[0.08] px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-[#D6A632]/20
                          bg-[#D6A632]/10
                          text-[#E4B544]
                        "
                      >
                        <FontAwesomeIcon icon={faUserCircle} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-white">
                          {auth?.adi} {auth?.soyadi}
                        </p>

                        <p className="mt-1 truncate text-[9px] text-white/40">
                          {auth?.masterDepartmanAdi}
                        </p>

                        <p
                          className="
                            mt-1.5
                            inline-flex
                            rounded-full
                            border
                            border-[#D6A632]/20
                            bg-[#D6A632]/10
                            px-2
                            py-0.5
                            text-[8px]
                            font-bold
                            uppercase
                            tracking-[0.08em]
                            text-[#D6A632]
                          "
                        >
                          {auth?.rolAdi}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangePasswordModalOpen(true);

                        setIsUserMenuOpen(false);
                      }}
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-2.5
                        text-[12px]
                        text-white/60
                        transition-all
                        hover:bg-white/[0.055]
                        hover:text-white
                      "
                    >
                      <FontAwesomeIcon
                        icon={faKey}
                        className="
                          w-4
                          text-center
                          text-[#D6A632]/80
                        "
                      />

                      <span>Şifre Değiştir</span>
                    </button>

                    <div className="my-1 h-px bg-white/[0.07]" />

                    <button
                      type="button"
                      onClick={() => authService.logout()}
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-2.5
                        text-[12px]
                        text-red-400
                        transition-all
                        hover:bg-red-500/[0.08]
                        hover:text-red-300
                      "
                    >
                      <FontAwesomeIcon
                        icon={faSignOutAlt}
                        className="w-4 text-center"
                      />

                      <span>Güvenli Çıkış</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* =================================================
                MOBİL
            ================================================= */}

            <button
              type="button"
              onClick={() => {
                closeDesktopMenus();
                setIsSidebarOpen(true);
              }}
              aria-label="Menüyü aç"
              className="
                flex
                h-10
                w-10
                cursor-pointer
                items-center
                justify-center
                rounded-xl
                border
                border-transparent
                text-white/55
                transition-all
                hover:border-white/[0.08]
                hover:bg-white/[0.055]
                hover:text-white
                lg:hidden
              "
            >
              <FontAwesomeIcon icon={faBars} className="text-lg" />
            </button>
          </div>
        </div>
      </nav>

      {/* ====================================================
          MOBILE SIDEBAR
      ==================================================== */}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        auth={auth}
        isSuperAdmin={isSuperAdmin}
        canManageUsers={canManageUsers}
        canViewLogs={canViewLogs}
        onOpenPasswordModal={() => setIsChangePasswordModalOpen(true)}
      />

      {/* ====================================================
          PASSWORD MODAL
      ==================================================== */}

      {isChangePasswordModalOpen && auth && (
        <ChangePasswordModal
          auth={auth}
          onClose={() => setIsChangePasswordModalOpen(false)}
        />
      )}
    </>
  );
}

// ========================================================
// DESKTOP DROPDOWN LINK
// ========================================================

function DesktopSubLink({ to, icon, label, sub, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `
          group
          flex
          items-center
          gap-3
          rounded-xl
          border
          px-3
          py-3
          transition-all
          duration-200

          ${
            isActive
              ? "border-[#D6A632]/20 bg-[#D6A632]/10"
              : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.05]"
          }
        `
      }
    >
      {({ isActive }) => (
        <>
          {/* ICON */}
          <div
            className={`
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              transition-all

              ${
                isActive
                  ? `
                    border-[#D6A632]/25
                    bg-[#D6A632]/15
                    text-[#E4B544]
                  `
                  : `
                    border-white/[0.08]
                    bg-white/[0.05]
                    text-white/45

                    group-hover:border-[#D6A632]/20
                    group-hover:bg-[#D6A632]/10
                    group-hover:text-[#E4B544]
                  `
              }
            `}
          >
            <FontAwesomeIcon icon={icon} className="text-[12px]" />
          </div>

          {/* TEXT */}
          <div className="min-w-0 flex-1 text-left">
            <span
              className={`
                block
                text-[12px]
                font-semibold
                transition-colors

                ${
                  isActive
                    ? "text-[#E4B544]"
                    : "text-white/80 group-hover:text-white"
                }
              `}
            >
              {label}
            </span>

            <span
              className="
                mt-1
                block
                truncate
                text-[9px]
                leading-4
                text-white/40
              "
            >
              {sub}
            </span>
          </div>

          {/* CHEVRON */}
          <FontAwesomeIcon
            icon={faChevronRight}
            className={`
              text-[8px]
              transition-all

              ${
                isActive
                  ? "text-[#D6A632]"
                  : `
                    text-white/20
                    group-hover:translate-x-0.5
                    group-hover:text-white/40
                  `
              }
            `}
          />
        </>
      )}
    </NavLink>
  );
}
