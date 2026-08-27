using IsBasvuru.Domain.DTOs.BasvuruSevkDtos;
using IsBasvuru.Domain.DTOs.MasterBasvuruDtos;
using IsBasvuru.Domain.Wrappers;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IsBasvuru.Domain.Interfaces
{
    public interface IMasterBasvuruService
    {
        Task<ServiceResponse<MasterBasvuruListDto>> GetByIdAsync(int id, int roleId, int? subeId, int? departmanId, int? alanId);
        Task<ServiceResponse<List<MasterBasvuruListDto>>> GetAllAsync(int roleId, int? subeId, int? departmanId, int? alanId);
     
        Task<ServiceResponse<bool>> UpdateAsync(MasterBasvuruUpdateDto dto);
        Task<ServiceResponse<bool>> DeleteAsync(int id);
        Task<ServiceResponse<List<BasvuruBildirimDto>>> GetOnayBekleyenBildirimlerAsync(int roleId, int? subeId, int? departmanId, int? alanId);

        Task<ServiceResponse<bool>> SevkEtAsync(SevkEtRequestDto request, int? islemYapanSubeId);
        Task<ServiceResponse<bool>> DepartmanDegerlendirAsync(BasvuruSevkDegerlendirmeDto dto, int? subeId, int departmanId);
    }
}