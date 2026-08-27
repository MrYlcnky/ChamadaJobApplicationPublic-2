import {
  faClipboardCheck,
  faCommentDots,
  faPenSquare,
} from "@fortawesome/free-solid-svg-icons";

import { formatDate } from "../../../../../Users/modalHooks/dateUtils";

import { EmptyText, EnumText, Row, Section } from "./CVPdfComponents";

const SIGNATURE_ROLES = [
  "Departman Müdürü",
  "İnsan Kaynakları Müdürü",
  "Genel Müdür",
  "Mali İşler Müdürü",
];

/*
 * API verilerinde camelCase ve PascalCase birlikte
 * gelebileceği için verilen alanlardan ilk dolu olanı döndürür.
 */
const getField = (source, ...keys) => {
  if (!source) {
    return undefined;
  }

  for (const key of keys) {
    const value = source[key];

    if (value !== null && value !== undefined) {
      return value;
    }
  }

  return undefined;
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  return `${numericValue.toLocaleString("tr-TR")} ₺`;
};

const getBooleanText = (value) => {
  if (value === true || value === "true" || value === 1) {
    return "Evet";
  }

  if (value === false || value === "false" || value === 0) {
    return "Hayır";
  }

  return "-";
};

export default function CVInternalSections({
  gorevAtama = {},
  referansArastirmalari = [],
}) {
  const gorevAtamaVarMi = gorevAtama && Object.keys(gorevAtama).length > 0;

  const referansListesi = Array.isArray(referansArastirmalari)
    ? referansArastirmalari
    : [];

  return (
    <>
      {/* 10. GÖREV ATAMA DETAYLARI */}
      <Section title="Görev Atama Detayları" icon={faClipboardCheck}>
        {!gorevAtamaVarMi ? (
          <EmptyText />
        ) : (
          <GorevAtamaDetails gorevAtama={gorevAtama} />
        )}
      </Section>

      {/* 11. İK REFERANS ARAŞTIRMASI */}
      <Section title="İK Referans Araştırması Sonuçları" icon={faCommentDots}>
        {referansListesi.length === 0 ? (
          <EmptyText />
        ) : (
          referansListesi.map((referans, index) => (
            <ReferansArastirmasiCard
              key={getField(referans, "id", "Id") ?? index}
              referans={referans}
              index={index}
            />
          ))
        )}
      </Section>

      {/* 12. İMZALAR */}
      <Section title="Onay ve İmzalar" icon={faPenSquare}>
        <SignatureSection />
      </Section>
    </>
  );
}

