import React, { useState } from "react";
import { NavLink } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faXmark,
  faHome,
  faUserShield,
  faTools,
  faClipboardList,
  faChevronDown,
  faSignOutAlt,
  faKey,
  faUsers,
  faBuilding,
  faGlobe,
  faListCheck,
  faTrashCan,
  faUserCircle,
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";

import { authService } from "../../../services/authService";

import logo from "../../../assets/ch.ico";

export default function Sidebar({
  isOpen,
  onClose,
  auth,
  isSuperAdmin,
  canManageUsers,
  canViewLogs,
  onOpenPasswordModal,
}) {
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const toggleSubMenu = (menu) => {
    setOpenSubMenu((current) => (current === menu ? null : menu));
  };

  const menuLinkClass = ({ isActive }) =>
    `
      relative
      flex
      items-center
      gap-3
      rounded-xl
      border
      px-4
      py-3
      text-sm
      transition-all
      duration-200
      ${
        isActive
          ? "border-[#D6A632]/15 bg-[#D6A632]/10 text-[#E4B544]"
          : "border-transparent text-white/40 hover:border-white/[0.05] hover:bg-white/[0.04] hover:text-white"
      }
    `;

  const parentMenuClass = (isOpenMenu) =>
    `
      flex
      w-full
      items-center
      justify-between
      rounded-xl
      border
      px-4
      py-3
      transition-all
      duration-200
      ${
        isOpenMenu
          ? "border-[#D6A632]/15 bg-[#D6A632]/10 text-[#E4B544]"
          : "border-transparent text-white/40 hover:border-white/[0.05] hover:bg-white/[0.04] hover:text-white"
      }
    `;

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className={`
          fixed
          inset-0
          z-[100]
          bg-black/75
          backdrop-blur-sm
          transition-all
          duration-300
          lg:hidden
          ${isOpen ? "visible opacity-100" : "invisible opacity-0"}
        `}
      />

      {/* DRAWER */}
      <aside
        className={`
          fixed
          bottom-0
          left-0
          top-0
          z-[101]
          flex
          w-[290px]
          flex-col
          border-r
          border-white/[0.07]
          bg-[#09090B]
          shadow-[25px_0_80px_rgba(0,0,0,0.50)]
          transition-transform
          duration-300
          ease-out
          lg:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* MARKA */}
        <div
          className="
            flex
            min-h-[72px]
            items-center
            justify-between
            border-b
            border-white/[0.07]
            px-5
          "
        >
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <div
                className="
                  pointer-events-none
                  absolute
                  h-10
                  w-10
                  rounded-full
                  bg-[#D6A632]/15
                  blur-xl
                "
              />

              <img
                src={logo}
                alt="Chamada Hotels"
                className="relative z-10 h-9 w-9 object-contain"
              />
            </div>

            <div className="flex flex-col">
              <span
                className="
                  text-[11px]
                  font-bold
                  leading-none
                  tracking-[0.16em]
                  text-white
                "
              >
                CHAMADA
              </span>

              <span
                className="
                  mt-1
                  text-[8px]
                  uppercase
                  tracking-[0.1em]
                  text-white/25
                "
              >
                İş Başvuru Yönetimi
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Menüyü kapat"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-white/30
              transition-all
              hover:bg-white/[0.05]
              hover:text-white
            "
          >
            <FontAwesomeIcon icon={faXmark} className="text-lg" />
          </button>
        </div>

        {/* KULLANICI */}
        <div className="border-b border-white/[0.06] px-5 py-4">
          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-white/[0.06]
              bg-white/[0.025]
              p-3
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-[#D6A632]/20
                bg-[#D6A632]/10
                text-[#E4B544]
              "
            >
              <FontAwesomeIcon icon={faUserCircle} className="text-lg" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-white/85">
                {auth?.adi} {auth?.soyadi}
              </p>

              <p className="mt-1 truncate text-[9px] uppercase tracking-[0.08em] text-white/25">
                {auth?.masterDepartmanAdi || "—"}
              </p>

              <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.08em] text-[#D6A632]/80">
                {auth?.rolAdi}
              </p>
            </div>
          </div>
        </div>

        {/* MENÜ */}
        <div
          className="
            flex-1
            space-y-5
            overflow-y-auto
            px-4
            py-5
          "
        >
          {/* ANA MENÜ */}
          <div>
            <MenuSectionTitle>ANA MENÜ</MenuSectionTitle>

            <NavLink
              to="/admin/panel"
              end
              onClick={onClose}
              className={menuLinkClass}
            >
              <FontAwesomeIcon
                icon={faHome}
                className="w-5 text-center text-[13px]"
              />

              <span className="flex-1 text-left text-[12px] font-medium">
                Başvuru Yönetimi
              </span>
            </NavLink>
          </div>

          {/* SUPER ADMIN */}
          {isSuperAdmin && (
            <div>
              <MenuSectionTitle>SÜPER ADMIN</MenuSectionTitle>

              <button
                type="button"
                onClick={() => toggleSubMenu("super")}
                className={parentMenuClass(openSubMenu === "super")}
              >
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon
                    icon={faUserShield}
                    className="w-5 text-center text-[13px]"
                  />

                  <span className="text-[12px] font-medium">
                    Sistem Yönetimi
                  </span>
                </div>

                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`
                    text-[9px]
                    transition-transform
                    duration-200
                    ${openSubMenu === "super" ? "rotate-180" : ""}
                  `}
                />
              </button>

              {openSubMenu === "super" && (
                <div
                  className="
                    ml-5
                    mt-1
                    space-y-1
                    border-l
                    border-[#D6A632]/15
                    pl-3
                  "
                >
                  <SidebarSubLink
                    to="/admin/approval-logs"
                    icon={faListCheck}
                    label="KVKK & IP Logları"
                    onClick={onClose}
                  />

                  <SidebarSubLink
                    to="/admin/applications"
                    icon={faTrashCan}
                    label="Başvuruları Yönet"
                    onClick={onClose}
                  />

                  <SidebarSubLink
                    to="/admin/backups"
                    icon={faDatabase}
                    label="Yedekleme Yönetimi"
                    onClick={onClose}
                  />
                </div>
              )}
            </div>
          )}

          {/* YÖNETİCİ */}
          {canManageUsers && (
            <div>
              <MenuSectionTitle>YÖNETİM</MenuSectionTitle>

              <button
                type="button"
                onClick={() => toggleSubMenu("admin")}
                className={parentMenuClass(openSubMenu === "admin")}
              >
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon
                    icon={faTools}
                    className="w-5 text-center text-[13px]"
                  />

                  <span className="text-[12px] font-medium">
                    Yönetici İşlemleri
                  </span>
                </div>

                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`
                    text-[9px]
                    transition-transform
                    duration-200
                    ${openSubMenu === "admin" ? "rotate-180" : ""}
                  `}
                />
              </button>

              {openSubMenu === "admin" && (
                <div
                  className="
                    ml-5
                    mt-1
                    space-y-1
                    border-l
                    border-[#D6A632]/15
                    pl-3
                  "
                >
                  <SidebarSubLink
                    to="/admin/users"
                    icon={faUsers}
                    label="Personel Yönetimi"
                    onClick={onClose}
                  />

                  <SidebarSubLink
                    to="/admin/definitions"
                    icon={faBuilding}
                    label="Şirket Tanımları"
                    onClick={onClose}
                  />

                  <SidebarSubLink
                    to="/admin/form-definitions"
                    icon={faGlobe}
                    label="Form Tanımları"
                    onClick={onClose}
                  />
                </div>
              )}
            </div>
          )}

          {/* LOGLAR */}
          {canViewLogs && (
            <div>
              <MenuSectionTitle>LOGLAR</MenuSectionTitle>

              <button
                type="button"
                onClick={() => toggleSubMenu("log")}
                className={parentMenuClass(openSubMenu === "log")}
              >
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon
                    icon={faClipboardList}
                    className="w-5 text-center text-[13px]"
                  />

                  <span className="text-[12px] font-medium">Log Yönetimi</span>
                </div>

                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`
                    text-[9px]
                    transition-transform
                    duration-200
                    ${openSubMenu === "log" ? "rotate-180" : ""}
                  `}
                />
              </button>

              {openSubMenu === "log" && (
                <div
                  className="
                    ml-5
                    mt-1
                    space-y-1
                    border-l
                    border-[#D6A632]/15
                    pl-3
                  "
                >
                  <SidebarSubLink
                    to="/admin/logs"
                    icon={faClipboardList}
                    label="İK İşlem Logları"
                    onClick={onClose}
                  />

                  <SidebarSubLink
                    to="/admin/user-logs"
                    icon={faUsers}
                    label="Kullanıcı Logları"
                    onClick={onClose}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ALT İŞLEMLER */}
        <div
          className="
            border-t
            border-white/[0.07]
            bg-black/10
            p-4
          "
        >
          <button
            type="button"
            onClick={() => {
              onOpenPasswordModal();
              onClose();
            }}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-[12px]
              font-medium
              text-white/40
              transition-all
              hover:bg-white/[0.045]
              hover:text-white
            "
          >
            <FontAwesomeIcon
              icon={faKey}
              className="w-5 text-center text-[#D6A632]/70"
            />

            <span>Şifre Değiştir</span>
          </button>

          <button
            type="button"
            onClick={() => {
              authService.logout();
              onClose();
            }}
            className="
              mt-1
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-[12px]
              font-semibold
              text-red-400
              transition-all
              hover:bg-red-500/[0.08]
              hover:text-red-300
            "
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="w-5 text-center" />

            <span>Güvenli Çıkış</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ========================================================
// SECTION TITLE
// ========================================================

function MenuSectionTitle({ children }) {
  return (
    <p
      className="
        mb-2
        ml-3
        text-[8px]
        font-bold
        uppercase
        tracking-[0.18em]
        text-white/20
      "
    >
      {children}
    </p>
  );
}

// ========================================================
// SUB LINK
// ========================================================

function SidebarSubLink({ to, icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `
          flex
          items-center
          gap-3
          rounded-lg
          px-3
          py-2.5
          text-[11px]
          font-medium
          transition-all
          duration-200
          ${
            isActive
              ? "bg-[#D6A632]/10 text-[#E4B544]"
              : "text-white/30 hover:bg-white/[0.035] hover:text-white/70"
          }
        `
      }
    >
      <FontAwesomeIcon icon={icon} className="w-4 text-center text-[10px]" />

      <span className="text-left">{label}</span>
    </NavLink>
  );
}
