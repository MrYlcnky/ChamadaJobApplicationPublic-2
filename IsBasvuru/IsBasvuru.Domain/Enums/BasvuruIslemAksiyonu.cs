
namespace IsBasvuru.Domain.Enums
{
    public enum BasvuruIslemAksiyonu
    {
        StandartIslem = 0,
        SonlandirVeRedMailiGonder = 1,
        KaldigiYerdenDevamEttir = 2,
        IlkAsamayaDondur = 3

        /*
            0 → Mevcut normal işlemler

            1 → Başvuruyu tamamen reddet, kilitle ve red maili gönder

            2 → Tamamen reddetme kilidini kaldır, mevcut aşama ve sevklerden devam et

            3 → Tamamen reddetme kilidini kaldır ve başvuruyu İK ilk değerlendirmeye döndür
         */
    }
}