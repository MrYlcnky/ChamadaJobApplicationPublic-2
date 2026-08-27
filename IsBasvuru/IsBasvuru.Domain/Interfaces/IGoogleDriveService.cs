using IsBasvuru.Domain.DTOs.YedeklemeDtos;

namespace IsBasvuru.Domain.Interfaces
{
    public interface IGoogleDriveService
    {
        Task<GoogleDriveYuklemeSonucuDto> DosyaYukleAsync(
            string dosyaYolu,
            string dosyaAdi);
    }
}