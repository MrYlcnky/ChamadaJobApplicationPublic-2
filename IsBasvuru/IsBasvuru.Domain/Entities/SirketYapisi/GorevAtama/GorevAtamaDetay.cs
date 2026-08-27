using IsBasvuru.Domain.Entities.AdminBilgileri;
using IsBasvuru.Domain.Entities.SirketYapisi;
using IsBasvuru.Domain.Entities.SirketYapisi.SirketTanimYapisi;
using IsBasvuru.Domain.Entities.Tanimlamalar;
using IsBasvuru.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IsBasvuru.Domain.Entities.SirketYapisi.GorevAtama
{
    public class GorevAtamaDetay : BaseEntity
    {
        // Foreign Keys
        public int PersonelId { get; set; }
        public int MasterDepartmanId { get; set; }
        public int GorevId { get; set; }
        public int PanelKullaniciId { get; set; } // İşlemi onaylayan yönetici

        // Atama Detayları
        public int? NetUcret { get; set; } // int yapıldı
        public int? TalepEdilenGorevGenelButcesi { get; set; } // int yapıldı
        public DateTime BaslangicTarihi { get; set; }

        // Kadro Talebi
        public TalepNedeni TalepNedeni { get; set; } // Enum (Örn: 1=YeniKadro, 2=Yerine)
        public string? YerineAlinacakKisiAdSoyad { get; set; } // Sadece "Yerine" seçilirse dolacak
        public DateTime? YerineAlinacakKisiCikisTarihi { get; set; }


        // Pozisyon bütçe ve personel bilgileri
        public bool? PozisyonButcesiVarMi { get; set; }

        public int? AktifCalisanPersonel { get; set; }

        public int? PozisyondaCalismasiGerekenPersonelSayisi { get; set; }

        public int? TotalPozisyonButcesi { get; set; }

        // Çalışma izin belge türü
        public int? CalismaIzinBelgeTuruId { get; set; }


        // Navigation Properties
        public virtual Personel? Personel { get; set; }
        public virtual MasterDepartman? MasterDepartman { get; set; }
        public virtual Gorev? Gorev { get; set; }
        public virtual PanelKullanici? PanelKullanici { get; set; }  

        public virtual CalismaIzinBelgeTuru? CalismaIzinBelgeTuru { get; set; }
    }
}
