namespace IsBasvuru.Domain.DTOs.YedeklemeDtos
    .YedeklemeMailGonderimKaydiDtos
{
    public class YedeklemeMailGonderimKaydiResponseDto
    {
        public int Id { get; set; }

        public int YedeklemeKaydiId { get; set; }

        public required string Eposta { get; set; }

        public bool GonderildiMi { get; set; }

        public bool SqlEkiGonderildiMi { get; set; }

        public DateTime? GonderimTarihi { get; set; }

        public string? HataMesaji { get; set; }
    }
}