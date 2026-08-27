using IsBasvuru.Domain.Enums;
using System;

namespace IsBasvuru.Domain.DTOs.BasvuruSevkDtos
{
    public class BasvuruSevkListDto
    {
        public int Id { get; set; }
        public int MasterBasvuruId { get; set; }

        public int SubeId { get; set; }
        public string SubeAdi { get; set; } = null!;

        public int DepartmanId { get; set; }
        public string DepartmanAdi { get; set; } = null!;

        public SevkDurumu SevkDurumu { get; set; }
        public string? DegerlendirmeNotu { get; set; }
        public DateTime? IslemTarihi { get; set; }

        public int MasterDepartmanId { get; set; }
        public string? MasterDepartmanAdi { get; set; }

        public int MasterAlanId { get; set; }


    }
}