function GorevAtamaDetails({ gorevAtama }) {
  const talepNedeni = Number(
    getField(gorevAtama, "talepNedeni", "TalepNedeni"),
  );

  const yerineAlimMi = talepNedeni === 2;

  const pozisyonButcesiVarMi = getField(
    gorevAtama,
    "pozisyonButcesiVarMi",
    "PozisyonButcesiVarMi",
  );

  const pozisyonButcesiVar =
    pozisyonButcesiVarMi === true ||
    pozisyonButcesiVarMi === "true" ||
    Number(pozisyonButcesiVarMi) === 1;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "16px",
        padding: "16px",
        borderRadius: "8px",
        border: "1px solid #E5E7EB",
        breakInside: "avoid",
        pageBreakInside: "avoid",
      }}
    >
      {/* 1. SATIR */}

      <Row
        label="Departman"
        value={
          getField(
            gorevAtama,
            "masterDepartmanAdi",
            "MasterDepartmanAdi",
            "departmanAdi",
            "DepartmanAdi",
          ) || "-"
        }
      />

      <Row
        label="Atanacak Görev"
        value={getField(gorevAtama, "gorevAdi", "GorevAdi") || "-"}
      />

      <Row
        label="İşe Başlama Tarihi"
        value={formatDate(
          getField(gorevAtama, "baslangicTarihi", "BaslangicTarihi"),
        )}
      />

      {/* 2. SATIR */}

      <Row
        label="Talep Nedeni"
        value={yerineAlimMi ? "Yerine Alım" : "Yeni Kadro"}
      />

      <Row
        label="Önerilen Net Ücret"
        value={formatCurrency(getField(gorevAtama, "netUcret", "NetUcret"))}
      />

      <Row
        label="Pozisyon Standart Bütçesi"
        value={formatCurrency(
          getField(
            gorevAtama,
            "talepEdilenGorevGenelButcesi",
            "TalepEdilenGorevGenelButcesi",
          ),
        )}
      />

      {/* YERİNE ALIM BİLGİLERİ */}

      {yerineAlimMi && (
        <>
          <Row
            label="Yerine Alınacak Kişi"
            value={
              getField(
                gorevAtama,
                "yerineAlinacakKisiAdSoyad",
                "YerineAlinacakKisiAdSoyad",
              ) || "-"
            }
          />

          <Row
            label="Ayrılacak Kişi Çıkış Tarihi"
            value={formatDate(
              getField(
                gorevAtama,
                "yerineAlinacakKisiCikisTarihi",
                "YerineAlinacakKisiCikisTarihi",
              ),
            )}
          />
        </>
      )}

      {/* İK KONTROL ALANLARI */}

      <Row
        label="Pozisyon Bütçesi Var mı?"
        value={getBooleanText(pozisyonButcesiVarMi)}
      />

      <Row
        label="Pozisyonda Olması Gereken Personel Sayısı"
        value={
          getField(
            gorevAtama,
            "pozisyondaCalismasiGerekenPersonelSayisi",
            "PozisyondaCalismasiGerekenPersonelSayisi",
          ) ?? "-"
        }
      />

      <Row
        label="Aktif Çalışan Personel Sayısı"
        value={
          getField(
            gorevAtama,
            "aktifCalisanPersonel",
            "AktifCalisanPersonel",
          ) ?? "-"
        }
      />

      <Row
        label="Toplam Pozisyon Bütçesi"
        value={
          pozisyonButcesiVar
            ? formatCurrency(
                getField(
                  gorevAtama,
                  "totalPozisyonButcesi",
                  "TotalPozisyonButcesi",
                ),
              )
            : "-"
        }
      />

      <Row
        label="Çalışma İzin Belge Türü"
        value={
          getField(
            gorevAtama,
            "calismaIzinBelgeTuruAdi",
            "CalismaIzinBelgeTuruAdi",
          ) || "-"
        }
      />
    </div>
  );
}

