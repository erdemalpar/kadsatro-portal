using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Duyuru.API.Migrations
{
    /// <inheritdoc />
    public partial class AddLayoutWidth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LayoutWidth",
                table: "Announcements",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LayoutWidth",
                table: "Announcements");
        }
    }
}
