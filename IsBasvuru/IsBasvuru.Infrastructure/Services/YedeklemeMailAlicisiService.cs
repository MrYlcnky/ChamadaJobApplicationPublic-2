using IsBasvuru.Domain.DTOs.YedeklemeDtos.YedeklemeMailAlicisiDtos;
using IsBasvuru.Domain.Entities.Yedekleme;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Domain.Wrappers;
using IsBasvuru.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace IsBasvuru.Infrastructure.Services
{
    public class YedeklemeMailAlicisiService : IYedeklemeMailAlicisiService
    {
        private readonly IsBasvuruContext _context;

        public YedeklemeMailAlicisiService(IsBasvuruContext context)
        {
            _context = context;
        }

        public async Task<ServiceResponse<List<YedeklemeMailAlicisiResponseDto>>> GetAllAsync()
        {
            var list = await _context.YedeklemeMailAlicilari
                .AsNoTracking()
                .OrderBy(x => x.SiraNo)
                .ThenBy(x => x.Id)
                .Select(x => new YedeklemeMailAlicisiResponseDto
                {
                    Id = x.Id,
                    Eposta = x.Eposta,
                    AktifMi = x.AktifMi,
                    SiraNo = x.SiraNo
                })
                .ToListAsync();

            return ServiceResponse<List<YedeklemeMailAlicisiResponseDto>>.SuccessResult(list);
        }

        public async Task<ServiceResponse<List<YedeklemeMailAlicisiResponseDto>>> GetAktiflerAsync()
        {
            var list = await _context.YedeklemeMailAlicilari
                .AsNoTracking()
                .Where(x => x.AktifMi)
                .OrderBy(x => x.SiraNo)
                .ThenBy(x => x.Id)
                .Select(x => new YedeklemeMailAlicisiResponseDto
                {
                    Id = x.Id,
                    Eposta = x.Eposta,
                    AktifMi = x.AktifMi,
                    SiraNo = x.SiraNo
                })
                .ToListAsync();

            return ServiceResponse<List<YedeklemeMailAlicisiResponseDto>>.SuccessResult(list);
        }

        public async Task<ServiceResponse<YedeklemeMailAlicisiResponseDto>> GetByIdAsync(int id)
        {
            var entity = await _context.YedeklemeMailAlicilari
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null)
                return ServiceResponse<YedeklemeMailAlicisiResponseDto>.FailureResult("Mail alıcısı bulunamadı.");

            var dto = new YedeklemeMailAlicisiResponseDto
            {
                Id = entity.Id,
                Eposta = entity.Eposta,
                AktifMi = entity.AktifMi,
                SiraNo = entity.SiraNo
            };

            return ServiceResponse<YedeklemeMailAlicisiResponseDto>.SuccessResult(dto);
        }

        public async Task<ServiceResponse<YedeklemeMailAlicisiResponseDto>> CreateAsync(YedeklemeMailAlicisiCreateDto dto)
        {
            var eposta = dto.Eposta.Trim().ToLowerInvariant();

            if (string.IsNullOrWhiteSpace(eposta))
                return ServiceResponse<YedeklemeMailAlicisiResponseDto>.FailureResult("E-posta adresi boş olamaz.");

            if (dto.SiraNo < 0)
                return ServiceResponse<YedeklemeMailAlicisiResponseDto>.FailureResult("Sıra numarası 0'dan küçük olamaz.");
            var siraNoKullaniliyorMu =
                await _context.YedeklemeMailAlicilari
                    .AnyAsync(x => x.SiraNo == dto.SiraNo);

            if (siraNoKullaniliyorMu)
            {
                return ServiceResponse<YedeklemeMailAlicisiResponseDto>
                    .FailureResult(
                        $"{dto.SiraNo} sıra numarası başka bir mail alıcısı tarafından kullanılıyor.");
            }

            bool mevcutMu = await _context.YedeklemeMailAlicilari
                .AnyAsync(x => x.Eposta == eposta);

            if (mevcutMu)
                return ServiceResponse<YedeklemeMailAlicisiResponseDto>.FailureResult("Bu e-posta adresi zaten kayıtlı.");

            var entity = new YedeklemeMailAlicisi
            {
                Eposta = eposta,
                AktifMi = dto.AktifMi,
                SiraNo = dto.SiraNo
            };

            await _context.YedeklemeMailAlicilari.AddAsync(entity);
            await _context.SaveChangesAsync();

            var response = new YedeklemeMailAlicisiResponseDto
            {
                Id = entity.Id,
                Eposta = entity.Eposta,
                AktifMi = entity.AktifMi,
                SiraNo = entity.SiraNo
            };

            return ServiceResponse<YedeklemeMailAlicisiResponseDto>.SuccessResult(response);
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(YedeklemeMailAlicisiUpdateDto dto)
        {
            var entity = await _context.YedeklemeMailAlicilari.FindAsync(dto.Id);

            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Mail alıcısı bulunamadı.");

            var eposta = dto.Eposta.Trim().ToLowerInvariant();

            if (string.IsNullOrWhiteSpace(eposta))
                return ServiceResponse<bool>.FailureResult("E-posta adresi boş olamaz.");

            if (dto.SiraNo < 0)
                return ServiceResponse<bool>.FailureResult("Sıra numarası 0'dan küçük olamaz.");

            var siraNoKullaniliyorMu =
                await _context.YedeklemeMailAlicilari
                    .AnyAsync(x =>
                        x.SiraNo == dto.SiraNo &&
                        x.Id != dto.Id);

            if (siraNoKullaniliyorMu)
            {
                return ServiceResponse<bool>
                    .FailureResult(
                        $"{dto.SiraNo} sıra numarası başka bir mail alıcısı tarafından kullanılıyor.");
            }


            bool mevcutMu = await _context.YedeklemeMailAlicilari
                .AnyAsync(x => x.Eposta == eposta && x.Id != dto.Id);

            if (mevcutMu)
                return ServiceResponse<bool>.FailureResult("Bu e-posta adresi başka bir kayıtta kullanılıyor.");

            entity.Eposta = eposta;
            entity.AktifMi = dto.AktifMi;
            entity.SiraNo = dto.SiraNo;

            await _context.SaveChangesAsync();

            return ServiceResponse<bool>.SuccessResult(true);
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            var entity = await _context.YedeklemeMailAlicilari.FindAsync(id);

            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Mail alıcısı bulunamadı.");

            _context.YedeklemeMailAlicilari.Remove(entity);
            await _context.SaveChangesAsync();

            return ServiceResponse<bool>.SuccessResult(true);
        }
    }
}