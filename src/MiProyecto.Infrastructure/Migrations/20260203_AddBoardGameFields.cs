using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiProyecto.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBoardGameFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Categoria",
                table: "board_games",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaUltimaModificacion",
                table: "board_games",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Categoria",
                table: "board_games");

            migrationBuilder.DropColumn(
                name: "FechaUltimaModificacion",
                table: "board_games");
        }
    }
}
