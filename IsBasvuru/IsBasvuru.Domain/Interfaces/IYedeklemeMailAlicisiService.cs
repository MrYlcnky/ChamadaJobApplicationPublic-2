using IsBasvuru.Domain.DTOs.YedeklemeDtos.YedeklemeMailAlicisiDtos;
using IsBasvuru.Domain.Wrappers;

namespace IsBasvuru.Domain.Interfaces
{
    public interface IYedeklemeMailAlicisiService
    {
        Task<ServiceResponse<List<YedeklemeMailAlicisiResponseDto>>> GetAllAsync();

        Task<ServiceResponse<List<YedeklemeMailAlicisiResponseDto>>> GetAktiflerAsync();

        Task<ServiceResponse<YedeklemeMailAlicisiResponseDto>> GetByIdAsync(int id);

        Task<ServiceResponse<YedeklemeMailAlicisiResponseDto>> CreateAsync(YedeklemeMailAlicisiCreateDto dto);

        Task<ServiceResponse<bool>> UpdateAsync(YedeklemeMailAlicisiUpdateDto dto);

        Task<ServiceResponse<bool>> DeleteAsync(int id);
    }
}