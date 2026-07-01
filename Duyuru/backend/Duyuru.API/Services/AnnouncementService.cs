using Duyuru.API.Data;
using Duyuru.API.DTOs;
using Duyuru.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Duyuru.API.Hubs;
namespace Duyuru.API.Services
{
    public class AnnouncementService : IAnnouncementService
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<AnnouncementHub> _hubContext;

        public AnnouncementService(AppDbContext context, IHubContext<AnnouncementHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task<IEnumerable<AnnouncementResponseDto>> GetAnnouncementsByRoleAsync(Role userRole)
        {
            var query = _context.Announcements
                .Include(a => a.Category)
                .Include(a => a.CreatedBy)
                .AsQueryable();

            var editorStatuses = new[] { AnnouncementStatus.PendingEditor, AnnouncementStatus.PendingModerator, AnnouncementStatus.Rejected, AnnouncementStatus.Published, AnnouncementStatus.Withdrawn };
            var moderatorStatuses = new[] { AnnouncementStatus.PendingModerator, AnnouncementStatus.Rejected, AnnouncementStatus.Published, AnnouncementStatus.Withdrawn };

            var allAnnouncements = await query.OrderByDescending(a => a.CreatedAt).ToListAsync();

            // Rol tabanlı iş akışı filtrelemesi (Memory'de yapıyoruz, EF Core'un SQLite In-Memory translate bug'larından kaçınmak için)
            var filtered = userRole switch
            {
                Role.Admin => allAnnouncements, // Admin her şeyi görebilir
                Role.Editor => allAnnouncements.Where(a => editorStatuses.Contains(a.Status)),
                Role.Moderator => allAnnouncements.Where(a => moderatorStatuses.Contains(a.Status)),
                Role.User => allAnnouncements.Where(a => a.Status == AnnouncementStatus.Published),
                _ => Enumerable.Empty<Announcement>()
            };

            return filtered.Select(MapToDto);
        }

        public async Task<AnnouncementResponseDto> CreateAnnouncementAsync(CreateAnnouncementDto dto)
        {
            // Editör (Id=2) oluşturduğunda Moderatör onayına gider.
            // Admin (Id=1) veya Moderatör (Id=3) oluşturduğunda doğrudan yayınlanır.
            var initialStatus = (dto.CreatedById == 1 || dto.CreatedById == 3)
                ? AnnouncementStatus.Published
                : AnnouncementStatus.PendingModerator;

            var announcement = new Announcement
            {
                Title = dto.Title,
                Content = dto.Content,
                Format = dto.Format,
                CategoryId = dto.CategoryId,
                CreatedById = dto.CreatedById,
                Status = initialStatus,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Frequency = Enum.TryParse<DisplayFrequency>(dto.Frequency, true, out var parsedFreq) ? parsedFreq : DisplayFrequency.Once,
                OnceDurationMinutes = dto.OnceDurationMinutes,
                CreatedAt = DateTime.UtcNow,
                PublishedAt = initialStatus == AnnouncementStatus.Published ? DateTime.UtcNow : null
            };

            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();

            if (initialStatus == AnnouncementStatus.Published)
            {
                await _hubContext.Clients.All.SendAsync("ReceiveNewAnnouncement");
            }

            // Kategori ve CreatedBy verisini açıkça yükleyip dönüyoruz
            await _context.Entry(announcement).Reference(a => a.Category).LoadAsync();
            await _context.Entry(announcement).Reference(a => a.CreatedBy).LoadAsync();

            return MapToDto(announcement);
        }

        public async Task<AnnouncementResponseDto?> UpdateStatusAsync(int id, UpdateAnnouncementStatusDto dto, Role userRole)
        {
            var announcement = await _context.Announcements
                .Include(a => a.Category)
                .Include(a => a.CreatedBy)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (announcement == null) return null;

            // Kısıtlı iş akışı (Sadece ilgili roller onay/red yapabilir)
            bool isAuthorized = false;

            if (userRole == Role.Editor && announcement.Status == AnnouncementStatus.PendingEditor)
            {
                if (dto.Status == AnnouncementStatus.PendingModerator || dto.Status == AnnouncementStatus.Rejected)
                    isAuthorized = true;
            }
            else if (userRole == Role.Moderator && announcement.Status == AnnouncementStatus.PendingModerator)
            {
                if (dto.Status == AnnouncementStatus.Published || dto.Status == AnnouncementStatus.Rejected)
                    isAuthorized = true;
            }
            else if (userRole == Role.Admin)
            {
                isAuthorized = true; // Admin her şeyi onaylar veya geri alır
            }

            // Herhangi bir yetkili yayında olanı Geri Çekebilir (Withdrawn)
            if (announcement.Status == AnnouncementStatus.Published && dto.Status == AnnouncementStatus.Withdrawn && (userRole == Role.Admin || userRole == Role.Editor || userRole == Role.Moderator))
            {
                isAuthorized = true;
            }

            if (!isAuthorized)
                throw new UnauthorizedAccessException("Bu durum değişikliği için yetkiniz yok.");

            announcement.Status = dto.Status;
            announcement.RejectionReason = dto.Status == AnnouncementStatus.Rejected ? dto.RejectionReason : null;
            
            if (dto.Status == AnnouncementStatus.Published)
            {
                announcement.PublishedAt = DateTime.UtcNow;

                announcement.PublishedAt = DateTime.UtcNow;
                
                // Versiyonu artır
                announcement.Version++;
                
                // Tarihçeye ekle
                _context.AnnouncementVersionHistories.Add(new AnnouncementVersionHistory
                {
                    AnnouncementId = id,
                    Version = announcement.Version,
                    PublishedAt = announcement.PublishedAt.Value
                });

                await _hubContext.Clients.All.SendAsync("ReceiveNewAnnouncement");
            }

            await _context.SaveChangesAsync();
            return MapToDto(announcement);
        }

        public async Task<AnnouncementResponseDto?> UpdateAnnouncementAsync(int id, UpdateAnnouncementDto dto, Role userRole)
        {
            var announcement = await _context.Announcements
                .Include(a => a.Category)
                .Include(a => a.CreatedBy)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (announcement == null) return null;
            if (userRole != Role.Admin && userRole != Role.Editor && userRole != Role.Moderator)
                throw new UnauthorizedAccessException("Güncelleme yetkiniz yok.");

            announcement.Title = dto.Title;
            announcement.Content = dto.Content;
            announcement.Format = dto.Format;
            announcement.CategoryId = dto.CategoryId;
            announcement.StartDate = dto.StartDate;
            announcement.EndDate = dto.EndDate;
            if (Enum.TryParse<DisplayFrequency>(dto.Frequency, true, out var parsedFreq)) {
                announcement.Frequency = parsedFreq;
            }

            // Once sıklığında gösterim süresini güncelle
            announcement.OnceDurationMinutes = (announcement.Frequency == DisplayFrequency.Once)
                ? dto.OnceDurationMinutes
                : null;



            // Düzenleme yapıldığında süreç baştan başlar
            if (userRole == Role.Admin || userRole == Role.Moderator)
            {
                announcement.Status = AnnouncementStatus.Published;
                announcement.PublishedAt = DateTime.UtcNow;

                // Düzenleme + yeniden yayınlama: Versiyonu artır
                announcement.Version++;
                _context.AnnouncementVersionHistories.Add(new AnnouncementVersionHistory
                {
                    AnnouncementId = id,
                    Version = announcement.Version,
                    PublishedAt = announcement.PublishedAt.Value
                });

                await _hubContext.Clients.All.SendAsync("ReceiveNewAnnouncement");
            }
            else if (userRole == Role.Editor)
                announcement.Status = AnnouncementStatus.PendingModerator;

            announcement.RejectionReason = null; // Düzenlendiği için reddedilme sebebini temizle

            await _context.SaveChangesAsync();
            await _context.Entry(announcement).Reference(a => a.Category).LoadAsync();
            return MapToDto(announcement);
        }

        public async Task<bool> DeleteAnnouncementAsync(int id, Role userRole)
        {
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null) return false;
            
            if (userRole != Role.Admin && userRole != Role.Editor && userRole != Role.Moderator)
                throw new UnauthorizedAccessException("Silme yetkiniz yok.");

            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var all = await _context.Announcements.ToListAsync();
            var views = all.Sum(a => a.ViewCount);
            var totalViews = views; 
            
            return new DashboardStatsDto(
                PublishedCount: all.Count(a => a.Status == AnnouncementStatus.Published),
                PendingCount: all.Count(a => a.Status == AnnouncementStatus.PendingModerator || a.Status == AnnouncementStatus.PendingEditor),
                RejectedCount: all.Count(a => a.Status == AnnouncementStatus.Rejected),
                TotalViews: totalViews
            );
        }

