using IsBasvuru.Domain.Entities.SirketYapisi.SirketTanimYapisi;
using IsBasvuru.Domain.Enums;
using System;

namespace IsBasvuru.Domain.Entities
{
    public class BasvuruSevk : BaseEntity
    {
        public int MasterBasvuruId { get; set; }
        public virtual MasterBasvuru? MasterBasvuru { get; set; }

        public int SubeId { get; set; }
        public virtual Sube? Sube { get; set; }

        public int DepartmanId { get; set; }
        public virtual Departman? Departman { get; set; }

        public SevkDurumu SevkDurumu { get; set; }

        public string? DegerlendirmeNotu { get; set; }
        public DateTime? IslemTarihi { get; set; }
    }
}