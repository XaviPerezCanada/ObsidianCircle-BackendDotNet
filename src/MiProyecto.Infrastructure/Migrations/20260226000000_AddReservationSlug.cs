using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiProyecto.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReservationSlug : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "reservations",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true);

            // Backfill: Slug = Id sin guiones (mismo formato que Id.ToString("N"))
            migrationBuilder.Sql(
                "UPDATE reservations SET \"Slug\" = REPLACE(\"Id\"::text, '-', '') WHERE \"Slug\" IS NULL;");

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                table: "reservations",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false);

            migrationBuilder.CreateIndex(
                name: "IX_reservations_Slug",
                table: "reservations",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_reservations_Slug",
                table: "reservations");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "reservations");
        }
    }
}
