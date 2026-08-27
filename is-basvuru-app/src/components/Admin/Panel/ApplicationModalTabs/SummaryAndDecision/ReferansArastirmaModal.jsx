import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faTimes,
  faInfoCircle,
  faUserClock,
  faBuildingUser,
  faClipboardCheck,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import { referansArastirmasiService } from "../../../../../services/referansArastirmasiService";
import Swal from "sweetalert2";

// 🎯 ZOD ŞEMASINI IMPORT EDİYORUZ
import { referansArastirmaSchema } from "../../../../../schemas/referansArastirmaSchema";

// Saat dilimi (Timezone) hatasını önleyen güvenli tarih fonksiyonları
const getLocalToday = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function ReferansArastirmaModal({
  masterBasvuruId,
  onClose,
  onSuccess,
  isDeneyimleri = [],
  editData = null,
}) {
  const [loading, setLoading] = useState(false);
  const [selectedExpId, setSelectedExpId] = useState("");

  const ULASILAMADI_TEXT = "Ulaşılamadı";
  const [ulasilamadi, setUlasilamadi] = useState(false);

  // 🎯 YENİ: Form Hatalarını Tutacağımız State
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    masterBasvuruId: Number(masterBasvuruId),
    gorusmeTarihi: "",
    referansIsYeriAdi: "",
    referansGorusulenAdSoyad: "",
    referansUnvan: "",
    gorusulenKisininTelefonu: "",
    adayIseBaslamaTarihi: "",
    adayIstenAyrilmaTarihi: "",
    ilkGorev: "",
    sonGorev: "",
    istenAyrilmaNedeni: "",
    disiplinKaydiVarMi: 0,
    disiplinKaydiAciklama: "",
    odulVarMi: 0,
    odulAciklama: "",
    istenAyrilisSureciSorunluMu: 0,
    istenAyrilisSorunAciklama: "",
    yenidenIseAlirMisin: 0,
    yenidenIseAlmamaNedeni: "",
    genelDegerlendirmeNotu: "",
  });

  useEffect(() => {
    if (editData) {
      const isUlasilamadi =
        editData.referansGorusulenAdSoyad === ULASILAMADI_TEXT ||
        editData.genelDegerlendirmeNotu === ULASILAMADI_TEXT;

      setUlasilamadi(isUlasilamadi);

      setFormData({
        ...editData,
        gorusmeTarihi:
          formatDateForInput(editData.gorusmeTarihi) || getLocalToday(),
        adayIseBaslamaTarihi: formatDateForInput(editData.adayIseBaslamaTarihi),
        adayIstenAyrilmaTarihi: formatDateForInput(
          editData.adayIstenAyrilmaTarihi,
        ),
      });
    } else {
      setUlasilamadi(false);

      // Yeni eklemede tarihi bugüne çek
      setFormData((prev) => ({
        ...prev,
        gorusmeTarihi: getLocalToday(),
      }));
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const numericFields = [
      "disiplinKaydiVarMi",
      "odulVarMi",
      "istenAyrilisSureciSorunluMu",
      "yenidenIseAlirMisin",
    ];

    const finalValue = numericFields.includes(name) ? Number(value) : value;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    // 🎯 Kullanıcı yazmaya başlayınca o inputun hatasını sil
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleUlasilamadiChange = (e) => {
    const checked = e.target.checked;
    setUlasilamadi(checked);

    if (checked) {
      setFormData((prev) => ({
        ...prev,
        referansGorusulenAdSoyad: ULASILAMADI_TEXT,
        genelDegerlendirmeNotu: ULASILAMADI_TEXT,
      }));

      setErrors((prev) => ({
        ...prev,
        referansGorusulenAdSoyad: null,
        genelDegerlendirmeNotu: null,
      }));

      return;
    }

    // Checkbox kaldırılırsa sadece otomatik yazılan değerleri temizle
    setFormData((prev) => ({
      ...prev,
      referansGorusulenAdSoyad:
        prev.referansGorusulenAdSoyad === ULASILAMADI_TEXT
          ? ""
          : prev.referansGorusulenAdSoyad,
      genelDegerlendirmeNotu:
        prev.genelDegerlendirmeNotu === ULASILAMADI_TEXT
          ? ""
          : prev.genelDegerlendirmeNotu,
    }));
  };

  const handleExperienceSelect = (e) => {
    setSelectedExpId(e.target.value);
  };

  const selectedExpData = selectedExpId
    ? isDeneyimleri.find((x) => String(x.id || x.Id) === String(selectedExpId))
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedFormData = ulasilamadi
      ? {
          ...formData,
          referansGorusulenAdSoyad: ULASILAMADI_TEXT,
          genelDegerlendirmeNotu: ULASILAMADI_TEXT,
        }
      : formData;

    const payload = {
      ...normalizedFormData,
      id: normalizedFormData.id ? Number(normalizedFormData.id) : 0,
      masterBasvuruId: Number(normalizedFormData.masterBasvuruId),
      disiplinKaydiVarMi: Number(normalizedFormData.disiplinKaydiVarMi),
      odulVarMi: Number(normalizedFormData.odulVarMi),
      istenAyrilisSureciSorunluMu: Number(
        normalizedFormData.istenAyrilisSureciSorunluMu,
      ),
      yenidenIseAlirMisin: Number(normalizedFormData.yenidenIseAlirMisin),
      adayIseBaslamaTarihi: normalizedFormData.adayIseBaslamaTarihi
        ? normalizedFormData.adayIseBaslamaTarihi
        : null,
      adayIstenAyrilmaTarihi: normalizedFormData.adayIstenAyrilmaTarihi
        ? normalizedFormData.adayIstenAyrilmaTarihi
        : null,
      gorusmeTarihi: normalizedFormData.gorusmeTarihi
        ? normalizedFormData.gorusmeTarihi
        : null,
    };

    // 🎯 ZOD VALIDASYONU KONTROLÜ
    const validationResult = referansArastirmaSchema.safeParse(payload);

    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);

      Swal.fire({
        icon: "warning",
        title: "Eksik Bilgiler",
        text: "Lütfen kırmızı ile işaretlenen zorunlu alanları doldurunuz.",
        background: "#1f2937",
        color: "#fff",
      });
      return; // Hata varsa burada durdur!
    }

    setLoading(true);

    try {
      let res;
      if (editData) {
        res = await referansArastirmasiService.update(payload);
      } else {
        res = await referansArastirmasiService.create(payload);
      }

      if (res.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Başarılı!",
          text: editData
            ? "Referans araştırması güncellendi."
            : "Referans araştırması sisteme işlendi.",
          background: "#1f2937",
          color: "#fff",
          confirmButtonColor: "#0ea5e9",
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error(error);
      const errorMsg =
        error.response?.data?.Message ||
        error.response?.data?.title ||
        "Lütfen alanları kontrol ediniz.";

      Swal.fire({
        icon: "error",
        title: "İşlem Hatası",
        text: errorMsg,
        background: "#1f2937",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMappedExpData = () => {
    if (!selectedExpData) return null;
    const e = selectedExpData;
    const sehir = e.sehirAdi || e.SehirAdi || "";
    const ulke = e.ulkeAdi || e.UlkeAdi || "";
    return {
      sirket: e.sirketAdi || e.SirketAdi || e.isAdi || e.IsAdi || "-",
      departman: e.departman || e.Departman || "",
      pozisyon: e.pozisyon || e.Pozisyon || "-",
      ucret: e.ucret || e.Ucret,
      lokasyon: sehir && ulke ? `${sehir} / ${ulke}` : sehir || ulke || "-",
      baslangic: e.baslangicTarihi || e.BaslangicTarihi,
      bitis: e.bitisTarihi || e.BitisTarihi,
      neden:
        e.ayrilisSebep ||
        e.AyrilisSebep ||
        e.ayrilisSebebi ||
        e.AyrilisSebebi ||
        "-",
    };
  };

  const expMap = getMappedExpData();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700/50 w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* HEADER */}
        <div className="bg-gray-800/80 px-6 py-5 border-b border-gray-700 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center border border-sky-500/30">
              <FontAwesomeIcon
                icon={faInfoCircle}
                className="text-sky-400 text-lg"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-wide">
                {editData
                  ? "Referans Araştırmasını Düzenle"
                  : "Referans Araştırması Ekle"}
              </h3>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                Adayın eski işyeriyle yapılan görüşme detaylarını giriniz.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all border border-transparent hover:border-gray-600"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* FORM BODY */}
        <div className="overflow-y-auto custom-scrollbar p-6 space-y-8 bg-gradient-to-b from-gray-900 to-gray-950">
          {/* CV'DEN İŞ DENEYİMİ SEÇİMİ VE READONLY KARTI */}
          {!editData && isDeneyimleri && isDeneyimleri.length > 0 && (
            <div className="bg-sky-900/10 border border-sky-500/30 rounded-2xl p-5 shadow-inner">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-3 md:w-1/3">
                  <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400">
                    <FontAwesomeIcon icon={faBriefcase} />
                  </div>
                  <div>
                    <h4 className="text-sky-400 text-sm font-bold uppercase">
                      Adayın CV'sine Göz At
                    </h4>
                    <p className="text-[10px] text-gray-400">
                      Görüşeceğiniz kurumu seçerek adayın girdiği bilgileri
                      görebilirsiniz.
                    </p>
                  </div>
                </div>

                <div className="md:w-2/3">
                  <select
                    value={selectedExpId}
                    onChange={handleExperienceSelect}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="">
                      -- Görüntülemek için bir kurum seçiniz --
                    </option>
                    {isDeneyimleri.map((exp) => (
                      <option key={exp.id || exp.Id} value={exp.id || exp.Id}>
                        {exp.sirketAdi ||
                          exp.SirketAdi ||
                          exp.isAdi ||
                          exp.IsAdi ||
                          "İsimsiz Kurum"}{" "}
                        - {exp.pozisyon || exp.Pozisyon || "-"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {expMap && (
                <div className="mt-5 bg-gray-900 border border-sky-500/30 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 shadow-lg">
                  <div className="bg-sky-500/10 px-5 py-2.5 border-b border-sky-500/20 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className="text-sky-400 text-sm"
                    />
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                      Adayın Kendi Beyanı
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-4 p-5">
                    <div>
                      <span className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                        Şirket / Departman
                      </span>
                      <span className="block text-sm text-white font-bold">
                        {expMap.sirket}
                      </span>
                      {expMap.departman && (
                        <span className="block text-xs text-gray-400 mt-0.5 uppercase">
                          {expMap.departman}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                        Pozisyon / Görev
                      </span>
                      <span className="block text-sm text-sky-400 font-bold">
                        {expMap.pozisyon}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                        Çalışma Süresi
                      </span>
                      <span className="block text-sm text-gray-200">
                        {expMap.baslangic
                          ? new Date(expMap.baslangic).toLocaleDateString(
                              "tr-TR",
                            )
                          : "-"}
                        <span className="text-gray-500 mx-1">-</span>
                        {expMap.bitis ? (
                          new Date(expMap.bitis).toLocaleDateString("tr-TR")
                        ) : (
                          <span className="text-emerald-500 text-xs font-bold uppercase">
                            Devam Ediyor
                          </span>
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                        Lokasyon / Şehir
                      </span>
                      <span className="block text-sm text-gray-300">
                        {expMap.lokasyon}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                        Maaş / Gelir
                      </span>
                      <span className="block text-sm text-emerald-400 font-mono font-bold">
                        {expMap.ucret
                          ? `${Number(expMap.ucret).toLocaleString("tr-TR")} ₺`
                          : "Belirtilmemiş"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 font-bold mb-1 uppercase">
                        Ayrılma Nedeni
                      </span>
                      <span
                        className="block text-sm text-gray-300 leading-relaxed truncate"
                        title={expMap.neden}
                      >
                        {expMap.neden}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <form id="refForm" onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Kurum Bilgileri */}
              <div className="bg-gray-800/30 p-5 rounded-2xl border border-gray-700/50 space-y-4">
                <h4 className="text-sky-400 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b border-gray-700/50 pb-2">
                  <FontAwesomeIcon icon={faBuildingUser} /> Görüşülen Kurum &
                  Kişi
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Eski İş Yeri Adı"
                      name="referansIsYeriAdi"
                      value={formData.referansIsYeriAdi}
                      onChange={handleChange}
                      placeholder="Örn: X Teknoloji A.Ş."
                      error={errors.referansIsYeriAdi}
                    />
                    <Input
                      label="Görüşme Tarihi"
                      type="date"
                      name="gorusmeTarihi"
                      value={formData.gorusmeTarihi}
                      onChange={handleChange}
                      error={errors.gorusmeTarihi}
                    />
                  </div>

                  <Input
                    label="Görüşülen Kişi (Ad Soyad)"
                    name="referansGorusulenAdSoyad"
                    value={formData.referansGorusulenAdSoyad}
                    onChange={handleChange}
                    placeholder="Örn: Ahmet Yılmaz"
                    error={errors.referansGorusulenAdSoyad}
                    readOnly={ulasilamadi}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Kişinin Ünvanı"
                      name="referansUnvan"
                      value={formData.referansUnvan}
                      onChange={handleChange}
                      placeholder="Örn: İK Müdürü"
                      error={errors.referansUnvan}
                    />
                    <Input
                      label="İletişim / Telefon"
                      name="gorusulenKisininTelefonu"
                      value={formData.gorusulenKisininTelefonu}
                      onChange={handleChange}
                      placeholder="05XX XXX XX XX"
                      error={errors.gorusulenKisininTelefonu}
                    />
                  </div>
                  <label className="flex items-center gap-3 bg-gray-900/60 border border-gray-700/80 rounded-xl px-4 py-3 cursor-pointer hover:border-sky-500/60 transition-all">
                    <input
                      type="checkbox"
                      checked={ulasilamadi}
                      onChange={handleUlasilamadiChange}
                      className="w-4 h-4 accent-sky-500 cursor-pointer"
                    />
                    <div>
                      <span className="block text-sm text-gray-200 font-bold">
                        Ulaşılamadı
                      </span>
                      <span className="block text-[10px] text-gray-500">
                        İşaretlenirse görüşülen kişi ve İK değerlendirme notu
                        otomatik doldurulur.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Geçmiş Bilgileri */}
              <div className="bg-gray-800/30 p-5 rounded-2xl border border-gray-700/50 space-y-4">
                <h4 className="text-sky-400 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b border-gray-700/50 pb-2">
                  <FontAwesomeIcon icon={faUserClock} /> Adayın Kurum Geçmişi
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="İşe Başlama Tarihi (Teyit Edilen)"
                      type="date"
                      name="adayIseBaslamaTarihi"
                      value={formData.adayIseBaslamaTarihi}
                      onChange={handleChange}
                      error={errors.adayIseBaslamaTarihi}
                    />
                    <Input
                      label="İşten Ayrılma Tarihi (Teyit Edilen)"
                      type="date"
                      name="adayIstenAyrilmaTarihi"
                      value={formData.adayIstenAyrilmaTarihi}
                      onChange={handleChange}
                      error={errors.adayIstenAyrilmaTarihi}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="İlk Görevi"
                      name="ilkGorev"
                      value={formData.ilkGorev}
                      onChange={handleChange}
                      placeholder="Başlangıç pozisyonu"
                      error={errors.ilkGorev}
                    />
                    <Input
                      label="Son Görevi"
                      name="sonGorev"
                      value={formData.sonGorev}
                      onChange={handleChange}
                      placeholder="Ayrıldığı pozisyon"
                      error={errors.sonGorev}
                    />
                  </div>
                  <div className="pt-2">
                    <Textarea
                      label="İşten Ayrılma Nedeni (Görüşülen Kişiye Göre)"
                      name="istenAyrilmaNedeni"
                      value={formData.istenAyrilmaNedeni}
                      onChange={handleChange}
                      placeholder="Kurum yetkilisinin belirttiği ayrılma gerekçesi..."
                      error={errors.istenAyrilmaNedeni}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. ALT BÖLÜM: DEĞERLENDİRME & ENUMLAR */}
            <div className="space-y-4">
              <h4 className="text-sky-400 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b border-gray-700/50 pb-2">
                <FontAwesomeIcon icon={faClipboardCheck} /> Performans ve
                Davranış Değerlendirmesi
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-5 bg-gray-900/50 p-5 rounded-2xl border border-gray-800">
                  <div className="space-y-3">
                    <EnumSelect
                      label="Çıkış Süreci Sorunlu muydu?"
                      name="istenAyrilisSureciSorunluMu"
                      value={formData.istenAyrilisSureciSorunluMu}
                      onChange={handleChange}
                    />
                    {(formData.istenAyrilisSureciSorunluMu === 2 ||
                      formData.istenAyrilisSureciSorunluMu === 3) && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <Textarea
                          label="Sorun Detayları (Zorunlu)"
                          name="istenAyrilisSorunAciklama"
                          value={formData.istenAyrilisSorunAciklama}
                          onChange={handleChange}
                          error={errors.istenAyrilisSorunAciklama}
                          placeholder="Yaşanan sorunu detaylandırınız..."
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 pt-2 border-t border-gray-800/80">
                    <EnumSelect
                      label="Tekrar İşe Almak İster Misiniz?"
                      name="yenidenIseAlirMisin"
                      value={formData.yenidenIseAlirMisin}
                      onChange={handleChange}
                    />
                    {(formData.yenidenIseAlirMisin === 1 ||
                      formData.yenidenIseAlirMisin === 3) && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <Textarea
                          label="Neden İşe Alınmaz? (Zorunlu)"
                          name="yenidenIseAlmamaNedeni"
                          value={formData.yenidenIseAlmamaNedeni}
                          onChange={handleChange}
                          error={errors.yenidenIseAlmamaNedeni}
                          placeholder="Tercih edilmeme nedeni..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-5 bg-gray-900/50 p-5 rounded-2xl border border-gray-800">
                  <div className="space-y-3">
                    <EnumSelect
                      label="Herhangi Bir Disiplin Kaydı Var Mı?"
                      name="disiplinKaydiVarMi"
                      value={formData.disiplinKaydiVarMi}
                      onChange={handleChange}
                    />
                    {(formData.disiplinKaydiVarMi === 2 ||
                      formData.disiplinKaydiVarMi === 3) && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <Textarea
                          label="Disiplin Kaydı Açıklaması (Zorunlu)"
                          name="disiplinKaydiAciklama"
                          value={formData.disiplinKaydiAciklama}
                          onChange={handleChange}
                          error={errors.disiplinKaydiAciklama}
                          placeholder="Disiplin süreci hakkında bilgi..."
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 pt-2 border-t border-gray-800/80">
                    <EnumSelect
                      label="Ödül veya Üstün Başarısı Var Mı?"
                      name="odulVarMi"
                      value={formData.odulVarMi}
                      onChange={handleChange}
                    />
                    {(formData.odulVarMi === 2 || formData.odulVarMi === 3) && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <Textarea
                          label="Ödül/Başarı Detayı"
                          name="odulAciklama"
                          value={formData.odulAciklama}
                          onChange={handleChange}
                          error={errors.odulAciklama}
                          placeholder="Alınan ödül veya başarı..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. İK SONUÇ DEĞERLENDİRMESİ */}
            <div className="bg-sky-900/10 p-5 rounded-2xl border border-sky-500/20 shadow-inner">
              <Textarea
                label="İK Genel Değerlendirme & Sonuç Notu"
                name="genelDegerlendirmeNotu"
                value={formData.genelDegerlendirmeNotu}
                onChange={handleChange}
                error={errors.genelDegerlendirmeNotu}
                placeholder="Bu referans görüşmesi sonucunda edindiğiniz genel intiba ve notlarınız..."
                rows="3"
                readOnly={ulasilamadi}
              />
            </div>
          </form>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-gray-800/80 px-6 py-4 border-t border-gray-700 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-700 transition-all border border-transparent"
          >
            İptal Et
          </button>
          <button
            form="refForm"
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 rounded-xl font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_15px_rgba(2,132,199,0.4)] hover:shadow-[0_0_25px_rgba(2,132,199,0.6)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faSave} />
            {loading
              ? "Kaydediliyor..."
              : editData
                ? "Güncelle"
                : "Referansı Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

// 🎯 HATA PROP'UNU DESTEKLEYEN YARDIMCI BİLEŞENLER
function Input({ label, error, ...props }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] text-gray-400 font-bold uppercase tracking-wider ml-1">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...props}
        className={`w-full bg-gray-900/80 border rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 outline-none transition-all shadow-inner
          ${
            error
              ? "border-red-500/80 focus:border-red-500 focus:ring-red-500"
              : "border-gray-700/80 focus:border-sky-500 focus:ring-sky-500 focus:bg-gray-900"
          }
        `}
      />
      {error && (
        <span className="block text-[10px] text-red-400 font-medium ml-1 mt-1 animate-in fade-in">
          {error}
        </span>
      )}
    </div>
  );
}

function Textarea({ label, error, rows = 2, ...props }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] text-gray-400 font-bold uppercase tracking-wider ml-1">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        {...props}
        rows={rows}
        className={`w-full bg-gray-900/80 border rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 outline-none transition-all resize-none shadow-inner
          ${
            error
              ? "border-red-500/80 focus:border-red-500 focus:ring-red-500"
              : "border-gray-700/80 focus:border-sky-500 focus:ring-sky-500 focus:bg-gray-900"
          }
        `}
      />
      {error && (
        <span className="block text-[10px] text-red-400 font-medium ml-1 mt-1 animate-in fade-in">
          {error}
        </span>
      )}
    </div>
  );
}

function EnumSelect({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] text-gray-400 font-bold uppercase tracking-wider ml-1">
        {label}
      </label>
      <div className="flex bg-gray-900/50 p-1 rounded-xl border border-gray-700/50 shadow-inner">
        {[
          {
            v: 1,
            l: "HAYIR",
            base: "hover:bg-red-500/10 hover:text-red-400",
            active:
              "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
          },
          {
            v: 2,
            l: "EVET",
            base: "hover:bg-emerald-500/10 hover:text-emerald-400",
            active:
              "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
          },
          {
            v: 3,
            l: "KISMEN",
            base: "hover:bg-amber-500/10 hover:text-amber-400",
            active:
              "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
          },
        ].map((opt) => {
          const isSelected = props.value === opt.v;
          return (
            <label key={opt.v} className="flex-1 cursor-pointer relative group">
              <input
                type="radio"
                name={props.name}
                value={opt.v}
                checked={isSelected}
                onChange={props.onChange}
                className="hidden"
              />
              <div
                className={`text-center py-2 rounded-lg text-xs font-bold transition-all border border-transparent ${isSelected ? opt.active : `text-gray-500 ${opt.base}`}`}
              >
                {opt.l}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
