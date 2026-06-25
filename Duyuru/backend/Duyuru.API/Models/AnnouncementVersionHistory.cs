using System;

namespace Duyuru.API.Models
{
    public class AnnouncementVersionHistory
    {
        public int Id { get; set; }
        
        public int AnnouncementId { get; set; }
        public Announcement Announcement { get; set; } = null!;
        
        public int Version { get; set; }
        
        public DateTime PublishedAt { get; set; }
    }
}
