using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiProyecto.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SyncPostgresModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Loans",
                table: "Loans");

            migrationBuilder.RenameTable(
                name: "Loans",
                newName: "board_games");

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                table: "GameRooms",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddPrimaryKey(
                name: "PK_board_games",
                table: "board_games",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "reservations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GameRoomId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Franja = table.Column<int>(type: "integer", nullable: false),
                    BoardGameId = table.Column<int>(type: "integer", nullable: true),
                    Estado = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reservations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "reservation_blocks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReservationId = table.Column<Guid>(type: "uuid", nullable: false),
                    GameRoomId = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Bloque = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reservation_blocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_reservation_blocks_reservations_ReservationId",
                        column: x => x.ReservationId,
                        principalTable: "reservations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GameRooms_Name",
                table: "GameRooms",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GameRooms_Slug",
                table: "GameRooms",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_board_games_Slug",
                table: "board_games",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_reservation_blocks_GameRoomId_Date_Bloque",
                table: "reservation_blocks",
                columns: new[] { "GameRoomId", "Date", "Bloque" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_reservation_blocks_ReservationId",
                table: "reservation_blocks",
                column: "ReservationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "reservation_blocks");

            migrationBuilder.DropTable(
                name: "reservations");

            migrationBuilder.DropIndex(
                name: "IX_GameRooms_Name",
                table: "GameRooms");

            migrationBuilder.DropIndex(
                name: "IX_GameRooms_Slug",
                table: "GameRooms");

            migrationBuilder.DropPrimaryKey(
                name: "PK_board_games",
                table: "board_games");

            migrationBuilder.DropIndex(
                name: "IX_board_games_Slug",
                table: "board_games");

            migrationBuilder.RenameTable(
                name: "board_games",
                newName: "Loans");

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                table: "GameRooms",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(150)",
                oldMaxLength: 150);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Loans",
                table: "Loans",
                column: "Id");
        }
    }
}
