using Duyuru.API.DTOs;
using Duyuru.API.Models;

namespace Duyuru.API.Services
{
    public interface IAnnouncementService
    {
        Task<IEnumerable<AnnouncementResponseDto>> GetAnnouncementsByRoleAsync(Role userRole);
        Task<AnnouncementResponseDto> CreateAnnouncementAsync(CreateAnnouncementDto dto);
        Task<AnnouncementResponseDto?> UpdateStatusAsync(int id, UpdateAnnouncementStatusDto dto, Role userRole);
        Task<AnnouncementResponseDto?> UpdateAnnouncementAsync(int id, UpdateAnnouncementDto dto, Role userRole);
        Task<bool> DeleteAnnouncementAsync(int id, Role userRole);
        Task<DashboardStatsDto> GetDashboardStatsAsync();
        Task<ChartDataDto> GetChartDataAsync(string period);
        
        Task<IEnumerable<AnnouncementResponseDto>> GetUnreadAnnouncementsAsync(int userId);
        Task<bool> MarkAsReadAsync(int announcementId, int userId);
        Task<IEnumerable<AnnouncementReaderDto>> GetReadersAsync(int announcementId);
    }
}
