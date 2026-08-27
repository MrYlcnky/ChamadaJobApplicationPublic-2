using System;
using IsBasvuru.Domain.Enums;

namespace IsBasvuru.Domain.DTOs.SirketYapisiDtos.GorevAtamaDetayDtos
{
    public class GorevAtamaDetayListDto
    {
        public int Id { get; set; }

        public int PersonelId { get; set; }
        public string? PersonelAdSoyad { get; set; } 

        public int MasterDepartmanId { get; set; }
        public string? MasterDepartmanAdi { get; set; } 

        public int GorevId { get; set; }
        public string? GorevAdi { get; set; } 

        public int PanelKullaniciId { get; set; }
        public string? OnaylayanKullaniciAdSoyad { get; set; } 

        public int? NetUcret { get; set; }
        public int? TalepEdilenGorevGenelButcesi { get; set; }
        public DateTime BaslangicTarihi { get; set; }

        public TalepNedeni TalepNedeni { get; set; }
        public string? TalepNedeniMetin { get; set; } 

        public string? YerineAlinacakKisiAdSoyad { get; set; }
        public DateTime? YerineAlinacakKisiCikisTarihi { get; set; }

        public bool? PozisyonButcesiVarMi { get; set; }

        public int? AktifCalisanPersonel { get; set; }

        public int? PozisyondaCalismasiGerekenPersonelSayisi { get; set; }

        public int? TotalPozisyonButcesi { get; set; }

        public int? CalismaIzinBelgeTuruId { get; set; }
        public string? CalismaIzinBelgeTuruAdi { get; set; }
    }
}