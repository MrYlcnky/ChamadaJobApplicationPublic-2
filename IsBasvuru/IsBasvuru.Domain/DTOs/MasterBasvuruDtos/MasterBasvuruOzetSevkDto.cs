namespace IsBasvuru.Domain.DTOs.MasterBasvuruDtos
{
    public class MasterBasvuruOzetSevkDto
    {
        public int SubeId { get; set; }

        public string SubeAdi { get; set; } = string.Empty;

        public int SevkDurumu { get; set; }

        public int DepartmanId { get; set; }

        public int MasterDepartmanId { get; set; }

        public int MasterAlanId { get; set; }
    }
}