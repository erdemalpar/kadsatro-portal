using Duyuru.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Duyuru.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Announcement> Announcements => Set<Announcement>();
        public DbSet<AnnouncementReadLog> AnnouncementReadLogs => Set<AnnouncementReadLog>();
        public DbSet<AnnouncementVersionHistory> AnnouncementVersionHistories => Set<AnnouncementVersionHistory>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Seed Mock Data
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Genel Duyurular" },
                new Category { Id = 2, Name = "Yazılım ve Güncellemeler" },
                new Category { Id = 3, Name = "Mevzuat ve Kanun" },
                new Category { Id = 4, Name = "Eğitim" },
                new Category { Id = 5, Name = "Megsis" },
                new Category { Id = 6, Name = "Sistemsel" },
                new Category { Id = 7, Name = "Talimat" },
                new Category { Id = 8, Name = "Genelge" },
                new Category { Id = 9, Name = "Acil Duyuru" },
                new Category { Id = 10, Name = "Sağlık" }
            );

            modelBuilder.Entity<User>().HasData(
                new User { Id = 1, Username = "admin", FullName = "Admin Kullanıcı", Role = Role.Admin },
                new User { Id = 2, Username = "editor", FullName = "Editör Kullanıcı", Role = Role.Editor },
                new User { Id = 3, Username = "moderator", FullName = "Moderatör Kullanıcı", Role = Role.Moderator },
                new User { Id = 4, Username = "personel", FullName = "Normal Personel", Role = Role.User }
            );
        }
    }
}
