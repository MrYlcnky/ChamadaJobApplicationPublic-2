import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "../../../../utils/dateFormatter";
import { StatusBadge, TruncatedList } from "./ApplicationTable";
import {
  TableActionsCell,
  CurrentStageBadge,
  JobStartDateCell,
} from "./TableActions";
import { basvuruService } from "../../../../services/basvuruService";

export default function useAdminPanelColumns({
  auth,
  isIKGroup,
  handleSendToDepartment,
  setLightboxImage,
  setSelectedCvData,
  setShowCvModal,
  setActiveRow,
  setOpenModal,
  mapDtoToCvFormat,
}) {
  const [loadingAction, setLoadingAction] = useState(null);
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "NO / ID",
        size: 60,
        enableSorting: true,
        sortDescFirst: true,
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <div className="font-black text-gray-900 text-[11px] leading-none">
              #{row.original.id}
            </div>
            <div className="text-[9px] font-mono font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 flex items-center gap-1">
              <span className="opacity-50">P-ID:</span>
              <span>{row.original.personelId}</span>
            </div>
          </div>
        ),
      },
      {
        id: "profile",
        header: "PROFİL",
        size: 70,
        enableSorting: false, // Fotoğrafa göre sıralama olmaz
        cell: ({ row }) => {
          const imgUrl = row.original.personal?.foto;
          return (
            <div className="flex justify-center">
              <div
                className={`w-9 h-9 rounded-full bg-white border border-gray-200 overflow-hidden shadow-sm flex items-center justify-center relative ${
                  imgUrl
                    ? "cursor-zoom-in hover:ring-2 hover:ring-blue-300 transition-all"
                    : ""
                }`}
                onClick={() => imgUrl && setLightboxImage(imgUrl)}
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    // 🎯 FOTOĞRAF KALİTESİ BURADA ARTIYOR
                    className="w-full h-full object-cover"
                    style={{
                      // Tarayıcılara resmi netleştirmelerini söyler (Anti-Blur)
                      imageRendering: "-webkit-optimize-contrast",
                      transform: "translateZ(0)", // Donanım hızlandırmayı açar (Daha net render)
                    }}
                    crossOrigin="anonymous"
                    alt={`${row.original.ad || ""} ${row.original.soyad || ""}`}
                  />
                ) : (
                  <div className="text-gray-300 bg-gray-50 flex w-full h-full items-center justify-center">
                    <FontAwesomeIcon icon={faUser} size="sm" />
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "ad",
        header: "AD",
        enableSorting: true,
        sortDescFirst: true,
        cell: (i) => (
          <div className="font-bold text-gray-700 text-[11px] uppercase">
            {i.getValue()}
          </div>
        ),
      },
      {
        accessorKey: "soyad",
        header: "SOYAD",
        enableSorting: true,
        sortDescFirst: true,
        cell: (i) => (
          <div className="font-bold text-gray-700 text-[11px] uppercase">
            {i.getValue()}
          </div>
        ),
      },
      {
        accessorKey: "branches",
        header: "ŞUBELER",
        enableSorting: false,
        cell: (i) => (
          <TruncatedList
            items={i.getValue()}
            colorClass="bg-blue-50 text-blue-700 border-blue-100"
          />
        ),
      },
      {
        accessorKey: "areas",
        header: "ALANLAR",
        enableSorting: false,
        cell: (i) => (
          <TruncatedList
            items={i.getValue()}
            colorClass="bg-indigo-50 text-indigo-700 border-indigo-100"
          />
        ),
      },
      {
        accessorKey: "departments",
        header: "DEPARTMANLAR",
        enableSorting: false,
        cell: (i) => (
          <TruncatedList
            items={i.getValue()}
            colorClass="bg-purple-50 text-purple-700 border-purple-100"
          />
        ),
      },
      {
        accessorKey: "roles",
        header: "POZİSYONLAR",
        enableSorting: false,
        cell: (i) => (
          <TruncatedList
            items={i.getValue()}
            colorClass="bg-amber-50 text-amber-700 border-amber-100"
          />
        ),
      },
      {
        accessorKey: "date",
        header: "TARİH",
        enableSorting: true,
        sortDescFirst: true,
        cell: (i) => (
          <div className="text-[10px] text-gray-500 font-bold">
            {formatDate(i.getValue())}
          </div>
        ),
      },
      {
        id: "startdate",
        accessorKey: "iseBaslamaTarihi",
        header: "İŞ BAŞLAMA TARİHİ",
        enableSorting: true,
        sortDescFirst: true,
        cell: ({ row }) => <JobStartDateCell row={row} />,
      },
      {
        id: "status",
        header: "DURUM",
        enableSorting: false,
        size: 150,
        minSize: 140,
        maxSize: 170,
        cell: ({ row }) => {
          const tamamenReddedildiMi = Boolean(
            row.original.tamamenReddedildiMi ?? false,
          );

          return (
            <div className="w-full flex justify-center px-1">
              <div className="max-w-full whitespace-nowrap text-[9px]">
                <StatusBadge
                  status={
                    tamamenReddedildiMi
                      ? "Tamamen Reddedildi"
                      : row.original.status
                  }
                  statusId={tamamenReddedildiMi ? 4 : row.original.statusId}
                />
              </div>
            </div>
          );
        },
      },
      {
        id: "stage",
        header: "AŞAMA",
        accessorKey: "approvalStage",
        enableSorting: true,
        cell: ({ row }) => {
          const tamamenReddedildiMi = Boolean(
            row.original.tamamenReddedildiMi ?? false,
          );
          return (
            <div className="flex justify-center">
              <CurrentStageBadge
                stage={
                  tamamenReddedildiMi
                    ? "Reddedildi"
                    : row.original.approvalStage
                }
                statusId={tamamenReddedildiMi ? 4 : row.original.statusId}
                row={row}
                auth={auth}
                isIKGroup={isIKGroup}
              />
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "İŞLEMLER",
        enableSorting: false,
        cell: ({ row }) => (
          <TableActionsCell
            row={row}
            isIKGroup={isIKGroup}
            auth={auth}
            loadingAction={loadingAction}
            onViewCv={async (data) => {
              const loadingKey = `cv-${data.id}`;

              if (loadingAction) return;

              try {
                setLoadingAction(loadingKey);

                const response = await basvuruService.getById(data.id);

                const detailData = response?.data || response?.Data || response;

                setSelectedCvData(mapDtoToCvFormat(detailData));

                setShowCvModal(true);
              } catch (error) {
                console.error("CV bilgileri alınamadı:", error);
              } finally {
                setLoadingAction(null);
              }
            }}
            onSendToDept={handleSendToDepartment}
            onOpenDetail={async (data) => {
              const loadingKey = `detail-${data.id}`;

              if (loadingAction) return;

              try {
                setLoadingAction(loadingKey);

                const response = await basvuruService.getById(data.id);

                const detailData = response?.data || response?.Data || response;

                setActiveRow({
                  ...data,
                  originalData: detailData,
                });

                setOpenModal(true);
              } catch (error) {
                console.error("Başvuru detayı alınamadı:", error);
              } finally {
                setLoadingAction(null);
              }
            }}
          />
        ),
      },
    ],
    [
      isIKGroup,
      handleSendToDepartment,
      auth,
      loadingAction,
      setLightboxImage,
      setSelectedCvData,
      setShowCvModal,
      setActiveRow,
      setOpenModal,
      mapDtoToCvFormat,
    ],
  );

  return columns;
}
