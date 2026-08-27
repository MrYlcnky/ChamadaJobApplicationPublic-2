import { z } from "zod";

export const referansArastirmaSchema = z
  .object({
    masterBasvuruId: z.number(),
    gorusmeTarihi: z.string().min(1, "Görüşme tarihi zorunludur."),
    referansIsYeriAdi: z
      .string()
      .min(2, "İş yeri adı en az 2 karakter olmalıdır."),
    referansGorusulenAdSoyad: z
      .string()
      .min(3, "Görüşülen kişi adı zorunludur."),
    referansUnvan: z.string().optional().nullable(),
    gorusulenKisininTelefonu: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => {
          // 1. Boş bırakılmışsa geçerli say (Çünkü optional bir alan)
          if (!val || val.trim() === "") return true;

          // 2. Sadece rakam, boşluk, artı, tire ve parantez içerebilir
          const isAllowedChars = /^[0-9\s\+\-\(\)]+$/.test(val);

          // 3. İçindeki sadece rakamları sayıyoruz (En az 10, en fazla 15 rakam olmalı)
          const digitCount = val.replace(/\D/g, "").length;

          return isAllowedChars && digitCount >= 7 && digitCount <= 19;
        },
        {
          message: "Geçerli bir telefon formatı giriniz (Örn: 05XX XXX XX XX).",
        },
      ),
    adayIseBaslamaTarihi: z.string().optional().nullable(),
    adayIstenAyrilmaTarihi: z.string().optional().nullable(),
    ilkGorev: z.string().optional().nullable(),
    sonGorev: z.string().optional().nullable(),
    istenAyrilmaNedeni: z.string().optional().nullable(),
    disiplinKaydiVarMi: z.number().default(0),
    disiplinKaydiAciklama: z.string().optional().nullable(),
    odulVarMi: z.number().default(0),
    odulAciklama: z.string().optional().nullable(),
    istenAyrilisSureciSorunluMu: z.number().default(0),
    istenAyrilisSorunAciklama: z.string().optional().nullable(),
    yenidenIseAlirMisin: z.number().default(0),
    yenidenIseAlmamaNedeni: z.string().optional().nullable(),
    genelDegerlendirmeNotu: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    // 🎯 KOŞULLU DOĞRULAMALAR (Conditional Validation)

    // 1. Çıkış Süreci Sorunluysa (Evet:2, Kısmen:3) açıklama zorunlu!
    if (
      (data.istenAyrilisSureciSorunluMu === 2 ||
        data.istenAyrilisSureciSorunluMu === 3) &&
      (!data.istenAyrilisSorunAciklama ||
        data.istenAyrilisSorunAciklama.trim() === "")
    ) {
      ctx.addIssue({
        path: ["istenAyrilisSorunAciklama"],
        code: z.ZodIssueCode.custom,
        message: "Çıkış süreci sorunluysa detayları belirtmelisiniz.",
      });
    }

    // 2. Yeniden İşe Alınmazsa (Hayır:1, Kısmen:3) açıklama zorunlu!
    if (
      (data.yenidenIseAlirMisin === 1 || data.yenidenIseAlirMisin === 3) &&
      (!data.yenidenIseAlmamaNedeni ||
        data.yenidenIseAlmamaNedeni.trim() === "")
    ) {
      ctx.addIssue({
        path: ["yenidenIseAlmamaNedeni"],
        code: z.ZodIssueCode.custom,
        message: "Neden işe alınmayacağını belirtmelisiniz.",
      });
    }

    // 3. Disiplin Kaydı Varsa (Evet:2, Kısmen:3) açıklama zorunlu!
    if (
      (data.disiplinKaydiVarMi === 2 || data.disiplinKaydiVarMi === 3) &&
      (!data.disiplinKaydiAciklama || data.disiplinKaydiAciklama.trim() === "")
    ) {
      ctx.addIssue({
        path: ["disiplinKaydiAciklama"],
        code: z.ZodIssueCode.custom,
        message: "Disiplin kaydı hakkında bilgi vermelisiniz.",
      });
    }
  });