        public async Task<ChartDataDto> GetChartDataAsync(string period)
        {
            var now = DateTime.UtcNow;
            var labels = new List<string>();
            var views = new List<int>();
            var interactions = new List<int>();

            var logs = await _context.AnnouncementReadLogs.ToListAsync();
            var announcements = await _context.Announcements.ToListAsync();

            if (period == "daily")
            {
                // Son 7 gün
                for (int i = 6; i >= 0; i--)
                {
                    var date = now.Date.AddDays(-i);
                    labels.Add(date.ToString("dd MMM")); 
                    
                    var dayLogsCount = logs.Count(l => l.ReadAt.Date == date);
                    var dayAnnViews = announcements.Where(a => a.PublishedAt.HasValue && a.PublishedAt.Value.Date == date).Sum(a => a.ViewCount);
                    
                    int vCount = dayAnnViews;

                    views.Add(vCount);
                    interactions.Add(dayLogsCount);
                }
            }
            else if (period == "monthly")
            {
                // Son 6 ay
                for (int i = 5; i >= 0; i--)
                {
                    var date = now.AddMonths(-i);
                    labels.Add(date.ToString("MMM yyyy")); 
                    
                    var monthLogsCount = logs.Count(l => l.ReadAt.Month == date.Month && l.ReadAt.Year == date.Year);
                    var monthAnnViews = announcements.Where(a => a.PublishedAt.HasValue && a.PublishedAt.Value.Month == date.Month && a.PublishedAt.Value.Year == date.Year).Sum(a => a.ViewCount);
                    
                    int vCount = monthAnnViews;

                    views.Add(vCount);
                    interactions.Add(monthLogsCount);
                }
            }
            else if (period == "yearly")
            {
                // Son 5 yıl
                for (int i = 4; i >= 0; i--)
                {
                    var date = now.AddYears(-i);
                    labels.Add(date.ToString("yyyy")); 
                    
                    var yearLogsCount = logs.Count(l => l.ReadAt.Year == date.Year);
                    var yearAnnViews = announcements.Where(a => a.PublishedAt.HasValue && a.PublishedAt.Value.Year == date.Year).Sum(a => a.ViewCount);
                    
                    int vCount = yearAnnViews;

                    views.Add(vCount);
                    interactions.Add(yearLogsCount);
                }
            }
            else // weekly (Varsayılan)
            {
                // Son 4 hafta
                for (int i = 3; i >= 0; i--)
                {
                    var startOfWeek = now.AddDays(-i * 7 - 7);
                    var endOfWeek = now.AddDays(-i * 7);
                    labels.Add($"{startOfWeek:dd MMM} - {endOfWeek:dd MMM}"); 
                    
                    var weekLogsCount = logs.Count(l => l.ReadAt >= startOfWeek && l.ReadAt < endOfWeek);
                    var weekAnnViews = announcements.Where(a => a.PublishedAt.HasValue && a.PublishedAt.Value >= startOfWeek && a.PublishedAt.Value < endOfWeek).Sum(a => a.ViewCount);
                    
                    int vCount = weekAnnViews;

                    views.Add(vCount);
                    interactions.Add(weekLogsCount);
                }
            }

            return new ChartDataDto(labels, views, interactions);
        }

