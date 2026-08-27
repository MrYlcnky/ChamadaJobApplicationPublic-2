import { useMemo, useEffect, useState } from "react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import tanimlamalarService from "../../../services/tanimlamalarService";
import {
  faEye,
  faBuilding,
  faLayerGroup,
  faBriefcase,
  faComputer,
  faHouseUser,
  faClapperboard,
} from "@fortawesome/free-solid-svg-icons";

// React-Select Stilleri
const customStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "43px",
    borderRadius: "0.5rem",
    backgroundColor: state.isDisabled ? "#f3f4f6" : "white",
    border: "1px solid #d1d5db",
    boxShadow: "none",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    "&:hover": { borderColor: "#000000" },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

// --- YARDIMCI FONKSİYONLAR ---

const safeGet = (item, ...keys) => {
  if (!item) return null;
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null) return item[key];
  }
  return null;
};

// 🎯 YENİ MUCİZE FONKSİYON: Aynı isimdeki seçenekleri silmez, ID'lerini birleştirir!
const bundleOptionsByLabel = (options) => {
  const map = new Map();
  options.forEach((opt) => {
    if (!opt.label) return;
    const label = opt.label.trim();
    if (!map.has(label)) {
      map.set(label, { label: label, ids: new Set([String(opt.value)]) });
    } else {
      map.get(label).ids.add(String(opt.value));
    }
  });
  return Array.from(map.values()).map((item) => ({
    label: item.label,
    value: Array.from(item.ids).join(","), // Örn: "36,72"
  }));
};
/*
// 🎯 GÜNCELLENEN HİDRASYON FONKSİYONU: Virgüllü ID'leri parçalayarak eşleştirir
const getValueObjects = (
  formValue,
  options,
  allRawData,
  labelKey = "Label",
) => {
  if (!formValue) return [];
  const valueArray = Array.isArray(formValue) ? formValue : [formValue];

  const hydrated = [];
  valueArray.forEach((item) => {
    const valStr = String(item.value || item);

    // Seçili değer virgüllü paketlenmiş listede var mı?
    let found = options.find((opt) => {
      const ids = String(opt.value).split(",");
      return opt.value === valStr || ids.includes(valStr);
    });

    if (found) {
      if (!hydrated.some((h) => h.value === found.value)) {
        hydrated.push(found);
      }
    } else if (allRawData) {
      const rawFound = allRawData.find(
        (d) => String(safeGet(d, "id", "Id")) === valStr,
      );
      if (rawFound) {
        hydrated.push({
          value: valStr,
          label: safeGet(rawFound, labelKey, labelKey.toLowerCase()),
        });
      }
    }
  });
  return hydrated;
};*/

const getValueObjects = (
  formValue,
  options,
  allRawData,
  labelKey = "Label",
) => {
  if (!formValue) return [];

  const valueArray = Array.isArray(formValue) ? formValue : [formValue];

  return valueArray
    .map((item) => {
      const valStr = String(item.value || item);

      const found = options.find((opt) => String(opt.value) === valStr);

      if (found) return found;

      if (allRawData) {
        const rawFound = allRawData.find(
          (d) => String(safeGet(d, "id", "Id")) === valStr,
        );

        if (rawFound) {
          return {
            value: valStr,
            label: safeGet(rawFound, labelKey, labelKey.toLowerCase()),
          };
        }
      }

      return null;
    })
    .filter(Boolean);
};

