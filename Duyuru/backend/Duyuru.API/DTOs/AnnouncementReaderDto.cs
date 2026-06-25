using System;

namespace Duyuru.API.DTOs
{
    public class AnnouncementReaderDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; }
        public string Role { get; set; }
        public DateTime ReadAt { get; set; }
    }
}
