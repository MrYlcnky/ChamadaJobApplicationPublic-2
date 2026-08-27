namespace IsBasvuru.Domain.Interfaces
{
    public interface IRecaptchaService
    {
        Task<bool> VerifyAsync(string? token);
        Task<bool> VerifyAdminAsync(string? token);
    }
}