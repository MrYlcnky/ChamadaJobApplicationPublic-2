import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faMoneyBillWave,
  faCalendarAlt,
  faUserTie,
  faBuilding,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { gorevAtamaService } from "../../../../../services/gorevAtamaService";
import { tanimlamalarService } from "../../../../../services/tanimlamalarService";
import MuiDateStringField from "../../../../../components/Users/Date/MuiDateStringField";
import DarkSelect from "../../../../Ortak/DarkSelect";

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

  // 🎯 YETKİ VE AŞAMA KONTROLLERİ
  const rid = Number(auth?.rolId || auth?.roleId);
  const isSuperAdmin = rid === 1;

  const isIK = rid <= 4;
  const isDM = rid === 6;

  const isDMStage2 = isDM && Number(currentStageId) === 2;
  const isIKStage3 = isIK && Number(currentStageId) === 3;

  // Form genel olarak bu rollerde ve aşamalarda düzenlenebilir.
  const canEditForm = isDMStage2 || isIKStage3 || isSuperAdmin;

  // Departman müdürünün düzenleyebileceği görev ve teklif alanları.
  const canEditDepartmentFields = isDMStage2 || isSuperAdmin;

  // İK'nın düzenleyebileceği pozisyon bütçesi, kadro ve belge alanları.
  const canEditIkFields = isIKStage3 || isSuperAdmin;

  // Mevcut görev, departman ve ücret alanlarında kullanılmaya devam edecek.
  const isOnlyDateEditable = isIKStage3 && !isSuperAdmin;

  const today = new Date().toISOString().split("T")[0];

  // 🎯 SÜPER ADMİN İÇİN ADAYIN SEVK EDİLDİĞİ DEPARTMANLARI ÇIKARTIYORUZ
  const availableDepartments = React.useMemo(() => {
    if (!isSuperAdmin) return [];

    const sevkler = rawData?.basvuruSevkleri || rawData?.BasvuruSevkleri || [];
    const depts = new Map();

    // 1. AutoMapper ile veri düzleştiği için artık doğrudan 's' objesinin içinden okuyoruz!
    sevkler.forEach((s) => {
      // DİKKAT: Artık s.departman aramıyoruz!
      const mDepId = s.masterDepartmanId || s.MasterDepartmanId;
      const mDepAdi =
        s.masterDepartmanAdi || s.MasterDepartmanAdi || "Bilinmeyen Departman";

      if (mDepId && mDepId !== 0 && !depts.has(mDepId)) {
        depts.set(mDepId, { id: mDepId, adi: mDepAdi });
      }
    });

    // 2. Eğer sevk yoksa adayın başvuru formunda seçtiği departmanlardan yedeği al
    // (Burası Personel içinden geldiği için hala iç içe yapıdadır, böyle kalmalı)
    if (depts.size === 0) {
      const basvuruDepts =
        rawData?.personel?.isBasvuruDetay?.basvuruDepartmanlar ||
        rawData?.Personel?.IsBasvuruDetay?.BasvuruDepartmanlar ||
        [];
      basvuruDepts.forEach((d) => {
        const dep = d.departman || d.Departman;
        if (dep) {
          const mDepId = dep.masterDepartmanId || dep.MasterDepartmanId;
          const mDepAdi =
            dep.masterDepartman?.masterDepartmanAdi ||
            dep.MasterDepartman?.MasterDepartmanAdi ||
            "Seçilen Departman";
          if (mDepId && !depts.has(mDepId)) {
            depts.set(mDepId, { id: mDepId, adi: mDepAdi });
          }
        }
      });
    }
    return Array.from(depts.values());
  }, [rawData, isSuperAdmin]);

  // 1. USE-EFFECT: SADECE KAYDI (EXISTING DATA) ÇEKER
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const atamaRes = await gorevAtamaService.getByPersonelId(personelId);
        let data = null;

        if (atamaRes?.data?.success && atamaRes?.data?.data) {
          data = atamaRes.data.data;
          if (isMounted) setExistingData(data);
        }

        if (isMounted) {
          if (data) {
            setJobOfferData({
              id: data.id,
              masterDepartmanId: data.masterDepartmanId,
              gorevId: data.gorevId,
              netUcret: data.netUcret || "",
              talepEdilenGorevGenelButcesi:
                data.talepEdilenGorevGenelButcesi || "",
              pozisyonButcesiVarMi: data.pozisyonButcesiVarMi ?? "",
              aktifCalisanPersonel: data.aktifCalisanPersonel ?? "",
              pozisyondaCalismasiGerekenPersonelSayisi:
                data.pozisyondaCalismasiGerekenPersonelSayisi ?? "",
              totalPozisyonButcesi: data.totalPozisyonButcesi ?? "",
              calismaIzinBelgeTuruId: data.calismaIzinBelgeTuruId ?? "",

              baslangicTarihi: data.baslangicTarihi
                ? data.baslangicTarihi.split("T")[0]
                : "",
              talepNedeni: data.talepNedeni || 1,
              yerineAlinacakKisiAdSoyad: data.yerineAlinacakKisiAdSoyad || "",
              yerineAlinacakKisiCikisTarihi: data.yerineAlinacakKisiCikisTarihi
                ? data.yerineAlinacakKisiCikisTarihi.split("T")[0]
                : "",
            });
          } else if (isDMStage2 && !isSuperAdmin) {
            // Normal DM ise departmanını otomatik doldur
            setJobOfferData((prev) => ({
              ...prev,
              masterDepartmanId: auth?.masterDepartmanId,
            }));
          }
        }
      } catch {
        console.log("Atama kaydı bulunamadı veya henüz oluşturulmamış.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [personelId, auth, isDMStage2, isSuperAdmin, setJobOfferData]);

  // 2. USE-EFFECT: GÖREVLERİ (TASKS) SEÇİLİ DEPARTMANA GÖRE DİNAMİK ÇEKER
  useEffect(() => {
    let isMounted = true;

    const fetchGorevler = async () => {
      // Formdaki seçili departmanı al
      const targetDeptId = jobOfferData.masterDepartmanId;

      if (!targetDeptId) {
        if (isMounted) setGorevler([]);
        return;
      }

      try {
        const gorevRes =
          await gorevAtamaService.getGorevlerByDepartmanId(targetDeptId);
        if (isMounted) setGorevler(gorevRes?.data?.data || []);
      } catch {
        console.log("Görevler çekilemedi.");
      }
    };

    if (canEditForm) {
      fetchGorevler();
    }

    return () => {
      isMounted = false;
    };
  }, [jobOfferData.masterDepartmanId, canEditForm]);

  useEffect(() => {
    let isMounted = true;

    const fetchCalismaIzinBelgeTurleri = async () => {
      try {
        const response = await tanimlamalarService.getCalismaIzinBelgeTurleri();

        if (isMounted) {
          setCalismaIzinBelgeTurleri(
            response?.success ? response.data || [] : [],
          );
        }
      } catch (error) {
        console.error("Çalışma izin belge türleri yüklenemedi:", error);

        if (isMounted) {
          setCalismaIzinBelgeTurleri([]);
        }
      }
    };

    fetchCalismaIzinBelgeTurleri();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Departman değişirse, seçili görev sıfırlansın
    if (name === "masterDepartmanId") {
      setJobOfferData((prev) => ({
        ...prev,
        [name]: value,
        gorevId: "",
      }));
      return;
    }

    if (name === "pozisyonButcesiVarMi") {
      const yeniDeger = value === "" ? "" : value === "true";

      setJobOfferData((prev) => ({
        ...prev,
        pozisyonButcesiVarMi: yeniDeger,

        // Bütçe yok veya seçim kaldırıldıysa toplam bütçeyi temizle
        ...(yeniDeger !== true
          ? {
              totalPozisyonButcesi: "",
            }
          : {}),
      }));

      return;
    }

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

    // Talep nedeni "Yeni Kadro" yapılırsa yerine alınacak kişi alanları temizlensin
    if (name === "talepNedeni") {
      const yeniTalepNedeni = Number(value);

      setJobOfferData((prev) => ({
        ...prev,
        talepNedeni: yeniTalepNedeni,
        ...(yeniTalepNedeni === 1
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

  const getInputClass = (disabled) => {
    return `w-full bg-gray-900 border rounded-lg p-2.5 outline-none transition-all ${
      disabled
        ? "border-gray-700/50 text-gray-500 cursor-not-allowed opacity-70 shadow-inner"
        : "border-sky-500/50 text-white focus:border-sky-500"
    }`;
  };

  // 1. YÜKLENİYOR DURUMU
  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500 animate-pulse">
        Görev detayları yükleniyor...
      </div>
    );
  }

  // 2. HENÜZ GİRİLMEMİŞ DURUM
  if (!canEditForm && !existingData) {
    return (
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 text-center">
        <FontAwesomeIcon
          icon={faBriefcase}
          className="text-4xl text-gray-600 mb-3"
        />
        <h4 className="text-gray-400 font-semibold">
          Henüz Görev Ataması Yapılmamış
        </h4>
        <p className="text-gray-500 text-sm mt-1">
          Departman yöneticisi tarafından değerlendirme aşamasında görev ve maaş
          bilgileri girilecektir.
        </p>
      </div>
    );
  }

  // 3. SADECE OKUNUR (READ-ONLY) DURUM
  if (!canEditForm && existingData) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
          <h4 className="text-sky-400 font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faBriefcase} /> Görev & Teklif Detayları
          </h4>
          <span className="text-xs text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-gray-700">
            Onaylayan:{" "}
            <strong className="text-gray-300">
              {existingData.onaylayanKullaniciAdSoyad}
            </strong>
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
            value={new Date(existingData.baslangicTarihi).toLocaleDateString(
              "tr-TR",
            )}
          />
          <DetailItem
            icon={faMoneyBillWave}
            label="Önerilen Net Ücret"
            value={`₺ ${existingData.netUcret?.toLocaleString("tr-TR")}`}
            highlight
          />
          <DetailItem
            icon={faMoneyBillWave}
            label="Kadro Bütçesi"
            value={`₺ ${existingData.talepEdilenGorevGenelButcesi?.toLocaleString("tr-TR")}`}
          />
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
              value={
                existingData.totalPozisyonButcesi != null
                  ? `₺ ${Number(
                      existingData.totalPozisyonButcesi,
                    ).toLocaleString("tr-TR")}`
                  : "-"
              }
            />
          )}
          <DetailItem
            icon={faUserTie}
            label="Aktif Çalışan Personel"
            value={
              existingData.aktifCalisanPersonel != null
                ? existingData.aktifCalisanPersonel
                : "-"
            }
          />
          <DetailItem
            icon={faUserTie}
            label="Olması Gereken Personel"
            value={
              existingData.pozisyondaCalismasiGerekenPersonelSayisi != null
                ? existingData.pozisyondaCalismasiGerekenPersonelSayisi
                : "-"
            }
          />
          <DetailItem
            icon={faInfoCircle}
            label="Çalışma İzin Belge Türü"
            value={existingData.calismaIzinBelgeTuruAdi || "-"}
          />
          <DetailItem
            icon={faMoneyBillWave}
            label="Kadro Bütçesi"
            value={`₺ ${existingData.talepEdilenGorevGenelButcesi?.toLocaleString(
              "tr-TR",
            )}`}
          />
          <DetailItem
            icon={faBriefcase}
            label="Talep Nedeni"
            value={
              existingData.talepNedeni === 1
                ? "Yeni Kadro"
                : `Yerine (${existingData.yerineAlinacakKisiAdSoyad})`
            }
            badge={
              existingData.talepNedeni === 1
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-amber-500/20 text-amber-400"
            }
          />

          {existingData.talepNedeni === 2 &&
            existingData.yerineAlinacakKisiCikisTarihi && (
              <DetailItem
                icon={faCalendarAlt}
                label="Ayrılacak Kişinin Çıkışı"
                value={new Date(
                  existingData.yerineAlinacakKisiCikisTarihi,
                ).toLocaleDateString("tr-TR")}
              />
            )}
        </div>
      </div>
    );
  }

  const isYerineAlim = Number(jobOfferData.talepNedeni) === 2;

  const yerineAlimAlanlariDisabled = !canEditDepartmentFields || !isYerineAlim;

  const totalPozisyonButcesiDisabled =
    !canEditIkFields || jobOfferData.pozisyonButcesiVarMi !== true;

  // 4. FORMLU DURUM (DM, İK veya SÜPER ADMİN İÇİN)
  return (
    <div className="bg-gray-800 border border-sky-500/30 rounded-xl p-6 shadow-lg shadow-sky-900/10">
      {/* Başlık */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6 pb-3 border-b border-gray-700">
        <h4 className="text-lg font-bold text-white flex items-center gap-2">
          <FontAwesomeIcon icon={faBriefcase} className="text-sky-500" />
          Görev & Maaş Atama Formu
        </h4>

        <div className="flex items-center gap-3">
          {isOnlyDateEditable ? (
            <span className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded border border-amber-500/30 flex items-center gap-1 font-bold">
              <FontAwesomeIcon icon={faInfoCircle} />
              İK KONTROL ALANLARI
            </span>
          ) : (
            <span className="text-xs text-sky-400 bg-sky-500/10 px-3 py-1 rounded border border-sky-500/20">
              Zorunlu Alanlar
            </span>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {/* 1. SATIR: 4 ALAN */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* Departman */}
          <div>
            <label className="block text-xs text-gray-500 font-semibold mb-1 uppercase">
              Departman
            </label>

            {isSuperAdmin && canEditDepartmentFields ? (
              <div className="relative">
                <select
                  name="masterDepartmanId"
                  value={jobOfferData.masterDepartmanId || ""}
                  onChange={handleInputChange}
                  disabled={!canEditDepartmentFields}
                  className={getModernSelectClass(!canEditDepartmentFields)}
                >
                  <option value="" className={optionClassName}>
                    Departman Seçiniz...
                  </option>

                  {availableDepartments.map((departman) => (
                    <option
                      key={departman.id}
                      value={departman.id}
                      className={optionClassName}
                    >
                      {departman.adi}
                    </option>
                  ))}

                  {existingData &&
                    !availableDepartments.find(
                      (departman) =>
                        Number(departman.id) ===
                        Number(existingData.masterDepartmanId),
                    ) && (
                      <option
                        value={existingData.masterDepartmanId}
                        className={optionClassName}
                      >
                        {existingData.masterDepartmanAdi}
                      </option>
                    )}
                </select>

                <SelectChevron disabled={!canEditDepartmentFields} />
              </div>
            ) : (
              <div className="w-full min-h-[42px] bg-gray-900/50 border border-gray-700/50 text-gray-500 rounded-lg p-2.5 cursor-not-allowed flex items-center gap-2 shadow-inner">
                <FontAwesomeIcon icon={faBuilding} className="text-gray-600" />

                {existingData?.masterDepartmanAdi ||
                  auth?.masterDepartmanAdi ||
                  "Departman Bilgisi Bekleniyor..."}
              </div>
            )}
          </div>

          {/* Atanacak Görev */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1 uppercase ${
                canEditDepartmentFields ? "text-sky-400" : "text-gray-500"
              }`}
            >
              Atanacak Görev
            </label>

            <div className="relative">
              <select
                name="gorevId"
                value={jobOfferData.gorevId || ""}
                onChange={handleInputChange}
                disabled={!canEditDepartmentFields || gorevler.length === 0}
                className={getModernSelectClass(
                  !canEditDepartmentFields || gorevler.length === 0,
                )}
              >
                <option value="" className={optionClassName}>
                  {jobOfferData.masterDepartmanId
                    ? "Görev Seçiniz..."
                    : "Önce Departman Seçiniz"}
                </option>

                {gorevler.map((gorev) => (
                  <option
                    key={gorev.id}
                    value={gorev.id}
                    className={optionClassName}
                  >
                    {gorev.masterGorevAdi}
                  </option>
                ))}
              </select>

              <SelectChevron
                disabled={!canEditDepartmentFields || gorevler.length === 0}
              />
            </div>
          </div>

          {/* Başlama Tarihi */}
          <div className="dark-date-picker">
            <MuiDateStringField
              label="Başlama Tarihi"
              variant="dark"
              name="baslangicTarihi"
              value={jobOfferData.baslangicTarihi}
              onChange={handleInputChange}
              displayFormat="dd.MM.yyyy"
              min={today}
              disabled={!canEditForm}
            />
          </div>

          {/* Talep Nedeni */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1 uppercase ${
                canEditDepartmentFields ? "text-sky-400" : "text-gray-500"
              }`}
            >
              Talep Nedeni
            </label>

            <div className="relative">
              <select
                name="talepNedeni"
                value={jobOfferData.talepNedeni}
                onChange={handleInputChange}
                disabled={!canEditDepartmentFields}
                className={getModernSelectClass(!canEditDepartmentFields)}
              >
                <option value={1} className={optionClassName}>
                  Yeni Kadro
                </option>

                <option value={2} className={optionClassName}>
                  Yerine Alım
                </option>
              </select>

              <SelectChevron disabled={!canEditDepartmentFields} />
            </div>
          </div>
        </div>

        {/* 2. SATIR: 4 ALAN */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* Önerilen Net Ücret */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1 uppercase ${
                canEditDepartmentFields ? "text-sky-400" : "text-gray-500"
              }`}
            >
              Önerilen Net Ücret (₺)
            </label>

            <input
              type="number"
              name="netUcret"
              min="0"
              placeholder="Örn: 45000"
              value={jobOfferData.netUcret ?? ""}
              onChange={handleInputChange}
              disabled={!canEditDepartmentFields}
              className={getInputClass(!canEditDepartmentFields)}
            />
          </div>

          {/* Pozisyon Standart Bütçesi */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1 uppercase ${
                canEditDepartmentFields ? "text-sky-400" : "text-gray-500"
              }`}
            >
              Pozisyon Standart Bütçesi (₺)
            </label>

            <input
              type="number"
              name="talepEdilenGorevGenelButcesi"
              min="0"
              placeholder="Örn: 50000"
              value={jobOfferData.talepEdilenGorevGenelButcesi ?? ""}
              onChange={handleInputChange}
              disabled={!canEditDepartmentFields}
              className={getInputClass(!canEditDepartmentFields)}
            />
          </div>

          {/* Kimin Yerine Alınıyor */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1 uppercase ${
                !yerineAlimAlanlariDisabled ? "text-amber-400" : "text-gray-500"
              }`}
            >
              Kimin Yerine Alınıyor?
            </label>

            <input
              type="text"
              name="yerineAlinacakKisiAdSoyad"
              placeholder={
                isYerineAlim
                  ? "Ayrılan personelin adı ve soyadı"
                  : "Talep nedeni Yerine Alım olmalıdır"
              }
              value={jobOfferData.yerineAlinacakKisiAdSoyad ?? ""}
              onChange={handleInputChange}
              disabled={yerineAlimAlanlariDisabled}
              className={`${getInputClass(yerineAlimAlanlariDisabled)} ${
                !yerineAlimAlanlariDisabled
                  ? "border-amber-500/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
                  : ""
              }`}
            />
          </div>

          {/* Ayrılacak Kişi Çıkış Tarihi */}
          <div className="dark-date-picker">
            <MuiDateStringField
              label="Ayrılacak Kişi Çıkış Tarihi"
              variant="dark"
              name="yerineAlinacakKisiCikisTarihi"
              value={jobOfferData.yerineAlinacakKisiCikisTarihi}
              onChange={handleInputChange}
              displayFormat="dd.MM.yyyy"
              disabled={yerineAlimAlanlariDisabled}
            />
          </div>
        </div>

        {/* 3. SATIR: 4 ALAN */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* Pozisyon Bütçesi Var mı */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1 uppercase ${
                canEditIkFields ? "text-sky-400" : "text-gray-500"
              }`}
            >
              Pozisyon Bütçesi Var mı?
            </label>

            <div className="relative">
              <select
                name="pozisyonButcesiVarMi"
                value={
                  jobOfferData.pozisyonButcesiVarMi === true
                    ? "true"
                    : jobOfferData.pozisyonButcesiVarMi === false
                      ? "false"
                      : ""
                }
                onChange={handleInputChange}
                disabled={!canEditIkFields}
                className={getModernSelectClass(!canEditIkFields)}
              >
                <option value="" className={optionClassName}>
                  Seçiniz...
                </option>

                <option value="true" className={optionClassName}>
                  Evet
                </option>

                <option value="false" className={optionClassName}>
                  Hayır
                </option>
              </select>

              <SelectChevron disabled={!canEditIkFields} />
            </div>
          </div>

          {/* Olması Gereken Personel */}
          <div>
            <label
              className={`block text-[11px] font-semibold mb-1 uppercase ${
                canEditIkFields ? "text-sky-400" : "text-gray-500"
              }`}
            >
              Pozisyonda Olması Gereken Personel Sayısı
            </label>

            <input
              type="number"
              name="pozisyondaCalismasiGerekenPersonelSayisi"
              min="0"
              step="1"
              placeholder="Örn: 10"
              value={
                jobOfferData.pozisyondaCalismasiGerekenPersonelSayisi ?? ""
              }
              onChange={handleInputChange}
              disabled={!canEditIkFields}
              className={getInputClass(!canEditIkFields)}
            />
          </div>

          {/* Aktif Çalışan Personel */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1 uppercase ${
                canEditIkFields ? "text-sky-400" : "text-gray-500"
              }`}
            >
              Aktif Çalışan Personel Sayısı
            </label>

            <input
              type="number"
              name="aktifCalisanPersonel"
              min="0"
              step="1"
              placeholder="Örn: 7"
              value={jobOfferData.aktifCalisanPersonel ?? ""}
              onChange={handleInputChange}
              disabled={!canEditIkFields}
              className={getInputClass(!canEditIkFields)}
            />
          </div>

          {/* Toplam Pozisyon Bütçesi */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1 uppercase ${
                !totalPozisyonButcesiDisabled ? "text-sky-400" : "text-gray-500"
              }`}
            >
              Toplam Pozisyon Bütçesi (₺)
            </label>

            <input
              type="number"
              name="totalPozisyonButcesi"
              min="1"
              step="1"
              placeholder={
                jobOfferData.pozisyonButcesiVarMi === true
                  ? "Örn: 250000"
                  : "Önce bütçe durumunu Evet seçiniz"
              }
              value={jobOfferData.totalPozisyonButcesi ?? ""}
              onChange={handleInputChange}
              disabled={totalPozisyonButcesiDisabled}
              className={getInputClass(totalPozisyonButcesiDisabled)}
            />
          </div>
        </div>

        {/* 4. SATIR: 1 ALAN */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div>
            <label
              className={`block text-xs font-semibold mb-1 uppercase ${
                canEditIkFields ? "text-sky-400" : "text-gray-500"
              }`}
            >
              Çalışma İzin Belge Türü
            </label>

            <div className="relative">
              <select
                name="calismaIzinBelgeTuruId"
                value={jobOfferData.calismaIzinBelgeTuruId ?? ""}
                onChange={handleInputChange}
                disabled={!canEditIkFields}
                className={getModernSelectClass(!canEditIkFields)}
              >
                <option value="" className={optionClassName}>
                  Belge türü seçiniz...
                </option>

                {calismaIzinBelgeTurleri.map((belge) => {
                  const belgeId = belge.id ?? belge.Id;
                  const belgeAdi = belge.belgeAdi ?? belge.BelgeAdi;

                  return (
                    <option
                      key={belgeId}
                      value={belgeId}
                      className={optionClassName}
                    >
                      {belgeAdi}
                    </option>
                  );
                })}
              </select>

              <SelectChevron disabled={!canEditIkFields} />
            </div>
          </div>
        </div>
      </div>

      {/* Bilgilendirme */}
      <div
        className={`mt-6 p-3 rounded-lg flex items-start gap-3 border ${
          isOnlyDateEditable
            ? "bg-amber-900/10 border-amber-500/20"
            : "bg-sky-900/20 border-sky-500/20"
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

function DetailItem({ icon, label, value, highlight, badge }) {
  return (
    <div>
      <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">
        {label}
      </span>
      <div
        className={`flex items-center gap-3 font-semibold ${highlight ? "text-sky-400 text-lg" : "text-gray-200"}`}
      >
        <FontAwesomeIcon
          icon={icon}
          className={highlight ? "text-sky-500/50" : "text-gray-600"}
        />
        {badge ? (
          <span
            className={`px-2.5 py-0.5 rounded text-xs border ${badge} border-current`}
          >
            {value}
          </span>
        ) : (
          value || "-"
        )}
      </div>
    </div>
  );
}
