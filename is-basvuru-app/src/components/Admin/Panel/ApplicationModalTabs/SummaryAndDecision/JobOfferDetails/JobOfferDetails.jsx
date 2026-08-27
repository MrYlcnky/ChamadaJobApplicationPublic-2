import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faMoneyBillWave,
  faCalendarAlt,
  faUserTie,
  faBuilding,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

import { gorevAtamaService } from "../../../../../../services/gorevAtamaService";
import { tanimlamalarService } from "../../../../../../services/tanimlamalarService";

import JobOfferAssignmentFields from "./JobOfferAssignmentFields";
import JobOfferIkControlFields from "./JobOfferIkControlFields";

const normalizeDateForInput = (value) => {
  if (!value) {
    return "";
  }

  return String(value).split("T")[0];
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("tr-TR");
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  return `₺ ${numericValue.toLocaleString("tr-TR")}`;
};

export default function JobOfferDetails({
  personelId,
  auth,
  currentStageId,
  jobOfferData,
  setJobOfferData,
  rawData,
}) {
  const [loading, setLoading] = useState(true);
  const [existingData, setExistingData] = useState(null);
  const [gorevler, setGorevler] = useState([]);
  const [calismaIzinBelgeTurleri, setCalismaIzinBelgeTurleri] = useState([]);

  /*
   * Yetki ve aşama kontrolleri
   */
  const roleId = Number(auth?.rolId || auth?.roleId);

  const isSuperAdmin = roleId === 1;
  const isIK = roleId >= 1 && roleId <= 4;
  const isDM = roleId === 6;

  const isDMStage2 = isDM && Number(currentStageId) === 2;

  const isIKStage3 = isIK && Number(currentStageId) === 3;

  /*
   * Formun herhangi bir kısmını düzenleme yetkisi.
   */
  const canEditForm = isDMStage2 || isIKStage3 || isSuperAdmin;

  /*
   * Departman müdürünün görev, ücret ve atama alanları.
   */
  const canEditDepartmentFields = isDMStage2 || isSuperAdmin;

  /*
   * İK'nın pozisyon bütçesi, personel sayıları
   * ve çalışma izin belgesi alanları.
   */
  const canEditIkFields = isIKStage3 || isSuperAdmin;

  /*
   * İK üçüncü aşamada görev ve ücret alanlarını
   * değiştiremez; tarih ve İK kontrol alanlarını
   * değiştirebilir.
   */
  const isOnlyDateEditable = isIKStage3 && !isSuperAdmin;

  const totalPozisyonButcesiDisabled =
    !canEditIkFields || jobOfferData.pozisyonButcesiVarMi !== true;

  const today = new Date().toISOString().split("T")[0];

  /*
   * Süper Admin için adayın sevk edildiği
   * departmanları çıkartır.
   */
  const availableDepartments = useMemo(() => {
    if (!isSuperAdmin) {
      return [];
    }

    const sevkler = rawData?.basvuruSevkleri || rawData?.BasvuruSevkleri || [];

    const departments = new Map();

    sevkler.forEach((sevk) => {
      const masterDepartmanId =
        sevk.masterDepartmanId || sevk.MasterDepartmanId;

      const masterDepartmanAdi =
        sevk.masterDepartmanAdi ||
        sevk.MasterDepartmanAdi ||
        "Bilinmeyen Departman";

      if (
        masterDepartmanId &&
        Number(masterDepartmanId) !== 0 &&
        !departments.has(Number(masterDepartmanId))
      ) {
        departments.set(Number(masterDepartmanId), {
          id: Number(masterDepartmanId),
          adi: masterDepartmanAdi,
        });
      }
    });

    /*
     * Sevk kaydı bulunmuyorsa başvuru formunda
     * seçilen departmanlardan yedek veri alınır.
     */
    if (departments.size === 0) {
      const basvuruDepartmanlar =
        rawData?.personel?.isBasvuruDetay?.basvuruDepartmanlar ||
        rawData?.Personel?.IsBasvuruDetay?.BasvuruDepartmanlar ||
        [];

      basvuruDepartmanlar.forEach((item) => {
        const departman = item.departman || item.Departman;

        if (!departman) {
          return;
        }

        const masterDepartmanId =
          departman.masterDepartmanId || departman.MasterDepartmanId;

        const masterDepartmanAdi =
          departman.masterDepartman?.masterDepartmanAdi ||
          departman.MasterDepartman?.MasterDepartmanAdi ||
          "Seçilen Departman";

        if (masterDepartmanId && !departments.has(Number(masterDepartmanId))) {
          departments.set(Number(masterDepartmanId), {
            id: Number(masterDepartmanId),
            adi: masterDepartmanAdi,
          });
        }
      });
    }

    return Array.from(departments.values());
  }, [rawData, isSuperAdmin]);

  /*
   * Mevcut görev atama kaydını getirir.
   */
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      if (!personelId) {
        if (isMounted) {
          setLoading(false);
        }

        return;
      }

      setLoading(true);

      try {
        const response = await gorevAtamaService.getByPersonelId(personelId);

        const responseBody = response?.data;

        const data =
          responseBody?.data || (responseBody?.id ? responseBody : null);

        if (!isMounted) {
          return;
        }

        if (data) {
          setExistingData(data);

          setJobOfferData({
            id: data.id ?? 0,

            masterDepartmanId: data.masterDepartmanId ?? "",

            gorevId: data.gorevId ?? "",

            netUcret: data.netUcret ?? "",

            talepEdilenGorevGenelButcesi:
              data.talepEdilenGorevGenelButcesi ?? "",

            pozisyonButcesiVarMi: data.pozisyonButcesiVarMi ?? "",

            aktifCalisanPersonel: data.aktifCalisanPersonel ?? "",

            pozisyondaCalismasiGerekenPersonelSayisi:
              data.pozisyondaCalismasiGerekenPersonelSayisi ?? "",

            totalPozisyonButcesi: data.totalPozisyonButcesi ?? "",

            calismaIzinBelgeTuruId: data.calismaIzinBelgeTuruId ?? "",

            baslangicTarihi: normalizeDateForInput(data.baslangicTarihi),

            talepNedeni: data.talepNedeni ?? 1,

            yerineAlinacakKisiAdSoyad: data.yerineAlinacakKisiAdSoyad ?? "",

            yerineAlinacakKisiCikisTarihi: normalizeDateForInput(
              data.yerineAlinacakKisiCikisTarihi,
            ),
          });

          return;
        }

        setExistingData(null);

        /*
         * Departman müdürü ikinci aşamadaysa
         * kendi departmanı otomatik seçilir.
         */
        if (isDMStage2 && !isSuperAdmin) {
          setJobOfferData((prev) => ({
            ...prev,
            masterDepartmanId: auth?.masterDepartmanId ?? "",
          }));
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setExistingData(null);

        /*
         * Kayıt henüz oluşturulmamışsa servis
         * 404 döndürebilir. Bu durumda DM için
         * departman yine otomatik doldurulur.
         */
        if (isDMStage2 && !isSuperAdmin) {
          setJobOfferData((prev) => ({
            ...prev,
            masterDepartmanId: auth?.masterDepartmanId ?? "",
          }));
        }

        console.info("Görev atama kaydı henüz oluşturulmamış.", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [
    personelId,
    auth?.masterDepartmanId,
    isDMStage2,
    isSuperAdmin,
    setJobOfferData,
  ]);

  /*
   * Çalışma izin belge türlerini getirir.
   */
  useEffect(() => {
    let isMounted = true;

    const fetchCalismaIzinBelgeTurleri = async () => {
      try {
        const result = await tanimlamalarService.getCalismaIzinBelgeTurleri();

        if (!isMounted) {
          return;
        }

        const belgeTurleri = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : Array.isArray(result?.data?.data)
              ? result.data.data
              : [];

        setCalismaIzinBelgeTurleri(belgeTurleri);
      } catch (error) {
        if (isMounted) {
          setCalismaIzinBelgeTurleri([]);
        }

        console.error("Çalışma izin belge türleri yüklenemedi.", error);
      }
    };

    fetchCalismaIzinBelgeTurleri();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
   * Seçilen departmana göre görevleri getirir.
   */
  useEffect(() => {
    let isMounted = true;

    const fetchGorevler = async () => {
      const masterDepartmanId = jobOfferData.masterDepartmanId;

      if (!masterDepartmanId) {
        if (isMounted) {
          setGorevler([]);
        }

        return;
      }

      try {
        const response =
          await gorevAtamaService.getGorevlerByDepartmanId(masterDepartmanId);

        if (!isMounted) {
          return;
        }

        const responseBody = response?.data;

        const gorevListesi = Array.isArray(responseBody?.data)
          ? responseBody.data
          : Array.isArray(responseBody)
            ? responseBody
            : [];

        setGorevler(gorevListesi);
      } catch (error) {
        if (isMounted) {
          setGorevler([]);
        }

        console.error("Departmana ait görevler yüklenemedi.", error);
      }
    };

    if (canEditForm) {
      fetchGorevler();
    } else {
      setGorevler([]);
    }

    return () => {
      isMounted = false;
    };
  }, [jobOfferData.masterDepartmanId, canEditForm]);

  /*
   * Standart input değişiklikleri.
   */
  const handleInputChange = (event) => {
    const { name, value } = event?.target || {};

    if (!name) {
      return;
    }

    /*
     * Departman değişirse eski görev seçimi
     * temizlenir.
     */
    if (name === "masterDepartmanId") {
      setJobOfferData((prev) => ({
        ...prev,
        masterDepartmanId: value,
        gorevId: "",
      }));

      return;
    }

    /*
     * Pozisyon bütçesi select değeri string
     * yerine boolean olarak tutulur.
     */
    if (name === "pozisyonButcesiVarMi") {
      const yeniDeger = value === "" ? "" : value === "true";

      setJobOfferData((prev) => ({
        ...prev,
        pozisyonButcesiVarMi: yeniDeger,

        ...(yeniDeger !== true
          ? {
              totalPozisyonButcesi: "",
            }
          : {}),
      }));

      return;
    }

    /*
     * Yeni nullable sayı alanları state içinde
     * number olarak tutulur.
     */
    const sayisalAlanlar = [
      "aktifCalisanPersonel",
      "pozisyondaCalismasiGerekenPersonelSayisi",
      "totalPozisyonButcesi",
      "calismaIzinBelgeTuruId",
    ];

    if (sayisalAlanlar.includes(name)) {
      setJobOfferData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
      }));

      return;
    }

    /*
     * Talep nedeni Yeni Kadro olarak değiştirilirse
     * yerine alınacak kişi bilgileri temizlenir.
     */
    if (name === "talepNedeni") {
      const yeniTalepNedeni = Number(value);

      setJobOfferData((prev) => ({
        ...prev,
        talepNedeni: yeniTalepNedeni,

        ...(yeniTalepNedeni !== 2
          ? {
              yerineAlinacakKisiAdSoyad: "",
              yerineAlinacakKisiCikisTarihi: "",
            }
          : {}),
      }));

      return;
    }

    setJobOfferData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /*
   * Yükleniyor durumu
   */
  if (loading) {
    return (
      <div className="animate-pulse p-4 text-center text-gray-500">
        Görev detayları yükleniyor...
      </div>
    );
  }

  /*
   * Görev ataması henüz yapılmamış ve kullanıcı
   * formu düzenleyemiyorsa bilgi ekranı gösterilir.
   */
  if (!canEditForm && !existingData) {
    return (
      <div className="rounded-xl border border-gray-700/50 bg-gray-800/30 p-6 text-center">
        <FontAwesomeIcon
          icon={faBriefcase}
          className="mb-3 text-4xl text-gray-600"
        />

        <h4 className="font-semibold text-gray-400">
          Henüz Görev Ataması Yapılmamış
        </h4>

        <p className="mt-1 text-sm text-gray-500">
          Departman yöneticisi tarafından değerlendirme aşamasında görev ve maaş
          bilgileri girilecektir.
        </p>
      </div>
    );
  }

  /*
   * Salt okunur detay ekranı
   */
  if (!canEditForm && existingData) {
    const talepNedeni =
      Number(existingData.talepNedeni) === 2 ? "Yerine Alım" : "Yeni Kadro";

    return (
      <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800/50">
        <div className="flex flex-col gap-3 border-b border-gray-700 bg-gray-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="flex items-center gap-2 font-bold text-sky-400">
            <FontAwesomeIcon icon={faBriefcase} />
            Görev & Teklif Detayları
          </h4>

          {existingData.onaylayanKullaniciAdSoyad && (
            <span className="rounded-full border border-gray-700 bg-gray-900 px-3 py-1 text-xs text-gray-500">
              Onaylayan:{" "}
              <strong className="text-gray-300">
                {existingData.onaylayanKullaniciAdSoyad}
              </strong>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <DetailItem
            icon={faBuilding}
            label="Departman"
            value={existingData.masterDepartmanAdi}
          />

          <DetailItem
            icon={faUserTie}
            label="Atanan Görev"
            value={existingData.gorevAdi}
          />

          <DetailItem
            icon={faCalendarAlt}
            label="Başlangıç Tarihi"
            value={formatDate(existingData.baslangicTarihi)}
          />

          <DetailItem
            icon={faBriefcase}
            label="Talep Nedeni"
            value={
              Number(existingData.talepNedeni) === 2 &&
              existingData.yerineAlinacakKisiAdSoyad
                ? `${talepNedeni} (${existingData.yerineAlinacakKisiAdSoyad})`
                : talepNedeni
            }
            badge={
              Number(existingData.talepNedeni) === 2
                ? "bg-amber-500/20 text-amber-400"
                : "bg-emerald-500/20 text-emerald-400"
            }
          />

          <DetailItem
            icon={faMoneyBillWave}
            label="Önerilen Net Ücret"
            value={formatCurrency(existingData.netUcret)}
            highlight
          />

          <DetailItem
            icon={faMoneyBillWave}
            label="Pozisyon Standart Bütçesi"
            value={formatCurrency(existingData.talepEdilenGorevGenelButcesi)}
          />

          {Number(existingData.talepNedeni) === 2 && (
            <>
              <DetailItem
                icon={faUserTie}
                label="Yerine Alınacak Kişi"
                value={existingData.yerineAlinacakKisiAdSoyad}
              />

              <DetailItem
                icon={faCalendarAlt}
                label="Ayrılacak Kişinin Çıkışı"
                value={formatDate(existingData.yerineAlinacakKisiCikisTarihi)}
              />
            </>
          )}

          <DetailItem
            icon={faMoneyBillWave}
            label="Pozisyon Bütçesi Var mı?"
            value={
              existingData.pozisyonButcesiVarMi === true
                ? "Evet"
                : existingData.pozisyonButcesiVarMi === false
                  ? "Hayır"
                  : "Belirtilmedi"
            }
          />

          {existingData.pozisyonButcesiVarMi === true && (
            <DetailItem
              icon={faMoneyBillWave}
              label="Toplam Pozisyon Bütçesi"
              value={formatCurrency(existingData.totalPozisyonButcesi)}
            />
          )}

          <DetailItem
            icon={faUserTie}
            label="Pozisyonda Olması Gereken Personel"
            value={existingData.pozisyondaCalismasiGerekenPersonelSayisi ?? "-"}
          />

          <DetailItem
            icon={faUserTie}
            label="Aktif Çalışan Personel"
            value={existingData.aktifCalisanPersonel ?? "-"}
          />

          <DetailItem
            icon={faInfoCircle}
            label="Çalışma İzin Belge Türü"
            value={existingData.calismaIzinBelgeTuruAdi || "-"}
          />
        </div>
      </div>
    );
  }

  /*
   * Düzenlenebilir form
   */
  return (
    <div className="rounded-xl border border-sky-500/30 bg-gray-800 p-6 shadow-lg shadow-sky-900/10">
      {/* Başlık */}
      <div className="mb-6 flex flex-col gap-3 border-b border-gray-700 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="flex items-center gap-2 text-lg font-bold text-white">
          <FontAwesomeIcon icon={faBriefcase} className="text-sky-500" />
          Görev & Maaş Atama Formu
        </h4>

        <div className="flex items-center gap-3">
          {isOnlyDateEditable ? (
            <span className="flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
              <FontAwesomeIcon icon={faInfoCircle} />
              İK KONTROL ALANLARI
            </span>
          ) : (
            <span className="rounded border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs text-sky-400">
              Zorunlu Alanlar
            </span>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <JobOfferAssignmentFields
          jobOfferData={jobOfferData}
          setJobOfferData={setJobOfferData}
          handleInputChange={handleInputChange}
          existingData={existingData}
          auth={auth}
          availableDepartments={availableDepartments}
          gorevler={gorevler}
          canEditForm={canEditForm}
          canEditDepartmentFields={canEditDepartmentFields}
          isSuperAdmin={isSuperAdmin}
          today={today}
        />

        <JobOfferIkControlFields
          jobOfferData={jobOfferData}
          setJobOfferData={setJobOfferData}
          handleInputChange={handleInputChange}
          canEditIkFields={canEditIkFields}
          totalPozisyonButcesiDisabled={totalPozisyonButcesiDisabled}
          calismaIzinBelgeTurleri={calismaIzinBelgeTurleri}
        />
      </div>

      {/* Bilgilendirme */}
      <div
        className={`mt-6 flex items-start gap-3 rounded-lg border p-3 ${
          isOnlyDateEditable
            ? "border-amber-500/20 bg-amber-900/10"
            : "border-sky-500/20 bg-sky-900/20"
        }`}
      >
        <FontAwesomeIcon
          icon={isOnlyDateEditable ? faInfoCircle : faBriefcase}
          className={`mt-0.5 ${
            isOnlyDateEditable ? "text-amber-500" : "text-sky-400"
          }`}
        />

        <p
          className={`text-xs leading-relaxed ${
            isOnlyDateEditable ? "text-amber-200/80" : "text-sky-200/70"
          }`}
        >
          {isOnlyDateEditable
            ? "İşe başlama tarihi, pozisyon bütçesi, personel sayıları ve çalışma izin belge türü güncellenebilir. Departman, görev, talep nedeni ve ücret alanları kilitlidir."
            : 'Formu doldurduktan sonra bilgilerin kaydedilmesi ve adayın bir sonraki aşamaya iletilmesi için ekranın altındaki "Onayla ve İlerlet" butonuna basınız.'}
        </p>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value, highlight = false, badge }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </span>

      <div
        className={`flex items-center gap-3 font-semibold ${
          highlight ? "text-lg text-sky-400" : "text-gray-200"
        }`}
      >
        <FontAwesomeIcon
          icon={icon}
          className={highlight ? "text-sky-500/50" : "text-gray-600"}
        />

        {badge ? (
          <span
            className={`rounded border border-current px-2.5 py-0.5 text-xs ${badge}`}
          >
            {value || "-"}
          </span>
        ) : (
          <span className="break-words">{value ?? "-"}</span>
        )}
      </div>
    </div>
  );
}
