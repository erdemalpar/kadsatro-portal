using Duyuru.API.Models;

namespace Duyuru.API.DTOs
{
    public record CreateAnnouncementDto(
        string Title,
        string Content,
        string Format,
        int CategoryId,
        int CreatedById,
        DateTime? StartDate,
        DateTime? EndDate,
        string Frequency,
        int? OnceDurationMinutes,
        string? LayoutWidth
    );

    public record UpdateAnnouncementStatusDto(
        AnnouncementStatus Status,
        string? RejectionReason
    );

    public record UpdateAnnouncementDto(
        string Title,
        string Content,
        string Format,
        int CategoryId,
        DateTime? StartDate,
        DateTime? EndDate,
        string Frequency,
        int? OnceDurationMinutes,
        string? LayoutWidth
    );

    public record DashboardStatsDto(
        int PublishedCount,
        int PendingCount,
        int RejectedCount,
        int TotalViews
    );

    public record ChartDataDto(
        List<string> Labels,
        List<int> Views,
        List<int> Interactions
    );

    public record AnnouncementResponseDto(
        int Id,
        string Title,
        string Content,
        string Format,
        string Status,
        string? RejectionReason,
        string CategoryName,
        string CreatedByName,
        int ViewCount,
        DateTime CreatedAt,
        DateTime? PublishedAt,
        DateTime? StartDate,
        DateTime? EndDate,
        string Frequency,
        int? OnceDurationMinutes,
        string? LayoutWidth
    );
}
