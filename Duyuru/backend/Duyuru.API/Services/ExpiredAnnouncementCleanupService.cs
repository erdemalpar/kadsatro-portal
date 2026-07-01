using Duyuru.API.Data;
using Duyuru.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Duyuru.API.Services
{
    /// <summary>
    /// Her dakika çalışarak EndDate'i geçmiş "Yayında" duyuruları
    /// otomatik olarak "Withdrawn" (Süresi Doldu) statüsüne alır.
    /// </summary>
    public class ExpiredAnnouncementCleanupService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<ExpiredAnnouncementCleanupService> _logger;
        private static readonly TimeSpan _kontrol_araligi = TimeSpan.FromMinutes(1);

        public ExpiredAnnouncementCleanupService(
            IServiceScopeFactory scopeFactory,
            ILogger<ExpiredAnnouncementCleanupService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Süresi Dolan Duyuru Temizleme Servisi başlatıldı.");

            while (!stoppingToken.IsCancellationRequested)
            {
                await SureciDolanDuyuruIsle(stoppingToken);
                await Task.Delay(_kontrol_araligi, stoppingToken);
            }
        }

        private async Task SureciDolanDuyuruIsle(CancellationToken stoppingToken)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var simdi = DateTime.UtcNow;

                // EndDate'i geçmiş ve hâlâ "Published" olan duyuruları bul
                var sureciDolanlar = await dbContext.Announcements
                    .Where(a =>
                        a.Status == AnnouncementStatus.Published &&
                        a.EndDate != null &&
                        a.EndDate < simdi)
                    .ToListAsync(stoppingToken);

                if (sureciDolanlar.Count == 0) return;

                foreach (var duyuru in sureciDolanlar)
                {
                    duyuru.Status = AnnouncementStatus.Withdrawn;
                    _logger.LogInformation(
                        "Duyuru süresi doldu → Withdrawn yapıldı. Id={Id}, Başlık='{Baslik}', EndDate={EndDate}",
                        duyuru.Id, duyuru.Title, duyuru.EndDate);
                }

                await dbContext.SaveChangesAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Uygulama kapatılıyor — normal akış
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Süresi dolan duyurular işlenirken hata oluştu.");
            }
        }
    }
}
