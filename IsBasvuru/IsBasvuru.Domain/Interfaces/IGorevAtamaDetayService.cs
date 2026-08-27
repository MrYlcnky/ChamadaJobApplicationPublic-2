using IsBasvuru.Domain.DTOs.SirketYapisiDtos.GorevAtamaDetayDtos;
using IsBasvuru.Domain.Wrappers;

namespace IsBasvuru.Domain.Interfaces
{
    public interface IGorevAtamaDetayService
    {
        Task<ServiceResponse<GorevAtamaDetayListDto>> GetByPersonelIdAsync(int personelId);

        Task<ServiceResponse<int>> CreateAsync(GorevAtamaDetayCreateDto dto);

        Task<ServiceResponse<bool>> UpdateAsync(GorevAtamaDetayUpdateDto dto);

        Task<ServiceResponse<GorevAtamaDetayListDto>> GetByMasterBasvuruIdAsync(int masterBasvuruId);
    }
}