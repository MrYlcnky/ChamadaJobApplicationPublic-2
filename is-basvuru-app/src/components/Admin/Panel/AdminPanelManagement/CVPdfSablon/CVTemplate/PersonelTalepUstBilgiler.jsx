import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

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

const getDisplayValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "object") {
    return (
      value.label ||
      value.Label ||
      value.name ||
      value.Name ||
      value.ad ||
      value.Ad ||
      value.adi ||
      value.Adi ||
      "-"
    );
  }

  return value;
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return `${numericValue.toLocaleString("tr-TR")} ₺`;
};

const getBudgetStatus = (value) => {
  if (value === true || value === "true" || Number(value) === 1) {
    return "VAR";
  }

  if (value === false || value === "false" || Number(value) === 0) {
    return "YOK";
  }

  return "-";
};

const getTalepNedeni = (value) => {
  const numericValue = Number(value);

  if (numericValue === 2) {
    return "Yerine Alım";
  }

  if (numericValue === 1) {
    return "Yeni Kadro";
  }

  return getDisplayValue(value);
};

const getLanguagesSummary = (languages) => {
  if (!Array.isArray(languages) || languages.length === 0) {
    return "-";
  }

  return languages
    .map((language) => {
      const dil =
        language.dil || language.Dil || language.dilAdi || language.DilAdi;

      const seviyeler = [
        language.konusma ? `Konuşma: ${language.konusma}` : "",
        language.okuma ? `Okuma: ${language.okuma}` : "",
        language.yazma ? `Yazma: ${language.yazma}` : "",
      ].filter(Boolean);

      if (!dil) {
        return null;
      }

      return seviyeler.length > 0 ? `${dil} (${seviyeler.join(", ")})` : dil;
    })
    .filter(Boolean)
    .join(" | ");
};

const getEducationSummary = (education) => {
  if (!Array.isArray(education) || education.length === 0) {
    return "-";
  }

  return education
    .map((item) =>
      [
        item.seviye || item.Seviye,
        item.okul || item.Okul,
        item.bolum || item.Bolum,
      ]
        .filter(Boolean)
        .join(" - "),
    )
    .filter(Boolean)
    .join(" | ");
};

function FormField({ label, value }) {
  return (
    <div
      style={{
        minHeight: "28px",
        padding: "5px 8px",
        border: "1px solid #374151",
        boxSizing: "border-box",
        backgroundColor: "#FFFFFF",
        breakInside: "avoid",
        pageBreakInside: "avoid",
      }}
    >
      <span
        style={{
          marginRight: "5px",
          fontSize: "0.68rem",
          fontWeight: "700",
          color: "#111827",
          textTransform: "uppercase",
          letterSpacing: "0.01em",
        }}
      >
        {label}:
      </span>

      <span
        style={{
          fontSize: "0.74rem",
          fontWeight: "400",
          color: "#111827",
          lineHeight: "1.3",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {getDisplayValue(value)}
      </span>
    </div>
  );
}

function BudgetInformation({ gorevAtama }) {
  const pozisyonButcesiVarMi = getField(
    gorevAtama,
    "pozisyonButcesiVarMi",
    "PozisyonButcesiVarMi",
  );

  const totalPozisyonButcesi = getField(
    gorevAtama,
    "totalPozisyonButcesi",
    "TotalPozisyonButcesi",
  );

  const gerekliPersonel = getField(
    gorevAtama,
    "pozisyondaCalismasiGerekenPersonelSayisi",
    "PozisyondaCalismasiGerekenPersonelSayisi",
  );

  const aktifPersonel = getField(
    gorevAtama,
    "aktifCalisanPersonel",
    "AktifCalisanPersonel",
  );

  return (
    <div
      style={{
        minHeight: "28px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "4px 9px",
        padding: "5px 8px",
        border: "1px solid #374151",
        boxSizing: "border-box",
        backgroundColor: "#FFFFFF",
        fontSize: "0.68rem",
        color: "#111827",
        breakInside: "avoid",
        pageBreakInside: "avoid",
      }}
    >
      <span style={{ fontWeight: "700" }}>BÜTÇE BİLGİSİ:</span>

      <span style={{ fontWeight: "600" }}>
        {getBudgetStatus(pozisyonButcesiVarMi)}
      </span>

      <span>
        <strong>BÜTÇE:</strong> {formatCurrency(totalPozisyonButcesi)}
      </span>

      <span>
        <strong>MEVCUT:</strong> {gerekliPersonel ?? "-"}
      </span>

      <span>
        <strong>AKTİF ÇALIŞAN:</strong> {aktifPersonel ?? "-"}
      </span>
    </div>
  );
}

function ButceVeUcretField({ kadroButcesi, netUcret }) {
  return (
    <div
      style={{
        minHeight: "28px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "4px 6px",
        padding: "5px 8px",
        border: "1px solid #374151",
        boxSizing: "border-box",
        backgroundColor: "#FFFFFF",
        color: "#111827",
        breakInside: "avoid",
        pageBreakInside: "avoid",
      }}
    >
      <span
        style={{
          fontSize: "0.68rem",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "0.01em",
        }}
      >
        Pozisyon Ücreti / Önerilen Net Ücret:
      </span>

      <span
        style={{
          fontSize: "0.74rem",
          fontWeight: "400",
        }}
      >
        {formatCurrency(kadroButcesi)}
        {" / "}
        {formatCurrency(netUcret)}
      </span>
    </div>
  );
}

function PersonalSummary({ personal, otherInfo, photoUrl, age }) {
  const uyruk = getField(personal, "uyruk", "Uyruk");

  const boy = getField(otherInfo, "boy", "Boy");

  const kilo = getField(otherInfo, "kilo", "Kilo");

  return (
    <div>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt="Personel"
          crossOrigin="anonymous"
          style={{
            display: "block",
            width: "140px",
            height: "155px",
            margin: "0 auto 8px",
            objectFit: "cover",
            border: "1px solid #D1D5DB",
            borderRadius: "4px",
          }}
        />
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "140px",
            height: "155px",
            margin: "0 auto 8px",
            backgroundColor: "#F3F4F6",
            border: "1px solid #D1D5DB",
            borderRadius: "4px",
          }}
        >
          <FontAwesomeIcon
            icon={faUser}
            style={{
              width: "55px",
              height: "55px",
              color: "#D1D5DB",
            }}
          />
        </div>
      )}

      <div
        style={{
          padding: "8px",
          border: "1px solid #374151",
          fontSize: "0.7rem",
          lineHeight: "1.55",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div>
          <strong>UYRUK:</strong> {uyruk || "-"}
        </div>

        <div>
          <strong>YAŞ:</strong> {age ?? "-"}
        </div>

        <div>
          <strong>BOY:</strong> {boy ? `${boy} cm` : "-"}
        </div>

        <div>
          <strong>KİLO:</strong> {kilo ? `${kilo} kg` : "-"}
        </div>
      </div>
    </div>
  );
}