export default function JobApplicationDetails({ definitions }) {
  const { t } = useTranslation();
  const {
    control,
    setValue,
    register,
    formState: { errors },
  } = useFormContext();
  const portalTarget = typeof document !== "undefined" ? document.body : null;

  const [departmanPozisyonApi, setDepartmanPozisyonApi] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await tanimlamalarService.getDepartmanPozisyonlar();
        if (!alive) return;
        setDepartmanPozisyonApi(res?.data ?? []);
      } catch (e) {
        console.error("DepartmanPozisyon verisi yüklenirken hata:", e);
        setDepartmanPozisyonApi([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // --- API Verileri (Memoized) ---
  const apiSubeler = useMemo(() => definitions?.subeler ?? [], [definitions]);
  const apiSubeAlanlar = useMemo(
    () => definitions?.subeAlanlar ?? [],
    [definitions],
  );
  const apiDepartmanlar = useMemo(
    () => definitions?.departmanlar ?? [],
    [definitions],
  );
  const apiPozisyonlar = useMemo(
    () => departmanPozisyonApi ?? [],
    [departmanPozisyonApi],
  );
  const apiProgramlar = useMemo(
    () => definitions?.programlar ?? [],
    [definitions],
  );
  const apiOyunlar = useMemo(
    () => definitions?.kagitOyunlari ?? [],
    [definitions],
  );

  // --- Form Verileri (Watch) ---
  const rawSubeler = useWatch({ name: "jobDetails.subeler" });
  const subeler = useMemo(() => rawSubeler || [], [rawSubeler]);

  const rawAlanlar = useWatch({ name: "jobDetails.alanlar" });
  const alanlar = useMemo(() => rawAlanlar || [], [rawAlanlar]);

  const rawDepartmanlar = useWatch({ name: "jobDetails.departmanlar" });
  const departmanlar = useMemo(() => rawDepartmanlar || [], [rawDepartmanlar]);

  const rawProgramlar = useWatch({ name: "jobDetails.programlar" });
  const programlar = useMemo(() => rawProgramlar || [], [rawProgramlar]);

  const rawDepartmanPozisyonlari = useWatch({
    name: "jobDetails.departmanPozisyonlari",
  });
  const departmanPozisyonlari = useMemo(
    () => rawDepartmanPozisyonlari || [],
    [rawDepartmanPozisyonlari],
  );

  const rawKagitOyunlari = useWatch({ name: "jobDetails.kagitOyunlari" });
  const kagitOyunlari = useMemo(
    () => rawKagitOyunlari || [],
    [rawKagitOyunlari],
  );

  const lojman = useWatch({ name: "jobDetails.lojman" });
  const rawTercihNedeni = useWatch({ name: "jobDetails.tercihNedeni" });
  const tercihNedeni = useMemo(() => rawTercihNedeni || "", [rawTercihNedeni]);

  const expandedSubeIds = useMemo(
    () => subeler.flatMap((s) => String(s.value).split(",")),
    [subeler],
  );
  const expandedAlanIds = useMemo(
    () => alanlar.flatMap((a) => String(a.value).split(",")),
    [alanlar],
  );
  const expandedDeptIds = useMemo(
    () => departmanlar.flatMap((d) => String(d.value).split(",")),
    [departmanlar],
  );

  //-------------------
  const getSubeName = (subeId) => {
    const sube = apiSubeler.find(
      (x) => String(safeGet(x, "id", "Id")) === String(subeId),
    );

    return safeGet(sube, "subeAdi", "SubeAdi") || "";
  };

  const getAlanInfo = (alanId) => {
    const alan = apiSubeAlanlar.find(
      (x) => String(safeGet(x, "id", "Id")) === String(alanId),
    );

    if (!alan) {
      return {
        alanAdi: "",
        subeAdi: "",
      };
    }

    const subeId = safeGet(alan, "subeId", "SubeId");

    return {
      alanAdi: safeGet(alan, "alanAdi", "AlanAdi") || "",
      subeAdi: getSubeName(subeId),
    };
  };

  const getDepartmanInfo = (departmanId) => {
    const departman = apiDepartmanlar.find(
      (x) => String(safeGet(x, "id", "Id")) === String(departmanId),
    );

    if (!departman) {
      return {
        departmanAdi: "",
        alanAdi: "",
        subeAdi: "",
      };
    }

    const alanId = safeGet(departman, "subeAlanId", "SubeAlanId", "alanId");
    const alanInfo = getAlanInfo(alanId);

    return {
      departmanAdi: safeGet(departman, "departmanAdi", "DepartmanAdi") || "",
      alanAdi: alanInfo.alanAdi,
      subeAdi: alanInfo.subeAdi,
    };
  };
  //-----------------------------------
  /*
  const subeOptions = useMemo(() => {
    const opts = apiSubeler.map((s) => ({
      value: String(safeGet(s, "id", "Id")),
      label: safeGet(s, "subeAdi", "SubeAdi"),
    }));
    return bundleOptionsByLabel(opts);
  }, [apiSubeler]);*/
  const subeOptions = useMemo(() => {
    return apiSubeler.map((s) => ({
      value: String(safeGet(s, "id", "Id")),
      label: safeGet(s, "subeAdi", "SubeAdi"),
    }));
  }, [apiSubeler]);
  /*
  const alanOptions = useMemo(() => {
    if (expandedSubeIds.length === 0) return [];
    const opts = apiSubeAlanlar
      .filter((a) =>
        expandedSubeIds.includes(String(safeGet(a, "subeId", "SubeId"))),
      )
      .map((a) => ({
        value: String(safeGet(a, "id", "Id")),
        label: safeGet(a, "alanAdi", "AlanAdi"),
      }));
    return bundleOptionsByLabel(opts);
  }, [apiSubeAlanlar, expandedSubeIds]);
*/
  const alanOptions = useMemo(() => {
    if (expandedSubeIds.length === 0) return [];

    return apiSubeAlanlar
      .filter((a) =>
        expandedSubeIds.includes(String(safeGet(a, "subeId", "SubeId"))),
      )
      .map((a) => {
        const id = String(safeGet(a, "id", "Id"));
        const alanAdi = safeGet(a, "alanAdi", "AlanAdi") || "";
        const subeAdi = getSubeName(safeGet(a, "subeId", "SubeId"));

        return {
          value: id,
          label: subeAdi ? `${subeAdi} / ${alanAdi}` : alanAdi,
        };
      });
  }, [apiSubeAlanlar, expandedSubeIds, apiSubeler]);

  /*
  const departmanOptions = useMemo(() => {
    if (expandedAlanIds.length === 0) return [];
    const opts = apiDepartmanlar
      .filter((d) =>
        expandedAlanIds.includes(
          String(safeGet(d, "subeAlanId", "SubeAlanId", "alanId")),
        ),
      )
      .map((d) => ({
        value: String(safeGet(d, "id", "Id")),
        label: safeGet(d, "departmanAdi", "DepartmanAdi"),
      }));
    return bundleOptionsByLabel(opts);
  }, [apiDepartmanlar, expandedAlanIds]);
*/
  const departmanOptions = useMemo(() => {
    if (expandedAlanIds.length === 0) return [];

    return apiDepartmanlar
      .filter((d) =>
        expandedAlanIds.includes(
          String(safeGet(d, "subeAlanId", "SubeAlanId", "alanId")),
        ),
      )
      .map((d) => {
        const id = String(safeGet(d, "id", "Id"));
        const departmanAdi = safeGet(d, "departmanAdi", "DepartmanAdi") || "";
        const alanId = safeGet(d, "subeAlanId", "SubeAlanId", "alanId");
        const alanInfo = getAlanInfo(alanId);

        const labelParts = [
          alanInfo.subeAdi,
          alanInfo.alanAdi,
          departmanAdi,
        ].filter(Boolean);

        return {
          value: id,
          label: labelParts.join(" / "),
        };
      });
  }, [apiDepartmanlar, expandedAlanIds, apiSubeAlanlar, apiSubeler]);

  const pozisyonOptions = useMemo(() => {
    if (expandedDeptIds.length === 0) return [];

    return apiPozisyonlar
      .filter((dp) =>
        expandedDeptIds.includes(
          String(safeGet(dp, "departmanId", "DepartmanId")),
        ),
      )
      .map((dp) => {
        const nestedPos =
          dp.masterPozisyon || dp.MasterPozisyon || dp.pozisyon || dp.Pozisyon;

        const value = String(
          safeGet(dp, "id", "Id", "departmanPozisyonId", "DepartmanPozisyonId"),
        );

        const pozisyonAdi =
          safeGet(nestedPos, "pozisyonAdi", "PozisyonAdi") ??
          safeGet(dp, "pozisyonAdi", "PozisyonAdi", "masterPozisyonAdi");

        const departmanId = safeGet(dp, "departmanId", "DepartmanId");
        const departmanInfo = getDepartmanInfo(departmanId);

        const labelParts = [
          departmanInfo.subeAdi,
          departmanInfo.alanAdi,
          departmanInfo.departmanAdi,
          pozisyonAdi,
        ].filter(Boolean);

        return {
          value,
          label: labelParts.join(" / "),
        };
      })
      .filter((x) => x.value && x.value !== "null" && x.label);
  }, [
    apiPozisyonlar,
    expandedDeptIds,
    apiDepartmanlar,
    apiSubeAlanlar,
    apiSubeler,
  ]);
  /*
  const programOptions = useMemo(() => {
    if (expandedDeptIds.length === 0) return [];
    const opts = apiProgramlar
      .filter((pr) =>
        expandedDeptIds.includes(
          String(safeGet(pr, "departmanId", "DepartmanId")),
        ),
      )
      .map((pr) => ({
        value: String(safeGet(pr, "id", "Id")),
        label: safeGet(pr, "programAdi", "ProgramAdi"),
      }));
    return bundleOptionsByLabel(opts);
  }, [apiProgramlar, expandedDeptIds]);
*/

  const programOptions = useMemo(() => {
    if (expandedDeptIds.length === 0) return [];

    return apiProgramlar
      .filter((pr) =>
        expandedDeptIds.includes(
          String(safeGet(pr, "departmanId", "DepartmanId")),
        ),
      )
      .map((pr) => {
        const id = String(safeGet(pr, "id", "Id"));
        const programAdi = safeGet(pr, "programAdi", "ProgramAdi") || "";
        const departmanId = safeGet(pr, "departmanId", "DepartmanId");
        const departmanInfo = getDepartmanInfo(departmanId);

        const labelParts = [
          departmanInfo.subeAdi,
          departmanInfo.alanAdi,
          departmanInfo.departmanAdi,
          programAdi,
        ].filter(Boolean);

        return {
          value: id,
          label: labelParts.join(" / "),
        };
      });
  }, [
    apiProgramlar,
    expandedDeptIds,
    apiDepartmanlar,
    apiSubeAlanlar,
    apiSubeler,
  ]);
  /*
  const oyunOptions = useMemo(() => {
    const opts = apiOyunlar.map((o) => ({
      value: String(safeGet(o, "id", "Id")),
      label: safeGet(o, "oyunAdi", "OyunAdi"),
    }));
    return bundleOptionsByLabel(opts);
  }, [apiOyunlar]);
*/
  const oyunOptions = useMemo(() => {
    return apiOyunlar.map((o) => ({
      value: String(safeGet(o, "id", "Id")),
      label: safeGet(o, "oyunAdi", "OyunAdi"),
    }));
  }, [apiOyunlar]);

  const selectedSubelerHydrated = useMemo(() => {
    return getValueObjects(subeler, subeOptions, apiSubeler, "subeAdi");
  }, [subeler, subeOptions, apiSubeler]);

  const selectedAlanlarHydrated = useMemo(() => {
    return getValueObjects(alanlar, alanOptions, apiSubeAlanlar, "alanAdi");
  }, [alanlar, alanOptions, apiSubeAlanlar]);

  const selectedDepartmanlarHydrated = useMemo(() => {
    return getValueObjects(
      departmanlar,
      departmanOptions,
      apiDepartmanlar,
      "departmanAdi",
    );
  }, [departmanlar, departmanOptions, apiDepartmanlar]);

  const selectedPozisyonlarHydrated = useMemo(() => {
    return getValueObjects(
      departmanPozisyonlari,
      pozisyonOptions,
      apiPozisyonlar,
      "pozisyonAdi",
    );
  }, [departmanPozisyonlari, pozisyonOptions, apiPozisyonlar]);

  const selectedProgramlarHydrated = useMemo(() => {
    return getValueObjects(
      programlar,
      programOptions,
      apiProgramlar,
      "programAdi",
    );
  }, [programlar, programOptions, apiProgramlar]);

  const selectedOyunlarHydrated = useMemo(() => {
    return getValueObjects(kagitOyunlari, oyunOptions, apiOyunlar, "oyunAdi");
  }, [kagitOyunlari, oyunOptions, apiOyunlar]);

  // Casino Kontrolü
  const isLiveGameDepartmentName = (name = "") => {
    return /\b(canl[ıi]\s*oyun|live\s*game)\b/i.test(String(name).trim());
  };

  const isLiveGameSelected = useMemo(() => {
    const selectedDeptIds = departmanlar.flatMap((d) =>
      String(d?.value || d).split(","),
    );

    return selectedDeptIds.some((id) => {
      const departman = apiDepartmanlar.find(
        (d) => String(safeGet(d, "id", "Id")) === String(id),
      );

      const departmanAdi =
        safeGet(departman, "departmanAdi", "DepartmanAdi") || "";

      return isLiveGameDepartmentName(departmanAdi);
    });
  }, [departmanlar, apiDepartmanlar]);
  const lojmanOptions = [
    { value: "2", label: t("jobDetails.housing.yes") || "Evet" },
    { value: "1", label: t("jobDetails.housing.no") || "Hayır" },
  ];

  // --- HANDLERS ---
  const handleSubeChange = (val, field) => {
    field.onChange(val);
    setValue("jobDetails.alanlar", []);
    setValue("jobDetails.departmanlar", []);
    setValue("jobDetails.departmanPozisyonlari", []);
    setValue("jobDetails.programlar", []);
  };

  const handleAlanChange = (val, field) => {
    field.onChange(val);
    setValue("jobDetails.departmanlar", []);
    setValue("jobDetails.departmanPozisyonlari", []);
    setValue("jobDetails.programlar", []);
  };

  const handleDepartmanChange = (val, field) => {
    field.onChange(val);

    setValue("jobDetails.departmanPozisyonlari", [], {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    setValue("jobDetails.programlar", [], {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    const selectedDeptIds = (val || []).flatMap((v) =>
      String(v?.value || v).split(","),
    );

    const hasLive = selectedDeptIds.some((id) => {
      const departman = apiDepartmanlar.find(
        (d) => String(safeGet(d, "id", "Id")) === String(id),
      );

      const departmanAdi =
        safeGet(departman, "departmanAdi", "DepartmanAdi") || "";

      return isLiveGameDepartmentName(departmanAdi);
    });

    if (!hasLive) {
      setValue("jobDetails.kagitOyunlari", [], {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  };

  return (
    <div className="bg-gray-50 rounded-b-lg p-4 sm:p-6 lg:p-8">
      <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4 rounded-md shadow-sm">
        <p className="text-sm sm:text-base leading-relaxed">
          <strong>📋 {t("jobDetails.info.title")}</strong>{" "}
          {t("jobDetails.info.bodyBase")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        <Controller
          name="jobDetails.subeler"
          control={control}
          render={({ field }) => (
            <SelectField
              label={t("jobDetails.labels.branches")}
              options={subeOptions}
              {...field}
              value={selectedSubelerHydrated}
              onChange={(val) => handleSubeChange(val, field)}
              placeholder={t("jobDetails.placeholders.selectBranch")}
              error={errors.jobDetails?.subeler}
              isMulti
              menuPortalTarget={portalTarget}
            />
          )}
        />

        <Controller
          name="jobDetails.alanlar"
          control={control}
          render={({ field }) => (
            <SelectField
              label={t("jobDetails.labels.areas")}
              options={alanOptions}
              {...field}
              value={selectedAlanlarHydrated}
              onChange={(val) => handleAlanChange(val, field)}
              placeholder={t("jobDetails.placeholders.selectArea")}
              error={errors.jobDetails?.alanlar}
              isMulti
              menuPortalTarget={portalTarget}
            />
          )}
        />

        <Controller
          name="jobDetails.departmanlar"
          control={control}
          render={({ field }) => (
            <SelectField
              label={t("jobDetails.labels.departments")}
              options={departmanOptions}
              {...field}
              value={selectedDepartmanlarHydrated}
              onChange={(val) => {
                const selected = val || [];

                if (selected.length > 2) {
                  return;
                }

                handleDepartmanChange(selected, field);
              }}
              placeholder={t("jobDetails.placeholders.selectDepartment")}
              error={errors.jobDetails?.departmanlar}
              isOptionDisabled={(option) =>
                selectedDepartmanlarHydrated?.length >= 2 &&
                !selectedDepartmanlarHydrated.some(
                  (x) => x.value === option.value,
                )
              }
              isMulti
              menuPortalTarget={portalTarget}
            />
          )}
        />

        <Controller
          name="jobDetails.departmanPozisyonlari"
          control={control}
          render={({ field }) => (
            <SelectField
              label={`${t("jobDetails.labels.roles")} *`}
              options={pozisyonOptions}
              {...field}
              onChange={(val) => {
                const selected = val || [];

                if (selected.length > 4) {
                  return;
                }

                setValue("jobDetails.departmanPozisyonlari", selected, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
              value={selectedPozisyonlarHydrated}
              placeholder={t("jobDetails.placeholders.selectRoles")}
              error={errors.jobDetails?.departmanPozisyonlari}
              isOptionDisabled={(option) =>
                selectedPozisyonlarHydrated?.length >= 4 &&
                !selectedPozisyonlarHydrated.some(
                  (x) => x.value === option.value,
                )
              }
              isMulti
              menuPortalTarget={portalTarget}
            />
          )}
        />

        <Controller
          name="jobDetails.programlar"
          control={control}
          render={({ field }) => (
            <SelectField
              label={t("jobDetails.labels.programs")}
              options={programOptions}
              {...field}
              value={selectedProgramlarHydrated}
              placeholder={t("jobDetails.placeholders.selectProgram")}
              error={errors.jobDetails?.programlar}
              isMulti
              menuPortalTarget={portalTarget}
            />
          )}
        />

        <Controller
          name="jobDetails.kagitOyunlari"
          control={control}
          render={({ field }) => (
            <SelectField
              label={t("jobDetails.labels.cardGames")}
              options={oyunOptions}
              {...field}
              value={selectedOyunlarHydrated}
              placeholder={t("jobDetails.placeholders.selectCardGame")}
              isDisabled={!isLiveGameSelected}
              error={errors.jobDetails?.kagitOyunlari}
              isMulti
              menuPortalTarget={portalTarget}
            />
          )}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
        <div className="lg:col-span-2">
          <Controller
            name="jobDetails.lojman"
            control={control}
            render={({ field }) => (
              <SelectField
                label={t("jobDetails.labels.housing")}
                options={lojmanOptions}
                {...field}
                value={lojmanOptions.find(
                  (o) => o.value === String(field.value),
                )}
                onChange={(opt) => field.onChange(opt ? opt.value : "")}
                placeholder={t("jobDetails.placeholders.selectHousing")}
                error={errors.jobDetails?.lojman}
                isMulti={false}
                menuPortalTarget={portalTarget}
              />
            )}
          />
        </div>

        <div className="lg:col-span-10">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t("jobDetails.labels.whyUs")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            maxLength={500}
            placeholder={t("jobDetails.placeholders.whyUs")}
            {...register("jobDetails.tercihNedeni")}
            className={`w-full rounded-lg px-4 py-2 border ${
              errors.jobDetails?.tercihNedeni
                ? "border-red-500"
                : "border-gray-300"
            } focus:outline-none focus:border-black resize-none`}
          />
          <div className="flex justify-between text-xs mt-1">
            <span className="text-red-600">
              {errors.jobDetails?.tercihNedeni?.message}
            </span>
            <span className="text-gray-400">{tercihNedeni.length}/500</span>
          </div>
        </div>
      </div>

      <PreviewSection
        t={t}
        data={{
          subeler: selectedSubelerHydrated,
          alanlar: selectedAlanlarHydrated,
          departmanlar: selectedDepartmanlarHydrated,
          departmanPozisyonlari: selectedPozisyonlarHydrated,
          programlar: selectedProgramlarHydrated,
          kagitOyunlari: selectedOyunlarHydrated,
          lojman,
        }}
      />
    </div>
  );
}

function SelectField({ label, error, ...props }) {
  let errorMessage = null;
  if (error) {
    if (typeof error === "string") errorMessage = error;
    else if (typeof error === "object" && error.message)
      errorMessage = error.message;
    else errorMessage = "Geçersiz seçim.";
  }
  return (
    <div className="w-full">
      <label className="block text-sm sm:text-[15px] font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <Select
        styles={customStyles}
        menuPosition="fixed"
        noOptionsMessage={() => "Seçenek bulunamadı"}
        {...props}
      />
      {errorMessage && (
        <p className="text-red-600 text-xs mt-1">{errorMessage}</p>
      )}
    </div>
  );
}

function PreviewSection({ t, data }) {
  const items = [
    {
      icon: faBuilding,
      label: t("jobDetails.preview.branches"),
      val: data.subeler,
    },
    {
      icon: faLayerGroup,
      label: t("jobDetails.preview.areas"),
      val: data.alanlar,
    },
    {
      icon: faBriefcase,
      label: t("jobDetails.preview.departments"),
      val: data.departmanlar,
    },
    {
      icon: faBriefcase,
      label: t("jobDetails.preview.roles"),
      val: data.departmanPozisyonlari,
    },
    {
      icon: faComputer,
      label: t("jobDetails.preview.programs"),
      val: data.programlar,
    },
    {
      icon: faClapperboard,
      label: t("jobDetails.preview.cardGames"),
      val: data.kagitOyunlari,
    },
  ];
  return (
    <div className="mt-10 bg-white rounded-lg border border-gray-200 shadow-sm p-5">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FontAwesomeIcon icon={faEye} className="text-red-600" />{" "}
        {t("jobDetails.preview.title")}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 p-2 hover:bg-gray-50 rounded-md">
            <FontAwesomeIcon icon={item.icon} className="text-gray-400 mt-1" />
            <div>
              <strong>{item.label}:</strong>
              <div className="text-gray-900">
                {Array.isArray(item.val) && item.val.length > 0
                  ? item.val.map((v) => v.label).join(", ")
                  : "—"}
              </div>
            </div>
          </div>
        ))}
        <div className="flex gap-2 p-2 hover:bg-gray-50 rounded-md">
          <FontAwesomeIcon icon={faHouseUser} className="text-gray-400 mt-1" />
          <div>
            <strong>{t("jobDetails.preview.housing")}:</strong>
            <div className="text-gray-900">
              {data.lojman === "2"
                ? t("jobDetails.housing.yes")
                : data.lojman === "1"
                  ? t("jobDetails.housing.no")
                  : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
