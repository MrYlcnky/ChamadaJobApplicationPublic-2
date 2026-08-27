namespace IsBasvuru.Domain.DTOs.YedeklemeDtos.YedeklemeMailAlicisiDtos
{
    public class YedeklemeMailAlicisiResponseDto
    {
        public int Id { get; set; }

        public required string Eposta { get; set; }

        public bool AktifMi { get; set; }

        public int SiraNo { get; set; }
    }
}