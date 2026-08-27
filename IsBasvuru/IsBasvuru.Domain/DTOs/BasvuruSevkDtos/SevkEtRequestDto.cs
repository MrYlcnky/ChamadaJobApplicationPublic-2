using System.Collections.Generic;

namespace IsBasvuru.Domain.DTOs.BasvuruSevkDtos
{
    public class SevkEtRequestDto
    {
        public int MasterBasvuruId { get; set; }
        public List<int> DepartmanIds { get; set; } = new List<int>();
    }
}