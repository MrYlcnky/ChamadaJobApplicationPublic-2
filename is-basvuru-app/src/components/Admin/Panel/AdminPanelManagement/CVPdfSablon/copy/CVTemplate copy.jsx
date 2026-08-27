import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faGraduationCap,
  faAward,
  faLaptopCode,
  faLanguage,
  faBriefcase,
  faPhoneVolume,
  faUserCog,
  faFileSignature,
  faPenSquare,
  faClipboardCheck,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "../../../../../Users/modalHooks/dateUtils";

// 🎯 SERVİSLER
import { referansArastirmasiService } from "../../../../../../services/referansArastirmasiService";
import { gorevAtamaService } from "../../../../../../services/gorevAtamaService";

// === YARDIMCI BİLEŞENLER ===

const Section = ({ title, icon, children }) => (
  <div
    className="pdf-section"
    style={{
      marginTop: "20px",
      paddingTop: "10px",
      paddingBottom: "10px",
      breakInside: "avoid",
    }}
  >
    <h2
      style={{
        display: "flex",
        alignItems: "center",
        fontSize: "1.25rem",
        fontWeight: "700",
        color: "#111827",
        borderBottom: "2px solid #E5E7EB",
        paddingBottom: "8px",
        marginBottom: "16px",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "32px",
          height: "32px",
          backgroundColor: "#F3F4F6",
          borderRadius: "6px",
          marginRight: "12px",
        }}
      >
        <FontAwesomeIcon
          icon={icon}
          style={{ width: "16px", height: "16px", color: "#4B5563" }}
        />
      </span>
      {title.toUpperCase()}
    </h2>
    <div style={{ fontSize: "0.925rem", color: "#374151", lineHeight: "1.5" }}>
      {children}
    </div>
  </div>
);

const Row = ({ label, value, colSpan = false }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      marginBottom: "12px",
      gridColumn: colSpan ? "span 3" : "span 1",
    }}
  >
    <span
      style={{
        fontSize: "0.75rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        fontWeight: "600",
        color: "#6B7280",
        marginBottom: "4px",
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: "0.95rem",
        fontWeight: "500",
        color: "#111827",
        wordBreak: "break-word",
      }}
    >
      {value || "-"}
    </span>
  </div>
);

