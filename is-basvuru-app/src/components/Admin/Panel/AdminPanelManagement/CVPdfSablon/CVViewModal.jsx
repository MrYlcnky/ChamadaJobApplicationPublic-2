import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faTimes,
  faSpinner,
  faFileLines,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import html2pdf from "html2pdf.js";

import CVTemplate from "./CVTemplate/CVTemplate";
import PersonelTalepOnayFormuTemplate from "./CVTemplate/PersonelTalepOnayFormuTemplate";

const TEMPLATE_TYPES = {
  CV_FORM: "cv-form",
  PERSONEL_TALEP_ONAY_FORMU: "personel-talep-onay-formu",
};

export default function CVViewModal({ applicationData, onClose }) {
  const templateRef = useRef(null);

  const [isDownloading, setIsDownloading] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState(
    TEMPLATE_TYPES.CV_FORM,
  );

  const isCvForm = selectedTemplate === TEMPLATE_TYPES.CV_FORM;

  const getPdfFileName = () => {
    const ad =
      applicationData?.personal?.ad || applicationData?.personel?.ad || "Aday";

    const soyad =
      applicationData?.personal?.soyad ||
      applicationData?.personel?.soyad ||
      "";

    const adSoyad = `${ad}_${soyad}`.trim().replace(/\s+/g, "_");

    if (isCvForm) {
      return `CV_Form_${adSoyad}.pdf`;
    }

    return `Personel_Talep_Onay_Formu_${adSoyad}.pdf`;
  };

  const handleDownload = async () => {
    if (!templateRef.current) {
      return;
    }

    setIsDownloading(true);

    try {
      const options = {
        margin: [10, 0, 10, 0],
        filename: getPdfFileName(),

        image: {
          type: "jpeg",
          quality: 1,
        },

        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollY: 0,
          backgroundColor: "#FFFFFF",
        },

        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },

        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
        },
      };

      await html2pdf().set(options).from(templateRef.current).save();
    } catch (error) {
      console.error("PDF Hatası:", error);

      alert("PDF oluşturulurken bir sorun oluştu.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black/60 p-2 backdrop-blur-sm sm:p-4">
      <div className="flex h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:h-[90vh]">
        {/* HEADER */}
        <div className="shrink-0 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col items-center justify-between gap-3 px-3 py-3 sm:flex-row sm:px-6 sm:py-4">
            <h3 className="w-full text-center text-base font-bold text-gray-800 sm:w-auto sm:text-left sm:text-lg">
              Başvuru Önizleme
            </h3>

            <div className="flex w-full shrink-0 items-center justify-center gap-2 sm:w-auto sm:justify-end">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FontAwesomeIcon
                  icon={isDownloading ? faSpinner : faDownload}
                  className={isDownloading ? "animate-spin" : ""}
                />

                {isDownloading ? "PDF Hazırlanıyor..." : "PDF İndir"}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                aria-label="Kapat"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>

          {/* TABS */}
          <div className="flex overflow-x-auto px-3 sm:px-6">
            <button
              type="button"
              onClick={() => setSelectedTemplate(TEMPLATE_TYPES.CV_FORM)}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                isCvForm
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
              }`}
            >
              <FontAwesomeIcon icon={faFileLines} />
              CV Form
            </button>

            <button
              type="button"
              onClick={() =>
                setSelectedTemplate(TEMPLATE_TYPES.PERSONEL_TALEP_ONAY_FORMU)
              }
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                !isCvForm
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
              }`}
            >
              <FontAwesomeIcon icon={faClipboardCheck} />
              Personel Talep Onay Formu
            </button>
          </div>
        </div>

        {/* PDF ÖNİZLEME */}
        <div className="custom-scrollbar flex-1 overflow-auto bg-gray-100 p-2 sm:p-4 md:p-8">
          <div className="flex w-full min-w-max justify-center pb-8 sm:pb-0">
            <div
              className="mx-auto shrink-0 bg-white shadow-2xl ring-1 ring-gray-200"
              style={{
                width: "210mm",
                minHeight: "297mm",
                height: "auto",
              }}
            >
              <div ref={templateRef} className="h-full w-full">
                {isCvForm ? (
                  <CVTemplate data={applicationData} />
                ) : (
                  <PersonelTalepOnayFormuTemplate data={applicationData} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
