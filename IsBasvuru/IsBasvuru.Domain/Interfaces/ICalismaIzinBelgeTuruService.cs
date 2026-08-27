using IsBasvuru.Domain.DTOs.SirketYapisiDtos.CalismaIzinBelgeTuruDtos;
using IsBasvuru.Domain.Wrappers;

namespace IsBasvuru.Domain.Interfaces
{
    public interface ICalismaIzinBelgeTuruService
    {
        Task<ServiceResponse<List<CalismaIzinBelgeTuruListDto>>> GetAllAsync();

        Task<ServiceResponse<CalismaIzinBelgeTuruListDto>> GetByIdAsync(int id);

        Task<ServiceResponse<CalismaIzinBelgeTuruListDto>> CreateAsync(CalismaIzinBelgeTuruCreateDto dto);

        Task<ServiceResponse<bool>> UpdateAsync(CalismaIzinBelgeTuruUpdateDto dto);

        Task<ServiceResponse<bool>> DeleteAsync(int id);
    }
}