        public async Task<IEnumerable<AnnouncementResponseDto>> GetUnreadAnnouncementsAsync(int userId)
        {
            var now = DateTime.UtcNow;

            // Sadece yayınlanmış olanları al (SQLite date filter bug'ından kaçınmak için tarihleri memory'de filtreleyeceğiz)
            var query = _context.Announcements
                .Include(a => a.Category)
                .Include(a => a.CreatedBy)
                .Where(a => a.Status == AnnouncementStatus.Published);

            var dbAnnouncements = await query.OrderBy(a => a.PublishedAt).ToListAsync();
            
            // Tarih filtrelemesini Memory'de yap
            var activeAnnouncements = dbAnnouncements
                .Where(a => (a.StartDate == null || a.StartDate <= now) && (a.EndDate == null || a.EndDate >= now))
                .ToList();

            // Kullanıcının okuduğu duyuruların listesini al
            var userLogs = await _context.AnnouncementReadLogs
                .Where(l => l.UserId == userId)
                .ToListAsync();

            var unread = new List<Announcement>();

            foreach (var ann in activeAnnouncements)
            {
                var log = userLogs.FirstOrDefault(l => l.AnnouncementId == ann.Id);

                if (ann.Frequency == DisplayFrequency.Always)
                {
                    unread.Add(ann);
                }
                else if (ann.Frequency == DisplayFrequency.Daily)
                {
                    // Eğer hiç okumadıysa, eski versiyonu okuduysa veya son 24 saatte okumadıysa ekle
                    if (log == null || log.Version < ann.Version || log.ReadAt < now.AddDays(-1))
                    {
                        unread.Add(ann);
                    }
                }
                else // DisplayFrequency.Once
                {
                    if (ann.OnceDurationMinutes.HasValue && ann.OnceDurationMinutes.Value > 0)
                    {
                        // Sıklıklı mod: hiç okunmadıysa, eski versiyonu okuduysa VEYA son okunmadan bu yana belirlenen süre geçtiyse göster
                        if (log == null || log.Version < ann.Version || log.ReadAt.AddMinutes(ann.OnceDurationMinutes.Value) <= now)
                        {
                            unread.Add(ann);
                        }
                    }
                    else
                    {
                        // Klasik "bir kez" modu: sadece hiç okunmadıysa veya eski versiyonu okuduysa göster
                        if (log == null || log.Version < ann.Version)
                        {
                            unread.Add(ann);
                        }
                    }
                }
            }

            return unread.Select(MapToDto);
        }

