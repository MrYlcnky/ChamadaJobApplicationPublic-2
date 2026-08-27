using IsBasvuru.Domain.Enums;

namespace IsBasvuru.Domain.DTOs.BasvuruSevkDtos
{
    public class BasvuruSevkDegerlendirmeDto
    {
        public int Id { get; set; } // BasvuruSevk tablosunun kendi PK Id'si
        public SevkDurumu SevkDurumu { get; set; } // Frontend'den 2 (Onay) veya 3 (Red) gelecek
        public string? DegerlendirmeNotu { get; set; } // Müdür red verirse nedenini yazabileceği opsiyonel alan
        public int? DepartmanId { get; set; }
    }
}