export default function PersonelTalepUstBilgiler({
  personal = {},
  otherInfo = {},
  jobDetails = {},
  gorevAtama = {},
  languages = [],
  education = [],
  photoUrl = null,
  age = null,
}) {
  const departman = getField(
    gorevAtama,
    "masterDepartmanAdi",
    "MasterDepartmanAdi",
    "departmanAdi",
    "DepartmanAdi",
  );

  const gorev = getField(gorevAtama, "gorevAdi", "GorevAdi");

  const departmanVeGorev = [departman, gorev].filter(Boolean).join(" / ");

  const adSoyad = [
    getField(personal, "ad", "Ad"),
    getField(personal, "soyad", "Soyad"),
  ]
    .filter(Boolean)
    .join(" ");

  const kadroButcesi = getField(
    gorevAtama,
    "talepEdilenGorevGenelButcesi",
    "TalepEdilenGorevGenelButcesi",
  );

  const netUcret = getField(gorevAtama, "netUcret", "NetUcret");

  const talepNedeni = getField(gorevAtama, "talepNedeni", "TalepNedeni");

  const yerineAlimMi = Number(talepNedeni) === 2;

  const yerineAlinacakKisi = getField(
    gorevAtama,
    "yerineAlinacakKisiAdSoyad",
    "YerineAlinacakKisiAdSoyad",
  );

  const talepNedeniGosterim = yerineAlimMi
    ? `${getTalepNedeni(talepNedeni)} : ${yerineAlinacakKisi || " "}`
    : getTalepNedeni(talepNedeni);

  const kisiBilgiveTalepNedeniGösterim = [adSoyad, talepNedeniGosterim]
    .filter(Boolean)
    .join(" / ");

  const calismaIzinTuru = getField(
    gorevAtama,
    "calismaIzinBelgeTuruAdi",
    "CalismaIzinBelgeTuruAdi",
  );

  const lojmanTalebi = getField(
    jobDetails,
    "lojman",
    "Lojman",
    "lojmanTalebi",
    "LojmanTalebi",
  );

  return (
    <section
      style={{
        breakInside: "avoid",
        pageBreakInside: "avoid",
      }}
    >
      <h1
        style={{
          margin: "0 0 10px",
          textAlign: "center",
          fontSize: "1.2rem",
          fontWeight: "700",
          color: "#111827",
        }}
      >
        PERSONEL TALEP ONAY FORMU
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 150px",
          gap: "12px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: "5px",
          }}
        >
          {/* DEPARTMAN VE GÖREV */}
          <FormField label="Departman / Pozisyon" value={departmanVeGorev} />

          {/* AD SOYAD VE TALEP NEDENİ */}
          <FormField
            label="Adı Soyadı / Talep Nedeni "
            value={kisiBilgiveTalepNedeniGösterim}
          />
          {/* KADRO VE ÖNERİLEN ÜCRET */}
          <ButceVeUcretField kadroButcesi={kadroButcesi} netUcret={netUcret} />

          {/* POZİSYON BÜTÇE BİLGİLERİ */}
          <BudgetInformation gorevAtama={gorevAtama} />

          {/* LOJMAN VE ÇALIŞMA İZNİ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <FormField label="Lojman Talebi" value={lojmanTalebi} />

            <FormField label="Çalışma İzin Türü" value={calismaIzinTuru} />
          </div>

          <FormField
            label="Yabancı Dil Bilgisi"
            value={getLanguagesSummary(languages)}
          />

          <FormField
            label="Eğitim Durumu"
            value={getEducationSummary(education)}
          />
        </div>

        <PersonalSummary
          personal={personal}
          otherInfo={otherInfo}
          photoUrl={photoUrl}
          age={age}
        />
      </div>
    </section>
  );
}