function ReferansArastirmasiCard({ referans, index }) {
  const referansIsYeriAdi = getField(
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

  const gorusmeTarihi = getField(referans, "gorusmeTarihi", "GorusmeTarihi");

  const disiplinKaydiVarMi = getField(
    referans,
    "disiplinKaydiVarMi",
    "DisiplinKaydiVarMi",
  );

  const disiplinKaydiAciklama = getField(
    referans,
    "disiplinKaydiAciklama",
    "DisiplinKaydiAciklama",
  );

  const odulVarMi = getField(referans, "odulVarMi", "OdulVarMi");

  const odulAciklama = getField(referans, "odulAciklama", "OdulAciklama");

  const ayrilisSureciSorunluMu = getField(
    referans,
    "istenAyrilisSureciSorunluMu",
    "IstenAyrilisSureciSorunluMu",
  );

  const ayrilisSorunAciklama = getField(
    referans,
    "istenAyrilisSorunAciklama",
    "IstenAyrilisSorunAciklama",
  );

  const yenidenIseAlirMisin = getField(
    referans,
    "yenidenIseAlirMisin",
    "YenidenIseAlirMisin",
  );

  const yenidenIseAlmamaNedeni = getField(
    referans,
    "yenidenIseAlmamaNedeni",
    "YenidenIseAlmamaNedeni",
  );

  const gorusmeci = getField(
    referans,
    "gorusmeyiYapanKullaniciAdSoyad",
    "GorusmeyiYapanKullaniciAdSoyad",
  );

  const genelDegerlendirmeNotu = getField(
    referans,
    "genelDegerlendirmeNotu",
    "GenelDegerlendirmeNotu",
  );

  return (
    <div
      style={{
        marginBottom: "20px",
        border: "1px solid #E5E7EB",
        borderRadius: "8px",
        padding: "16px",
        breakInside: "avoid",
        pageBreakInside: "avoid",
      }}
    >
      {/* Referans başlığı */}
      <div
        style={{
          margin: "0 0 12px 0",
          borderBottom: "1px solid #E5E7EB",
          paddingBottom: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
        }}
      >
        <h4
          style={{
            margin: 0,
            color: "#111827",
            fontSize: "1rem",
            lineHeight: "1.4",
          }}
        >
          {index + 1}. {referansIsYeriAdi || "İş Yeri Belirtilmedi"}
          {" - "}
          {gorusulenAdSoyad || "Görüşülen Kişi Belirtilmedi"}
          {" ("}
          {referansUnvan || "Ünvan Yok"}
          {")"}
        </h4>

        <span
          style={{
            flexShrink: 0,
            fontSize: "0.75rem",
            color: "#6B7280",
            fontWeight: "400",
          }}
        >
          Tarih: {formatDate(gorusmeTarihi)}
        </span>
      </div>

      {/* Temel görüşme bilgileri */}
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
          value={getField(
            referans,
            "gorusulenKisininTelefonu",
            "GorusulenKisininTelefonu",
          )}
        />

        <Row
          label="İlk Görevi"
          value={getField(referans, "ilkGorev", "IlkGorev")}
        />

        <Row
          label="Son Görevi"
          value={getField(referans, "sonGorev", "SonGorev")}
        />

        <Row
          label="İşe Başlama (Teyit)"
          value={formatDate(
            getField(referans, "adayIseBaslamaTarihi", "AdayIseBaslamaTarihi"),
          )}
        />

        <Row
          label="İşten Ayrılma (Teyit)"
          value={formatDate(
            getField(
              referans,
              "adayIstenAyrilmaTarihi",
              "AdayIstenAyrilmaTarihi",
            ),
          )}
        />

        <Row
          label="Ayrılma Nedeni (Teyit)"
          value={getField(referans, "istenAyrilmaNedeni", "IstenAyrilmaNedeni")}
        />
      </div>

      {/* Değerlendirme sonuçları */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "12px",
          borderTop: "1px dashed #D1D5DB",
          paddingTop: "12px",
        }}
      >
        <EvaluationRow
          label="Disiplin Kaydı Var mı?"
          enumValue={disiplinKaydiVarMi}
          description={disiplinKaydiAciklama}
          descriptionPrefix="Açıklama"
        />

        <EvaluationRow
          label="Ödül / Başarı Var mı?"
          enumValue={odulVarMi}
          description={odulAciklama}
          descriptionPrefix="Detay"
        />

        <EvaluationRow
          label="Çıkış Süreci Sorunlu mu?"
          enumValue={ayrilisSureciSorunluMu}
          description={ayrilisSorunAciklama}
          descriptionPrefix="Detay"
        />

        <EvaluationRow
          label="Tekrar İşe Alınır mı?"
          enumValue={yenidenIseAlirMisin}
          description={yenidenIseAlmamaNedeni}
          descriptionPrefix="Neden Alınmaz"
          descriptionColor="#EF4444"
        />

        <div
          style={{
            padding: "12px",
            borderRadius: "6px",
            marginTop: "4px",
            border: "1px solid #E5E7EB",
          }}
        >
          <Row
            label={`İK Genel Değerlendirme Notu (${gorusmeci || "Görüşmeci"})`}
            value={genelDegerlendirmeNotu || "Not girilmemiş."}
            colSpan
          />
        </div>
      </div>
    </div>
  );
}

function EvaluationRow({
  label,
  enumValue,
  description,
  descriptionPrefix = "Açıklama",
  descriptionColor = "#4B5563",
}) {
  return (
    <Row
      label={label}
      value={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <EnumText value={enumValue} />

          {description && (
            <span
              style={{
                fontSize: "0.85rem",
                fontStyle: "italic",
                marginTop: "2px",
                color: descriptionColor,
              }}
            >
              {descriptionPrefix}: {description}
            </span>
          )}
        </div>
      }
      colSpan
    />
  );
}

function SignatureSection() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "16px",
        marginTop: "30px",
        breakInside: "avoid",
        pageBreakInside: "avoid",
      }}
    >
      {SIGNATURE_ROLES.map((role) => (
        <div
          key={role}
          style={{
            width: "22%",
            textAlign: "center",
            pageBreakInside: "avoid",
          }}
        >
          <div
            style={{
              height: "50px",
              marginBottom: "10px",
              borderBottom: "1px solid #374151",
            }}
          />

          <p
            style={{
              margin: 0,
              fontWeight: "700",
              color: "#111827",
              fontSize: "0.875rem",
              lineHeight: "1.3",
            }}
          >
            {role}
          </p>

          <p
            style={{
              fontSize: "0.75rem",
              color: "#6B7280",
              marginTop: "4px",
              marginBottom: 0,
            }}
          >
            (İmza)
          </p>
        </div>
      ))}
    </div>
  );
}
