import React, { useState, useEffect } from "react";
import { faClipboardCheck } from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "../../../../Users/modalHooks/dateUtils";
import { gorevAtamaService } from "../../../../services/gorevAtamaService";

export default function CVGorevAtamaSection({ masterBasvuruId }) {
  const [gorevAtama, setGorevAtama] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (masterBasvuruId) {
      setLoading(true);
      // 🎯 Backend'e yazdığımız yeni endpoint'e istek atıyoruz
      gorevAtamaService
        .getByMasterBasvuruId(masterBasvuruId)
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            setGorevAtama(res.data.data);
          }
        })
        .catch((err) => {
          console.error("Görev atama hatası:", err);
          setGorevAtama({}); // Hata durumunda boş obje set et ki ekranda null patlamasın
        })
        .finally(() => setLoading(false));
    }
  }, [masterBasvuruId]);

  if (loading) {
    return (
      <div style={{ fontSize: "12px", color: "gray", marginTop: "10px" }}>
        Görev Atama bilgileri yükleniyor...
      </div>
    );
  }

  // Eğer veri yoksa (veya backend null döndüyse) bu bölümü hiç çizme
  if (!gorevAtama || Object.keys(gorevAtama).length === 0) return null;

  return (
    <Section title="Görev Atama Detayları" icon={faClipboardCheck}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          backgroundColor: "#F9FAFB",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #E5E7EB",
        }}
      >
        <Row
          label="Departman"
          value={gorevAtama.departmanAdi || gorevAtama.DepartmanAdi || "-"}
        />
        <Row
          label="Atanacak Görev"
          value={gorevAtama.gorevAdi || gorevAtama.GorevAdi || "-"}
        />
        <Row
          label="İşe Başlama Tarihi"
          value={
            formatDate(
              gorevAtama.baslangicTarihi || gorevAtama.BaslangicTarihi,
            ) || "-"
          }
        />
        <Row
          label="Talep Nedeni"
          value={
            gorevAtama.talepNedeni === 2 || gorevAtama.TalepNedeni === 2
              ? "Yerine Alım"
              : "Yeni Kadro"
          }
        />
        <Row
          label="Önerilen Ücret"
          value={
            gorevAtama.netUcret || gorevAtama.NetUcret
              ? `${Number(gorevAtama.netUcret || gorevAtama.NetUcret).toLocaleString("tr-TR")} ₺`
              : "-"
          }
        />
        <Row
          label="Pozisyon Bütçesi"
          value={
            gorevAtama.talepEdilenGorevGenelButcesi ||
            gorevAtama.TalepEdilenGorevGenelButcesi
              ? `${Number(gorevAtama.talepEdilenGorevGenelButcesi || gorevAtama.TalepEdilenGorevGenelButcesi).toLocaleString("tr-TR")} ₺`
              : "-"
          }
        />

        {/* Yerine Alım (Talep Nedeni = 2) ise ekstra satırları göster */}
        {(gorevAtama.talepNedeni === 2 || gorevAtama.TalepNedeni === 2) && (
          <>
            <Row
              label="Yerine Alınacak Kişi"
              value={
                gorevAtama.yerineAlinacakKisiAdSoyad ||
                gorevAtama.YerineAlinacakKisiAdSoyad ||
                "-"
              }
              colSpan={true}
            />
            <Row
              label="Ayrılacak Kişi Çıkış Tarihi"
              value={
                formatDate(
                  gorevAtama.yerineAlinacakKisiCikisTarihi ||
                    gorevAtama.YerineAlinacakKisiCikisTarihi,
                ) || "-"
              }
              colSpan={true}
            />
          </>
        )}
      </div>
    </Section>
  );
}
