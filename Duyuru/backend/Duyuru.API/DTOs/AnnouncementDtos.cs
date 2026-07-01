using Duyuru.API.Models;

namespace Duyuru.API.DTOs
{
    public record CreateAnnouncementDto
    {
        public string Title { get; init; } = string.Empty;
        public string Content { get; init; } = string.Empty;
        public string Format { get; init; } = "Glassmorphism";
        public int CategoryId { get; init; }
        public int CreatedById { get; init; }
        public DateTime? StartDate { get; init; }
        public DateTime? EndDate { get; init; }
        public string Frequency { get; init; } = "Once";
        public int? OnceDurationMinutes { get; init; }
        public string? LayoutWidth { get; init; }
        public string? TitleFontFamily { get; init; }
        public string? TitleFontSize { get; init; }
        public bool TitleIsBold { get; init; }
        public string? TitleColor { get; init; }
        public string RepeatInterval { get; init; } = "None";
    }

    public record UpdateAnnouncementStatusDto(
        AnnouncementStatus Status,
        string? RejectionReason
    );

    public record UpdateAnnouncementDto
    {
        public string Title { get; init; } = string.Empty;
        public string Content { get; init; } = string.Empty;
        public string Format { get; init; } = "Glassmorphism";
        public int CategoryId { get; init; }
        public DateTime? StartDate { get; init; }
        public DateTime? EndDate { get; init; }
        public string Frequency { get; init; } = "Once";
        public int? OnceDurationMinutes { get; init; }
        public string? LayoutWidth { get; init; }
        public string? TitleFontFamily { get; init; }
        public string? TitleFontSize { get; init; }
        public bool TitleIsBold { get; init; }
        public string? TitleColor { get; init; }
        public string RepeatInterval { get; init; } = "None";
    }

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

    public record AnnouncementResponseDto
    {
        public int Id { get; init; }
        public string Title { get; init; } = string.Empty;
        public string Content { get; init; } = string.Empty;
        public string Format { get; init; } = string.Empty;
        public string Status { get; init; } = string.Empty;
        public string? RejectionReason { get; init; }
        public string CategoryName { get; init; } = string.Empty;
        public string CreatedByName { get; init; } = string.Empty;
        public int ViewCount { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime? PublishedAt { get; init; }
        public DateTime? StartDate { get; init; }
        public DateTime? EndDate { get; init; }
        public string Frequency { get; init; } = string.Empty;
        public int? OnceDurationMinutes { get; init; }
        public string? LayoutWidth { get; init; }
        public string? TitleFontFamily { get; init; }
        public string? TitleFontSize { get; init; }
        public bool TitleIsBold { get; init; }
        public string? TitleColor { get; init; }
        public string RepeatInterval { get; init; } = "None";
    }
}
