import React, { useMemo, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileLines,
  faGavel,
  faXmark,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { formatDate } from "../../../utils/dateFormatter";
import { basvuruService } from "../../../services/basvuruService";
import { gorevAtamaService } from "../../../services/gorevAtamaService";
import { tanimlamalarService } from "../../../services/tanimlamalarService";

import ApprovalWorkflow from "./ApplicationModalTabs/SummaryAndDecision/ApprovalWorkflow";
import DecisionArea from "./ApplicationModalTabs/SummaryAndDecision/DecisionArea";
import ApplicationSummary from "./ApplicationModalTabs/ApplicationSummary";
import HistoryAndChanges from "./ApplicationModalTabs/SummaryAndDecision/HistoryAndChanges";
import ReadOnlyApplicationView from "./ApplicationModalTabs/ReadOnlyApplicationView";
import JobOfferDetails from "./ApplicationModalTabs/SummaryAndDecision/JobOfferDetails/JobOfferDetails";
import SevkPopupModal from "./AdminPanelManagement/SevkPopupModal";
import ReferansCheck from "./ApplicationModalTabs/SummaryAndDecision/ReferansCheck";

export default function ApplicationModal({ data, auth, onClose, onAction }) {
  const [note, setNote] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [cvLogs, setCvLogs] = useState([]);

  const [subeler, setSubeler] = useState([]);
  const [subeAlanlari, setSubeAlanlari] = useState([]);
  const [departmanlar, setDepartmanlar] = useState([]);
  const [pozisyonlar, setPozisyonlar] = useState([]);

  const [sevkPopupState, setSevkPopupState] = useState({
    isOpen: false,
    row: null,
    selectedIds: [],
    departmanlar: [],
    subeAlanlari: [],
    isProcessing: false,
  });

  const rawData = data.originalData || {};
  const currentStageId = Number(
    data.approvalStage || rawData.basvuruOnayAsamasi || 1,
  );
  const statusId = Number(data.statusId || rawData.basvuruDurum || 1);
  const tamamenReddedildiMi = Boolean(
    data.tamamenReddedildiMi ??
    data.TamamenReddedildiMi ??
    rawData.tamamenReddedildiMi ??
    rawData.TamamenReddedildiMi ??
    false,
  );
  const personelId =
    rawData.personelId || rawData.PersonelId || rawData.personel?.id || 0;

  const isDeneyimleri =
    rawData?.personel?.isDeneyimleri || rawData?.Personel?.IsDeneyimleri || [];

  const [jobOfferData, setJobOfferData] = useState({
    id: 0,
    masterDepartmanId: auth?.masterDepartmanId || "",
    gorevId: "",

    netUcret: "",
    talepEdilenGorevGenelButcesi: "",

    // İK pozisyon bütçe ve kadro bilgileri
    pozisyonButcesiVarMi: "",
    aktifCalisanPersonel: "",
    pozisyondaCalismasiGerekenPersonelSayisi: "",
    totalPozisyonButcesi: "",
    calismaIzinBelgeTuruId: "",

    baslangicTarihi: "",
    talepNedeni: 1,
    yerineAlinacakKisiAdSoyad: "",
    yerineAlinacakKisiCikisTarihi: "",
  });

  //-----------------------------------

  const toNullableNumber = (value) => {
    if (value === "" || value === null || value === undefined) return null;

    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  };

  const toNullableDate = (value) => {
    if (!value || String(value).trim() === "") return null;
    return value;
  };

  const buildGorevAtamaPayload = () => {
    const isYerineAlim = Number(jobOfferData.talepNedeni) === 2;

    return {
      ...jobOfferData,

      id: Number(jobOfferData.id) || 0,
      personelId: Number(personelId),
      masterDepartmanId: Number(jobOfferData.masterDepartmanId),
      gorevId: Number(jobOfferData.gorevId),

      netUcret: toNullableNumber(jobOfferData.netUcret),
      talepEdilenGorevGenelButcesi: toNullableNumber(
        jobOfferData.talepEdilenGorevGenelButcesi,
      ),

      baslangicTarihi: toNullableDate(jobOfferData.baslangicTarihi),

      talepNedeni: Number(jobOfferData.talepNedeni),

      yerineAlinacakKisiAdSoyad: isYerineAlim
        ? jobOfferData.yerineAlinacakKisiAdSoyad?.trim() || null
        : null,

      yerineAlinacakKisiCikisTarihi:
        isYerineAlim && jobOfferData.yerineAlinacakKisiCikisTarihi
          ? jobOfferData.yerineAlinacakKisiCikisTarihi
          : null,
    };
  };

  //------------------------------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      if (!data?.id) return;

      setLoadingLogs(true);
      try {
        const [
          processRes,
          cvRes,
          subelerRes,
          subeAlanlariRes,
          departmanlarRes,
          pozisyonlarRes,
        ] = await Promise.all([
          basvuruService.getBasvuruLogs(data.id),
          personelId ? basvuruService.getCvLogs(personelId) : { data: [] },
          tanimlamalarService.getSubeler(),
          tanimlamalarService.getSubeAlanlar(),
          tanimlamalarService.getDepartmanlar(),
          tanimlamalarService.getDepartmanPozisyonlar(),
        ]);

        if (isMounted) {
          setLogs(
            Array.isArray(processRes) ? processRes : processRes.data || [],
          );
          setCvLogs(Array.isArray(cvRes) ? cvRes : cvRes.data || []);

          setSubeler(subelerRes?.data || []);
          setSubeAlanlari(subeAlanlariRes?.data || []);
          setDepartmanlar(departmanlarRes?.data || []);
          setPozisyonlar(pozisyonlarRes?.data || []);
        }
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      } finally {
        if (isMounted) setLoadingLogs(false);
      }
    };

    fetchAllData();
    return () => {
      isMounted = false;
    };
  }, [data.id, personelId]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  // 🎯 YENİ: SÜPER ADMİN DEĞİŞKENİ
  const isSuperAdmin = Number(auth?.rolId || auth?.roleId) === 1;
  const currentRoleId = Number(auth?.rolId ?? auth?.roleId);

  const isIKGroup = [1, 2, 3, 4].includes(currentRoleId);

  const userRole = useMemo(() => {
    const rid = Number(auth?.rolId ?? auth?.roleId);
    if ([1, 2, 3, 4].includes(rid)) return "ik";
    if (rid === 6) return "dm";
    if (rid === 5) return "gm";
    if (rid === 7) return "mim";
    return "guest";
  }, [auth]);

  const { canAction, hasUserAction } = useMemo(() => {
    let actionAllowed = false;
    let userDidAction = false;

    if (logs && logs.length > 0) {
      const currentUserId = Number(
        auth?.id || auth?.userId || auth?.personelId || auth?.Id,
      );
      userDidAction = logs.some((log) => {
        const logUserId = Number(
          log.panelKullaniciId ||
            log.PanelKullaniciId ||
            log.kullaniciId ||
            log.islemYapanId ||
            log.ekleyenId,
        );
        return logUserId === currentUserId;
      });
    }

    if (tamamenReddedildiMi) {
      return {
        canAction: false,
        hasUserAction: userDidAction,
      };
    }

    // 🎯 YENİ: SÜPER ADMİN İSE TÜM KİLİTLERİ AÇ (AŞAMA/DURUM FARK ETMEKSİZİN ONAY BUTONLARINI GÖRÜR)
    if (isSuperAdmin) {
      // Sadece reddedilmiş (4) veya işe alınmış (3) gibi bitmiş senaryolarda aksiyonu engellemek istersen bırakabilirsin.
      // Ancak "her şeye tam müdahale" isteniyorsa return { canAction: true, hasUserAction: false } yaparız.
      // Süreç bittiyse (status 3 veya 4) bile Süper Admin geri döndürebilir/müdahale edebilir:
      return { canAction: true, hasUserAction: false };
    }

    if ([3].includes(statusId))
      return { canAction: false, hasUserAction: userDidAction };

    const sevkler = rawData?.basvuruSevkleri || rawData?.BasvuruSevkleri || [];
    const userSubeId = Number(auth?.subeId || auth?.SubeId) || null;

    /*
  Reddedilmiş başvuruda:
  - İK tekrar işlem yapabilir.
  - Departman müdürü kendi sevkinde daha önce işlem yaptıysa revize isteyebilir.
  - GM/Mali de kendi logu varsa revize isteyebilir.
*/
    if (statusId === 4) {
      if (userRole === "ik") {
        if (userSubeId) {
          const myBranchSevkler = sevkler.filter(
            (s) => Number(s.subeId || s.SubeId) === userSubeId,
          );

          if (myBranchSevkler.length === 0) {
            return { canAction: true, hasUserAction: userDidAction };
          }
        } else {
          return { canAction: true, hasUserAction: userDidAction };
        }
      }

      if (userRole === "dm") {
        const userDeptId =
          Number(
            auth?.masterDepartmanId ||
              auth?.MasterDepartmanId ||
              auth?.departmanId ||
              auth?.DepartmanId,
          ) || null;

        const userAlanId =
          Number(
            auth?.masterAlanId ||
              auth?.MasterAlanId ||
              auth?.alanId ||
              auth?.AlanId,
          ) || null;

        const myRelevantSevkler = sevkler.filter((s) => {
          const matchSube = userSubeId
            ? Number(s.subeId || s.SubeId) === userSubeId
            : true;

          const sDeptId = Number(
            s.masterDepartmanId ||
              s.MasterDepartmanId ||
              s.departmanId ||
              s.DepartmanId,
          );

          const matchDept = userDeptId ? sDeptId === userDeptId : true;

          const sAlanId = Number(s.masterAlanId || s.MasterAlanId);
          const matchAlan =
            userAlanId && sAlanId && sAlanId !== 0
              ? sAlanId === userAlanId
              : true;

          return matchSube && matchDept && matchAlan;
        });

        const departmentAlreadyActed = myRelevantSevkler.some((s) =>
          [2, 3, 5].includes(Number(s.sevkDurumu || s.SevkDurumu)),
        );

        return {
          canAction: false,
          hasUserAction: userDidAction || departmentAlreadyActed,
        };
      }

      return { canAction: false, hasUserAction: userDidAction };
    }

    if ([3, 4, 5].includes(currentStageId)) {
      if (userSubeId !== null) {
        const onaylayanSevk = sevkler.find(
          (s) => Number(s.sevkDurumu || s.SevkDurumu) === 2,
        );
        if (
          onaylayanSevk &&
          Number(onaylayanSevk.subeId || onaylayanSevk.SubeId) !== userSubeId
        ) {
          return { canAction: false, hasUserAction: userDidAction };
        }
      }
    }

    if (userRole === "dm") {
      const userDeptId =
        Number(
          auth?.masterDepartmanId ||
            auth?.MasterDepartmanId ||
            auth?.departmanId ||
            auth?.DepartmanId,
        ) || null;
      const userAlanId =
        Number(
          auth?.masterAlanId ||
            auth?.MasterAlanId ||
            auth?.alanId ||
            auth?.AlanId,
        ) || null;

      const myRelevantSevkler = sevkler.filter((s) => {
        const matchSube = Number(s.subeId || s.SubeId) === userSubeId;

        const sDeptId = Number(
          s.masterDepartmanId ||
            s.MasterDepartmanId ||
            s.departmanId ||
            s.DepartmanId,
        );
        const matchDept = sDeptId === userDeptId;

        const sAlanId = Number(s.masterAlanId || s.MasterAlanId);
        const matchAlan =
          userAlanId && sAlanId && sAlanId !== 0
            ? sAlanId === userAlanId
            : true;

        return matchSube && matchDept && matchAlan;
      });

      const alreadyActed = myRelevantSevkler.some((s) =>
        [2, 3].includes(Number(s.sevkDurumu || s.SevkDurumu)),
      );

      if (currentStageId !== 2) {
        return {
          canAction: false,
          hasUserAction: userDidAction || alreadyActed,
        };
      }

      const pendingAction = myRelevantSevkler.some(
        (s) => Number(s.sevkDurumu || s.SevkDurumu) === 1,
      );

      return {
        canAction: pendingAction,
        hasUserAction: userDidAction || alreadyActed,
      };
    }

    if (userRole === "ik")
      actionAllowed =
        currentStageId === 1 || currentStageId === 3 || statusId === 5;
    if (userRole === "gm") actionAllowed = currentStageId === 4;
    if (userRole === "mim") actionAllowed = currentStageId === 5;

    return { canAction: actionAllowed, hasUserAction: userDidAction };
  }, [
    statusId,
    currentStageId,
    userRole,
    auth,
    rawData,
    logs,
    isSuperAdmin,
    tamamenReddedildiMi,
  ]);

  const handleProcess = async (actionType) => {
    if (!note || note.trim().length < 13) {
      Swal.fire({
        icon: "warning",
        title: "Açıklama Yetersiz",
        text: "En az 13 karakter giriniz.",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }

    if (actionType === "completely_reject") {
      const confirmation = await Swal.fire({
        icon: "warning",
        title: "Başvuruyu tamamen reddetmek istediğinize emin misiniz?",
        html: `
      <div style="text-align: left; line-height: 1.6;">
        <p>
          Bu işlem başvurunun tüm onay sürecini durduracak ve başvuruyu
          işlem yapılmaya kapatacaktır.
        </p>

        <p style="margin-top: 12px;">
          Adaya başvurusunun olumsuz sonuçlandığını bildiren
          <strong>red e-postası gönderilecektir.</strong>
        </p>

        <p style="margin-top: 12px; color: #fca5a5;">
          Başvuru daha sonra yalnızca İK grubu tarafından revize sürecine
          yeniden açılabilir.
        </p>
      </div>
    `,
        showCancelButton: true,
        confirmButtonText: "Evet, Tamamen Reddet",
        cancelButtonText: "Vazgeç",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#4b5563",
        reverseButtons: true,
        focusCancel: true,
        background: "#1f2937",
        color: "#fff",
      });

      if (!confirmation.isConfirmed) {
        return;
      }
    }

    const isDM = Number(auth?.rolId || auth?.roleId) === 6 || isSuperAdmin;
    const isDepartmanOnayi = currentStageId === 2;

    const isDepartmanDegerlendirmeIslemi =
      isDM && isDepartmanOnayi && ["approve", "reject"].includes(actionType);

    const roleId = Number(auth?.rolId || auth?.roleId);

    const getRevisionReturnStage = () => {
      const roleId = Number(auth?.rolId || auth?.roleId);
      const stageId = Number(currentStageId);
      const status = Number(statusId);

      const isRejected = status === 4;
      const isIkRole = [1, 2, 3, 4].includes(roleId);

      // İK / Admin / SuperAdmin / İK rolü
      if (isIkRole) {
        // İK bulunduğu aşamada red verdikten sonra revize açıyorsa,
        // aynı aşamaya geri dönmeli.
        if (isRejected && stageId >= 1 && stageId <= 5) {
          return stageId;
        }

        // Başvuru reddedilmemişken İK aşama 2 veya 3'te revize açarsa 1'e döner.
        if ([2, 3].includes(stageId)) {
          return 1;
        }

        // Başvuru reddedilmemişken İK aşama 4 veya 5'te revize açarsa 3'e döner.
        if ([4, 5].includes(stageId)) {
          return 3;
        }

        return stageId || 1;
      }

      // Departman Müdürü
      if (roleId === 6) {
        return 2;
      }

      // Genel Müdür
      if (roleId === 5) {
        return 4;
      }

      // Mali İşler
      if (roleId === 7) {
        return 5;
      }

      return stageId || 1;
    };

    if (actionType === "approve" && isDM && isDepartmanOnayi) {
      if (!jobOfferData.gorevId || !jobOfferData.baslangicTarihi) {
        Swal.fire({
          icon: "warning",
          title: "Eksik Görev Bilgileri",
          text: "Lütfen adayı onaylamadan önce Görev ve Başlama Tarihi alanlarını eksiksiz doldurun.",
          background: "#1f2937",
          color: "#fff",
        });
        return;
      }
      if (
        Number(jobOfferData.talepNedeni) === 2 &&
        (!jobOfferData.yerineAlinacakKisiAdSoyad.trim() ||
          !jobOfferData.yerineAlinacakKisiCikisTarihi)
      ) {
        Swal.fire({
          icon: "warning",
          title: "Eksik Bilgi",
          text: "Lütfen kimin yerine alınacağını ve ayrılış tarihini eksiksiz doldurunuz.",
          background: "#1f2937",
          color: "#fff",
        });
        return;
      }

      const selectedDate = new Date(jobOfferData.baslangicTarihi);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        Swal.fire({
          icon: "error",
          title: "Geçersiz Tarih",
          text: "İşe başlama tarihi bugünden önce olamaz.",
          background: "#1f2937",
          color: "#fff",
        });
        return;
      }
    }

    // İK son kontrol aşamasındaki pozisyon bütçe ve kadro kontrolleri
    const isIkSonKontrol =
      [1, 2, 3, 4].includes(roleId) && Number(currentStageId) === 3;

    if (actionType === "approve" && isIkSonKontrol) {
      // Pozisyon bütçesi var/yok seçimi zorunlu
      if (typeof jobOfferData.pozisyonButcesiVarMi !== "boolean") {
        Swal.fire({
          icon: "warning",
          title: "Eksik Pozisyon Bilgisi",
          text: "Lütfen pozisyon bütçesinin olup olmadığını seçiniz.",
          background: "#1f2937",
          color: "#fff",
        });

        return;
      }

      const aktifCalisanPersonel = Number(jobOfferData.aktifCalisanPersonel);

      const olmasiGerekenPersonel = Number(
        jobOfferData.pozisyondaCalismasiGerekenPersonelSayisi,
      );

      // Aktif çalışan sayısı zorunlu
      if (
        jobOfferData.aktifCalisanPersonel === "" ||
        !Number.isInteger(aktifCalisanPersonel) ||
        aktifCalisanPersonel < 0
      ) {
        Swal.fire({
          icon: "warning",
          title: "Geçersiz Personel Sayısı",
          text: "Aktif çalışan personel sayısını sıfır veya daha büyük bir tam sayı olarak giriniz.",
          background: "#1f2937",
          color: "#fff",
        });

        return;
      }

      // Olması gereken personel sayısı zorunlu
      if (
        jobOfferData.pozisyondaCalismasiGerekenPersonelSayisi === "" ||
        !Number.isInteger(olmasiGerekenPersonel) ||
        olmasiGerekenPersonel < 0
      ) {
        Swal.fire({
          icon: "warning",
          title: "Geçersiz Personel Sayısı",
          text: "Pozisyonda olması gereken personel sayısını sıfır veya daha büyük bir tam sayı olarak giriniz.",
          background: "#1f2937",
          color: "#fff",
        });

        return;
      }

      // Pozisyon bütçesi varsa toplam bütçe zorunlu
      if (jobOfferData.pozisyonButcesiVarMi === true) {
        const totalPozisyonButcesi = Number(jobOfferData.totalPozisyonButcesi);

        if (
          jobOfferData.totalPozisyonButcesi === "" ||
          !Number.isInteger(totalPozisyonButcesi) ||
          totalPozisyonButcesi <= 0
        ) {
          Swal.fire({
            icon: "warning",
            title: "Eksik Bütçe Bilgisi",
            text: "Pozisyon bütçesi varsa toplam pozisyon bütçesini sıfırdan büyük bir tam sayı olarak giriniz.",
            background: "#1f2937",
            color: "#fff",
          });

          return;
        }
      }
    }

    if (actionType === "sevk_et") {
      const isBasvuruDetay =
        rawData?.personel?.isBasvuruDetay ||
        rawData?.Personel?.IsBasvuruDetay ||
        {};
      const defaultIds = (
        isBasvuruDetay.basvuruDepartmanlar ||
        isBasvuruDetay.BasvuruDepartmanlar ||
        []
      ).map((d) => Number(d.departmanId || d.DepartmanId || d.id || d.Id));

      setSevkPopupState({
        isOpen: true,
        row: data,
        selectedIds: defaultIds,
        departmanlar: departmanlar,
        subeAlanlari: subeAlanlari,
        isProcessing: false,
      });
      return;
    }

    setIsProcessing(true);

    try {
      const specialActionMap = {
        completely_reject: 1,
        revision_continue_current: 2,
        revision_return_first_stage: 3,
      };

      const specialActionId = specialActionMap[actionType];

      if (specialActionId) {
        const specialPayload = {
          Id: Number(data.id),
          PersonelId: Number(personelId),
          BasvuruDurum: Number(statusId),
          BasvuruOnayAsamasi: Number(currentStageId),
          IslemAciklama:
            specialActionId === 1
              ? `BAŞVURU TAMAMEN REDDEDİLDİ: ${note.trim()}`
              : specialActionId === 2
                ? `REVİZE TALEBİ - KALDIĞI AŞAMAYA DÖNÜŞ: ${note.trim()}`
                : `REVİZE TALEBİ - İLK AŞAMAYA DÖNÜŞ: ${note.trim()}`,
          IslemAksiyonu: specialActionId,
        };

        await basvuruService.updateStatus(specialPayload);

        Swal.fire({
          icon: "success",
          title:
            specialActionId === 1
              ? "Başvuru Tamamen Reddedildi"
              : "Revize Talebi Oluşturuldu",
          text:
            specialActionId === 1
              ? "Başvuru kilitlendi ve red maili gönderildi."
              : specialActionId === 2
                ? "Revize onaylandığında başvuru kaldığı aşamaya dönecektir."
                : "Revize onaylandığında başvuru İK ilk değerlendirme aşamasına dönecektir.",
          timer: 2200,
          showConfirmButton: false,
          background: "#1f2937",
          color: "#fff",
        });

        onAction?.();
        onClose();
        return;
      }

      if (isDepartmanDegerlendirmeIslemi) {
        if (actionType === "approve") {
          const atamaPayload = buildGorevAtamaPayload();

          if (jobOfferData.id) {
            await gorevAtamaService.update(atamaPayload);
          } else {
            await gorevAtamaService.create(atamaPayload);
          }

          await basvuruService.departmanDegerlendir({
            id: data.id,
            sevkDurumu: 2,
            degerlendirmeNotu: note,
            departmanId: Number(jobOfferData.masterDepartmanId),
          });
        } else if (actionType === "reject") {
          await basvuruService.departmanDegerlendir({
            id: data.id,
            sevkDurumu: 3,
            degerlendirmeNotu: note,
            departmanId: Number(jobOfferData.masterDepartmanId),
          });
        }

        Swal.fire({
          icon: "success",
          title: "İşlem Başarılı",
          text: "Değerlendirmeniz sisteme işlendi.",
          timer: 1500,
          showConfirmButton: false,
          background: "#1f2937",
          color: "#fff",
        });

        onAction?.();
        onClose();
        return;
      }

      // 🎯 YENİ KURAL: İK (VE SÜPER ADMİN) SON KONTROL (AŞAMA 3) GÜNCELLEMESİ
      const isIK = Number(auth?.rolId || auth?.roleId) <= 4 || isSuperAdmin;
      if (isIK && currentStageId === 3 && jobOfferData && jobOfferData.id > 0) {
        const atamaPayload = buildGorevAtamaPayload();
        await gorevAtamaService.update(atamaPayload);
      }

      let newStatus = statusId;
      let newStage = currentStageId;

      if (actionType === "reject_revision") {
        newStatus = 4;
        newStage = currentStageId;
      } else if (actionType === "approve_revision") {
        newStatus = 2;

        const lastRevReq = [...logs]
          .sort((a, b) => Number(b.id || b.Id) - Number(a.id || a.Id))
          .find(
            (l) =>
              Number(l.basvuruDurum || l.BasvuruDurum) === 5 ||
              Number(l.islemTipi || l.IslemTipi) === 10,
          );

        if (lastRevReq) {
          const revizeDonusAsamasi = Number(
            lastRevReq.basvuruOnayAsamasi ||
              lastRevReq.BasvuruOnayAsamasi ||
              currentStageId ||
              1,
          );

          if (revizeDonusAsamasi >= 1 && revizeDonusAsamasi <= 5) {
            newStage = revizeDonusAsamasi;
          } else {
            newStage = currentStageId || 1;
          }
        } else {
          newStage = currentStageId || 1;
        }
      } else if (actionType === "approve") {
        if (currentStageId === 5) {
          newStage = 6;
          newStatus = 3;
        } else {
          newStage = currentStageId + 1;
          newStatus = 2;
        }
      } else if (actionType === "reject") {
        newStatus = 4;
        newStage = currentStageId;
      } else if (actionType === "request_revision") {
        newStatus = 5;
        newStage = getRevisionReturnStage();
      }

      const payload = {
        Id: data.id,
        PersonelId: personelId,
        BasvuruDurum: newStatus,
        BasvuruOnayAsamasi: newStage,
        IslemAciklama:
          actionType === "request_revision"
            ? `REVİZE TALEBİ: ${note}`
            : actionType === "reject_revision"
              ? `REVİZE TALEBİ REDDEDİLDİ: ${note}`
              : note,
      };

      await basvuruService.updateStatus(payload);

      Swal.fire({
        icon: "success",
        title: "İşlem Başarılı",
        timer: 1500,
        showConfirmButton: false,
        background: "#1f2937",
        color: "#fff",
      });

      onAction?.();
      onClose();
    } catch (error) {
      console.error("SİSTEM HATASI:", error);
      Swal.fire({
        icon: "error",
        title: "Hata",
        text: error?.response?.data?.message || "İşlem başarısız.",
        background: "#1f2937",
        color: "#fff",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center sm:p-4 p-0 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-7xl h-full flex flex-col bg-gray-900 sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-800/50">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
              {data.name || `${data.ad} ${data.soyad}`}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border uppercase ${tamamenReddedildiMi || statusId === 4 ? "bg-red-500/10 text-red-500 border-red-500/20" : statusId === 3 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-sky-500/10 text-sky-500 border-sky-500/20"}`}
              >
                {tamamenReddedildiMi
                  ? "Tamamen Reddedildi"
                  : data.status || "Süreçte"}
              </span>
            </h3>
            <div className="text-xs text-gray-500 flex items-center gap-2 mt-1 font-bold uppercase">
              <span className="font-mono text-gray-600">ID: #{data.id}</span>
              <span>Tarih: {formatDate(data.date)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} size="lg" />
          </button>
        </div>

        <div className="flex items-center gap-1 px-6 bg-gray-900 border-b border-gray-800 overflow-x-auto">
          <TabButton
            icon={faGavel}
            label="Özet & Karar"
            isActive={activeTab === "summary"}
            onClick={() => setActiveTab("summary")}
          />
          <TabButton
            icon={faHistory}
            label="Geçmiş"
            isActive={activeTab === "history"}
            onClick={() => setActiveTab("history")}
          />
          <TabButton
            icon={faFileLines}
            label="Form"
            isActive={activeTab === "details"}
            onClick={() => setActiveTab("details")}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-900">
          {activeTab === "summary" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ApprovalWorkflow
                currentStageId={currentStageId}
                statusId={statusId}
                auth={auth} // Süper admin kontrolü için auth prop'unu yolluyoruz
              />

              <JobOfferDetails
                personelId={personelId}
                auth={auth}
                currentStageId={currentStageId}
                jobOfferData={jobOfferData}
                setJobOfferData={setJobOfferData}
                rawData={rawData}
              />

              <DecisionArea
                note={note}
                setNote={setNote}
                canAction={canAction}
                isProcessing={isProcessing}
                currentStageId={currentStageId}
                statusId={statusId}
                onProcess={handleProcess}
                isIKGroup={isIKGroup}
                isSuperAdmin={isSuperAdmin}
                tamamenReddedildiMi={tamamenReddedildiMi}
                hasUserAction={hasUserAction}
                auth={auth}
              />

              <ApplicationSummary
                data={data}
                logs={logs}
                loadingLogs={loadingLogs}
              />

              <ReferansCheck
                masterBasvuruId={data.id}
                currentStageId={currentStageId}
                isDeneyimleri={isDeneyimleri}
              />
            </div>
          )}
          {activeTab === "history" && (
            <HistoryAndChanges
              processLogs={logs}
              cvLogs={cvLogs}
              subeler={subeler}
              subeAlanlari={subeAlanlari}
              departmanlar={departmanlar}
              pozisyonlar={pozisyonlar}
            />
          )}
          {activeTab === "details" && <ReadOnlyApplicationView data={data} />}
        </div>
      </div>

      <SevkPopupModal
        state={sevkPopupState}
        setState={setSevkPopupState}
        onSuccess={() => {
          onAction?.();
          onClose();
        }}
        auth={auth}
      />
    </div>
  );
}

function TabButton({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? "text-sky-400 bg-sky-500/5" : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"}`}
    >
      <FontAwesomeIcon icon={icon} className={isActive ? "text-sky-500" : ""} />{" "}
      {label}
      {isActive && (
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-500" />
      )}
    </button>
  );
}