const Table = ({ headers, rows }) => {
  if (!rows || rows.length === 0) {
    return (
      <p
        style={{ fontSize: "0.875rem", color: "#9CA3AF", fontStyle: "italic" }}
      >
        Bu alan doldurulmamış.
      </p>
    );
  }
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "0.875rem",
      }}
    >
      <thead>
        <tr style={{ borderBottom: "2px solid #E5E7EB" }}>
          {headers.map((h, i) => (
            <th
              key={i}
              style={{
                padding: "12px 8px",
                textAlign: "left",
                fontWeight: "600",
                color: "#374151",
                fontSize: "0.8rem",
                textTransform: "uppercase",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={i}
            style={{
              borderBottom: "1px solid #F3F4F6",
              breakInside: "avoid",
            }}
          >
            {row.map((cell, j) => (
              <td
                key={j}
                style={{
                  padding: "12px 8px",
                  color: "#4B5563",
                  verticalAlign: "top",
                }}
              >
                {Array.isArray(cell) ? cell.join(", ") : cell || "-"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const getEnumText = (val) => {
  if (val === 1)
    return <span style={{ color: "#EF4444", fontWeight: "bold" }}>Hayır</span>;
  if (val === 2)
    return <span style={{ color: "#10B981", fontWeight: "bold" }}>Evet</span>;
  if (val === 3)
    return <span style={{ color: "#F59E0B", fontWeight: "bold" }}>Kısmen</span>;
  return "-";
};

// === ANA BİLEŞEN ===

export default function CVTemplate({ data }) {
  const [fetchedReferanslar, setFetchedReferanslar] = useState([]);
  const [fetchedGorevAtama, setFetchedGorevAtama] = useState({});

  const findMasterId = (cvData) => {
    if (!cvData) return null;
    if (cvData.id) return cvData.id;
    if (cvData.Id) return cvData.Id;
    if (cvData.originalData?.id) return cvData.originalData.id;
    if (cvData.originalData?.Id) return cvData.originalData.Id;
    if (cvData.originalData?.masterBasvuruId)
      return cvData.originalData.masterBasvuruId;
    if (cvData.notes && cvData.notes.length > 0)
      return cvData.notes[0]?.masterBasvuruId;
    return null;
  };

  const targetId = findMasterId(data);

  useEffect(() => {
    if (targetId) {
      // 1. REFERANSLARI ÇEK
      referansArastirmasiService
        .getByMasterBasvuruId(targetId)
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            setFetchedReferanslar(res.data.data);
          }
        })
        .catch((err) => console.error("Referans hatası:", err));

      // 2. GÖREV ATAMAYI ÇEK
      gorevAtamaService
        .getByMasterBasvuruId(targetId)
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            setFetchedGorevAtama(res.data.data);
          }
        })
        .catch((err) => console.error("Görev Atama hatası:", err));
    }
  }, [targetId]);

  if (!data)
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Veri Yükleniyor...
      </div>
    );

  const cv = data;
  const rawData = cv.originalData || {};
  const personal = cv.personal || {};
  const jobDetails = cv.jobDetails || {};
  const experience = cv.experience || [];
  const education = cv.education || [];
  const languages = cv.languages || [];
  const computer = cv.computer || [];
  const certificates = cv.certificates || [];
  const references = cv.references || [];
  const otherInfo = cv.otherInfo || {};

  const gorevAtama =
    Object.keys(fetchedGorevAtama).length > 0
      ? fetchedGorevAtama
      : cv.gorevAtama || rawData.gorevAtama || rawData.GorevAtama || {};
  const referansArastirmalari =
    fetchedReferanslar.length > 0
      ? fetchedReferanslar
      : cv.referansArastirmalari ||
        rawData.referansArastirmalari ||
        rawData.ReferansArastirmalari ||
        [];

  const cleanAndJoinLabels = (arr, separator = ", ") => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return "";
    return [...new Set(arr.map((o) => o?.label).filter(Boolean))].join(
      separator,
    );
  };

  const rolesDisplay =
    cleanAndJoinLabels(jobDetails.departmanPozisyonlari, " / ") || "-";

  return (
    <div
      id="cv-to-print"
      style={{
        width: "100%",
        maxWidth: "210mm",
        margin: "0 auto",
        backgroundColor: "#FFFFFF",
        color: "#1F2937",
        padding: "50px 40px",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        lineHeight: "1.5",
        boxSizing: "border-box",
        wordWrap: "break-word",
      }}
    >
      {/* === BAŞLIK (HEADER) === */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "30px",
          borderBottom: "3px solid #111827",
        }}
      >
        <tbody>
          <tr>
            <td style={{ verticalAlign: "top", paddingBottom: "30px" }}>
              <h1
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "800",
                  color: "#111827",
                  margin: "0 0 8px 0",
                  lineHeight: "1.1",
                }}
              >
                {personal.ad} {personal.soyad}
              </h1>
              <p
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "500",
                  color: "#4B5563",
                  margin: "0 0 24px 0",
                }}
              >
                {rolesDisplay}
              </p>

              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <td
                      style={{
                        width: "24px",
                        verticalAlign: "middle",
                        paddingBottom: "8px",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faPhone}
                        style={{ color: "#6B7280" }}
                      />
                    </td>
                    <td
                      style={{
                        color: "#374151",
                        fontSize: "0.925rem",
                        paddingBottom: "8px",
                      }}
                    >
                      {personal.telefon}
                      {personal.whatsapp && (
                        <span style={{ color: "#9CA3AF", marginLeft: "8px" }}>
                          • WA: {personal.whatsapp}
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        width: "24px",
                        verticalAlign: "middle",
                        paddingBottom: "8px",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        style={{ color: "#6B7280" }}
                      />
                    </td>
                    <td
                      style={{
                        color: "#374151",
                        fontSize: "0.925rem",
                        paddingBottom: "8px",
                      }}
                    >
                      {personal.eposta}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        width: "24px",
                        verticalAlign: "top",
                        paddingTop: "2px",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        style={{ color: "#6B7280" }}
                      />
                    </td>
                    <td
                      style={{
                        color: "#374151",
                        fontSize: "0.925rem",
                        lineHeight: "1.4",
                      }}
                    >
                      {personal.adres}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>

            <td
              style={{
                width: "160px",
                verticalAlign: "top",
                textAlign: "right",
                paddingBottom: "30px",
              }}
            >
              {personal.foto ? (
                <img
                  src={
                    personal.foto.startsWith("http") ||
                    personal.foto.startsWith("data:")
                      ? personal.foto
                      : `${import.meta.env.VITE_API_BASE_URL}/uploads/personel-fotograflari/${personal.foto}`
                  }
                  alt="Profil"
                  style={{
                    width: "140px",
                    height: "160px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    display: "inline-block",
                  }}
                  crossOrigin="anonymous"
                />
              ) : (
                <div
                  style={{
                    width: "140px",
                    height: "160px",
                    borderRadius: "8px",
                    backgroundColor: "#F3F4F6",
                    border: "1px solid #E5E7EB",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: "auto",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faUser}
                    style={{ width: "64px", height: "64px", color: "#D1D5DB" }}
                  />
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* === 1. KİŞİSEL BİLGİLER === */}
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
            value={` ${personal.dogumUlke || ""}/ ${personal.dogumSehir || ""}/ ${personal.dogumIlce || ""}`}
          />
          <Row
            label="İkamet Yeri"
            value={` ${personal.ikametUlke || ""}/ ${personal.ikametSehir || ""}/ ${personal.ikametIlce || ""}`}
            colSpan={true}
          />
        </div>
      </Section>

      {/* === 2. EĞİTİM BİLGİLERİ === */}
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
          rows={education.map((e) => [
            e.seviye,
            e.okul,
            e.bolum,
            formatDate(e.baslangic),
            formatDate(e.bitis),
            e.diplomaDurum,
            `${e.gano || "-"} / ${e.notSistemi}`,
          ])}
        />
      </Section>

      {/* === 3. SERTİFİKALAR === */}
      <Section title="Sertifika ve Eğitimler" icon={faAward}>
        <Table
          headers={[
            "Eğitim Adı",
            "Kurum",
            "Süre",
            "Veriliş Tarihi",
            "Geçerlilik Tarihi",
          ]}
          rows={certificates.map((c) => [
            c.ad,
            c.kurum,
            c.sure,
            formatDate(c.verilisTarihi),
            formatDate(c.gecerlilikTarihi),
          ])}
        />
      </Section>

      {/* === 4. BİLGİSAYAR BİLGİLERİ === */}
      <Section title="Bilgisayar Bilgileri" icon={faLaptopCode}>
        <Table
          headers={["Program Adı", "Yetkinlik"]}
          rows={computer.map((c) => [c.programAdi, c.yetkinlik])}
        />
      </Section>

      {/* === 5. YABANCI DİL === */}
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
          rows={languages.map((l) => [
            l.dil,
            l.konusma,
            l.dinleme,
            l.okuma,
            l.yazma,
            l.ogrenilenKurum,
          ])}
        />
      </Section>

      {/* === 6. İŞ DENEYİMLERİ === */}
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
          rows={experience.map((e) => [
            e.isAdi,
            e.departman,
            e.pozisyon,
            formatDate(e.baslangicTarihi),
            e.halenCalisiyor ? "Devam Ediyor" : formatDate(e.bitisTarihi),
            e.ayrilisSebebi,
          ])}
        />
      </Section>

      {/* === 7. REFERANSLAR (Adayın Girdiği) === */}
      <Section title="Referanslar" icon={faPhoneVolume}>
        <Table
          headers={["Ad Soyad", "Kurum", "Görev", "Telefon", "Tipi"]}
          rows={references.map((r) => [
            `${r.referansAdi} ${r.referansSoyadi}`,
            r.referansIsYeri,
            r.referansGorevi,
            r.referansTelefon,
            r.calistigiKurum,
          ])}
        />
      </Section>

      {/* === 8. DİĞER KİŞİSEL BİLGİLER === */}
      <Section title="Diğer Kişisel Bilgiler" icon={faUserCog}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          <Row label="KKTC Belgesi" value={otherInfo.kktcGecerliBelge} />
          <Row label="Askerlik Durumu" value={otherInfo.askerlik} />
          <Row
            label="Ehliyet"
            value={`${otherInfo.ehliyet || ""} (${(otherInfo.ehliyetTurleri || []).join(", ")})`}
          />
          <Row
            label="Boy / Kilo"
            value={`${otherInfo.boy || "-"} cm / ${otherInfo.kilo || "-"} kg`}
          />
          <Row label="Sigara Kullanımı" value={otherInfo.sigara} />
          <Row
            label="Dava Durumu"
            value={`${otherInfo.davaDurumu || ""} (${otherInfo.davaNedeni || "N/A"})`}
          />
          <Row
            label="Kalıcı Rahatsızlık"
            value={`${otherInfo.kaliciRahatsizlik || ""} (${otherInfo.rahatsizlikAciklama || "N/A"})`}
            colSpan={true}
          />
        </div>
      </Section>

      {/* === 9. İŞ BAŞVURU DETAYLARI === */}
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
          <Row
            label="Tercih Nedeni"
            value={jobDetails.tercihNedeni}
            colSpan={true}
          />
        </div>
      </Section>

      {/* 🎯 === 10. GÖREV ATAMA DETAYLARI === */}
      <Section title="Görev Atama Detayları" icon={faClipboardCheck}>
        {!gorevAtama || Object.keys(gorevAtama).length === 0 ? (
          <p
            style={{
              fontSize: "0.875rem",
              color: "#9CA3AF",
              fontStyle: "italic",
            }}
          >
            Bu alan doldurulmamış.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
            }}
          >
            <Row
              label="Departman"
              value={
                gorevAtama.masterDepartmanAdi || gorevAtama.departmanAdi || "-"
              }
            />
            <Row
              label="Atanacak Görev"
              value={gorevAtama.gorevAdi || gorevAtama.GorevAdi || "-"}
            />
            <Row
              label="İşe Başlama Tarihi"
              value={formatDate(
                gorevAtama.baslangicTarihi || gorevAtama.BaslangicTarihi,
              )}
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

            {/* Yan yana gelmesi için colSpan={true} özelliklerini sildik */}
            {(gorevAtama.talepNedeni === 2 || gorevAtama.TalepNedeni === 2) && (
              <>
                <Row
                  label="Yerine Alınacak Kişi"
                  value={
                    gorevAtama.yerineAlinacakKisiAdSoyad ||
                    gorevAtama.YerineAlinacakKisiAdSoyad ||
                    "-"
                  }
                />
                <Row
                  label="Ayrılacak Kişi Çıkış Tarihi"
                  value={
                    formatDate(
                      gorevAtama.yerineAlinacakKisiCikisTarihi ||
                        gorevAtama.YerineAlinacakKisiCikisTarihi,
                    ) || "-"
                  }
                />
              </>
            )}
          </div>
        )}
      </Section>

      {/* 🎯 === 11. REFERANS ARAŞTIRMA SONUÇLARI === */}
      <Section title="İK Referans Araştırması Sonuçları" icon={faCommentDots}>
        {!referansArastirmalari || referansArastirmalari.length === 0 ? (
          <p
            style={{
              fontSize: "0.875rem",
              color: "#9CA3AF",
              fontStyle: "italic",
            }}
          >
            Bu alan doldurulmamış.
          </p>
        ) : (
          referansArastirmalari.map((ref, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "20px",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                padding: "16px",
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
                  alignItems: "center",
                }}
              >
                <span>
                  {idx + 1}. {ref.referansIsYeriAdi || ref.ReferansIsYeriAdi} -{" "}
                  {ref.referansGorusulenAdSoyad || ref.ReferansGorusulenAdSoyad}{" "}
                  ({ref.referansUnvan || ref.ReferansUnvan || "Ünvan Yok"})
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#6B7280",
                    fontWeight: "normal",
                  }}
                >
                  Tarih: {formatDate(ref.gorusmeTarihi || ref.GorusmeTarihi)}
                </span>
              </h4>

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
                  value={
                    ref.gorusulenKisininTelefonu || ref.GorusulenKisininTelefonu
                  }
                />
                <Row label="İlk Görevi" value={ref.ilkGorev || ref.IlkGorev} />
                <Row label="Son Görevi" value={ref.sonGorev || ref.SonGorev} />
                <Row
                  label="İşe Başlama (Teyit)"
                  value={formatDate(
                    ref.adayIseBaslamaTarihi || ref.AdayIseBaslamaTarihi,
                  )}
                />
                <Row
                  label="İşten Ayrılma (Teyit)"
                  value={formatDate(
                    ref.adayIstenAyrilmaTarihi || ref.AdayIstenAyrilmaTarihi,
                  )}
                />
                <Row
                  label="Ayrılma Nedeni (Teyit)"
                  value={ref.istenAyrilmaNedeni || ref.IstenAyrilmaNedeni}
                />
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
                  label="Disiplin Kaydı Var mı?"
                  value={
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {getEnumText(
                        ref.disiplinKaydiVarMi || ref.DisiplinKaydiVarMi,
                      )}
                      {(ref.disiplinKaydiAciklama ||
                        ref.DisiplinKaydiAciklama) && (
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontStyle: "italic",
                            marginTop: "2px",
                            color: "#4B5563",
                          }}
                        >
                          Açıklama:{" "}
                          {ref.disiplinKaydiAciklama ||
                            ref.DisiplinKaydiAciklama}
                        </span>
                      )}
                    </div>
                  }
                  colSpan={true}
                />
                <Row
                  label="Ödül / Başarı Var mı?"
                  value={
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {getEnumText(ref.odulVarMi || ref.OdulVarMi)}
                      {(ref.odulAciklama || ref.OdulAciklama) && (
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontStyle: "italic",
                            marginTop: "2px",
                            color: "#4B5563",
                          }}
                        >
                          Detay: {ref.odulAciklama || ref.OdulAciklama}
                        </span>
                      )}
                    </div>
                  }
                  colSpan={true}
                />
                <Row
                  label="Çıkış Süreci Sorunlu mu?"
                  value={
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {getEnumText(
                        ref.istenAyrilisSureciSorunluMu ||
                          ref.IstenAyrilisSureciSorunluMu,
                      )}
                      {(ref.istenAyrilisSorunAciklama ||
                        ref.IstenAyrilisSorunAciklama) && (
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontStyle: "italic",
                            marginTop: "2px",
                            color: "#4B5563",
                          }}
                        >
                          Detay:{" "}
                          {ref.istenAyrilisSorunAciklama ||
                            ref.IstenAyrilisSorunAciklama}
                        </span>
                      )}
                    </div>
                  }
                  colSpan={true}
                />
                <Row
                  label="Tekrar İşe Alınır mı?"
                  value={
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {getEnumText(
                        ref.yenidenIseAlirMisin || ref.YenidenIseAlirMisin,
                      )}
                      {(ref.yenidenIseAlmamaNedeni ||
                        ref.YenidenIseAlmamaNedeni) && (
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontStyle: "italic",
                            marginTop: "2px",
                            color: "#EF4444",
                          }}
                        >
                          Neden Alınmaz:{" "}
                          {ref.yenidenIseAlmamaNedeni ||
                            ref.YenidenIseAlmamaNedeni}
                        </span>
                      )}
                    </div>
                  }
                  colSpan={true}
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
                    label={`İK Genel Değerlendirme Notu (${ref.gorusmeyiYapanKullaniciAdSoyad || ref.GorusmeyiYapanKullaniciAdSoyad || "Görüşmeci"})`}
                    value={
                      ref.genelDegerlendirmeNotu ||
                      ref.GenelDegerlendirmeNotu ||
                      "Not girilmemiş."
                    }
                    colSpan={true}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </Section>

      {/* === 12. İMZALAR === */}
      <Section title="Onay ve İmzalar" icon={faPenSquare}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
          }}
        >
          {[
            "Departman Müdürü",
            "İnsan Kaynakları Müdürü",
            "Genel Müdür",
            "Mali İşler Müdürü",
          ].map((role) => (
            <div
              key={role}
              style={{
                width: "20%",
                textAlign: "center",
                pageBreakInside: "avoid",
              }}
            >
              <div
                style={{
                  borderBottom: "1px solid #374151",
                  height: "50px",
                  marginBottom: "10px",
                }}
              ></div>
              <p
                style={{
                  fontWeight: "700",
                  color: "#111827",
                  fontSize: "0.875rem",
                }}
              >
                {role}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#6B7280",
                  marginTop: "4px",
                }}
              >
                (İmza)
              </p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
