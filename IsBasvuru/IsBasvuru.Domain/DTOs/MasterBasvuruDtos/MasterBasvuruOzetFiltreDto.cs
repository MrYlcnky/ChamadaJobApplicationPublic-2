using IsBasvuru.Domain.Enums;

namespace IsBasvuru.Domain.DTOs.MasterBasvuruDtos
{
    public class MasterBasvuruOzetFiltreDto
    {
        // Pagination
        public int PageNumber { get; set; } = 1;

        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; }

        public bool SortDescending { get; set; } = true;

        // Genel arama
        public string? Search { get; set; }

        // Şube / Alan / Departman / Pozisyon
        public string? Sube { get; set; }
        public bool? SadeceSube { get; set; }

        public string? Alan { get; set; }

        public string? Departman { get; set; }

        public string? Pozisyon { get; set; }

        // Durum / Aşama
        public List<BasvuruDurum>? Durumlar { get; set; }

        public BasvuruOnayAsamasi? Asama { get; set; }

        // Özel sekmeler
        public bool? TamamenReddedildiMi { get; set; }

        public bool? IseBaslamaTarihiVarMi { get; set; }

        // Başvuru tarihi
        public DateTime? BaslangicTarihi { get; set; }

        public DateTime? BitisTarihi { get; set; }

        // Yaş
        public int? YasMin { get; set; }

        public int? YasMax { get; set; }

        // Cinsiyet
        public int? Cinsiyet { get; set; }

        // Eğitim
        public int? EgitimSeviyesi { get; set; }
    }
}