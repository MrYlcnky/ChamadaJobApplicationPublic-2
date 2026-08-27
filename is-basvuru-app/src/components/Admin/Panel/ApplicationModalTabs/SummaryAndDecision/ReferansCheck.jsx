import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIdBadge,
  faPhone,
  faBuilding,
  faTrophy,
  faExclamationTriangle,
  faUserCheck,
  faCommentDots,
  faUserTie,
  faInfoCircle,
  faPlus,
  faEdit,
  faTrash,
  faUserClock,
  faClipboardCheck,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { referansArastirmasiService } from "../../../../../services/referansArastirmasiService";
import ReferansArastirmaModal from "./ReferansArastirmaModal";
import Swal from "sweetalert2";

export default function ReferansCheck({
  masterBasvuruId,
  currentStageId,
  isDeneyimleri = [],
}) {
  const [referanslar, setReferanslar] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRef, setEditingRef] = useState(null);

  const [expandedItems, setExpandedItems] = useState([]);

  const authData = JSON.parse(sessionStorage.getItem("authUser") || "{}");
  const rid = Number(authData.rolId || authData.roleId);
  const allowedRoles = [1, 2, 3, 4];
  const canAdd = allowedRoles.includes(rid) && Number(currentStageId) === 3;

  const fetchReferanslar = async () => {
    if (!masterBasvuruId) return;
    setLoading(true);
    try {
      const res =
        await referansArastirmasiService.getByMasterBasvuruId(masterBasvuruId);
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        setReferanslar(data);
        // 🎯 GÜNCELLEME: Artık ilkini otomatik açmıyoruz, hepsi kapalı başlıyor.
      } else {
        setReferanslar([]);
      }
    } catch (error) {
      console.error("Referans araştırmaları çekilirken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferanslar();
  }, [masterBasvuruId]);

  const toggleExpand = (id) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: "Bu referans kaydını silmek istediğinize emin misiniz?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#374151",
      confirmButtonText: "Evet, Sil!",
      cancelButtonText: "İptal",
      background: "#1f2937",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await referansArastirmasiService.delete(id);
        Swal.fire({
          title: "Silindi!",
          text: "Kayıt başarıyla silindi.",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          showConfirmButton: false,
          timer: 1500,
        });
        fetchReferanslar();
      } catch (error) {
        Swal.fire({
          title: "Hata",
          text: "Silme işlemi sırasında bir hata oluştu.",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  const getSecimBadge = (deger, tip) => {
    if (deger === 0 || !deger)
      return <span className="text-gray-500 italic">Belirtilmemiş</span>;

    let colorClass = "bg-gray-700 text-gray-300";
    let text = deger === 1 ? "Hayır" : deger === 2 ? "Evet" : "Kısmen";

    if (tip === "olumluIs") {
      if (deger === 2)
        colorClass =
          "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      if (deger === 1)
        colorClass = "bg-red-500/20 text-red-400 border border-red-500/30";
      if (deger === 3)
        colorClass =
          "bg-amber-500/20 text-amber-400 border border-amber-500/30";
    } else if (tip === "olumsuzIs") {
      if (deger === 1)
        colorClass =
          "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      if (deger === 2)
        colorClass = "bg-red-500/20 text-red-400 border border-red-500/30";
      if (deger === 3)
        colorClass =
          "bg-amber-500/20 text-amber-400 border border-amber-500/30";
    }

    return (
      <span className={`px-2 py-0.5 rounded text-xs font-bold ${colorClass}`}>
        {text}
      </span>
    );
  };

  return (
    <div className="space-y-6 mb-7">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 ">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faIdBadge} className="text-sky-400 text-xl" />
          <h3 className="text-lg font-bold text-white">Referans Görüşmeleri</h3>
          {!loading && referanslar.length > 0 && (
            <span className="bg-sky-500/20 text-sky-400 py-0.5 px-2 rounded-full text-xs font-bold border border-sky-500/30">
              {referanslar.length} Kayıt
            </span>
          )}
        </div>

        {canAdd && (
          <button
            onClick={() => {
              setEditingRef(null);
              setIsModalOpen(true);
            }}
            className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-sky-900/20"
          >
            <FontAwesomeIcon icon={faPlus} />
            Referans Ekle
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-6 text-center text-gray-400 animate-pulse bg-gray-800/50 rounded-xl border border-gray-700">
          Referans kayıtları aranıyor...
        </div>
      ) : referanslar.length === 0 ? (
        <div className="bg-gray-800/40 border border-sky-500/20 rounded-xl p-6 text-center shadow-inner">
          <FontAwesomeIcon
            icon={faIdBadge}
            className="text-4xl text-sky-500/50 mb-3"
          />
          <h4 className="text-gray-300 font-semibold text-lg">
            Referans Araştırması Henüz Yapılmadı
          </h4>
          <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
            Bu adaya ait sistemde kayıtlı bir referans görüşmesi
            bulunmamaktadır. Referans araştırmaları sürece göre{" "}
            <strong className="text-sky-400 font-medium">İK Son Kontrol</strong>{" "}
            aşamasında İnsan Kaynakları ekibi tarafından gerçekleştirilip
            sisteme işlenecektir.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {referanslar.map((ref, index) => {
            const isExpanded = expandedItems.includes(ref.id || index);

            const performansItems = [
              {
                id: 1,
                icon: faExclamationTriangle,
                title: "Disiplin Kaydı",
                value: ref.disiplinKaydiVarMi,
                type: "olumsuzIs",
                text: ref.disiplinKaydiAciklama,
                color: "text-amber-500",
              },
              {
                id: 2,
                icon: faTrophy,
                title: "Ödül/Başarı",
                value: ref.odulVarMi,
                type: "olumluIs",
                text: ref.odulAciklama,
                color: "text-yellow-500",
              },
              {
                id: 3,
                icon: faInfoCircle,
                title: "Çıkış Sorunlu Mu?",
                value: ref.istenAyrilisSureciSorunluMu,
                type: "olumsuzIs",
                text: ref.istenAyrilisSorunAciklama,
                color: "text-sky-500",
              },
              {
                id: 4,
                icon: faUserCheck,
                title: "Tekrar İşe Alınır Mı?",
                value: ref.yenidenIseAlirMisin,
                type: "olumluIs",
                text: ref.yenidenIseAlmamaNedeni,
                color: "text-emerald-500",
              },
            ];

            return (
              <div
                key={ref.id || index}
                className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg transition-all"
              >
                {/* 🎯 KART BAŞLIĞI (Tıklanabilir Akordeon Başlığı) */}
                <div
                  onClick={() => toggleExpand(ref.id || index)}
                  className={`px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer hover:bg-gray-700/50 transition-colors ${isExpanded ? "bg-gray-900/80 border-b border-gray-700" : "bg-gray-900/40"}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-gray-800 border border-gray-600 transition-transform duration-300 ${isExpanded ? "rotate-180 bg-sky-900/50 border-sky-700 text-sky-400" : "text-gray-400"}`}
                    >
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className="text-xs"
                      />
                    </div>

                    <div>
                      <h4 className="text-white font-bold flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faBuilding}
                          className={
                            isExpanded ? "text-sky-400" : "text-gray-400"
                          }
                        />
                        {ref.referansIsYeriAdi || "Belirtilmeyen Kurum"}
                      </h4>
                      <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faUserTie}
                          className="text-sky-500"
                        />
                        {ref.referansGorusulenAdSoyad || "İsim Yok"}{" "}
                        <span className="text-gray-600">|</span>{" "}
                        {ref.referansUnvan || "Ünvan Yok"}
                      </p>
                    </div>
                  </div>

                  {/* 🎯 GÜNCELLEME: SAĞ TARAF KONTROLLERİ */}
                  <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto mt-2 sm:mt-0 pl-10 sm:pl-0">
                    <div className="flex items-center gap-2 text-sm text-sky-300 bg-sky-900/30 px-3 py-1.5 rounded-lg border border-sky-800/50 w-fit">
                      <FontAwesomeIcon icon={faPhone} />
                      <span>
                        {ref.gorusulenKisininTelefonu || "Telefon Yok"}
                      </span>

                      {canAdd && (
                        <div className="flex items-center gap-3 ml-2 pl-3 border-l border-sky-800/50">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingRef(ref);
                              setIsModalOpen(true);
                            }}
                            className="text-gray-400 hover:text-sky-400 transition-colors"
                            title="Düzenle"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(ref.id);
                            }}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                            title="Sil"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Telefon Numarasının Altındaki Bilgi Satırı */}
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 px-1 font-medium">
                      <span>
                        Görüşen:{" "}
                        <strong className="text-gray-300">
                          {ref.gorusmeyiYapanKullaniciAdSoyad}
                        </strong>
                      </span>
                      <span className="text-gray-600">•</span>
                      <span>
                        {new Date(ref.gorusmeTarihi).toLocaleDateString(
                          "tr-TR",
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 🎯 KART GÖVDESİ: SADECE AÇIKSA (isExpanded) GÖRÜNÜR */}
                {isExpanded && (
                  <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="p-5 space-y-6">
                      {/* 1. Kurum İçi Görev Geçmişi */}
                      <div className="space-y-3">
                        <h5 className="text-xs text-sky-400 font-bold uppercase tracking-wider flex items-center gap-2 border-b border-gray-700/50 pb-2">
                          <FontAwesomeIcon icon={faUserClock} /> Kurum İçi Görev
                          Geçmişi
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-900/30 p-4 rounded-xl border border-gray-700/50">
                          <div>
                            <span className="block text-gray-500 text-[10px] uppercase font-bold mb-1">
                              İlk Görevi
                            </span>
                            <span className="text-gray-200 text-sm font-medium">
                              {ref.ilkGorev || "-"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-gray-500 text-[10px] uppercase font-bold mb-1">
                              Son Görevi
                            </span>
                            <span className="text-gray-200 text-sm font-medium">
                              {ref.sonGorev || "-"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-gray-500 text-[10px] uppercase font-bold mb-1">
                              Başlama Tarihi
                            </span>
                            <span className="text-gray-300 text-sm">
                              {ref.adayIseBaslamaTarihi
                                ? new Date(
                                    ref.adayIseBaslamaTarihi,
                                  ).toLocaleDateString("tr-TR")
                                : "-"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-gray-500 text-[10px] uppercase font-bold mb-1">
                              Ayrılma Tarihi
                            </span>
                            <span className="text-gray-300 text-sm">
                              {ref.adayIstenAyrilmaTarihi
                                ? new Date(
                                    ref.adayIstenAyrilmaTarihi,
                                  ).toLocaleDateString("tr-TR")
                                : "-"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Performans ve Çıkış Süreci */}
                      <div className="space-y-3">
                        <h5 className="text-xs text-sky-400 font-bold uppercase tracking-wider flex items-center gap-2 border-b border-gray-700/50 pb-2">
                          <FontAwesomeIcon icon={faClipboardCheck} /> Performans
                          ve Çıkış Süreci
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {performansItems.map((item) => (
                            <div
                              key={item.id}
                              className={`bg-gray-900/40 rounded-xl border border-gray-700/50 flex flex-col ${item.text ? "md:col-span-2" : ""}`}
                            >
                              <div
                                className={`px-4 py-3 flex justify-between items-center ${item.text ? "border-b border-gray-700/50 bg-gray-800/20" : ""}`}
                              >
                                <span className="text-gray-300 text-sm font-medium flex items-center gap-2">
                                  <FontAwesomeIcon
                                    icon={item.icon}
                                    className={`${item.color} w-4`}
                                  />
                                  {item.title}
                                </span>
                                {getSecimBadge(item.value, item.type)}
                              </div>
                              {item.text && (
                                <div className="px-4 py-3 bg-gray-900/60 rounded-b-xl">
                                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {item.text}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* İK GENEL DEĞERLENDİRME */}
                    <div className="bg-sky-900/10 px-5 py-4 border-t border-sky-900/30">
                      <div className="flex items-start gap-3">
                        <FontAwesomeIcon
                          icon={faCommentDots}
                          className="text-sky-500 mt-1"
                        />
                        <div>
                          <h6 className="text-xs text-sky-400 font-bold uppercase mb-1">
                            İK Değerlendirme Notu
                          </h6>
                          <p className="text-sm text-gray-200 italic leading-relaxed">
                            "
                            {ref.genelDegerlendirmeNotu ||
                              "Özel bir değerlendirme notu girilmemiş."}
                            "
                          </p>
                        </div>
                      </div>
                      {/* Kart detayında tekrar göstermeye gerek yok (Zaten başlıkta var) ama istersen açık kalabilir */}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <ReferansArastirmaModal
          masterBasvuruId={masterBasvuruId}
          isDeneyimleri={isDeneyimleri}
          editData={editingRef}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRef(null);
          }}
          onSuccess={fetchReferanslar}
        />
      )}
    </div>
  );
}
