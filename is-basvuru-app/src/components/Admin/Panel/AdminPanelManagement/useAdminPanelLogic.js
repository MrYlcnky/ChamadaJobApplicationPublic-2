import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { basvuruService } from "../../../../services/basvuruService";
import { resolveImageUrl, EGITIM_SEVIYELERI } from "./TableUtils";
import { tanimlamalarService } from "../../../../services/tanimlamalarService";

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

const egitimSeviyesiMap = {
  Lise: 1,
  "Ön Lisans": 2,
  Lisans: 3,
  "Yüksek Lisans": 4,
  Doktora: 5,
  Diğer: 6,
};

export default function useAdminPanelLogic() {
  const [applicationData, setApplicationData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [paginationMeta, setPaginationMeta] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  });
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [lookups, setLookups] = useState({
    subeler: [],
    alanlar: [],
    departmanlar: [],
    pozisyonlar: [],
  });
  const [sorting, setSorting] = useState([
    {
      id: "date",
      desc: true,
    },
  ]);

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

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [subeRes, alanRes, departmanRes, pozisyonRes] = await Promise.all(
          [
            tanimlamalarService.getSubeler(),
            tanimlamalarService.getMasterAlanlar(),
            tanimlamalarService.getMasterDepartmanlar(),
            tanimlamalarService.getMasterPozisyonlar(),
          ],
        );

        setLookups({
          subeler: (subeRes.data || [])
            .map((x) => x.subeAdi || x.SubeAdi || x.ad || x.Ad || "")
            .filter(Boolean)
            .sort(),

          alanlar: (alanRes.data || [])
            .map(
              (x) =>
                x.masterAlanAdi ||
                x.MasterAlanAdi ||
                x.alanAdi ||
                x.AlanAdi ||
                "",
            )
            .filter(Boolean)
            .sort(),

          departmanlar: (departmanRes.data || [])
            .map(
              (x) =>
                x.masterDepartmanAdi ||
                x.MasterDepartmanAdi ||
                x.departmanAdi ||
                x.DepartmanAdi ||
                "",
            )
            .filter(Boolean)
            .sort(),

          pozisyonlar: (pozisyonRes.data || [])
            .map(
              (x) =>
                x.masterPozisyonAdi ||
                x.MasterPozisyonAdi ||
                x.pozisyonAdi ||
                x.PozisyonAdi ||
                "",
            )
            .filter(Boolean)
            .sort(),
        });
      } catch (error) {
        console.error("Filtre tanımlamaları alınamadı:", error);
      }
    };

    fetchLookups();
  }, []);

  //Filtre Effectler

  useEffect(() => {
    setPageNumber(1);
  }, [branchFilter]);

  useEffect(() => {
    setPageNumber(1);
  }, [tab]);

  useEffect(() => {
    setPageNumber(1);
  }, [stageFilter]);

  useEffect(() => {
    setPageNumber(1);
  }, [activeFilters]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const statusMap = {
        new: [1],
        pending: [2, 5],
        approved: [3],
        rejected: [4],
        revision: [5],
      };

      const tabParams = {};

      if (tab === "completelyRejected") {
        tabParams.TamamenReddedildiMi = true;
      } else if (tab === "hasStartDate") {
        tabParams.TamamenReddedildiMi = false;
        tabParams.IseBaslamaTarihiVarMi = true;
      } else if (tab !== "all") {
        tabParams.Durumlar = statusMap[tab];
        tabParams.TamamenReddedildiMi = false;
      }

      let resolvedSube;
      let sadeceSube;

      if (branchFilter !== "all") {
        if (branchFilter.startsWith("selected:")) {
          resolvedSube = branchFilter.replace("selected:", "");
          sadeceSube = false;
        } else if (branchFilter.startsWith("only:")) {
          resolvedSube = branchFilter.replace("only:", "");
          sadeceSube = true;
        } else {
          resolvedSube = branchFilter;
          sadeceSube = false;
        }
      } else if (activeFilters.branch !== "all") {
        const advancedBranch = activeFilters.branch;

        sadeceSube = advancedBranch.startsWith("Sadece ");

        const kisaAd = advancedBranch
          .replace(/^Sadece\s+/i, "")
          .replace(/\s+Seçenler$/i, "")
          .trim();

        resolvedSube = (lookups.subeler || []).find((sube) => {
          const subeAdi = String(sube);

          const subeKisaAd = subeAdi.replace(/^Chamada\s+/i, "").trim();

          return (
            subeKisaAd.toLocaleLowerCase("tr-TR") ===
            kisaAd.toLocaleLowerCase("tr-TR")
          );
        });
      }
      const response = await basvuruService.getAll({
        pageNumber,
        pageSize,
        SortBy: sorting[0]?.id || "date",
        SortDescending: sorting[0]?.desc ?? true,
        Search: search || undefined,
        Sube: resolvedSube || undefined,
        SadeceSube: resolvedSube !== undefined ? sadeceSube : undefined,
        Asama: stageFilter === "all" ? undefined : Number(stageFilter),
        Alan: activeFilters.area === "all" ? undefined : activeFilters.area,
        Departman:
          activeFilters.department === "all"
            ? undefined
            : activeFilters.department,
        Pozisyon: activeFilters.role === "all" ? undefined : activeFilters.role,
        BaslangicTarihi: activeFilters.startDate || undefined,
        BitisTarihi: activeFilters.endDate || undefined,
        Cinsiyet:
          activeFilters.gender === "all"
            ? undefined
            : activeFilters.gender === "Kadın"
              ? 1
              : activeFilters.gender === "Erkek"
                ? 2
                : undefined,
        EgitimSeviyesi:
          activeFilters.education === "all"
            ? undefined
            : egitimSeviyesiMap[activeFilters.education],
        YasMin:
          activeFilters.ageMin === ""
            ? undefined
            : Number(activeFilters.ageMin),

        YasMax:
          activeFilters.ageMax === ""
            ? undefined
            : Number(activeFilters.ageMax),
        ...tabParams,
      });

      const pagedData = response?.data || response?.Data;

      setPaginationMeta({
        pageNumber: pagedData?.pageNumber ?? pagedData?.PageNumber ?? 1,
        pageSize: pagedData?.pageSize ?? pagedData?.PageSize ?? 10,
        totalRecords: pagedData?.totalRecords ?? pagedData?.TotalRecords ?? 0,
        totalPages: pagedData?.totalPages ?? pagedData?.TotalPages ?? 0,
      });

      const rawData = response?.data || response?.data?.data || response || [];
      const actualList = Array.isArray(rawData) ? rawData : rawData.data || [];

      const mappedData = actualList.map((item) => {
        const egitimSeviyeleri =
          item.egitimSeviyeleri || item.EgitimSeviyeleri || [];

        const sevkler = item.sevkler || item.Sevkler || [];

        return {
          id: item.id || item.Id,

          personelId: item.personelId || item.PersonelId,

          ad: item.ad || item.Ad || "-",

          soyad: item.soyad || item.Soyad || "-",

          statusId: Number(item.basvuruDurum ?? item.BasvuruDurum),

          approvalStage: Number(
            item.basvuruOnayAsamasi ?? item.BasvuruOnayAsamasi,
          ),

          tamamenReddedildiMi: Boolean(
            item.tamamenReddedildiMi ?? item.TamamenReddedildiMi ?? false,
          ),

          personal: {
            foto: resolveImageUrl(item.fotografYolu || item.FotografYolu),

            birthDate: item.dogumTarihi || item.DogumTarihi || null,

            genderText:
              Number(item.cinsiyet ?? item.Cinsiyet) === 2
                ? "Erkek"
                : Number(item.cinsiyet ?? item.Cinsiyet) === 1
                  ? "Kadın"
                  : "Belirsiz",
          },

          date: item.basvuruTarihi || item.BasvuruTarihi,

          status: item.basvuruDurumAdi || item.BasvuruDurumAdi || "",

          iseBaslamaTarihi:
            item.iseBaslamaTarihi || item.IseBaslamaTarihi || null,

          branches: item.subeler || item.Subeler || [],

          areas: item.alanlar || item.Alanlar || [],

          departments: item.departmanlar || item.Departmanlar || [],

          roles: item.pozisyonlar || item.Pozisyonlar || [],

          educations: egitimSeviyeleri
            .map((e) => EGITIM_SEVIYELERI[e] || null)
            .filter(Boolean),

          appliedBranchIds:
            item.basvuruSubeIdleri || item.BasvuruSubeIdleri || [],

          appliedDepartmentIds:
            item.basvuruDepartmanIdleri || item.BasvuruDepartmanIdleri || [],

          sevkler: sevkler.map((s) => ({
            subeId: Number(s.subeId ?? s.SubeId ?? 0),

            subeAdi: s.subeAdi || s.SubeAdi || "",

            sevkDurumu: Number(s.sevkDurumu ?? s.SevkDurumu ?? 0),

            departmanId: Number(s.departmanId ?? s.DepartmanId ?? 0),

            masterDepartmanId: Number(
              s.masterDepartmanId ?? s.MasterDepartmanId ?? 0,
            ),

            masterAlanId: Number(s.masterAlanId ?? s.MasterAlanId ?? 0),
          })),
        };
      });
      setApplicationData(mappedData);
    } catch {
      toast.error("Veriler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [
    pageNumber,
    pageSize,
    sorting,
    search,
    branchFilter,
    tab,
    stageFilter,
    activeFilters,
    lookups.subeler,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (view === "pending") {
      setTab("pending");
      searchParams.delete("view");
      setSearchParams(searchParams, { replace: true });
    }
  }, [view, setSearchParams, searchParams, activeFilters]);

  const filteredData = applicationData;

  return {
    applicationData,
    filteredData,
    loading,
    tab,
    setTab,
    branchFilter,
    setBranchFilter,
    stageFilter,
    setStageFilter,
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
    paginationMeta,
    pageNumber,
    setPageNumber,
    pageSize,
    setPageSize,
    search,
    setSearch,
    initialLoading,
    initialFilters,
    sorting,
    setSorting,
  };
}
