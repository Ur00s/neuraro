using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class topicchanges : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Topics",
                newName: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Topics_UserID",
                table: "Topics",
                column: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Topics_Users_UserID",
                table: "Topics",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Topics_Users_UserID",
                table: "Topics");

            migrationBuilder.DropIndex(
                name: "IX_Topics_UserID",
                table: "Topics");

            migrationBuilder.RenameColumn(
                name: "UserID",
                table: "Topics",
                newName: "UserId");
        }
    }
}
