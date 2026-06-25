using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Duyuru.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAnnouncementVersions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "Announcements",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "AnnouncementReadLogs",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "AnnouncementVersionHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    AnnouncementId = table.Column<int>(type: "INTEGER", nullable: false),
                    Version = table.Column<int>(type: "INTEGER", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnnouncementVersionHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnnouncementVersionHistories_Announcements_AnnouncementId",
                        column: x => x.AnnouncementId,
                        principalTable: "Announcements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AnnouncementVersionHistories_AnnouncementId",
                table: "AnnouncementVersionHistories",
                column: "AnnouncementId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AnnouncementVersionHistories");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "AnnouncementReadLogs");
        }
    }
}
