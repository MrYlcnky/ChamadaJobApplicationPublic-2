using AutoMapper;
using IsBasvuru.Domain.DTOs.AdminDtos;
using IsBasvuru.Domain.DTOs.AdminDtos.PanelKullaniciDtos;
using IsBasvuru.Domain.Entities.AdminBilgileri;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Domain.Wrappers;
using IsBasvuru.Infrastructure.Tools;
using IsBasvuru.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IsBasvuru.Infrastructure.Services
{
    public class PanelKullaniciService : IPanelKullaniciService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;

        // Login işlemi AuthService'e taşındığı için IConfiguration'ı buradan kaldırdık.
        public PanelKullaniciService(IsBasvuruContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<PanelKullaniciListDto>> CreateAsync( PanelKullaniciCreateDto dto)
        {
            var scopeError = await ValidateKullaniciScopeAsync(
                dto.RolId,
                dto.SubeId,
                dto.MasterAlanId,
                dto.MasterDepartmanId);

            if (!string.IsNullOrWhiteSpace(scopeError))
            {
                return ServiceResponse<PanelKullaniciListDto>
                    .FailureResult(scopeError);
            }

            // 1. Kullanıcı adı
            string normalizedUsername = dto.KullaniciAdi?.Trim() ?? string.Empty;

            // 2. Aynı kullanıcı adı kontrolü
            var exist = await _context.PanelKullanicilari .AnyAsync(x => x.KullaniciAdi == normalizedUsername);

            if (exist)
            {
                return ServiceResponse<PanelKullaniciListDto>
                    .FailureResult(
                        "Bu kullanıcı adı zaten kullanılıyor.");
            }

            var entity = _mapper.Map<PanelKullanici>(dto);

            // 3. Temel bilgiler
            entity.KullaniciAdi = normalizedUsername;
            entity.Adi = dto.Adi?.Trim()!;
            entity.Soyadi = dto.Soyadi?.Trim()!;

            // 4. Şifre
            entity.KullaniciSifre =
                BCrypt.Net.BCrypt.HashPassword(
                    dto.KullaniciSifre);

            // 5. Tarih
            entity.SonGirisTarihi = DateTime.Now;

            await _context.PanelKullanicilari
                .AddAsync(entity);

            await _context.SaveChangesAsync();

            var responseDto = _mapper.Map<PanelKullaniciListDto>(entity);

            return ServiceResponse<PanelKullaniciListDto> .SuccessResult( responseDto, "Kullanıcı başarıyla oluşturuldu.");
        }

        public async Task<ServiceResponse<bool>> UpdateAsync( PanelKullaniciUpdateDto dto)
        {
            var entity = await _context.PanelKullanicilari
                .FindAsync(dto.Id);

            if (entity == null)
            {
                return ServiceResponse<bool>
                    .FailureResult(
                        "Kullanıcı bulunamadı.");
            }

            var scopeError = await ValidateKullaniciScopeAsync(
                dto.RolId,
                dto.SubeId,
                dto.MasterAlanId,
                dto.MasterDepartmanId);

            if (!string.IsNullOrWhiteSpace(scopeError))
            {
                return ServiceResponse<bool>
                    .FailureResult(scopeError);
            }

            // 1. Kullanıcı adı
            string normalizedUsername =
                dto.KullaniciAdi?.Trim() ?? string.Empty;

            // 2. Kullanıcı adı çakışma kontrolü
            if (entity.KullaniciAdi != normalizedUsername)
            {
                bool isTaken = await _context.PanelKullanicilari
                    .AnyAsync(x =>
                        x.KullaniciAdi == normalizedUsername &&
                        x.Id != dto.Id);

                if (isTaken)
                {
                    return ServiceResponse<bool> .FailureResult( $"'{normalizedUsername}' kullanıcı adı zaten başkası tarafından kullanılıyor.");
                }
            }

            // 3. Temel bilgiler
            entity.Adi = dto.Adi?.Trim()!;
            entity.Soyadi = dto.Soyadi?.Trim()!;
            entity.KullaniciAdi = normalizedUsername;

            // 4. Yetki / scope
            entity.RolId = dto.RolId;
            entity.SubeId = dto.SubeId;
            entity.MasterAlanId = dto.MasterAlanId;
            entity.MasterDepartmanId = dto.MasterDepartmanId;

            // 5. Şifre
            if (!string.IsNullOrWhiteSpace(
                dto.YeniKullaniciSifre))
            {
                entity.KullaniciSifre =
                    BCrypt.Net.BCrypt.HashPassword(
                        dto.YeniKullaniciSifre);
            }

            await _context.SaveChangesAsync();

            return ServiceResponse<bool> .SuccessResult( true, "Kullanıcı başarıyla güncellendi.");
        }

        public async Task<ServiceResponse<List<PanelKullaniciListDto>>> GetAllAsync()
        {
            var list = await _context.PanelKullanicilari
                .AsNoTracking()
                .Include(x => x.Rol)
                .Include(x => x.Sube)
                .Include(x => x.MasterDepartman) // Yeni Master Yapı
                .Include(x => x.MasterAlan)      // Yeni Master Yapı
                .OrderByDescending(x => x.Id)
                .ToListAsync();

            var map = _mapper.Map<List<PanelKullaniciListDto>>(list);
            return ServiceResponse<List<PanelKullaniciListDto>>.SuccessResult(map);
        }

        public async Task<ServiceResponse<PanelKullaniciListDto>> GetByIdAsync(int id)
        {
            var entity = await _context.PanelKullanicilari
                .AsNoTracking()
                .Include(x => x.Rol)
                .Include(x => x.Sube)
                .Include(x => x.MasterDepartman) // Yeni Master Yapı
                .Include(x => x.MasterAlan)      // Yeni Master Yapı
                .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null)
                return ServiceResponse<PanelKullaniciListDto>.FailureResult("Kullanıcı bulunamadı.");

            var map = _mapper.Map<PanelKullaniciListDto>(entity);
            return ServiceResponse<PanelKullaniciListDto>.SuccessResult(map);
        }

       

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            var entity = await _context.PanelKullanicilari.FindAsync(id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Kullanıcı bulunamadı.");

            _context.PanelKullanicilari.Remove(entity);
            await _context.SaveChangesAsync();

            return ServiceResponse<bool>.SuccessResult(true, "Kullanıcı silindi.");
        }


        public async Task<ServiceResponse<bool>> ChangePasswordAsync(PanelKullaniciPasswordChangeDto dto)
        {
            // 1. Yeni şifreler uyuşuyor mu? (Frontend'de de kontrol ediliyor ama backend'de de şart)
            if (dto.YeniSifre != dto.YeniSifreTekrar)
                return ServiceResponse<bool>.FailureResult("Yeni şifreler birbiriyle uyuşmuyor.");

            // 2. Kullanıcıyı bul
            var entity = await _context.PanelKullanicilari.FindAsync(dto.Id);
            if (entity == null)
                return ServiceResponse<bool>.FailureResult("Kullanıcı bulunamadı.");

            // 3. ESKİ ŞİFRE KONTROLÜ (Kritik Nokta)
            // Veritabanındaki hash ile gönderilen eski şifreyi kıyasla
            bool isOldPasswordCorrect = BCrypt.Net.BCrypt.Verify(dto.EskiSifre, entity.KullaniciSifre);

            if (!isOldPasswordCorrect)
                return ServiceResponse<bool>.FailureResult("Eski şifreniz hatalı. Lütfen kontrol ediniz.");

            // 4. Yeni şifreyi Hash'le ve Kaydet
            entity.KullaniciSifre = BCrypt.Net.BCrypt.HashPassword(dto.YeniSifre);

            _context.PanelKullanicilari.Update(entity);
            await _context.SaveChangesAsync();

            return ServiceResponse<bool>.SuccessResult(true, "Şifreniz başarıyla değiştirildi.");
        }


        private async Task<string?> ValidateKullaniciScopeAsync( int rolId, int? subeId, int? masterAlanId, int? masterDepartmanId)
        {
            if (!await _context.Roller.AnyAsync(x => x.Id == rolId))
                return "Geçersiz rol seçimi.";

            if (subeId.HasValue &&
                !await _context.Subeler.AnyAsync(x => x.Id == subeId.Value))
            {
                return "Geçersiz şube seçimi.";
            }

            if (masterAlanId.HasValue &&
                !await _context.MasterAlanlar.AnyAsync(
                    x => x.Id == masterAlanId.Value))
            {
                return "Geçersiz alan seçimi.";
            }

            if (masterDepartmanId.HasValue &&
                !await _context.MasterDepartmanlar.AnyAsync(
                    x => x.Id == masterDepartmanId.Value))
            {
                return "Geçersiz departman seçimi.";
            }

            if (subeId.HasValue && masterAlanId.HasValue)
            {
                var alanUyumluMu =
                    await _context.SubeAlanlar.AnyAsync(x =>
                        x.SubeId == subeId.Value &&
                        x.MasterAlanId == masterAlanId.Value);

                if (!alanUyumluMu)
                    return "Seçilen alan bu şubeye ait değildir.";
            }

            if (masterDepartmanId.HasValue)
            {
                var query = _context.Departmanlar
                    .Include(x => x.SubeAlan)
                    .Where(x =>
                        x.MasterDepartmanId ==
                        masterDepartmanId.Value);

                if (subeId.HasValue)
                {
                    query = query.Where(x =>
                        x.SubeAlan != null &&
                        x.SubeAlan.SubeId == subeId.Value);
                }

                if (masterAlanId.HasValue)
                {
                    query = query.Where(x =>
                        x.SubeAlan != null &&
                        x.SubeAlan.MasterAlanId ==
                        masterAlanId.Value);
                }

                if (!await query.AnyAsync())
                {
                    return
                        "Seçilen departman şube/alan bilgileriyle uyumlu değildir.";
                }
            }

            // Departman Müdürü departmansız bırakılamaz.
            if (rolId == 6 && !masterDepartmanId.HasValue)
            {
                return
                    "Departman Müdürü için departman seçimi zorunludur.";
            }

            return null;
        }
    }
}