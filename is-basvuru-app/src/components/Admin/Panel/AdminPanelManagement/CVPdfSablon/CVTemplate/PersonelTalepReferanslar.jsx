import { formatDate } from "../../../../../Users/modalHooks/dateUtils";
import { EmptyText } from "./CVPdfComponents";

const getField = (source, ...keys) => {
  if (!source) {
    return undefined;
  }

  for (const key of keys) {
    const value = source[key];

    if (value !== null && value !== undefined && value !== "") {
      return value;
    }
  }

  return undefined;
};

function ReferansField({ label, value, fullWidth = false }) {
  const hasValue = value !== null && value !== undefined && value !== "";

  return (
    <div
      style={{
        gridColumn: fullWidth ? "1 / -1" : "auto",
        minWidth: 0,
      }}
    >
      <div
        style={{
          marginBottom: "3px",
          color: "#6B7280",
          fontSize: "0.68rem",
          fontWeight: "700",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#111827",
          fontSize: "0.74rem",
          fontWeight: "600",
          lineHeight: "1.4",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {hasValue ? value : "-"}
      </div>
    </div>
  );
}
function ReferansSonucuCard({ referans, index }) {
  const referansIsYeri = getField(
    referans,
    "referansIsYeriAdi",
    "ReferansIsYeriAdi",
  );

  const gorusulenAdSoyad = getField(
    referans,
    "referansGorusulenAdSoyad",
    "ReferansGorusulenAdSoyad",
  );

  const referansUnvan = getField(referans, "referansUnvan", "ReferansUnvan");

  const gorusulenKisiVeUnvan = [
    gorusulenAdSoyad,
    referansUnvan ? `(${referansUnvan})` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const telefon = getField(
    referans,
    "gorusulenKisininTelefonu",
    "GorusulenKisininTelefonu",
  );

  const ilkGorev = getField(referans, "ilkGorev", "IlkGorev");

  const sonGorev = getField(referans, "sonGorev", "SonGorev");

  const iseBaslamaTarihi = getField(
    referans,
    "adayIseBaslamaTarihi",
    "AdayIseBaslamaTarihi",
  );
  const istenAyrilmaTarihi = getField(
    referans,
    "adayIstenAyrilmaTarihi",
    "AdayIstenAyrilmaTarihi",
  );

  const gorusmeTarihi = getField(referans, "gorusmeTarihi", "GorusmeTarihi");

  return (
    <div
      style={{
        width: "100%",
        padding: "12px",
        border: "1px solid #374151",
        boxSizing: "border-box",
        backgroundColor: "#FFFFFF",
        breakInside: "avoid",
        pageBreakInside: "avoid",
      }}
    >
      {/* REFERANS BAŞLIĞI */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
          marginBottom: "10px",
          paddingBottom: "7px",
          borderBottom: "1px solid #D1D5DB",
        }}
      >
        <div
          style={{
            minWidth: 0,
            color: "#111827",
            fontSize: "0.78rem",
            fontWeight: "800",
            lineHeight: "1.4",
            wordBreak: "break-word",
          }}
        >
          {index + 1}. REFERANS
          {referansIsYeri ? ` — ${referansIsYeri}` : ""}
        </div>

        <div
          style={{
            flexShrink: 0,
            color: "#4B5563",
            fontSize: "0.7rem",
            fontWeight: "600",
          }}
        >
          Tarih: {formatDate(gorusmeTarihi)}
        </div>
      </div>

      {/* REFERANS BİLGİLERİ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "10px 12px",
        }}
      >
        <ReferansField label="Görüşülen Kişi" value={gorusulenKisiVeUnvan} />

        <ReferansField label="İletişim / Telefon" value={telefon} />

        <ReferansField label="İlk Görev" value={ilkGorev} />

        <ReferansField label="Son Görev" value={sonGorev} />

        <ReferansField
          label="İşe Başlama Tarihi"
          value={formatDate(iseBaslamaTarihi)}
        />
        <ReferansField
          label="İşten Ayrılma Tarihi"
          value={formatDate(istenAyrilmaTarihi)}
        />
      </div>
    </div>
  );
}
export default function PersonelTalepReferanslar({
  referansArastirmalari = [],
}) {
  const referansListesi = Array.isArray(referansArastirmalari)
    ? referansArastirmalari
    : [];

  return (
    <section
      style={{
        width: "100%",
        marginTop: "14px",
      }}
    >
      <div
        style={{
          marginBottom: "8px",
          padding: "6px 10px",
          border: "1px solid #374151",
          backgroundColor: "#F9FAFB",
          color: "#111827",
          fontSize: "0.9rem",
          fontWeight: "800",
          textAlign: "center",
          textTransform: "uppercase",
        }}
      >
        Referans Sonuçları
      </div>

      {referansListesi.length === 0 ? (
        <div
          style={{
            padding: "12px",
            border: "1px solid #D1D5DB",
          }}
        >
          <EmptyText />
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "10px",
            alignItems: "start",
          }}
        >
          {referansListesi.map((referans, index) => (
            <ReferansSonucuCard
              key={getField(referans, "id", "Id") ?? index}
              referans={referans}
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  );
}
