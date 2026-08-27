using IsBasvuru.Domain.DTOs.YedeklemeDtos.YedeklemeMailGonderimKaydiDtos;
using IsBasvuru.Domain.Enums;

namespace IsBasvuru.Domain.DTOs.YedeklemeDtos.YedeklemeKaydiDtos
{
    public class YedeklemeKaydiResponseDto
    {
        public int Id { get; set; }

        public DateTime BaslamaTarihi { get; set; }

        public DateTime? TamamlanmaTarihi { get; set; }

        public YedeklemeDurumu Durum { get; set; }

        public YedeklemeTetiklemeTipi TetiklemeTipi { get; set; }

        public string? BaslatanKullaniciAdi { get; set; }

        public string? ZipDosyaAdi { get; set; }

        public long? SqlBoyutuByte { get; set; }

        public long? ZipBoyutuByte { get; set; }

        public bool DriveYuklendiMi { get; set; }

        public string? DriveLink { get; set; }

        public bool MailGonderildiMi { get; set; }

        public bool SqlMailEkiGonderildiMi { get; set; }

        public string? HataMesaji { get; set; }

        public List<YedeklemeMailGonderimKaydiResponseDto>? MailGonderimleri { get; set; }
    }
}