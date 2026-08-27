import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
  faRotate,
  faEye,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";

import {
  tarihFormatla,
  boyutFormatla,
  tetiklemeTipiMetni,
} from "../helpers/yedeklemeFormatters";

export default function YedeklemeGecmisi({ yedekler, loading, onDetayAc }) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="font-black text-gray-900">Yedekleme Geçmişi</h2>

        <p className="text-xs text-gray-500 mt-1">
          Manuel ve otomatik oluşturulan sistem yedekleri
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400">
          <FontAwesomeIcon icon={faRotate} className="animate-spin mr-2" />
          Yedekleme kayıtları yükleniyor...
        </div>
      ) : yedekler.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          Henüz yedekleme kaydı bulunmuyor.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-6 py-4">Tarih</th>

                <th className="px-6 py-4">Tür</th>

                <th className="px-6 py-4">Durum</th>

                <th className="px-6 py-4">ZIP</th>

                <th className="px-6 py-4">Drive</th>

                <th className="px-6 py-4">Mail</th>

                <th className="px-6 py-4">Başlatan</th>

                <th className="px-6 py-4 text-right">İşlem</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {yedekler.map((yedek) => (
                <tr key={yedek.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700">
                    {tarihFormatla(
                      yedek.tamamlanmaTarihi || yedek.baslamaTarihi,
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-600">
                      {tetiklemeTipiMetni(yedek.tetiklemeTipi)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <DurumBadge durum={yedek.durum} />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {boyutFormatla(yedek.zipBoyutuByte)}
                  </td>

                  <td className="px-6 py-4">
                    {yedek.driveYuklendiMi && yedek.driveLink ? (
                      <a
                        href={yedek.driveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold text-xs"
                      >
                        Drive
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {yedek.mailGonderildiMi ? (
                      <span className="text-emerald-600 font-bold text-xs">
                        Gönderildi
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">
                        Gönderilmedi
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {yedek.baslatanKullaniciAdi || "-"}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onDetayAc(yedek.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 px-3 py-2 text-xs font-bold transition"
                    >
                      <FontAwesomeIcon icon={faEye} />
                      Detay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DurumBadge({ durum }) {
  if (durum === 2) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-bold">
        <FontAwesomeIcon icon={faCircleCheck} />
        Başarılı
      </span>
    );
  }

  if (durum === 3) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 text-red-700 px-2.5 py-1 text-xs font-bold">
        <FontAwesomeIcon icon={faCircleXmark} />
        Başarısız
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 px-2.5 py-1 text-xs font-bold">
      <FontAwesomeIcon icon={faRotate} className="animate-spin" />
      Devam Ediyor
    </span>
  );
}
