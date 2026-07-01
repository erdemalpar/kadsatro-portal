using System;

namespace Duyuru.API.Models
{
    public class Announcement
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        
        // Popup format type: Glassmorphism, Cinematic, Story, Toast
        public string Format { get; set; } = "Glassmorphism";
        
        // Container width: Standart, Geniş, Tam Ekran
        public string LayoutWidth { get; set; } = "Standart";
        
        public AnnouncementStatus Status { get; set; } = AnnouncementStatus.PendingEditor;
        
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DisplayFrequency Frequency { get; set; } = DisplayFrequency.Once;
        
        // Once sıklığında gösterim süresi (dakika). Null ise manuel kapatma gerekir.
        public int? OnceDurationMinutes { get; set; }

        // Başlık Özelleştirmeleri
        public string? TitleFontFamily { get; set; }
        public string? TitleFontSize { get; set; }
        public bool TitleIsBold { get; set; } = false;
        public string? TitleColor { get; set; }

        // Yayına girme tekrarlama sıklığı (Örn: None, Yearly, Monthly)
        public string RepeatInterval { get; set; } = "None";


        public string? RejectionReason { get; set; }
        
        // Versiyon Takibi (Geri çekip tekrar yayınlama vb durumlarda artar)
        public int Version { get; set; } = 1;

        
        public int CategoryId { get; set; }
        public Category? Category { get; set; }
        
        public int CreatedById { get; set; }
        public User? CreatedBy { get; set; }
        
        public int ViewCount { get; set; } = 0;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PublishedAt { get; set; }
    }
}
