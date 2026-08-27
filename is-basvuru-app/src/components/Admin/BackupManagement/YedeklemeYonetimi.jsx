import React, { useCallback, useEffect, useState } from "react";

import { toast } from "react-toastify";

import { yedeklemeService } from "../../../services/yedeklemeService";

import YedeklemeHeader from "./components/YedeklemeHeader";
import YedeklemeOzetKartlari from "./components/YedeklemeOzetKartlari";
import YedeklemeTablosu from "./components/YedeklemeTablosu";
import YedeklemeDetayModal from "./components/YedeklemeDetayModal";
import MailAlicilariTablosu from "./components/MailAlicilariTablosu";

export default function YedeklemeYonetimi() {
  const [yedekler, setYedekler] = useState([]);

  const [sonYedek, setSonYedek] = useState(null);

  const [loading, setLoading] = useState(true);

  const [yedekAliniyor, setYedekAliniyor] = useState(false);

  const [detayAcik, setDetayAcik] = useState(false);

  const [seciliYedek, setSeciliYedek] = useState(null);

  const [detayLoading, setDetayLoading] = useState(false);

  const verileriGetir = useCallback(async () => {
    try {
      setLoading(true);

      const [listeResponse, sonResponse] = await Promise.all([
        yedeklemeService.getAll(),
        yedeklemeService.getSonBasarili(),
      ]);

      setYedekler(listeResponse?.data || []);

      setSonYedek(sonResponse?.data || null);
    } catch (error) {
      console.error(error);

      toast.error("Yedekleme bilgileri alınamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verileriGetir();
  }, [verileriGetir]);

  const yedekDetayAc = async (id) => {
    try {
      setDetayLoading(true);
      setDetayAcik(true);

      const response = await yedeklemeService.getById(id);

      if (!response?.success) {
        throw new Error(response?.message || "Yedekleme detayı alınamadı.");
      }

      setSeciliYedek(response.data);
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Yedekleme detayı alınamadı.",
      );

      setDetayAcik(false);
    } finally {
      setDetayLoading(false);
    }
  };

  const detayKapat = () => {
    setDetayAcik(false);
    setSeciliYedek(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <YedeklemeHeader
        yedekAliniyor={yedekAliniyor}
        setYedekAliniyor={setYedekAliniyor}
        onRefresh={verileriGetir}
      />

      <YedeklemeOzetKartlari sonYedek={sonYedek} />

      <YedeklemeTablosu
        yedekler={yedekler}
        loading={loading}
        onDetayAc={yedekDetayAc}
      />

      <MailAlicilariTablosu />

      <YedeklemeDetayModal
        open={detayAcik}
        loading={detayLoading}
        yedek={seciliYedek}
        onClose={detayKapat}
      />
    </div>
  );
}
