import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faArrowRight,
  faEye,
  faFlagCheckered,
  faUserTie,
  faRotateLeft,
  faXmark,
  faClock,
  faBan,
  faCalendarAlt,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

export const TableActionsCell = ({
  row,
  isIKGroup,
  auth,
  loadingAction,
  onViewCv,
  onSendToDept,
  onOpenDetail,
}) => {
  const stage = Number(row.original.approvalStage || 1);

  const statusId = Number(
    row.original.statusId || row.original.basvuruDurum || 1,
  );

  const rawSube = auth?.subeId || auth?.SubeId;

  const allowedSubeIds = rawSube
    ? String(rawSube)
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n))
    : [];

  const hasSpecificBranches = allowedSubeIds.length > 0;

  const tamamenReddedildiMi = Boolean(
    row.original.tamamenReddedildiMi ?? false,
  );

  const sevkler = row.original.sevkler || [];

  const appliedBranchIds = row.original.appliedBranchIds || [];

  const hasAppliedToMyBranch = hasSpecificBranches
    ? allowedSubeIds.some((id) => appliedBranchIds.includes(id))
    : true;

  let showSevkButton = false;

  if (isIKGroup) {
    if (hasSpecificBranches) {
      const myBranchSevkler = sevkler.filter((s) =>
        allowedSubeIds.includes(s.subeId),
      );

      const otherBranchActiveSevks = sevkler.filter(
        (s) => !allowedSubeIds.includes(s.subeId) && s.sevkDurumu !== 3,
      );

      if (
        myBranchSevkler.length === 0 &&
        otherBranchActiveSevks.length === 0 &&
        (stage === 1 || statusId === 4)
      ) {
        if (hasAppliedToMyBranch) {
          showSevkButton = true;
        }
      }
    } else {
      const isAlreadySent = sevkler.length > 0;

      showSevkButton = (!isAlreadySent && stage === 1) || statusId === 4;
    }
  }

  if (tamamenReddedildiMi) {
    showSevkButton = false;
  }

  const isCvLoading = loadingAction === `cv-${row.original.id}`;

  const isDetailLoading = loadingAction === `detail-${row.original.id}`;

  const isAnyLoading = Boolean(loadingAction);

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={isAnyLoading}
        onClick={() => onViewCv(row.original)}
        className={`
          p-1.5
          rounded
          border
          shadow-sm
          transition-colors
          ${
            isAnyLoading
              ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300"
              : "cursor-pointer border-red-100 bg-red-50 text-red-500 hover:text-red-700"
          }
        `}
        title={isCvLoading ? "CV yükleniyor..." : "CV Görüntüle / İndir"}
      >
        <FontAwesomeIcon
          icon={isCvLoading ? faSpinner : faFilePdf}
          spin={isCvLoading}
        />
      </button>

      {showSevkButton && (
        <button
          type="button"
          onClick={() => onSendToDept(row.original.id)}
          className="
            px-2
            py-1
            bg-amber-500
            text-white
            text-[9px]
            font-black
            rounded
            hover:bg-amber-600
            flex
            items-center
            gap-1
            transition-all
            uppercase
            shadow-sm
            animate-in
            fade-in
            cursor-pointer
          "
          title="Departmana Sevk Et"
        >
          <FontAwesomeIcon icon={faArrowRight} />
          Sevk
        </button>
      )}

      <button
        type="button"
        disabled={isAnyLoading}
        onClick={() => onOpenDetail(row.original)}
        className={`
          p-1.5
          rounded
          border
          shadow-sm
          transition-colors
          ${
            isAnyLoading
              ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300"
              : "cursor-pointer border-blue-100 bg-blue-50 text-blue-500 hover:text-blue-700"
          }
        `}
        title={isDetailLoading ? "Detay yükleniyor..." : "Detayları Gör"}
      >
        <FontAwesomeIcon
          icon={isDetailLoading ? faSpinner : faEye}
          spin={isDetailLoading}
        />
      </button>
    </div>
  );
};

