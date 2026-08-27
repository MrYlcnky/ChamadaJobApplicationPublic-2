using AutoMapper;
using IsBasvuru.Domain.DTOs.SirketYapisiDtos.CalismaIzinBelgeTuruDtos;
using IsBasvuru.Domain.Entities.SirketYapisi;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Domain.Wrappers;
using IsBasvuru.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace IsBasvuru.Infrastructure.Services
{
    public class CalismaIzinBelgeTuruService : ICalismaIzinBelgeTuruService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;

        public CalismaIzinBelgeTuruService(
            IsBasvuruContext context,
            IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<List<CalismaIzinBelgeTuruListDto>>>GetAllAsync()
        {
            var entities = await _context.CalismaIzinBelgeTurleri
                .AsNoTracking()
                .OrderBy(x => x.BelgeAdi)
                .ToListAsync();

            var list = _mapper.Map<List<CalismaIzinBelgeTuruListDto>>(entities);

            return ServiceResponse<List<CalismaIzinBelgeTuruListDto>>
                .SuccessResult(list);
        }

        public async Task<ServiceResponse<CalismaIzinBelgeTuruListDto>>  GetByIdAsync(int id)
        {
            var entity = await _context.CalismaIzinBelgeTurleri
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null)
            {
                return ServiceResponse<CalismaIzinBelgeTuruListDto>
                    .FailureResult("Çalışma izin belge türü bulunamadı.");
            }

            var dto = _mapper.Map<CalismaIzinBelgeTuruListDto>(entity);

            return ServiceResponse<CalismaIzinBelgeTuruListDto>
                .SuccessResult(dto);
        }

        public async Task<ServiceResponse<CalismaIzinBelgeTuruListDto>>CreateAsync(CalismaIzinBelgeTuruCreateDto dto)
        {
            var belgeAdi = dto.BelgeAdi?.Trim();

            if (string.IsNullOrWhiteSpace(belgeAdi))
            {
                return ServiceResponse<CalismaIzinBelgeTuruListDto>
                    .FailureResult("Belge adı boş bırakılamaz.");
            }

            var kayitVarMi = await _context.CalismaIzinBelgeTurleri
                .AnyAsync(x => x.BelgeAdi == belgeAdi);

            if (kayitVarMi)
            {
                return ServiceResponse<CalismaIzinBelgeTuruListDto>
                    .FailureResult(
                        $"'{belgeAdi}' isimli çalışma izin belge türü zaten kayıtlı."
                    );
            }

            var entity = _mapper.Map<CalismaIzinBelgeTuru>(dto);
            entity.BelgeAdi = belgeAdi;

            await _context.CalismaIzinBelgeTurleri.AddAsync(entity);
            await _context.SaveChangesAsync();

            var result = _mapper.Map<CalismaIzinBelgeTuruListDto>(entity);

            return ServiceResponse<CalismaIzinBelgeTuruListDto>
                .SuccessResult(
                    result,
                    "Çalışma izin belge türü başarıyla eklendi."
                );
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(CalismaIzinBelgeTuruUpdateDto dto)
        {
            var entity = await _context.CalismaIzinBelgeTurleri
                .FirstOrDefaultAsync(x => x.Id == dto.Id);

            if (entity == null)
            {
                return ServiceResponse<bool>
                    .FailureResult("Güncellenecek belge türü bulunamadı.");
            }

            var belgeAdi = dto.BelgeAdi?.Trim();

            if (string.IsNullOrWhiteSpace(belgeAdi))
            {
                return ServiceResponse<bool>
                    .FailureResult("Belge adı boş bırakılamaz.");
            }

            var ayniIsimdeKayitVarMi =
                await _context.CalismaIzinBelgeTurleri.AnyAsync(
                    x => x.BelgeAdi == belgeAdi && x.Id != dto.Id
                );

            if (ayniIsimdeKayitVarMi)
            {
                return ServiceResponse<bool>
                    .FailureResult(
                        $"'{belgeAdi}' isimli başka bir çalışma izin belge türü zaten kayıtlı."
                    );
            }

            entity.BelgeAdi = belgeAdi;

            await _context.SaveChangesAsync();

            return ServiceResponse<bool>
                .SuccessResult(
                    true,
                    "Çalışma izin belge türü başarıyla güncellendi."
                );
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            var entity = await _context.CalismaIzinBelgeTurleri
                .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null)
            {
                return ServiceResponse<bool>
                    .FailureResult("Silinecek çalışma izin belge türü bulunamadı.");
            }

            var kullaniliyorMu = await _context.GorevAtamaDetaylari
                .AnyAsync(x => x.CalismaIzinBelgeTuruId == id);

            if (kullaniliyorMu)
            {
                return ServiceResponse<bool>.FailureResult(
                    "Bu çalışma izin belge türü bir veya daha fazla görev atama kaydında kullanıldığı için silinemez."
                );
            }

            _context.CalismaIzinBelgeTurleri.Remove(entity);
            await _context.SaveChangesAsync();

            return ServiceResponse<bool>.SuccessResult(
                true,
                "Çalışma izin belge türü başarıyla silindi."
            );
        }
    }
}