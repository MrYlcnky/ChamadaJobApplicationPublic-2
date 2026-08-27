import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";

import { referansArastirmasiService } from "../../../../../../services/referansArastirmasiService";
import { gorevAtamaService } from "../../../../../../services/gorevAtamaService";

import CVMainSections from "./CVMainSections";
import CVInternalSections from "./CVInternalSections";

/*
 * Gönderilen CV verisinin içinden Master Başvuru ID'sini bulur.
 */
const findMasterBasvuruId = (cvData) => {
  if (!cvData) {
    return null;
  }

  return (
    cvData.id ||
    cvData.Id ||
    cvData.masterBasvuruId ||
    cvData.MasterBasvuruId ||
    cvData.originalData?.id ||
    cvData.originalData?.Id ||
    cvData.originalData?.masterBasvuruId ||
    cvData.originalData?.MasterBasvuruId ||
    cvData.notes?.[0]?.masterBasvuruId ||
    cvData.notes?.[0]?.MasterBasvuruId ||
    null
  );
};

/*
 * Fotoğrafın tam URL'sini oluşturur.
 */
const getPhotoUrl = (photo) => {
  if (!photo || typeof photo !== "string") {
    return null;
  }

  if (
    photo.startsWith("http://") ||
    photo.startsWith("https://") ||
    photo.startsWith("data:") ||
    photo.startsWith("blob:")
  ) {
    return photo;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!apiBaseUrl) {
    return photo;
  }

  return `${apiBaseUrl}/uploads/personel-fotograflari/${photo}`;
};

/*
 * Select biçimindeki:
 *
 * [{ value: 1, label: "Casino" }]
 *
 * verilerini tekrar etmeyecek şekilde metne dönüştürür.
 */
const cleanAndJoinLabels = (values, separator = ", ") => {
  if (!Array.isArray(values) || values.length === 0) {
    return "";
  }

  const labels = values
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      return (
        item?.label ||
        item?.Label ||
        item?.adi ||
        item?.Adi ||
        item?.ad ||
        item?.Ad ||
        ""
      );
    })
    .filter(Boolean);

  return [...new Set(labels)].join(separator);
};

