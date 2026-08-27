using IsBasvuru.Domain.DTOs.PersonelDtos;
using IsBasvuru.Domain.DTOs.Shared;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Infrastructure.Services;
using IsBasvuru.WebAPI.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[Route("api/[controller]")]
[ApiController]
public class PersonelController(IPersonelService service, IImageService imageService) : BaseController
{
    private readonly IPersonelService _service = service;
    private readonly IImageService _imageService = imageService;

   /*
    [HttpGet("GetAll")]
    [Authorize(Roles = "SuperAdmin,Admin,IkAdmin")]
    public async Task<IActionResult> GetAll([FromQuery] PaginationFilter filter)
    {
        var response = await _service.GetAllAsync(filter);
        return Ok(response);
    }

    [HttpGet("GetById/{id}")]
    [Authorize(Roles = "SuperAdmin,Admin,IkAdmin")]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        var response = await _service.GetByIdAsync(id);
        return CreateActionResultInstance(response);
    }
   */

    [HttpPost("Create")]
    [AllowAnonymous]
    public async Task<IActionResult> Create([FromForm] PersonelCreateDto dto)
    {


        if (dto.KisiselBilgiler != null) dto.KisiselBilgiler.VesikalikFotograf = "";

        // Bütün işlemi (veritabanı + dosya yükleme) Servis tek başına yapacak
        var response = await _service.CreateAsync(dto);

        return CreateActionResultInstance(response);
    }

    [HttpPut("Update")]
    [Authorize(Roles = "BasvuruYapan")]
    public async Task<IActionResult> Update([FromForm] PersonelUpdateDto dto)
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;

        if (string.IsNullOrWhiteSpace(email))
            return Unauthorized("Başvuru doğrulaması bulunamadı.");

        var response = await _service.UpdateAsync(dto, email);
        return CreateActionResultInstance(response);
    }

    [HttpDelete("Delete/{id}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        var getResponse = await _service.GetByIdAsync(id);
        if (getResponse.Success && getResponse.Data?.KisiselBilgiler != null)
        {
            if (!string.IsNullOrEmpty(getResponse.Data.KisiselBilgiler.VesikalikFotograf))
                await _imageService.DeleteImageAsync(getResponse.Data.KisiselBilgiler.VesikalikFotograf, "personel-fotograflari");
        }

        var deleteResponse = await _service.DeleteAsync(id);
        return CreateActionResultInstance(deleteResponse);
    }

    [HttpGet("basvurumu-getir")]
    [Authorize(Roles = "BasvuruYapan")]
    public async Task<IActionResult> GetBasvurumuGetir()
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;

        if (string.IsNullOrWhiteSpace(email))
            return Unauthorized("Başvuru doğrulaması bulunamadı.");

        var response = await _service.GetByEmailAsync(email);
        return CreateActionResultInstance(response);
    }

    [HttpGet("OnayLoglari")]
     [Authorize(Roles = "SuperAdmin")] // Yetkilendirme açıksa burayı aktif edebilirsin
    public async Task<IActionResult> GetOnayLoglari()
    {
        var result = await _service.GetOnayLoglariAsync();
        return Ok(result);
    }
}