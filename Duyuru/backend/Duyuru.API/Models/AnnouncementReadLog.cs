using System;

namespace Duyuru.API.Models
{
    public class AnnouncementReadLog
    {
        public int Id { get; set; }
        
        public int AnnouncementId { get; set; }
        public Announcement Announcement { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public DateTime ReadAt { get; set; } = DateTime.UtcNow;

        // Okunan duyurunun versiyonu (Böylece duyuru güncellendiğinde okunmamış sayılır)
        public int Version { get; set; } = 1;
    }
}
