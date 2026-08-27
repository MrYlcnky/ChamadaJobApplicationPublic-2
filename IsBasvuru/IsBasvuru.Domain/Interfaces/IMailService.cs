using IsBasvuru.Domain.Wrappers;
using System.Threading.Tasks;

namespace IsBasvuru.Domain.Interfaces
{
    public interface IMailService
    {
        Task<ServiceResponse<bool>> DogrulamaKoduGonderAsync(string aliciEposta, string kod);

        Task<ServiceResponse<bool>> BasvuruAlindiMailiGonderAsync(string aliciEposta, string adSoyad);


        Task<ServiceResponse<bool>> OlumsuzGeriDonusMailiGonderAsync(string aliciEposta, string adSoyad);

        Task<ServiceResponse<bool>> YedeklemeMailiGonderAsync( List<string> alicilar, string driveLink, string zipDosyaAdi, string? sqlDosyaYolu, bool sqlDosyasiEklensinMi);
    }
}