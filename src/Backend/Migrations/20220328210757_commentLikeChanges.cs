using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class commentLikeChanges : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "TopicDetails",
                newName: "UserID");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Likes",
                newName: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_TopicDetails_TopicID",
                table: "TopicDetails",
                column: "TopicID");

            migrationBuilder.CreateIndex(
                name: "IX_TopicDetails_UserID",
                table: "TopicDetails",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Likes_commentId",
                table: "Likes",
                column: "commentId");

            migrationBuilder.CreateIndex(
                name: "IX_Likes_UserID",
                table: "Likes",
                column: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_Likes_TopicDetails_commentId",
                table: "Likes",
                column: "commentId",
                principalTable: "TopicDetails",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Likes_Users_UserID",
                table: "Likes",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TopicDetails_Topics_TopicID",
                table: "TopicDetails",
                column: "TopicID",
                principalTable: "Topics",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TopicDetails_Users_UserID",
                table: "TopicDetails",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Likes_TopicDetails_commentId",
                table: "Likes");

            migrationBuilder.DropForeignKey(
                name: "FK_Likes_Users_UserID",
                table: "Likes");

            migrationBuilder.DropForeignKey(
                name: "FK_TopicDetails_Topics_TopicID",
                table: "TopicDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_TopicDetails_Users_UserID",
                table: "TopicDetails");

            migrationBuilder.DropIndex(
                name: "IX_TopicDetails_TopicID",
                table: "TopicDetails");

            migrationBuilder.DropIndex(
                name: "IX_TopicDetails_UserID",
                table: "TopicDetails");

            migrationBuilder.DropIndex(
                name: "IX_Likes_commentId",
                table: "Likes");

            migrationBuilder.DropIndex(
                name: "IX_Likes_UserID",
                table: "Likes");

            migrationBuilder.RenameColumn(
                name: "UserID",
                table: "TopicDetails",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "UserID",
                table: "Likes",
                newName: "UserId");
        }
    }
}
