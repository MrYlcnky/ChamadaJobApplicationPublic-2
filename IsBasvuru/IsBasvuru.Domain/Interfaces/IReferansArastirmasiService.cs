using IsBasvuru.Domain.DTOs.ReferansArastirmasiDtos;
using IsBasvuru.Domain.Wrappers;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IsBasvuru.Domain.Interfaces
{
    public interface IReferansArastirmasiService
    {
        Task<ServiceResponse<List<ReferansArastirmasiListDto>>> GetByMasterBasvuruIdAsync(int masterBasvuruId);

        Task<ServiceResponse<ReferansArastirmasiListDto>> GetByIdAsync(int id);

        Task<ServiceResponse<ReferansArastirmasiListDto>> CreateAsync(ReferansArastirmasiCreateDto dto);

        Task<ServiceResponse<bool>> UpdateAsync(ReferansArastirmasiUpdateDto dto);

        Task<ServiceResponse<bool>> DeleteAsync(int id);
    }
}