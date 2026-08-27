import React, { useState, useEffect } from "react";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { referansArastirmasiService } from "../../../../../services/referansArastirmasiService"; // Yolunu ayarla
import { formatDate } from "../../../../Users/modalHooks/dateUtils";

export default function CVReferansSection({ masterBasvuruId, getEnumText }) {
  const [referanslar, setReferanslar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (masterBasvuruId) {
      referansArastirmasiService
        .getByMasterBasvuruId(masterBasvuruId)
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            setReferanslar(res.data.data);
          }
        })
        .catch((err) => console.error("Referans hatası:", err))
        .finally(() => setLoading(false));
    }
  }, [masterBasvuruId]);

  if (loading)
    return (
      <div style={{ fontSize: "12px", color: "gray" }}>
        Referanslar yükleniyor...
      </div>
    );

  return (
    <Section title="İK Referans Araştırması Sonuçları" icon={faCommentDots}>
      {referanslar.length === 0 ? (
        <p
          style={{
            fontSize: "0.875rem",
            color: "#9CA3AF",
            fontStyle: "italic",
          }}
        >
          Sisteme kayıtlı referans araştırması bulunmamaktadır.
        </p>
      ) : (
        referanslar.map((ref, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: "20px",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "16px",
              backgroundColor: "#F9FAFB",
              breakInside: "avoid",
            }}
          >
            <h4
              style={{
                margin: "0 0 12px 0",
                color: "#111827",
                fontSize: "1rem",
                borderBottom: "1px solid #E5E7EB",
                paddingBottom: "8px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>
                {ref.referansIsYeriAdi} - {ref.referansGorusulenAdSoyad} (
                {ref.referansUnvan || "Ünvan Yok"})
              </span>
              <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                Tarih: {formatDate(ref.gorusmeTarihi)}
              </span>
            </h4>

            {/* Referans İçeriği (Grid ve Row'lar) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <Row
                label="İletişim / Telefon"
                value={ref.gorusulenKisininTelefonu}
              />
              <Row label="İlk Görevi" value={ref.ilkGorev} />
              <Row label="Son Görevi" value={ref.sonGorev} />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "12px",
                borderTop: "1px dashed #D1D5DB",
                paddingTop: "12px",
              }}
            >
              <Row
                label="Çıkış Süreci Sorunlu mu?"
                value={`${getEnumText(ref.istenAyrilisSureciSorunluMu)}`}
                colSpan={true}
              />
              <div
                style={{
                  backgroundColor: "#EFF6FF",
                  padding: "12px",
                  borderRadius: "6px",
                }}
              >
                <Row
                  label={`İK Genel Değerlendirme Notu`}
                  value={ref.genelDegerlendirmeNotu || "-"}
                  colSpan={true}
                />
              </div>
            </div>
          </div>
        ))
      )}
    </Section>
  );
}
