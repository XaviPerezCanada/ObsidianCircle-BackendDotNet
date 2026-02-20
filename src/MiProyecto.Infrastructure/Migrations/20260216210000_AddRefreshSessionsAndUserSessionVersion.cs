using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiProyecto.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRefreshSessionsAndUserSessionVersion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Agregar columna session_version a users
            migrationBuilder.AddColumn<int>(
                name: "session_version",
                table: "users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Crear tabla refresh_sessions
            migrationBuilder.CreateTable(
                name: "refresh_sessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    DeviceId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    FamilyId = table.Column<Guid>(type: "uuid", nullable: false),
                    CurrentTokenHash = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    Revoked = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    SessionVersion = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUsedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_refresh_sessions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_refresh_sessions_CurrentTokenHash",
                table: "refresh_sessions",
                column: "CurrentTokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_refresh_sessions_FamilyId",
                table: "refresh_sessions",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_refresh_sessions_UserEmail",
                table: "refresh_sessions",
                column: "UserEmail");

            migrationBuilder.CreateIndex(
                name: "IX_refresh_sessions_UserEmail_DeviceId",
                table: "refresh_sessions",
                columns: new[] { "UserEmail", "DeviceId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "refresh_sessions");

            migrationBuilder.DropColumn(
                name: "session_version",
                table: "users");
        }
    }
}
