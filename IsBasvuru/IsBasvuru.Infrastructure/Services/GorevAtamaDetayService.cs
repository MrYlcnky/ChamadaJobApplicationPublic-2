using AutoMapper;
using IsBasvuru.Domain.DTOs.SirketYapisiDtos.GorevAtamaDetayDtos;
using IsBasvuru.Domain.Entities.SirketYapisi.GorevAtama;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Domain.Wrappers;
using IsBasvuru.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace IsBasvuru.Infrastructure.Services
{
    public class GorevAtamaDetayService : IGorevAtamaDetayService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;

        public GorevAtamaDetayService(IsBasvuruContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<GorevAtamaDetayListDto>> GetByPersonelIdAsync(int personelId)
        {
            // AsNoTracking() performansı artırır.
            var entity = await _context.GorevAtamaDetaylari
                .Include(x => x.Personel).ThenInclude(p => p!.KisiselBilgiler)
                .Include(x => x.MasterDepartman)
                .Include(x => x.Gorev).ThenInclude(g => g!.MasterGorev)
                .Include(x => x.PanelKullanici)
                .Include(x => x.CalismaIzinBelgeTuru)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.PersonelId == personelId);

            if (entity == null)
                return ServiceResponse<GorevAtamaDetayListDto>.FailureResult("Bu başvuru için henüz görev ataması yapılmamış.");

            var dto = _mapper.Map<GorevAtamaDetayListDto>(entity);
            return ServiceResponse<GorevAtamaDetayListDto>.SuccessResult(dto);
        }

        public async Task<ServiceResponse<int>> CreateAsync( GorevAtamaDetayCreateDto dto)
        {
            // Aynı adaya daha önce görev ataması yapılmış mı?
            var existing = await _context.GorevAtamaDetaylari
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.PersonelId == dto.PersonelId);

            if (existing != null)
            {
                return ServiceResponse<int>.FailureResult(
                    "Bu adaya zaten bir görev ataması yapılmış. Lütfen güncelleme işlemi yapınız."
                );
            }

            // Personel sayıları negatif olamaz.
            if (dto.AktifCalisanPersonel.HasValue &&
                dto.AktifCalisanPersonel.Value < 0)
            {
                return ServiceResponse<int>.FailureResult(
                    "Aktif çalışan personel sayısı negatif olamaz."
                );
            }

            if (dto.PozisyondaCalismasiGerekenPersonelSayisi.HasValue &&
                dto.PozisyondaCalismasiGerekenPersonelSayisi.Value < 0)
            {
                return ServiceResponse<int>.FailureResult(
                    "Pozisyonda çalışması gereken personel sayısı negatif olamaz."
                );
            }

            // Pozisyon bütçesi varsa toplam bütçe zorunludur.
            if (dto.PozisyonButcesiVarMi == true &&
                (!dto.TotalPozisyonButcesi.HasValue ||
                 dto.TotalPozisyonButcesi.Value <= 0))
            {
                return ServiceResponse<int>.FailureResult(
                    "Pozisyon bütçesi varsa toplam pozisyon bütçesi girilmelidir."
                );
            }

            // Pozisyon bütçesi yoksa toplam bütçe temizlenir.
            if (dto.PozisyonButcesiVarMi == false)
            {
                dto.TotalPozisyonButcesi = null;
            }

            // Çalışma izin belge türü seçilmişse kayıt gerçekten var mı?
            if (dto.CalismaIzinBelgeTuruId.HasValue)
            {
                var belgeTuruVarMi = await _context.CalismaIzinBelgeTurleri
                    .AnyAsync(x => x.Id == dto.CalismaIzinBelgeTuruId.Value);

                if (!belgeTuruVarMi)
                {
                    return ServiceResponse<int>.FailureResult(
                        "Seçilen çalışma izin belge türü bulunamadı."
                    );
                }
            }

            var entity = _mapper.Map<GorevAtamaDetay>(dto);

            await _context.GorevAtamaDetaylari.AddAsync(entity);
            await _context.SaveChangesAsync();

            return ServiceResponse<int>.SuccessResult(
                entity.Id,
                "Görev atama bilgileri başarıyla kaydedildi."
            );
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(
     GorevAtamaDetayUpdateDto dto)
        {
            var entity = await _context.GorevAtamaDetaylari
                .FirstOrDefaultAsync(x => x.Id == dto.Id);

            if (entity == null)
            {
                return ServiceResponse<bool>.FailureResult(
                    "Güncellenecek görev atama kaydı bulunamadı."
                );
            }

            // Aktif çalışan personel sayısı negatif olamaz.
            if (dto.AktifCalisanPersonel.HasValue &&
                dto.AktifCalisanPersonel.Value < 0)
            {
                return ServiceResponse<bool>.FailureResult(
                    "Aktif çalışan personel sayısı negatif olamaz."
                );
            }

            // Olması gereken personel sayısı negatif olamaz.
            if (dto.PozisyondaCalismasiGerekenPersonelSayisi.HasValue &&
                dto.PozisyondaCalismasiGerekenPersonelSayisi.Value < 0)
            {
                return ServiceResponse<bool>.FailureResult(
                    "Pozisyonda çalışması gereken personel sayısı negatif olamaz."
                );
            }

            // Pozisyon bütçesi varsa toplam bütçe girilmelidir.
            if (dto.PozisyonButcesiVarMi == true &&
                (!dto.TotalPozisyonButcesi.HasValue ||
                 dto.TotalPozisyonButcesi.Value <= 0))
            {
                return ServiceResponse<bool>.FailureResult(
                    "Pozisyon bütçesi varsa toplam pozisyon bütçesi girilmelidir."
                );
            }

            // Pozisyon bütçesi yoksa eski bütçe değeri temizlenir.
            if (dto.PozisyonButcesiVarMi == false)
            {
                dto.TotalPozisyonButcesi = null;
            }

            // Çalışma izin belge türü seçilmişse kayıt mevcut olmalıdır.
            if (dto.CalismaIzinBelgeTuruId.HasValue)
            {
                var belgeTuruVarMi = await _context.CalismaIzinBelgeTurleri
                    .AnyAsync(x => x.Id == dto.CalismaIzinBelgeTuruId.Value);

                if (!belgeTuruVarMi)
                {
                    return ServiceResponse<bool>.FailureResult(
                        "Seçilen çalışma izin belge türü bulunamadı."
                    );
                }
            }

            _mapper.Map(dto, entity);

            await _context.SaveChangesAsync();

            return ServiceResponse<bool>.SuccessResult(
                true,
                "Görev atama bilgileri başarıyla güncellendi."
            );
        }


        public async Task<ServiceResponse<GorevAtamaDetayListDto>> GetByMasterBasvuruIdAsync(int masterBasvuruId)
        {
            var personelId = await _context.MasterBasvurular
                .Where(x => x.Id == masterBasvuruId)
                .Select(x => x.PersonelId)
                .FirstOrDefaultAsync();

            if (personelId == 0)
                return ServiceResponse<GorevAtamaDetayListDto>.FailureResult("Bu başvuruya ait bir personel kaydı bulunamadı.");

            var entity = await _context.GorevAtamaDetaylari
                .Include(x => x.Personel).ThenInclude(p => p!.KisiselBilgiler)
                .Include(x => x.MasterDepartman)
                .Include(x => x.Gorev).ThenInclude(g => g!.MasterGorev)
                .Include(x => x.PanelKullanici)
                .Include(x => x.CalismaIzinBelgeTuru)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.PersonelId == personelId);

            if (entity == null)
                return ServiceResponse<GorevAtamaDetayListDto>.FailureResult("Bu başvuru için henüz görev ataması yapılmamış.");

            var dto = _mapper.Map<GorevAtamaDetayListDto>(entity);
            return ServiceResponse<GorevAtamaDetayListDto>.SuccessResult(dto);
        }
    }
}