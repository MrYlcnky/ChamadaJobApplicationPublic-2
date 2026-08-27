import {
  faUser,
  faGraduationCap,
  faAward,
  faLaptopCode,
  faLanguage,
  faBriefcase,
  faPhoneVolume,
  faUserCog,
  faFileSignature,
} from "@fortawesome/free-solid-svg-icons";

import { formatDate } from "../../../../../Users/modalHooks/dateUtils";

import { DetailRow, Row, Section, Table } from "./CVPdfComponents";

const joinLocation = (...values) => values.filter(Boolean).join(" / ") || "-";

export default function CVMainSections({
  personal = {},
  education = [],
  certificates = [],
  computer = [],
  languages = [],
  experience = [],
  references = [],
  otherInfo = {},
  jobDetails = {},
  cleanAndJoinLabels = () => "",
}) {
  const ehliyetTurleri = Array.isArray(otherInfo.ehliyetTurleri)
    ? otherInfo.ehliyetTurleri.join(", ")
    : "";

  const ehliyetBilgisi = [
    otherInfo.ehliyet,
    ehliyetTurleri ? `(${ehliyetTurleri})` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* 1. KİŞİSEL BİLGİLER */}
      <Section title="Kişisel Bilgiler" icon={faUser}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          <Row label="Doğum Tarihi" value={formatDate(personal.dogumTarihi)} />

          <Row label="Cinsiyet" value={personal.cinsiyet} />

          <Row label="Medeni Durum" value={personal.medeniDurum} />

          <Row label="Çocuk Sayısı" value={personal.cocukSayisi} />

          <Row label="Uyruk" value={personal.uyruk} />

          <Row
            label="Doğum Yeri"
            value={joinLocation(
              personal.dogumUlke,
              personal.dogumSehir,
              personal.dogumIlce,
            )}
          />

          <Row
            label="İkamet Yeri"
            value={joinLocation(
              personal.ikametUlke,
              personal.ikametSehir,
              personal.ikametIlce,
            )}
            colSpan
          />
        </div>
      </Section>

      {/* 2. EĞİTİM BİLGİLERİ */}
      <Section title="Eğitim Bilgileri" icon={faGraduationCap}>
        <Table
          headers={[
            "Seviye",
            "Okul",
            "Bölüm",
            "Başlangıç",
            "Bitiş",
            "Durum",
            "GANO",
          ]}
          rows={education.map((item) => [
            item.seviye,
            item.okul,
            item.bolum,
            formatDate(item.baslangic),
            formatDate(item.bitis),
            item.diplomaDurum,
            item.gano ? `${item.gano} / ${item.notSistemi || "-"}` : "-",
          ])}
        />
      </Section>

      {/* 3. SERTİFİKALAR */}
      <Section title="Sertifika ve Eğitimler" icon={faAward}>
        <Table
          headers={[
            "Eğitim Adı",
            "Kurum",
            "Süre",
            "Veriliş Tarihi",
            "Geçerlilik Tarihi",
          ]}
          rows={certificates.map((item) => [
            item.ad,
            item.kurum,
            item.sure,
            formatDate(item.verilisTarihi),
            formatDate(item.gecerlilikTarihi),
          ])}
        />
      </Section>

      {/* 4. BİLGİSAYAR BİLGİLERİ */}
      <Section title="Bilgisayar Bilgileri" icon={faLaptopCode}>
        <Table
          headers={["Program Adı", "Yetkinlik"]}
          rows={computer.map((item) => [item.programAdi, item.yetkinlik])}
        />
      </Section>

      {/* 5. YABANCI DİL */}
      <Section title="Yabancı Dil Bilgisi" icon={faLanguage}>
        <Table
          headers={[
            "Dil",
            "Konuşma",
            "Dinleme",
            "Okuma",
            "Yazma",
            "Nasıl Öğrenildi",
          ]}
          rows={languages.map((item) => [
            item.dil,
            item.konusma,
            item.dinleme,
            item.okuma,
            item.yazma,
            item.ogrenilenKurum,
          ])}
        />
      </Section>

      {/* 6. İŞ DENEYİMLERİ */}
      <Section title="İş Deneyimleri" icon={faBriefcase}>
        <Table
          headers={[
            "Şirket",
            "Departman",
            "Pozisyon",
            "Başlangıç",
            "Bitiş",
            "Ayrılış Nedeni",
          ]}
          rows={experience.map((item) => [
            item.isAdi,
            item.departman,
            item.pozisyon,
            formatDate(item.baslangicTarihi),
            item.halenCalisiyor ? "Devam Ediyor" : formatDate(item.bitisTarihi),
            item.ayrilisSebebi,
          ])}
        />
      </Section>

      {/* 7. ADAYIN GİRDİĞİ REFERANSLAR */}
      <Section title="Referanslar" icon={faPhoneVolume}>
        <Table
          headers={["Ad Soyad", "Kurum", "Görev", "Telefon", "Tipi"]}
          rows={references.map((item) => [
            [item.referansAdi, item.referansSoyadi].filter(Boolean).join(" "),
            item.referansIsYeri,
            item.referansGorevi,
            item.referansTelefon,
            item.calistigiKurum,
          ])}
        />
      </Section>

      {/* 8. DİĞER KİŞİSEL BİLGİLER */}
      <Section title="Diğer Kişisel Bilgiler" icon={faUserCog}>
        {/* Kısa bilgiler */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "12px",
          }}
        >
          <Row label="Askerlik Durumu" value={otherInfo.askerlik} />

          <Row
            label="Boy / Kilo"
            value={`${otherInfo.boy || "-"} cm / ${otherInfo.kilo || "-"} kg`}
          />

          <Row label="Sigara Kullanımı" value={otherInfo.sigara} />
        </div>

        <DetailRow
          label="KKTC Geçerli Belge"
          value={otherInfo.kktcGecerliBelge}
        />

        <DetailRow label="Ehliyet Bilgisi" value={ehliyetBilgisi} />

        <DetailRow
          label="Dava Durumu"
          value={
            [
              otherInfo.davaDurumu,
              otherInfo.davaNedeni ? `: ${otherInfo.davaNedeni}` : "",
            ]
              .filter(Boolean)
              .join("") || "-"
          }
        />

        <DetailRow
          label="Kalıcı Rahatsızlık"
          value={
            [
              otherInfo.kaliciRahatsizlik,
              otherInfo.rahatsizlikAciklama
                ? `: ${otherInfo.rahatsizlikAciklama}`
                : "",
            ]
              .filter(Boolean)
              .join("") || "-"
          }
        />
      </Section>

      {/* 9. İŞ BAŞVURU DETAYLARI */}
      <Section title="İş Başvuru Detayları" icon={faFileSignature}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          <Row label="Şubeler" value={cleanAndJoinLabels(jobDetails.subeler)} />

          <Row label="Alanlar" value={cleanAndJoinLabels(jobDetails.alanlar)} />

          <Row
            label="Departmanlar"
            value={cleanAndJoinLabels(jobDetails.departmanlar)}
          />

          <Row
            label="Pozisyonlar"
            value={cleanAndJoinLabels(jobDetails.departmanPozisyonlari)}
          />

          <Row
            label="Programlar"
            value={cleanAndJoinLabels(jobDetails.programlar)}
          />

          <Row
            label="Kağıt Oyunları"
            value={cleanAndJoinLabels(jobDetails.kagitOyunlari) || "-"}
          />

          <Row label="Lojman Talebi" value={jobDetails.lojman} />

          <Row label="Tercih Nedeni" value={jobDetails.tercihNedeni} colSpan />
        </div>
      </Section>
    </>
  );
}