export const CurrentStageBadge = ({
  stage,
  statusId,
  row,
  auth,
  isIKGroup,
}) => {
  const tamamenReddedildiMi = Boolean(
    row.original.tamamenReddedildiMi ?? false,
  );

  if (tamamenReddedildiMi) {
    return (
      <span className="flex items-center justify-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-black uppercase whitespace-nowrap bg-red-50 text-red-600 border-red-200 shadow-sm">
        <FontAwesomeIcon icon={faBan} />
        REDDEDİLDİ
      </span>
    );
  }

  if (statusId === 5) {
    return (
      <span className="flex items-center justify-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-black uppercase bg-orange-500/10 text-orange-600 border-orange-200">
        <FontAwesomeIcon icon={faRotateLeft} className="animate-spin-slow" />
        REVİZE TALEBİ
      </span>
    );
  }

  const sevkler = row.original.sevkler || [];

  const userRoleId = Number(auth?.rolId || auth?.roleId);
  const rawSube = auth?.subeId || auth?.SubeId;
  const allowedSubeIds = rawSube
    ? String(rawSube)
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n))
    : [];
  const hasSpecificBranches = allowedSubeIds.length > 0;

  const userDeptId =
    Number(
      auth?.masterDepartmanId ||
        auth?.MasterDepartmanId ||
        auth?.departmanId ||
        auth?.DepartmanId,
    ) || null;
  const userAlanId =
    Number(
      auth?.masterAlanId || auth?.MasterAlanId || auth?.alanId || auth?.AlanId,
    ) || null;

  const appliedBranchIds = row.original.appliedBranchIds || [];
  const hasAppliedToMyBranch = hasSpecificBranches
    ? allowedSubeIds.some((id) => appliedBranchIds.includes(id))
    : true;

  if (userRoleId === 6 && hasSpecificBranches && userDeptId) {
    const mySevkler = sevkler.filter((s) => {
      const matchSube = allowedSubeIds.includes(s.subeId);

      const matchDept =
        userDeptId === s.masterDepartmanId || userDeptId === s.departmanId;

      const matchAlan =
        userAlanId && s.masterAlanId && s.masterAlanId !== 0
          ? s.masterAlanId === userAlanId
          : true;

      return matchSube && matchDept && matchAlan;
    });

    if (mySevkler.length > 0) {
      const isAllRejected = mySevkler.every((s) => s.sevkDurumu === 3);
      const isAnyApproved = mySevkler.some((s) => s.sevkDurumu === 2);

      if (isAllRejected)
        return (
          <span className="flex items-center justify-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-black uppercase whitespace-nowrap bg-rose-50 text-rose-600 border-rose-200 shadow-sm">
            <FontAwesomeIcon icon={faXmark} /> TARAFINIZDAN REDDEDİLDİ
          </span>
        );
      if (isAnyApproved && stage === 2)
        return (
          <span className="flex items-center justify-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-black uppercase whitespace-nowrap bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm">
            <FontAwesomeIcon icon={faFlagCheckered} /> TARAFINIZDAN ONAYLANDI
          </span>
        );
    }
  }

  if (isIKGroup) {
    if (hasSpecificBranches) {
      const myBranchSevkler = sevkler.filter((s) =>
        allowedSubeIds.includes(s.subeId),
      );
      const otherBranchActiveSevks = sevkler.filter(
        (s) => !allowedSubeIds.includes(s.subeId) && s.sevkDurumu !== 3,
      );

      if (
        statusId === 4 &&
        myBranchSevkler.length === 0 &&
        hasAppliedToMyBranch
      ) {
        return (
          <span className="flex items-center justify-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-black uppercase whitespace-nowrap bg-red-50 text-red-600 border-red-200 shadow-sm">
            <FontAwesomeIcon icon={faArrowRight} className="animate-pulse" />{" "}
            SİZDEN SEVK BEKLİYOR
          </span>
        );
      }

      if (statusId !== 3 && statusId !== 4) {
        if (otherBranchActiveSevks.length > 0) {
          const firstOther = otherBranchActiveSevks[0];
          const subeAdi = firstOther.subeAdi || "DİĞER ŞUBE";
          return (
            <span
              className="flex items-center justify-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-black uppercase whitespace-nowrap bg-amber-50 text-amber-600 border-amber-200 shadow-sm"
              title="Adayın diğer şubedeki süreci devam ediyor"
            >
              <FontAwesomeIcon icon={faClock} className="animate-pulse" />{" "}
              {subeAdi} DEĞERLENDİRİYOR
            </span>
          );
        }

        if (myBranchSevkler.length === 0 && stage === 1) {
          if (!hasAppliedToMyBranch) {
            return (
              <span className="flex items-center justify-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-black uppercase whitespace-nowrap bg-gray-100 text-gray-500 border-gray-200 shadow-sm">
                <FontAwesomeIcon icon={faBan} /> FARKLI ŞUBEYE BAŞVURDU
              </span>
            );
          }
          return (
            <span className="flex items-center justify-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-black uppercase whitespace-nowrap bg-red-50 text-red-600 border-red-200 shadow-sm">
              <FontAwesomeIcon icon={faArrowRight} className="animate-pulse" />{" "}
              SİZDEN SEVK BEKLİYOR
            </span>
          );
        }
      }
    } else {
      if (statusId === 4 || (sevkler.length === 0 && stage === 1)) {
        return (
          <span className="flex items-center justify-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-black uppercase whitespace-nowrap bg-red-50 text-red-600 border-red-200 shadow-sm">
            <FontAwesomeIcon icon={faArrowRight} className="animate-pulse" />{" "}
            SİZDEN SEVK BEKLİYOR
          </span>
        );
      }
    }
  }

  if (statusId === 3 || statusId === 4 || stage === 6)
    return (
      <span className="flex items-center justify-center gap-1 text-[10px] text-gray-500 font-bold uppercase">
        <FontAwesomeIcon
          icon={faFlagCheckered}
          className={statusId === 3 ? "text-emerald-500" : "text-rose-500"}
        />{" "}
        {statusId === 3 ? "TAMAMLANDI" : "REDDEDİLDİ"}
      </span>
    );

  const stageMap = {
    1: {
      label: "İK SEVK BEKLİYOR",
      color: "text-sky-700 bg-sky-50 border-sky-200",
    },
    2: {
      label: "DEP. ONAYI BEKLİYOR",
      color: "text-purple-700 bg-purple-50 border-purple-200",
    },
    3: {
      label: "İK SON KONTROL",
      color: "text-indigo-700 bg-indigo-50 border-indigo-200",
    },
    4: {
      label: "GM ONAYI BEKLİYOR",
      color: "text-amber-700 bg-amber-50 border-amber-200",
    },
    5: {
      label: "MİM ONAYI BEKLİYOR",
      color: "text-pink-700 bg-pink-50 border-pink-200",
    },
  };

  const info = stageMap[stage] || {
    label: "BEKLEMEDE",
    color: "text-gray-400 bg-gray-50",
  };

  return (
    <span
      className={`flex items-center justify-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-black uppercase whitespace-nowrap ${info.color}`}
    >
      <FontAwesomeIcon icon={faUserTie} /> {info.label}
    </span>
  );
};

