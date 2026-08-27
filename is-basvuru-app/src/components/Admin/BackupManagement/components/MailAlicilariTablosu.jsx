import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Mail, Plus } from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import DataTable from "../DataTable/DataTable";

import { mailAlicisiColumns } from "../columns/mailAlicisiColumns";

import YedeklemeMailAlicisiModal from "./YedeklemeMailAlicisiModal";

import { yedeklemeMailAlicisiService } from "../../../../services/yedeklemeMailAlicisiService";

export default function MailAlicilariTablosu() {
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

      setAlicilar(response.data || []);
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
    if (kaydediliyor) {
      return;
    }

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
        kayit.aktifMi
          ? "Mail alıcısı pasif edildi."
          : "Mail alıcısı aktif edildi.",
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
          <div style="
            font-size:14px;
            color:#64748b;
            line-height:1.6;
          ">
            <strong>
              ${kayit.eposta}
            </strong>
            adresi aktif yedekleme
            alıcı listesinden silinecektir.
            <br><br>
            Geçmiş yedekleme
            gönderim kayıtları
            etkilenmez.
          </div>
        `,

      showCancelButton: true,

      confirmButtonText: "Evet, Sil",

      cancelButtonText: "Vazgeç",

      confirmButtonColor: "#dc2626",

      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) {
      return;
    }

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

  const columns = useMemo(
    () =>
      mailAlicisiColumns({
        onDuzenle: duzenle,

        onSil: sil,

        onAktiflikDegistir: aktiflikDegistir,
      }),
    [],
  );

  const yeniAliciButton = (
    <button
      type="button"
      onClick={yeniAliciAc}
      className="
        inline-flex
        h-10
        items-center
        justify-center
        gap-2
        rounded-lg
        bg-gray-900
        px-4
        text-sm
        font-semibold
        text-white
        shadow-sm
        transition
        hover:bg-black
      "
    >
      <Plus className="h-4 w-4" />
      Yeni Alıcı
    </button>
  );

  return (
    <>
      <section
        className="
          rounded-2xl
          border
          border-gray-200
          bg-white
          p-5
          shadow-sm
          sm:p-6
        "
      >
        {/* HEADER */}
        <div
          className="
            mb-5
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div className="flex items-start gap-3">
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-blue-600
              "
            >
              <Mail className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                Yedekleme Mail Alıcıları
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Yedekleme tamamlandığında bilgilendirme gönderilecek adresleri
                yönetin.
              </p>
            </div>
          </div>

          <div
            className="
              rounded-full
              bg-gray-100
              px-3
              py-1
              text-xs
              font-semibold
              text-gray-600
            "
          >
            {alicilar.length} alıcı
          </div>
        </div>

        <DataTable
          columns={columns}
          data={alicilar}
          loading={loading}
          searchPlaceholder="E-posta adreslerinde ara..."
          initialPageSize={10}
          pageSizeOptions={[10, 20, 50]}
          filters={[
            {
              columnId: "aktifMi",

              label: "Tüm Durumlar",

              options: [
                {
                  label: "Aktif",
                  value: "true",
                },
                {
                  label: "Pasif",
                  value: "false",
                },
              ],
            },
          ]}
          actions={yeniAliciButton}
          emptyTitle="Mail alıcısı bulunamadı."
          emptyDescription="Yedekleme bildirimlerinin gönderilebilmesi için yeni bir mail alıcısı ekleyin."
        />
      </section>

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
