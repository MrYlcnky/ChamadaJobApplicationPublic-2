import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { basvuruService } from "../../../../services/basvuruService";
import { resolveImageUrl, calculateAge, EGITIM_SEVIYELERI } from "./TableUtils";

export const initialFilters = {
  branch: "all",
  area: "all",
  department: "all",
  role: "all",
  startDate: "",
  endDate: "",
  ageMin: "",
  ageMax: "",
  gender: "all",
  education: "all",
};

export default function useAdminPanelLogic() {
  const [applicationData, setApplicationData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  // 🎯 YENİ: Aşama Filtresi için State
  const [stageFilter, setStageFilter] = useState("all");

  const [filters, setFilters] = useState(initialFilters);
  const [activeFilters, setActiveFilters] = useState(initialFilters);

  const [searchParams, setSearchParams] = useSearchParams();
  const openId = searchParams.get("openId");
  const view = searchParams.get("view");

  const auth = useMemo(
    () => JSON.parse(sessionStorage.getItem("authUser")) || null,
    [],
  );
  const roleId = useMemo(
    () =>
      auth?.rolId !== undefined
        ? Number(auth.rolId)
        : Number(auth?.roleId) || null,
    [auth],
  );

  const isIKGroup = useMemo(() => [1, 2, 3, 4].includes(roleId), [roleId]);
  const isGenelMudur = useMemo(() => roleId === 5, [roleId]);
  const isDepartmanMudur = useMemo(() => roleId === 6, [roleId]);
  const isMaliIslerMudur = useMemo(() => roleId === 7, [roleId]);

  const lookups = useMemo(() => {
    const extract = (key) =>
      [...new Set(applicationData.flatMap((d) => d[key] || []))]
        .filter(Boolean)
        .sort();
    return {
      subeler: extract("branches"),
      alanlar: extract("areas"),
      departmanlar: extract("departments"),
      pozisyonlar: extract("roles"),
    };
  }, [applicationData]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await basvuruService.getAll();
      const rawData = response?.data || response?.data?.data || response || [];
      const actualList = Array.isArray(rawData) ? rawData : rawData.data || [];

      const mappedData = actualList.map((item) => {
        const p = item.personel || item.Personel || {};
        const kisisel = p.kisiselBilgiler || p.KisiselBilgiler || {};
        const detay = p.isBasvuruDetay || p.IsBasvuruDetay || {};
        return {
          id: item.id || item.Id,
          personelId: item.personelId || p.id || p.Id,
          ad: kisisel.ad || kisisel.Ad || "-",
          soyad:
            kisisel.soyadi ||
            kisisel.Soyadi ||
            kisisel.soyad ||
            kisisel.Soyad ||
            p.soyad ||
            p.Soyad ||
            "-",
          statusId: Number(item.basvuruDurum ?? item.BasvuruDurum),
          approvalStage: Number(
            item.basvuruOnayAsamasi ?? item.BasvuruOnayAsamasi,
          ),

          tamamenReddedildiMi: Boolean(
            item.tamamenReddedildiMi ?? item.TamamenReddedildiMi ?? false,
          ),
          personal: {
            foto: resolveImageUrl(kisisel.vesikalikFotograf || p.fotografYolu),
            birthDate: kisisel.dogumTarihi || kisisel.DogumTarihi,
            genderText:
              (kisisel.cinsiyet || kisisel.Cinsiyet) === 2
                ? "Erkek"
                : (kisisel.cinsiyet || kisisel.Cinsiyet) === 1
                  ? "Kadın"
                  : "Belirsiz",
          },
          date: item.basvuruTarihi || item.BasvuruTarihi,
          status: item.basvuruDurumAdi || item.BasvuruDurumAdi,
          iseBaslamaTarihi: item.iseBaslamaTarihi || item.IseBaslamaTarihi,
          branches: [
            ...new Set(
              (detay.basvuruSubeler || detay.BasvuruSubeler)
                ?.map((s) => s.subeAdi || s.SubeAdi)
                .filter(Boolean) || [],
            ),
          ],
          areas: [
            ...new Set(
              (detay.basvuruAlanlar || detay.BasvuruAlanlar)
                ?.map((a) => a.alanAdi || a.AlanAdi)
                .filter(Boolean) || [],
            ),
          ],
          departments: [
            ...new Set(
              (detay.basvuruDepartmanlar || detay.BasvuruDepartmanlar)
                ?.map((d) => d.departmanAdi || d.DepartmanAdi)
                .filter(Boolean) || [],
            ),
          ],
          roles: [
            ...new Set(
              (detay.basvuruPozisyonlar || detay.BasvuruPozisyonlar)
                ?.map((p) => p.pozisyonAdi || p.PozisyonAdi)
                .filter(Boolean) || [],
            ),
          ],
          educations: (p.egitimBilgileri || p.EgitimBilgileri || [])
            .map(
              (e) =>
                EGITIM_SEVIYELERI[e.egitimSeviyesi || e.EgitimSeviyesi] ||
                e.egitimSeviyesiAdi ||
                null,
            )
            .filter(Boolean),
          originalData: item,
        };
      });
      setApplicationData(mappedData);
    } catch {
      toast.error("Veriler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (view === "pending") {
      setTab("pending");
      searchParams.delete("view");
      setSearchParams(searchParams, { replace: true });
    }
  }, [view, setSearchParams, searchParams]);

  const filteredData = useMemo(() => {
    let data = [...applicationData];

    if (roleId !== null && !isIKGroup) {
      if (isDepartmanMudur) {
        data = data.filter((app) => Number(app.approvalStage) >= 2);
      } else if (isGenelMudur || isMaliIslerMudur) {
        const requiredStage = isGenelMudur ? 4 : 5;
        data = data.filter((app) => {
          const isFollowableStage = Number(app.approvalStage) >= requiredStage;
          const userSubeId = auth?.subeId ? Number(auth.subeId) : null;
          if (userSubeId === null) return false;

          const p = app.originalData?.personel || app.originalData?.Personel;
          const detay = p?.isBasvuruDetay || p?.IsBasvuruDetay;
          const appSubeler =
            detay?.basvuruSubeler || detay?.BasvuruSubeler || [];
          return (
            isFollowableStage &&
            appSubeler.some(
              (s) =>
                Number(s.subeId || s.SubeId || s.id || s.Id) === userSubeId,
            )
          );
        });
      }
    }

    if (branchFilter !== "all") {
      const normalizeText = (text) => {
        return String(text)
          .toLocaleLowerCase("tr-TR")
          .replace(/ğ/g, "g")
          .replace(/ü/g, "u")
          .replace(/ş/g, "s")
          .replace(/ı/g, "i")
          .replace(/ö/g, "o")
          .replace(/ç/g, "c")
          .replace(/i̇/g, "i");
      };

      const searchKey = normalizeText(branchFilter);

      data = data.filter((row) => {
        const isTargetBranch = row.branches.some((b) =>
          normalizeText(b).includes(searchKey),
        );
        const hasOtherBranch = row.branches.some(
          (b) => !normalizeText(b).includes(searchKey),
        );
        return isTargetBranch && !hasOtherBranch;
      });
    }

    // 3. SEKME (TAB) DURUM FİLTRESİ
    if (tab !== "all") {
      if (tab === "completelyRejected") {
        data = data.filter((row) => row.tamamenReddedildiMi === true);
      } else if (tab === "hasStartDate") {
        data = data.filter((row) => {
          const dateStr = row.iseBaslamaTarihi || row.IseBaslamaTarihi;

          return (
            !row.tamamenReddedildiMi &&
            dateStr &&
            !String(dateStr).startsWith("0001")
          );
        });
      } else {
        const statusMap = {
          new: [1],
          pending: [2, 5],
          approved: [3],
          rejected: [4],
          revision: [5],
        };

        data = data.filter(
          (row) =>
            !row.tamamenReddedildiMi && statusMap[tab]?.includes(row.statusId),
        );
      }
    }

    // 🎯 YENİ: AŞAMA (STAGE) FİLTRESİ
    if (stageFilter !== "all") {
      data = data.filter(
        (row) => Number(row.approvalStage) === Number(stageFilter),
      );
    }

    const {
      branch,
      area,
      department,
      role,
      startDate,
      endDate,
      ageMin,
      ageMax,
      gender,
      education,
    } = activeFilters;

    if (branch !== "all")
      data = data.filter((r) => r.branches.includes(branch));
    if (area !== "all") data = data.filter((r) => r.areas.includes(area));
    if (department !== "all")
      data = data.filter((r) => r.departments.includes(department));
    if (role !== "all") data = data.filter((r) => r.roles.includes(role));
    if (startDate)
      data = data.filter((r) => new Date(r.date) >= new Date(startDate));
    if (endDate)
      data = data.filter((r) => new Date(r.date) <= new Date(endDate));
    if (gender !== "all")
      data = data.filter((r) => r.personal.genderText === gender);
    if (education !== "all")
      data = data.filter((r) =>
        r.educations.some(
          (e) => String(e).toLowerCase() === String(education).toLowerCase(),
        ),
      );

    if (ageMin || ageMax) {
      data = data.filter((r) => {
        const age = calculateAge(r.personal.birthDate);
        return (
          (!ageMin || age >= Number(ageMin)) &&
          (!ageMax || age <= Number(ageMax))
        );
      });
    }

    return data;
  }, [
    applicationData,
    tab,
    branchFilter,
    stageFilter, // 🎯 EKLENDİ
    activeFilters,
    isIKGroup,
    isDepartmanMudur,
    isGenelMudur,
    isMaliIslerMudur,
    roleId,
    auth,
  ]);

  return {
    applicationData,
    filteredData,
    loading,
    tab,
    setTab,
    branchFilter,
    setBranchFilter,
    stageFilter, // 🎯 EKLENDİ
    setStageFilter, // 🎯 EKLENDİ
    filters,
    setFilters,
    activeFilters,
    setActiveFilters,
    lookups,
    auth,
    isIKGroup,
    fetchData,
    openId,
    searchParams,
    setSearchParams,
  };
}
