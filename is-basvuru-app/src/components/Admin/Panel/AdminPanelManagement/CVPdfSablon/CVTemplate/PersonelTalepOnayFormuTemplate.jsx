import { useEffect, useMemo, useState } from "react";

import { referansArastirmasiService } from "../../../../../../services/referansArastirmasiService";
import { gorevAtamaService } from "../../../../../../services/gorevAtamaService";

import PersonelTalepUstBilgiler from "./PersonelTalepUstBilgiler";
import PersonelTalepReferanslar from "./PersonelTalepReferanslar";
import PersonelTalepOnayImzalar from "./PersonelTalepOnayImzalar";

/*
 * Başvuru verisinin içerisinden MasterBaşvuru ID değerini bulur.
 */
const findMasterBasvuruId = (data) => {
  if (!data) {
    return null;
  }

  return (
    data.id ||
    data.Id ||
    data.masterBasvuruId ||
    data.MasterBasvuruId ||
    data.originalData?.id ||
    data.originalData?.Id ||
    data.originalData?.masterBasvuruId ||
    data.originalData?.MasterBasvuruId ||
    data.notes?.[0]?.masterBasvuruId ||
    data.notes?.[0]?.MasterBasvuruId ||
    null
  );
};

/*
 * Personel fotoğrafının tam adresini oluşturur.
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

  const normalizedBaseUrl = apiBaseUrl.replace(/\/+$/, "");
  const normalizedPhoto = photo.replace(/^\/+/, "");

  return `${normalizedBaseUrl}/uploads/personel-fotograflari/${normalizedPhoto}`;
};

/*
 * Doğum tarihinden yaş hesaplar.
 */
const calculateAge = (birthDate) => {
  if (!birthDate) {
    return null;
  }

  const date = new Date(birthDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const today = new Date();

  let age = today.getFullYear() - date.getFullYear();

  const monthDifference = today.getMonth() - date.getMonth();

  const birthdayNotReached =
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < date.getDate());

  if (birthdayNotReached) {
    age -= 1;
  }

  return age >= 0 ? age : null;
};

/*
 * Servis cevabından liste verisini güvenli şekilde alır.
 */
const extractListData = (response) => {
  const responseData = response?.data;

  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData?.data)) {
    return responseData.data;
  }

  return [];
};

/*
 * Servis cevabından nesne verisini güvenli şekilde alır.
 */
const extractObjectData = (response) => {
  const responseData = response?.data;

  if (
    responseData?.data &&
    typeof responseData.data === "object" &&
    !Array.isArray(responseData.data)
  ) {
    return responseData.data;
  }

  if (
    responseData &&
    typeof responseData === "object" &&
    !Array.isArray(responseData) &&
    (responseData.id ||
      responseData.Id ||
      responseData.masterBasvuruId ||
      responseData.MasterBasvuruId)
  ) {
    return responseData;
  }

  return {};
};

