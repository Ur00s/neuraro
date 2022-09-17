using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class TopicsTableUpdate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Author",
                table: "Topics");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Topics",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Topics");

            migrationBuilder.AddColumn<string>(
                name: "Author",
                table: "Topics",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }
    }
}
