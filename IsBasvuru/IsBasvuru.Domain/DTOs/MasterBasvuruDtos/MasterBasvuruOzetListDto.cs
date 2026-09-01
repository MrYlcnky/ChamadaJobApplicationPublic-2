using IsBasvuru.Domain.Enums;

namespace IsBasvuru.Domain.DTOs.MasterBasvuruDtos
{
    public class MasterBasvuruOzetListDto
    {
        public int Id { get; set; }

        public int PersonelId { get; set; }

        // DataTable temel personel bilgileri
        public string Ad { get; set; } = string.Empty;

        public string Soyad { get; set; } = string.Empty;

        public string FotografYolu { get; set; } = string.Empty;

        // Filtreleme için gerekli personel bilgileri
        public DateTime? DogumTarihi { get; set; }

        public int? Cinsiyet { get; set; }

        public List<int> EgitimSeviyeleri { get; set; } = [];

        // Başvuru bilgileri
        public DateTime BasvuruTarihi { get; set; }

        public BasvuruDurum BasvuruDurum { get; set; }

        public string BasvuruDurumAdi { get; set; } = string.Empty;

        public BasvuruOnayAsamasi BasvuruOnayAsamasi { get; set; }

        public bool TamamenReddedildiMi { get; set; }

        public DateTime? IseBaslamaTarihi { get; set; }

        // DataTable kolonları / filtreler
        public List<string> Subeler { get; set; } = [];

        public List<string> Alanlar { get; set; } = [];

        public List<string> Departmanlar { get; set; } = [];

        public List<string> Pozisyonlar { get; set; } = [];

        // Yetki / sevk kontrolleri
        public List<int> BasvuruSubeIdleri { get; set; } = [];

        public List<int> BasvuruDepartmanIdleri { get; set; } = [];

        // Liste ekranı için gerekli minimal sevk bilgisi
        public List<MasterBasvuruOzetSevkDto> Sevkler { get; set; } = [];
    }
}