export default function PersonelTalepOnayFormuTemplate({ data }) {
  const [fetchedReferanslar, setFetchedReferanslar] = useState([]);

  const [fetchedGorevAtama, setFetchedGorevAtama] = useState({});

  const targetId = useMemo(() => findMasterBasvuruId(data), [data]);

  /*
   * Görev atama ve referans araştırmalarını getirir.
   */
  useEffect(() => {
    let isMounted = true;

    setFetchedReferanslar([]);
    setFetchedGorevAtama({});

    if (!targetId) {
      return () => {
        isMounted = false;
      };
    }

    const fetchFormData = async () => {
      const [referansResult, gorevAtamaResult] = await Promise.allSettled([
        referansArastirmasiService.getByMasterBasvuruId(targetId),

        gorevAtamaService.getByMasterBasvuruId(targetId),
      ]);

      if (!isMounted) {
        return;
      }

      if (referansResult.status === "fulfilled") {
        setFetchedReferanslar(extractListData(referansResult.value));
      } else {
        console.error(
          "Personel talep formu referansları yüklenemedi:",
          referansResult.reason,
        );
      }

      if (gorevAtamaResult.status === "fulfilled") {
        setFetchedGorevAtama(extractObjectData(gorevAtamaResult.value));
      } else {
        console.error(
          "Personel talep formu görev atama bilgisi yüklenemedi:",
          gorevAtamaResult.reason,
        );
      }
    };

    fetchFormData();

    return () => {
      isMounted = false;
    };
  }, [targetId]);

  if (!data) {
    return (
      <div
        style={{
          minHeight: "297mm",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          boxSizing: "border-box",
          backgroundColor: "#FFFFFF",
          color: "#6B7280",
          fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        Form verileri yükleniyor...
      </div>
    );
  }

  const cv = data;
  const rawData = cv.originalData || {};

  const personal =
    cv.personal ||
    cv.personel ||
    rawData.personal ||
    rawData.personel ||
    rawData.Personel ||
    {};

  const otherInfo =
    cv.otherInfo ||
    cv.digerKisiselBilgiler ||
    rawData.otherInfo ||
    rawData.digerKisiselBilgiler ||
    rawData.DigerKisiselBilgiler ||
    {};

  const jobDetails =
    cv.jobDetails ||
    cv.isBasvuruDetay ||
    rawData.jobDetails ||
    rawData.isBasvuruDetay ||
    rawData.IsBasvuruDetay ||
    {};

  const languages = Array.isArray(cv.languages)
    ? cv.languages
    : Array.isArray(cv.yabanciDilBilgileri)
      ? cv.yabanciDilBilgileri
      : Array.isArray(rawData.languages)
        ? rawData.languages
        : Array.isArray(rawData.yabanciDilBilgileri)
          ? rawData.yabanciDilBilgileri
          : Array.isArray(rawData.YabanciDilBilgileri)
            ? rawData.YabanciDilBilgileri
            : [];

  const education = Array.isArray(cv.education)
    ? cv.education
    : Array.isArray(cv.egitimBilgileri)
      ? cv.egitimBilgileri
      : Array.isArray(rawData.education)
        ? rawData.education
        : Array.isArray(rawData.egitimBilgileri)
          ? rawData.egitimBilgileri
          : Array.isArray(rawData.EgitimBilgileri)
            ? rawData.EgitimBilgileri
            : [];

  /*
   * Öncelikle servisten gelen görev atama kullanılır.
   * Servis boşsa applicationData içindeki değer kullanılır.
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
   * Öncelikle servisten gelen referans araştırmaları kullanılır.
   */
  const fallbackReferanslar =
    cv.referansArastirmalari ||
    cv.ReferansArastirmalari ||
    rawData.referansArastirmalari ||
    rawData.ReferansArastirmalari ||
    [];

  const referansArastirmalari =
    fetchedReferanslar.length > 0
      ? fetchedReferanslar
      : Array.isArray(fallbackReferanslar)
        ? fallbackReferanslar
        : [];

  const birthDate = personal.dogumTarihi || personal.DogumTarihi || null;

  const photo =
    personal.foto ||
    personal.Foto ||
    personal.fotograf ||
    personal.Fotograf ||
    personal.fotoUrl ||
    personal.FotoUrl ||
    null;

  const age = calculateAge(birthDate);
  const photoUrl = getPhotoUrl(photo);

  return (
    <div
      id="personel-talep-onay-formu-to-print"
      style={{
        width: "100%",
        minHeight: "297mm",
        margin: "0 auto",
        padding: "16mm 13mm",
        boxSizing: "border-box",
        backgroundColor: "#FFFFFF",
        color: "#111827",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        lineHeight: "1.4",
        wordBreak: "break-word",
        overflowWrap: "break-word",
      }}
    >
      {/* ÜST PERSONEL VE GÖREV BİLGİLERİ */}
      <PersonelTalepUstBilgiler
        personal={personal}
        otherInfo={otherInfo}
        jobDetails={jobDetails}
        gorevAtama={gorevAtama}
        languages={languages}
        education={education}
        photoUrl={photoUrl}
        age={age}
      />

      {/* REFERANS SONUÇLARI */}
      <PersonelTalepReferanslar referansArastirmalari={referansArastirmalari} />

      {/* ONAY VE İMZALAR */}
      <PersonelTalepOnayImzalar />
    </div>
  );
}
