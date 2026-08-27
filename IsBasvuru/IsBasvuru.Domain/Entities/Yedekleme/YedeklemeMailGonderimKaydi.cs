namespace IsBasvuru.Domain.Entities.Yedekleme
{
    public class YedeklemeMailGonderimKaydi : BaseEntity
    {
        public int YedeklemeKaydiId { get; set; }

        public required string Eposta { get; set; }

        public bool GonderildiMi { get; set; }

        public bool SqlEkiGonderildiMi { get; set; }

        public DateTime? GonderimTarihi { get; set; }

        public string? HataMesaji { get; set; }
    }
}