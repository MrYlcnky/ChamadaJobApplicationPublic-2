using IsBasvuru.Domain.Enums;

namespace IsBasvuru.Domain.Entities.Yedekleme
{
    public class YedeklemeKaydi : BaseEntity
    {
        public DateTime BaslamaTarihi { get; set; }
        public DateTime? TamamlanmaTarihi { get; set; }

        public YedeklemeDurumu Durum { get; set; }
        public YedeklemeTetiklemeTipi TetiklemeTipi { get; set; }

        public string? BaslatanKullaniciAdi { get; set; }

        public string? ZipDosyaAdi { get; set; }

        public long? SqlBoyutuByte { get; set; }
        public long? ZipBoyutuByte { get; set; }

        public bool DriveYuklendiMi { get; set; }
        public string? DriveDosyaId { get; set; }
        public string? DriveLink { get; set; }

        public bool MailGonderildiMi { get; set; }
        public bool SqlMailEkiGonderildiMi { get; set; }

        public string? HataMesaji { get; set; }
    }
}