export default function CVTemplate({ data }) {
  const [fetchedReferanslar, setFetchedReferanslar] = useState([]);

  const [fetchedGorevAtama, setFetchedGorevAtama] = useState({});

  /*
   * Başvuru ID'si yalnızca data değiştiğinde tekrar hesaplanır.
   */
  const targetId = useMemo(() => findMasterBasvuruId(data), [data]);

  /*
   * İK referans araştırmaları ve görev atama bilgileri
   * ayrı servislerden getirilir.
   */
  useEffect(() => {
    let isMounted = true;

    /*
     * Farklı bir aday açıldığında önceki adayın
     * servis sonuçları ekranda kalmasın.
     */
    setFetchedReferanslar([]);
    setFetchedGorevAtama({});

    if (!targetId) {
      return () => {
        isMounted = false;
      };
    }

    const fetchAdditionalData = async () => {
      const [referansResult, gorevAtamaResult] = await Promise.allSettled([
        referansArastirmasiService.getByMasterBasvuruId(targetId),

        gorevAtamaService.getByMasterBasvuruId(targetId),
      ]);

      if (!isMounted) {
        return;
      }

      /*
       * Referans araştırması sonucu
       */
      if (referansResult.status === "fulfilled") {
        const responseData = referansResult.value?.data;

        const referanslar =
          responseData?.data ||
          (Array.isArray(responseData) ? responseData : []);

        setFetchedReferanslar(Array.isArray(referanslar) ? referanslar : []);
      } else {
        console.error(
          "Referans araştırması yüklenemedi:",
          referansResult.reason,
        );
      }

      /*
       * Görev atama sonucu
       */
      if (gorevAtamaResult.status === "fulfilled") {
        const responseData = gorevAtamaResult.value?.data;

        const gorevAtama =
          responseData?.data ||
          (responseData?.id || responseData?.Id ? responseData : {});

        setFetchedGorevAtama(
          gorevAtama &&
            typeof gorevAtama === "object" &&
            !Array.isArray(gorevAtama)
            ? gorevAtama
            : {},
        );
      } else {
        console.error(
          "Görev atama bilgisi yüklenemedi:",
          gorevAtamaResult.reason,
        );
      }
    };

    fetchAdditionalData();

    return () => {
      isMounted = false;
    };
  }, [targetId]);

  if (!data) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "#6B7280",
        }}
      >
        Veri yükleniyor...
      </div>
    );
  }

  /*
   * Ana CV verileri
   */
  const cv = data;
  const rawData = cv.originalData || {};

  const personal = cv.personal || {};
  const jobDetails = cv.jobDetails || {};

  const experience = Array.isArray(cv.experience) ? cv.experience : [];

  const education = Array.isArray(cv.education) ? cv.education : [];

  const languages = Array.isArray(cv.languages) ? cv.languages : [];

  const computer = Array.isArray(cv.computer) ? cv.computer : [];

  const certificates = Array.isArray(cv.certificates) ? cv.certificates : [];

  const references = Array.isArray(cv.references) ? cv.references : [];

  const otherInfo = cv.otherInfo || {};

  /*
   * Servisten görev atama geldiyse onu kullanır.
   * Servis sonucu yoksa CV içindeki mevcut veriye döner.
   */
  const gorevAtama =
    Object.keys(fetchedGorevAtama).length > 0
      ? fetchedGorevAtama
      : cv.gorevAtama ||
        cv.GorevAtama ||
        rawData.gorevAtama ||
        rawData.GorevAtama ||
        {};

  /*
   * Servisten referans araştırmaları geldiyse onları kullanır.
   * Gelmediyse mevcut CV verisine döner.
   */
  const referansArastirmalari =
    fetchedReferanslar.length > 0
      ? fetchedReferanslar
      : cv.referansArastirmalari ||
        cv.ReferansArastirmalari ||
        rawData.referansArastirmalari ||
        rawData.ReferansArastirmalari ||
        [];

  const rolesDisplay =
    cleanAndJoinLabels(jobDetails.departmanPozisyonlari, " / ") || "-";

  const photoUrl = getPhotoUrl(personal.foto);

  return (
    <div
      id="cv-to-print"
      style={{
        width: "100%",
        maxWidth: "210mm",
        margin: "0 auto",
        padding: "50px 40px",
        boxSizing: "border-box",
        backgroundColor: "#FFFFFF",
        color: "#1F2937",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        lineHeight: "1.5",
        wordWrap: "break-word",
        overflowWrap: "break-word",
      }}
    >
      {/* CV BAŞLIK ALANI */}
      <table
        style={{
          width: "100%",
          marginBottom: "30px",
          borderCollapse: "collapse",
          borderBottom: "3px solid #111827",
          breakInside: "avoid",
          pageBreakInside: "avoid",
        }}
      >
        <tbody>
          <tr>
            {/* İsim ve iletişim bilgileri */}
            <td
              style={{
                verticalAlign: "top",
                paddingBottom: "30px",
              }}
            >
              <h1
                style={{
                  margin: "0 0 8px 0",
                  color: "#111827",
                  fontSize: "2.5rem",
                  fontWeight: "800",
                  lineHeight: "1.1",
                  wordBreak: "break-word",
                }}
              >
                {[personal.ad, personal.soyad].filter(Boolean).join(" ") ||
                  "Aday Bilgisi"}
              </h1>

              <p
                style={{
                  margin: "0 0 24px 0",
                  color: "#4B5563",
                  fontSize: "1.25rem",
                  fontWeight: "500",
                  lineHeight: "1.35",
                }}
              >
                {rolesDisplay}
              </p>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <tbody>
                  {/* Telefon */}
                  <tr>
                    <td
                      style={{
                        width: "24px",
                        paddingBottom: "8px",
                        verticalAlign: "middle",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faPhone}
                        style={{
                          width: "14px",
                          color: "#6B7280",
                        }}
                      />
                    </td>

                    <td
                      style={{
                        paddingBottom: "8px",
                        color: "#374151",
                        fontSize: "0.925rem",
                        wordBreak: "break-word",
                      }}
                    >
                      {personal.telefon || "-"}

                      {personal.whatsapp && (
                        <span
                          style={{
                            marginLeft: "8px",
                            color: "#9CA3AF",
                          }}
                        >
                          • WA: {personal.whatsapp}
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* E-posta */}
                  <tr>
                    <td
                      style={{
                        width: "24px",
                        paddingBottom: "8px",
                        verticalAlign: "middle",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        style={{
                          width: "14px",
                          color: "#6B7280",
                        }}
                      />
                    </td>

                    <td
                      style={{
                        paddingBottom: "8px",
                        color: "#374151",
                        fontSize: "0.925rem",
                        wordBreak: "break-word",
                      }}
                    >
                      {personal.eposta || "-"}
                    </td>
                  </tr>

                  {/* Adres */}
                  <tr>
                    <td
                      style={{
                        width: "24px",
                        paddingTop: "2px",
                        verticalAlign: "top",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        style={{
                          width: "14px",
                          color: "#6B7280",
                        }}
                      />
                    </td>

                    <td
                      style={{
                        color: "#374151",
                        fontSize: "0.925rem",
                        lineHeight: "1.4",
                        wordBreak: "break-word",
                      }}
                    >
                      {personal.adres || "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>

            {/* Profil fotoğrafı */}
            <td
              style={{
                width: "160px",
                paddingBottom: "30px",
                verticalAlign: "top",
                textAlign: "right",
              }}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={`${personal.ad || ""} ${personal.soyad || ""} profil`}
                  crossOrigin="anonymous"
                  style={{
                    display: "inline-block",
                    width: "140px",
                    height: "160px",
                    objectFit: "cover",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
              ) : (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "140px",
                    height: "160px",
                    marginLeft: "auto",
                    backgroundColor: "#F3F4F6",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faUser}
                    style={{
                      width: "64px",
                      height: "64px",
                      color: "#D1D5DB",
                    }}
                  />
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ADAYIN DOLDURDUĞU CV BÖLÜMLERİ */}
      <CVMainSections
        personal={personal}
        education={education}
        certificates={certificates}
        computer={computer}
        languages={languages}
        experience={experience}
        references={references}
        otherInfo={otherInfo}
        jobDetails={jobDetails}
        cleanAndJoinLabels={cleanAndJoinLabels}
      />

      {/* KURUM İÇİ İK VE ONAY BÖLÜMLERİ */}
      <CVInternalSections
        gorevAtama={gorevAtama}
        referansArastirmalari={
          Array.isArray(referansArastirmalari) ? referansArastirmalari : []
        }
      />
    </div>
  );
}
