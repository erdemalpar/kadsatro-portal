using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Duyuru.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTitleAndRepeatSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RepeatInterval",
                table: "Announcements",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TitleColor",
                table: "Announcements",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TitleFontFamily",
                table: "Announcements",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TitleFontSize",
                table: "Announcements",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "TitleIsBold",
                table: "Announcements",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RepeatInterval",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "TitleColor",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "TitleFontFamily",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "TitleFontSize",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "TitleIsBold",
                table: "Announcements");
        }
    }
}
