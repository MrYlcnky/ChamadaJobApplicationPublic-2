using AutoMapper;
using IsBasvuru.Domain.DTOs.ReferansArastirmasiDtos;
using IsBasvuru.Domain.Entities;
using IsBasvuru.Domain.Interfaces;
using IsBasvuru.Domain.Wrappers;
using IsBasvuru.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IsBasvuru.Infrastructure.Services
{
    public class ReferansArastirmasiService : IReferansArastirmasiService
    {
        private readonly IsBasvuruContext _context;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public ReferansArastirmasiService(IsBasvuruContext context, IMapper mapper, ICurrentUserService currentUserService)
        {
            _context = context;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<ServiceResponse<List<ReferansArastirmasiListDto>>> GetByMasterBasvuruIdAsync(int masterBasvuruId)
        {
            var referanslar = await _context.ReferansArastirmalari
                .Include(r => r.GorusmeyiYapanKullanici)
                .Where(r => r.MasterBasvuruId == masterBasvuruId)
                .OrderByDescending(r => r.GorusmeTarihi)
                .ToListAsync();

            var dtoList = _mapper.Map<List<ReferansArastirmasiListDto>>(referanslar);
            return ServiceResponse<List<ReferansArastirmasiListDto>>.SuccessResult(dtoList);
        }

        public async Task<ServiceResponse<ReferansArastirmasiListDto>> GetByIdAsync(int id)
        {
            var referans = await _context.ReferansArastirmalari
                .Include(r => r.GorusmeyiYapanKullanici)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (referans == null)
                return ServiceResponse<ReferansArastirmasiListDto>.FailureResult("Referans kaydı bulunamadı.");

            var dto = _mapper.Map<ReferansArastirmasiListDto>(referans);
            return ServiceResponse<ReferansArastirmasiListDto>.SuccessResult(dto);
        }

        public async Task<ServiceResponse<ReferansArastirmasiListDto>> CreateAsync(ReferansArastirmasiCreateDto dto)
        {
            var referans = _mapper.Map<ReferansArastirmasi>(dto);

            referans.GorusmeyiYapanKullaniciId = _currentUserService.UserId;

            if (referans.GorusmeTarihi == default(DateTime))
            {
                referans.GorusmeTarihi = DateTime.Now;
            }

            await _context.ReferansArastirmalari.AddAsync(referans);
            await _context.SaveChangesAsync();

            var resultDto = _mapper.Map<ReferansArastirmasiListDto>(referans);
            return ServiceResponse<ReferansArastirmasiListDto>.SuccessResult(resultDto, "Referans araştırması başarıyla kaydedildi.");
        }

        public async Task<ServiceResponse<bool>> UpdateAsync(ReferansArastirmasiUpdateDto dto)
        {
            var referans = await _context.ReferansArastirmalari.FindAsync(dto.Id);

            if (referans == null)
                return ServiceResponse<bool>.FailureResult("Güncellenecek referans kaydı bulunamadı.");

            // Mevcut verinin üzerine DTO'dan gelen yeni verileri yazıyoruz (Tarih dahil)
            _mapper.Map(dto, referans);

            _context.ReferansArastirmalari.Update(referans);
            await _context.SaveChangesAsync();

            return ServiceResponse<bool>.SuccessResult(true, "Referans araştırması başarıyla güncellendi.");
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(int id)
        {
            var referans = await _context.ReferansArastirmalari.FindAsync(id);

            if (referans == null)
                return ServiceResponse<bool>.FailureResult("Silinecek referans kaydı bulunamadı.");

            _context.ReferansArastirmalari.Remove(referans);
            await _context.SaveChangesAsync();

            return ServiceResponse<bool>.SuccessResult(true, "Referans araştırması başarıyla silindi.");
        }
    }
}