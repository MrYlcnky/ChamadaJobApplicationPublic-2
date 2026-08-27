import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faCheckCircle,
  faArrowRight,
  faBan,
  faRotateLeft,
  faXmark,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";

export default function DecisionArea({
  note,
  setNote,
  canAction,
  isProcessing,
  currentStageId,
  statusId,
  onProcess,
  isIKGroup,
  isSuperAdmin: isSuperAdminProp,
  tamamenReddedildiMi = false,
  hasUserAction,
  auth,
}) {
  const stageId = Number(currentStageId);
  const status = Number(statusId);
  const roleId = Number(auth?.rolId || auth?.roleId);

  const isApproved = status === 3;
  const isRejected = status === 4;
  const isRevisionPending = status === 5;

  const isSuperAdmin = Boolean(isSuperAdminProp) || roleId === 1;

  const isIkRole = Boolean(isIKGroup) || [1, 2, 3, 4].includes(roleId);

  const canHandleCompletelyRejected = Boolean(tamamenReddedildiMi) && isIkRole;

  // Süper Admin ise canAction true kabul edilsin
  const effectiveCanAction = canAction || isSuperAdmin;

  const isNoteValid = note.trim().length >= 13;

  /*
  Revize kuralları:

  İK:
  - Aşama 2/3 ise revize açabilir -> dönüş 1
  - Aşama 4/5 ise revize açabilir -> dönüş 3
  - Kendi aşamasında red verdiyse -> bulunduğu aşamaya dönüş

  Departman Müdürü:
  - Kendi aşamasında yani aşama 2'de revize açabilir
  - Aşama 3/4/5'e ilerlemiş ve daha önce işlem yaptıysa revize açabilir
  - Kendi aşamasında red verdiyse revize açabilir

  GM:
  - Aşama 5'e geçmişse ve daha önce işlem yaptıysa revize açabilir
  - Kendi aşamasında red verdiyse revize açabilir

  Mali İşler:
  - Kendi aşamasında revize açabilir
  - Kendi aşamasında red verdiyse revize açabilir
*/

  const canIkRequestRevision =
    !isRevisionPending &&
    isIkRole &&
    ([2, 3, 4, 5].includes(stageId) || isRejected || hasUserAction);

  const canDepartmentRequestRevision =
    !isRevisionPending &&
    roleId === 6 &&
    hasUserAction &&
    // Departman onay verdikten sonra süreç ileri aşamalara geçtiyse
    ([3, 4, 5].includes(stageId) ||
      // Departman red verdiyse
      isRejected);

  const canGmRequestRevision =
    !isRevisionPending &&
    roleId === 5 &&
    // GM onayladıktan sonra süreç Mali İşler'e geçtiyse
    ((stageId === 5 && hasUserAction) ||
      // GM kendi aşamasında red verdiyse
      (isRejected && stageId === 4 && hasUserAction));

  const canFinanceRequestRevision =
    !isRevisionPending &&
    roleId === 7 &&
    hasUserAction &&
    // Mali işler onay verdiyse süreç tamamlanmış olur
    (isApproved ||
      // Mali işler red verdiyse
      isRejected);

  const canRequestRevision =
    canIkRequestRevision ||
    canDepartmentRequestRevision ||
    canGmRequestRevision ||
    canFinanceRequestRevision;

  // Onayla/Reddet butonları görünürken Revize Talebi de hangi durumlarda görünsün?
  const shouldShowRevisionWithDecisionButtons =
    canRequestRevision &&
    effectiveCanAction &&
    // İK/Admin kritik aşamalarda karar butonlarıyla beraber revize görebilsin
    isIkRole &&
    ([2, 3, 4, 5].includes(stageId) || isRejected);

  // Revize bekleyen durumda revizeyi onaylama/reddetme yetkisi
  const canDecideRevision = isIkRole || isSuperAdmin;

  const getStatusMessage = () => {
    if (isApproved) return "GENEL SÜREÇ TAMAMLANDI (ONAYLANDI)";
    if (isRejected) return "GENEL SÜREÇ TAMAMLANDI (REDDEDİLDİ)";
    if (hasUserAction && !isSuperAdmin) return "KARARINIZ SİSTEME İŞLENDİ";

    if (isSuperAdmin) {
      return "SÜREÇ BEKLEMEDE (SÜPER ADMİN YETKİSİ İLE MÜDAHALE EDEBİLİRSİNİZ)";
    }

    return "SIRA SİZDE DEĞİL VEYA İŞLEM YETKİNİZ YOK";
  };
  // Sevk butonu mu yoksa Onay butonu mu olduğunu anlıyoruz
  const isSevkAction = stageId === 1;
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-2.5 bg-gray-800/30 border-b border-gray-800 flex items-center">
        <div className="w-1 h-3 bg-sky-50 rounded-full mr-2"></div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Karar & Açıklama
        </span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 group">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                tamamenReddedildiMi
                  ? isIkRole
                    ? "Revize talebinin nedenini yazınız (En az 13 karakter)..."
                    : "Bu başvuru tamamen reddedilmiştir."
                  : isRevisionPending
                    ? "Revize talebi hakkında yönetici kararı..."
                    : "İşlem notunuzu buraya yazınız (En az 13 karakter)..."
              }
              disabled={
                isProcessing ||
                (tamamenReddedildiMi && !canHandleCompletelyRejected) ||
                (!tamamenReddedildiMi &&
                  !effectiveCanAction &&
                  !isRevisionPending &&
                  !canRequestRevision)
              }
              className={`w-full min-h-40 p-4 bg-gray-800/50 border rounded-xl text-sm text-gray-200 placeholder:text-gray-600 outline-none transition-all resize-none focus:bg-gray-800 ${
                note.trim().length > 0 && !isNoteValid
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-gray-700 focus:border-sky-500"
              }`}
            />

            {(!tamamenReddedildiMi || isIkRole) && (
              <div className="mt-2 flex items-center justify-end gap-2">
                {!isNoteValid && note.trim().length > 0 && (
                  <span className="text-[9px] text-red-400 font-bold flex items-center gap-1 animate-pulse">
                    <FontAwesomeIcon icon={faCircleExclamation} />
                    EN AZ 13 KARAKTER GİRMELİSİNİZ
                  </span>
                )}

                <div
                  className={`text-[9px] font-black px-2 py-1 rounded-md border transition-colors ${
                    isNoteValid
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-gray-900 text-gray-500 border-gray-700"
                  }`}
                >
                  {note.trim().length} / 13 KARAKTER
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 flex flex-col justify-center gap-3">
            {tamamenReddedildiMi ? (
              isIkRole ? (
                <>
                  <div className="p-4 border border-red-500/30 rounded-xl bg-red-500/10">
                    <p className="text-[10px] font-black text-red-400 uppercase text-center">
                      Başvuru tamamen reddedilmiş ve süreç kilitlenmiştir
                    </p>

                    <p className="text-[10px] text-gray-400 text-center mt-2">
                      Revize onaylandıktan sonra başvurunun hangi aşamaya
                      döneceğini seçiniz.
                    </p>
                  </div>

                  <button
                    onClick={() => onProcess("revision_continue_current")}
                    disabled={!isNoteValid || isProcessing}
                    className={`w-full py-4 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-3 transition-all ${
                      isNoteValid && !isProcessing
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                        : "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700"
                    }`}
                  >
                    {isProcessing ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faRotateLeft} />
                        Kaldığı Aşamaya Dönüş Revizesi
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onProcess("revision_return_first_stage")}
                    disabled={!isNoteValid || isProcessing}
                    className={`w-full py-4 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-3 transition-all border ${
                      isNoteValid && !isProcessing
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-600 hover:text-white"
                        : "bg-gray-800 text-gray-600 cursor-not-allowed border-gray-700"
                    }`}
                  >
                    {isProcessing ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faRotateLeft} />
                        İlk Aşamaya Dönüş Revizesi
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="p-4 border-2 border-dashed border-red-800/50 rounded-xl text-center bg-red-900/10">
                  <p className="text-[10px] font-black text-red-400 uppercase">
                    Başvuru tamamen reddedilmiştir
                  </p>

                  <p className="text-[9px] text-gray-500 mt-2 uppercase">
                    Yalnızca İK grubu başvuruyu revize sürecine açabilir
                  </p>
                </div>
              )
            ) : isRevisionPending ? (
              canDecideRevision ? (
                <>
                  <button
                    onClick={() => onProcess("approve_revision")}
                    disabled={!isNoteValid || isProcessing}
                    className={`w-full py-4 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-3 transition-all shadow-lg ${
                      isNoteValid && !isProcessing
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                        : "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700"
                    }`}
                  >
                    <FontAwesomeIcon icon={faRotateLeft} />
                    Revizeyi Onayla
                  </button>

                  <button
                    onClick={() => onProcess("reject_revision")}
                    disabled={!isNoteValid || isProcessing}
                    className={`w-full py-4 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-3 transition-all border ${
                      isNoteValid && !isProcessing
                        ? "border-red-500/30 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white"
                        : "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700"
                    }`}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                    Talebi Reddet
                  </button>
                </>
              ) : (
                <div className="p-4 border-2 border-dashed border-amber-800/50 rounded-xl text-center bg-amber-900/10">
                  <p className="text-[10px] font-bold text-amber-500 uppercase">
                    Revize Onayı Bekleniyor
                  </p>
                </div>
              )
            ) : effectiveCanAction ? (
              <>
                <button
                  onClick={() =>
                    onProcess(isSevkAction ? "sevk_et" : "approve")
                  }
                  disabled={!isNoteValid || isProcessing}
                  className={`w-full py-4 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-3 transition-all shadow-lg ${
                    isNoteValid && !isProcessing
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700"
                  }`}
                >
                  {isProcessing ? (
                    <FontAwesomeIcon icon={faSpinner} spin size="lg" />
                  ) : (
                    <>
                      <FontAwesomeIcon
                        icon={isSevkAction ? faArrowRight : faCheckCircle}
                        size="lg"
                      />

                      {isSevkAction
                        ? "Departmana Sevk Et"
                        : "Onayla ve İlerlet"}
                    </>
                  )}
                </button>

                <button
                  onClick={() => onProcess("reject")}
                  disabled={!isNoteValid || isProcessing}
                  className={`w-full py-4 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-3 transition-all border ${
                    isNoteValid && !isProcessing
                      ? "bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border-red-500/30"
                      : "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700"
                  }`}
                >
                  {isProcessing ? (
                    <FontAwesomeIcon icon={faSpinner} spin size="lg" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faBan} size="lg" />
                      Başvuruyu Reddet
                    </>
                  )}
                </button>

                {shouldShowRevisionWithDecisionButtons && (
                  <button
                    onClick={() => onProcess("request_revision")}
                    disabled={!isNoteValid || isProcessing}
                    className={`w-full py-3 rounded-xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${
                      isNoteValid && !isProcessing
                        ? "bg-amber-600/20 border border-amber-600/30 text-amber-500 hover:bg-amber-600 hover:text-white"
                        : "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700"
                    }`}
                  >
                    <FontAwesomeIcon icon={faRotateLeft} />
                    Revize Talebi Gönder
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="p-4 border-2 border-dashed border-gray-800 rounded-xl text-center bg-gray-800/20">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">
                    {getStatusMessage()}
                  </p>
                </div>

                {canRequestRevision && (
                  <button
                    onClick={() => onProcess("request_revision")}
                    disabled={!isNoteValid || isProcessing}
                    className={`w-full py-3 rounded-xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${
                      isNoteValid && !isProcessing
                        ? "bg-amber-600/20 border border-amber-600/30 text-amber-500 hover:bg-amber-600 hover:text-white"
                        : "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700"
                    }`}
                  >
                    <FontAwesomeIcon icon={faRotateLeft} />
                    Revize Talebi Gönder
                  </button>
                )}
              </div>
            )}

            {isIkRole && !tamamenReddedildiMi && !isRevisionPending && (
              <button
                onClick={() => onProcess("completely_reject")}
                disabled={!isNoteValid || isProcessing}
                className={`w-full py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 transition-all border ${
                  isNoteValid && !isProcessing
                    ? "bg-red-950/50 border-red-600/40 text-red-400 hover:bg-red-700 hover:text-white"
                    : "bg-gray-800 text-gray-600 cursor-not-allowed border-gray-700"
                }`}
              >
                {isProcessing ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faBan} />
                    Tamamen Reddet ve Red Maili Gönder
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
