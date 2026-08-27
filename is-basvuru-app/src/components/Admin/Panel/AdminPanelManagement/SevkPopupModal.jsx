import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faFileLines,
  faCheckCircle,
  faArrowRight,
  faSpinner,
  faBuilding,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { basvuruService } from "../../../../services/basvuruService";
import { tanimlamalarService } from "../../../../services/tanimlamalarService";

export default function SevkPopupModal({ state, setState, onSuccess, auth }) {
  const rawSube = auth?.subeId || auth?.SubeId;

  const allowedSubeIds = rawSube
    ? String(rawSube)
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n))
    : [];

  const isSingleBranch = allowedSubeIds.length === 1;

  const [activeSubeId, setActiveSubeId] = useState("");
  const [subeList, setSubeList] = useState([]);

  useEffect(() => {
    if (state.isOpen) {
      if (isSingleBranch) {
        setActiveSubeId(allowedSubeIds[0]);
      } else {
        setActiveSubeId("");
        tanimlamalarService
          .getSubeler()
          .then((res) => {
            const allSubeler = res.data || [];
            const filteredSubeler =
              allowedSubeIds.length > 0
                ? allSubeler.filter((s) =>
                    allowedSubeIds.includes(s.id || s.Id),
                  )
                : allSubeler;

            setSubeList(filteredSubeler);
          })
          .catch(console.error);
      }
    }
  }, [state.isOpen]);

  if (!state.isOpen || !state.row) return null;

  const { row, selectedIds, departmanlar, subeAlanlari, isProcessing } = state;

  const filteredDepartmanlar = departmanlar.filter((dep) => {
    if (!activeSubeId) return false;
    const depSubeAlanId = Number(dep.subeAlanId || dep.SubeAlanId);
    const matchedAlan = subeAlanlari?.find(
      (sa) => Number(sa.id || sa.Id) === depSubeAlanId,
    );
    const depGercekSubeId = matchedAlan
      ? Number(matchedAlan.subeId || matchedAlan.SubeId)
      : 0;

    return depGercekSubeId === activeSubeId;
  });

  const handleClose = () => {
    setState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCheckbox = (depId, isChecked) => {
    setState((prev) => {
      const newIds = isChecked
        ? [...prev.selectedIds, depId]
        : prev.selectedIds.filter((id) => id !== depId);
      return { ...prev, selectedIds: newIds };
    });
  };

  const handleConfirm = async () => {
    if (selectedIds.length === 0) {
      toast.warn("Lütfen sevk edilecek en az bir departman seçin.");
      return;
    }

    setState((prev) => ({ ...prev, isProcessing: true }));

    try {
      await basvuruService.sevkEt({
        masterBasvuruId: row.id,
        departmanIds: selectedIds,
      });
      toast.success("Aday başarıyla seçili departmanlara sevk edildi.");
      handleClose();
      onSuccess();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Sevk işlemi başarısız oldu.",
      );
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80  animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
          <div>
            <h3 className="text-white font-black text-lg uppercase tracking-tight">
              Departman Sevk İşlemi
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">
              {row.ad} {row.soyad} Adlı Aday İçin Seçim Yapınız
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="p-4 bg-sky-900/10 border border-sky-500/20 rounded-xl shadow-inner">
            <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faFileLines} /> Adayın Formda Seçtiği
              Departmanlar
            </p>
            <div className="flex flex-wrap gap-2">
              {row.departments?.length > 0 ? (
                row.departments.map((d, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-sky-500/10 text-sky-300 rounded-md text-[10px] font-bold border border-sky-500/20 shadow-sm"
                  >
                    {d}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500 italic">
                  Tercih bulunamadı.
                </span>
              )}
            </div>
          </div>

          <div className="bg-gray-800/30 p-5 rounded-xl border border-gray-800 shadow-sm">
            {!isSingleBranch && (
              <div className="mb-6">
                <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2 pl-1">
                  <FontAwesomeIcon icon={faBuilding} /> İşlem Yapılacak Şube
                </label>

                <div className="relative group">
                  <select
                    value={activeSubeId}
                    onChange={(e) => {
                      setActiveSubeId(Number(e.target.value));
                      setState((prev) => ({ ...prev, selectedIds: [] }));
                    }}
                    className="w-full appearance-none bg-gray-900/80 border-2 border-gray-700 hover:border-amber-500/50 rounded-xl pl-4 pr-10 py-3.5 text-xs font-bold text-gray-200 outline-none focus:border-amber-500 focus:bg-gray-900 focus:ring-4 focus:ring-amber-500/10 transition-all cursor-pointer shadow-inner"
                  >
                    <option value="" className="text-gray-500 bg-gray-900">
                      -- Lütfen Önce Şube Seçiniz --
                    </option>
                    {subeList.map((s) => (
                      <option
                        key={s.id || s.Id}
                        value={s.id || s.Id}
                        className="bg-gray-800 text-white font-bold py-2"
                      >
                        {s.ad || s.subeAdi || s.SubeAdi || s.name}
                      </option>
                    ))}
                  </select>

                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500 group-hover:text-amber-400 transition-colors">
                    <FontAwesomeIcon icon={faChevronDown} size="sm" />
                  </div>
                </div>
              </div>
            )}

            {activeSubeId ? (
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-1">
                  Seçili Şubedeki Departmanlar
                </p>
                {filteredDepartmanlar.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredDepartmanlar.map((dep) => {
                      const depId = Number(dep.id || dep.Id);
                      let depName =
                        dep.ad ||
                        dep.departmanAdi ||
                        dep.DepartmanAdi ||
                        dep.masterDepartman?.masterDepartmanAdi ||
                        "Departman";

                      const depSubeAlanId = Number(
                        dep.subeAlanId || dep.SubeAlanId,
                      );
                      const matchedAlan = subeAlanlari?.find(
                        (sa) => Number(sa.id || sa.Id) === depSubeAlanId,
                      );

                      if (matchedAlan) {
                        const alanAdi =
                          matchedAlan.ad ||
                          matchedAlan.alanAdi ||
                          matchedAlan.AlanAdi ||
                          matchedAlan.masterAlan?.masterAlanAdi ||
                          matchedAlan.MasterAlan?.MasterAlanAdi;
                        if (alanAdi && alanAdi.toUpperCase() !== "GENEL") {
                          depName = `${depName} - ${alanAdi}`;
                        }
                      }

                      const isChecked = selectedIds.includes(depId);

                      return (
                        <label
                          key={depId}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all shadow-sm ${isChecked ? "bg-emerald-500/10 border-emerald-500/40" : "bg-gray-900/50 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600"}`}
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? "bg-emerald-500 border-emerald-500" : "bg-gray-800 border-gray-600"}`}
                          >
                            {isChecked && (
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="text-white text-[10px]"
                              />
                            )}
                          </div>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={isChecked}
                            onChange={(e) =>
                              handleCheckbox(depId, e.target.checked)
                            }
                          />
                          <span
                            className={`text-[11px] font-bold uppercase truncate ${isChecked ? "text-emerald-400" : "text-gray-300"}`}
                            title={depName}
                          >
                            {depName}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 italic text-center">
                    Bu şubeye ait tanımlı bir departman bulunamadı.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-6 text-center border-2 border-dashed border-gray-700/50 rounded-xl bg-gray-900/30">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  Departmanları görmek için yukarıdan şube seçmelisiniz.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-800 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
          >
            İptal Et
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing || selectedIds.length === 0 || !activeSubeId}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faArrowRight} />
            )}
            Seçili Departmanlara Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