// =================================================================
// 🎯 İŞE BAŞLANGIÇ TARİHİNİ GÖSTEREN HÜCRE BİLEŞENİ
// =================================================================
export const JobStartDateCell = ({ row }) => {
  // 1. Adayın mevcut statüsünü alıyoruz
  const statusId = Number(
    row?.original?.statusId || row?.original?.basvuruDurum || 1,
  );

  const tamamenReddedildiMi = Boolean(
    row.original.tamamenReddedildiMi ?? false,
  );

  const dateStr = row.original.iseBaslamaTarihi || null;

  // 3. KURAL: Sadece "Devam Ediyor" (2) veya "Onaylandı" (3) olanlara tarihi göster
  const isEligibleToShow = statusId === 2 || statusId === 3;

  // Uygun durumda değilse veya tarih boş/geçersizse çizgi basıyoruz
  if (
    tamamenReddedildiMi ||
    !isEligibleToShow ||
    !dateStr ||
    String(dateStr).startsWith("0001")
  ) {
    return <span className="text-gray-500 font-bold text-xs">-</span>;
  }

  const dateObj = new Date(dateStr);

  return (
    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 whitespace-nowrap bg-amber-50 px-2 py-1 rounded border border-amber-200 w-max shadow-sm">
      <FontAwesomeIcon icon={faCalendarAlt} className="text-amber-500" />
      {dateObj.toLocaleDateString("tr-TR")}
    </div>
  );
};
