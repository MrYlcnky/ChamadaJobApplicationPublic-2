namespace IsBasvuru.Domain.DTOs.YedeklemeDtos.YedeklemeMailAlicisiDtos
{
    public class YedeklemeMailAlicisiCreateDto
    {
        public required string Eposta { get; set; }

        public bool AktifMi { get; set; }

        public int SiraNo { get; set; }
    }
}