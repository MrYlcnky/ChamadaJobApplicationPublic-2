namespace IsBasvuru.Domain.Entities.Yedekleme
{
    public class YedeklemeMailAlicisi : BaseEntity
    {
        public required string Eposta { get; set; }

        public bool AktifMi { get; set; } 

        public int SiraNo { get; set; } 
    }
}