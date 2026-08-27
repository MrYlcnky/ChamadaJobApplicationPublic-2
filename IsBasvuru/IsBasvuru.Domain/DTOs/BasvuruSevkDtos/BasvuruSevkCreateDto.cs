using IsBasvuru.Domain.Enums;

namespace IsBasvuru.Domain.DTOs.BasvuruSevkDtos
{
    public class BasvuruSevkCreateDto
    {
        public int MasterBasvuruId { get; set; }
        public int SubeId { get; set; }
        public int DepartmanId { get; set; }

        // Yeni bir sevk her zaman "Bekliyor" statüsünde başlar
        public SevkDurumu SevkDurumu { get; set; } = SevkDurumu.Bekliyor;
    }
}