using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Duyuru.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAnnouncementMediaFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BackgroundColor",
                table: "Announcements",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BackgroundImageUrl",
                table: "Announcements",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HeaderMediaUrl",
                table: "Announcements",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BackgroundColor",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "BackgroundImageUrl",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "HeaderMediaUrl",
                table: "Announcements");
        }
    }
}
