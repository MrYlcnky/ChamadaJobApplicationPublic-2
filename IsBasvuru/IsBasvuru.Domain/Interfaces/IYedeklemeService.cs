using IsBasvuru.Domain.DTOs.YedeklemeDtos.YedeklemeKaydiDtos;
using IsBasvuru.Domain.Enums;
using IsBasvuru.Domain.Wrappers;

namespace IsBasvuru.Domain.Interfaces
{
    public interface IYedeklemeService
    {
        Task<ServiceResponse<List<YedeklemeKaydiResponseDto>>> GetAllAsync();

        Task<ServiceResponse<YedeklemeKaydiResponseDto>> GetByIdAsync(int id);

        Task<ServiceResponse<YedeklemeOzetDto>> GetSonBasariliAsync();

        Task<ServiceResponse<YedeklemeKaydiResponseDto>> OlusturAsync(
            YedeklemeTetiklemeTipi tetiklemeTipi,
            string? baslatanKullaniciAdi);
    }
}