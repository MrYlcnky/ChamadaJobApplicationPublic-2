import React, { useCallback, useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPlus,
  faPen,
  faTrashCan,
  faRotate,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { yedeklemeMailAlicisiService } from "../../../../services/yedeklemeMailAlicisiService";

import YedeklemeMailAlicisiModal from "./YedeklemeMailAlicisiModal";

export default function YedeklemeMailAlicilari() {
  const [alicilar, setAlicilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  const [modalAcik, setModalAcik] = useState(false);

  const [seciliKayit, setSeciliKayit] = useState(null);

  const alicilariGetir = useCallback(async () => {
    try {
      setLoading(true);

      const response = await yedeklemeMailAlicisiService.getAll();

      if (!response?.success) {
        throw new Error(response?.message || "Mail alıcıları alınamadı.");
      }

      setAlicilar(
        [...(response.data || [])].sort(
          (a, b) => (a.siraNo || 0) - (b.siraNo || 0),
        ),
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Mail alıcıları alınamadı.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    alicilariGetir();
  }, [alicilariGetir]);

  const yeniAliciAc = () => {
    setSeciliKayit(null);
    setModalAcik(true);
  };

  const duzenle = (kayit) => {
    setSeciliKayit(kayit);
    setModalAcik(true);
  };

  const modalKapat = () => {
    if (kaydediliyor) return;

    setModalAcik(false);
    setSeciliKayit(null);
  };

  const kaydet = async (payload) => {
    try {
      setKaydediliyor(true);

      let response;

      if (payload.id) {
        response = await yedeklemeMailAlicisiService.update(payload);
      } else {
        response = await yedeklemeMailAlicisiService.create(payload);
      }

      if (!response?.success) {
        throw new Error(response?.message || "Mail alıcısı kaydedilemedi.");
      }

      toast.success(
        payload.id ? "Mail alıcısı güncellendi." : "Mail alıcısı eklendi.",
      );

      setModalAcik(false);
      setSeciliKayit(null);

      await alicilariGetir();
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Mail alıcısı kaydedilemedi.",
      );
    } finally {
      setKaydediliyor(false);
    }
  };

  const aktiflikDegistir = async (kayit) => {
    try {
      const response = await yedeklemeMailAlicisiService.update({
        id: kayit.id,
        eposta: kayit.eposta,
        aktifMi: !kayit.aktifMi,
        siraNo: kayit.siraNo,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Durum güncellenemedi.");
      }

      toast.success(
        !kayit.aktifMi
          ? "Mail alıcısı aktif edildi."
          : "Mail alıcısı pasif edildi.",
      );

      await alicilariGetir();
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Durum güncellenemedi.",
      );
    }
  };

  const sil = async (kayit) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Mail Alıcısı Silinsin mi?",
      html: `
        <div style="font-size:14px;color:#64748b;">
          <strong>${kayit.eposta}</strong>
          adresi yedekleme mail alıcılarından
          kaldırılacaktır.
          <br><br>
          Geçmiş yedekleme kayıtları bundan
          etkilenmez.
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Sil",
      cancelButtonText: "Vazgeç",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await yedeklemeMailAlicisiService.delete(kayit.id);

      if (!response?.success) {
        throw new Error(response?.message || "Mail alıcısı silinemedi.");
      }

      toast.success("Mail alıcısı silindi.");

      await alicilariGetir();
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Mail alıcısı silinemedi.",
      );
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faEnvelope} className="text-blue-600" />

              <h2 className="font-black text-gray-900">
                Yedekleme Mail Alıcıları
              </h2>
            </div>

            <p className="text-xs text-gray-500 mt-1">
              Backup tamamlandığında bilgilendirme maili gönderilecek adresler
            </p>
          </div>

          <button
            type="button"
            onClick={yeniAliciAc}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 hover:bg-black text-white px-4 py-2.5 text-xs font-bold transition"
          >
            <FontAwesomeIcon icon={faPlus} />
            Alıcı Ekle
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <FontAwesomeIcon icon={faRotate} className="animate-spin mr-2" />
            Mail alıcıları yükleniyor...
          </div>
        ) : alicilar.length === 0 ? (
          <div className="p-12 text-center">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="text-3xl text-gray-300"
            />

            <p className="mt-3 font-bold text-gray-500">
              Mail alıcısı bulunmuyor.
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Yedekleme maillerinin gönderilebilmesi için en az bir aktif adres
              ekleyin.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-4">Sıra</th>

                  <th className="px-6 py-4">E-posta</th>

                  <th className="px-6 py-4">Durum</th>

                  <th className="px-6 py-4 text-right">İşlem</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {alicilar.map((kayit) => (
                  <tr key={kayit.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="inline-flex min-w-8 h-8 items-center justify-center rounded-lg bg-gray-100 text-xs font-black text-gray-600">
                        {kayit.siraNo}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-bold text-gray-800">
                      {kayit.eposta}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => aktiflikDegistir(kayit)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                          kayit.aktifMi
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={kayit.aktifMi ? faCircleCheck : faCircleXmark}
                        />

                        {kayit.aktifMi ? "Aktif" : "Pasif"}
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => duzenle(kayit)}
                          className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 hover:text-blue-600 text-gray-500 transition"
                          title="Düzenle"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>

                        <button
                          type="button"
                          onClick={() => sil(kayit)}
                          className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-red-50 hover:text-red-600 text-gray-500 transition"
                          title="Sil"
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <YedeklemeMailAlicisiModal
        open={modalAcik}
        kayit={seciliKayit}
        loading={kaydediliyor}
        onClose={modalKapat}
        onSave={kaydet}
        kullanilanSiraNolari={alicilar.map((x) => ({
          id: x.id,
          siraNo: x.siraNo,
        }))}
      />
    </>
  );
}
