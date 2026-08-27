using IsBasvuru.Domain.Enums;
using System;

namespace IsBasvuru.Domain.DTOs.ReferansArastirmasiDtos
{
    public class ReferansArastirmasiCreateDto
    {
        public int MasterBasvuruId { get; set; }

        // Nullable (?) alanlarımız
        public string? ReferansIsYeriAdi { get; set; }
        public string? ReferansGorusulenAdSoyad { get; set; }
        public string? ReferansUnvan { get; set; }
        public string? GorusulenKisininTelefonu { get; set; }

        public DateTime? AdayIseBaslamaTarihi { get; set; }
        public DateTime? AdayIstenAyrilmaTarihi { get; set; }
        public string? IlkGorev { get; set; }
        public string? SonGorev { get; set; }

        public SecimDurumu DisiplinKaydiVarMi { get; set; }
        public string? DisiplinKaydiAciklama { get; set; }

        public SecimDurumu OdulVarMi { get; set; }
        public string? OdulAciklama { get; set; }

        public SecimDurumu IstenAyrilisSureciSorunluMu { get; set; }
        public string? IstenAyrilisSorunAciklama { get; set; }
        public string? IstenAyrilmaNedeni { get; set; }

        public SecimDurumu YenidenIseAlirMisin { get; set; }
        public string? YenidenIseAlmamaNedeni { get; set; }

        public string? GenelDegerlendirmeNotu { get; set; }

        public int GorusmeyiYapanKullaniciId { get; set; }
        public DateTime GorusmeTarihi { get; set; }
    }
}