        public async Task<bool> MarkAsReadAsync(int announcementId, int userId)
        {
            var ann = await _context.Announcements.FindAsync(announcementId);
            if (ann == null) return false;

            var existingLog = await _context.AnnouncementReadLogs
                .FirstOrDefaultAsync(l => l.AnnouncementId == announcementId && l.UserId == userId);

            if (existingLog != null)
            {
                // Sıklıklı mod veya yeni versiyon okuması: ReadAt ve Version güncelle
                existingLog.ReadAt = DateTime.UtcNow;
                existingLog.Version = ann.Version;
                await _context.SaveChangesAsync();
                return true;
            }

            // İlk kez okunuyor — yeni log oluştur
            var log = new AnnouncementReadLog
            {
                AnnouncementId = announcementId,
                UserId = userId,
                ReadAt = DateTime.UtcNow,
                Version = ann.Version
            };
            _context.AnnouncementReadLogs.Add(log);
            
            ann.ViewCount++;
            await _hubContext.Clients.All.SendAsync("ReceiveViewCountUpdate", announcementId, ann.ViewCount);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<AnnouncementReaderDto>> GetReadersAsync(int announcementId)
        {
            var readers = await _context.AnnouncementReadLogs
                .Include(l => l.User)
                .Where(l => l.AnnouncementId == announcementId)
                .OrderByDescending(l => l.ReadAt)
                .ToListAsync();

            return readers.Select(r => new AnnouncementReaderDto
            {
                UserId = r.UserId,
                FullName = r.User.FullName,
                Role = r.User.Role.ToString(),
                ReadAt = r.ReadAt
            });
        }

        private static AnnouncementResponseDto MapToDto(Announcement a)
        {
            return new AnnouncementResponseDto(
                Id: a.Id,
                Title: a.Title,
                Content: a.Content,
                Format: a.Format,
                Status: a.Status.ToString(),
                RejectionReason: a.RejectionReason,
                CategoryName: a.Category?.Name ?? "Bilinmiyor",
                CreatedByName: a.CreatedBy?.FullName ?? "Bilinmiyor",
                ViewCount: a.ViewCount,
                CreatedAt: a.CreatedAt,
                PublishedAt: a.PublishedAt,
                StartDate: a.StartDate,
                EndDate: a.EndDate,
                Frequency: a.Frequency.ToString(),
                OnceDurationMinutes: a.OnceDurationMinutes
            );
        }
    }
}
