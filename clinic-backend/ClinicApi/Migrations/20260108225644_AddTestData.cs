using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ClinicApi.Migrations
{
    /// <inheritdoc />
    public partial class AddTestData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "appointment_status",
                columns: new[] { "id", "name" },
                values: new object[,]
                {
                    { new Guid("0b01d9d2-5645-48d7-8ed8-edb1e9b8af5b"), "Completed" },
                    { new Guid("68727843-03b7-4cec-bbe4-ba837a1f398d"), "Confirmed" },
                    { new Guid("b43df020-3abd-442c-8b04-c70a2bc42062"), "Cancelled" },
                    { new Guid("cf063462-6a13-43d1-ac87-c18d161aa954"), "Scheduled" }
                });

            migrationBuilder.InsertData(
                table: "discount_type",
                columns: new[] { "id", "created_at", "created_by", "discount_name", "discount_percentage", "updated_at", "updated_by" },
                values: new object[,]
                {
                    { new Guid("782b35f4-1252-4de6-a710-9b2681112f7f"), new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(2000), null, "Student", 5m, new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(2000), null },
                    { new Guid("d0115ad2-4098-42f9-b1c2-1faddf373ccb"), new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(1580), null, "Senior Citizen", 10m, new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(1580), null }
                });

            migrationBuilder.InsertData(
                table: "document_type",
                columns: new[] { "id", "created_at", "description", "document_type", "name", "updated_at" },
                values: new object[,]
                {
                    { new Guid("4ba01043-3d4d-440f-85ca-79f7c6fd52f2"), new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(1240), null, "CONSENT", "Consent Form", new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(1240) },
                    { new Guid("de3b98d3-9281-439c-a014-0d87e38cdb5a"), new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(780), null, "XRAY", "X-Ray", new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(780) },
                    { new Guid("e8a3bf49-f083-443e-9749-00f54f7bc4bb"), new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(1240), null, "OTHER", "Other", new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(1240) }
                });

            migrationBuilder.InsertData(
                table: "role",
                columns: new[] { "id", "description", "name" },
                values: new object[,]
                {
                    { new Guid("1160be54-0d90-425d-aae1-e30491121809"), null, "Receptionist" },
                    { new Guid("4c64b60f-eb58-4c28-b4ee-8d5bf850b3b6"), null, "Admin" },
                    { new Guid("c96127a9-12dd-4211-85ed-8079504231ca"), null, "Dentist" }
                });

            migrationBuilder.InsertData(
                table: "tooth_status",
                columns: new[] { "id", "code", "created_at", "description", "updated_at" },
                values: new object[,]
                {
                    { new Guid("23ab8f4c-1944-46df-80d9-dc137752f649"), "HEALTHY", new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(3240), "Healthy", new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(3240) },
                    { new Guid("49bc7706-a3d4-4927-a4d8-9c505dbd426a"), "OTHER", new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(3640), "Other", new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(3640) },
                    { new Guid("58921fa0-25c3-45f4-976c-ea17379a98ed"), "MISSING", new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(3640), "Missing", new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(3640) },
                    { new Guid("665eb447-6d2e-4889-97b0-ea80c931c7bd"), "CAVITY", new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(3630), "Cavity", new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(3640) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "appointment_status",
                keyColumn: "id",
                keyValue: new Guid("0b01d9d2-5645-48d7-8ed8-edb1e9b8af5b"));

            migrationBuilder.DeleteData(
                table: "appointment_status",
                keyColumn: "id",
                keyValue: new Guid("68727843-03b7-4cec-bbe4-ba837a1f398d"));

            migrationBuilder.DeleteData(
                table: "appointment_status",
                keyColumn: "id",
                keyValue: new Guid("b43df020-3abd-442c-8b04-c70a2bc42062"));

            migrationBuilder.DeleteData(
                table: "appointment_status",
                keyColumn: "id",
                keyValue: new Guid("cf063462-6a13-43d1-ac87-c18d161aa954"));

            migrationBuilder.DeleteData(
                table: "discount_type",
                keyColumn: "id",
                keyValue: new Guid("782b35f4-1252-4de6-a710-9b2681112f7f"));

            migrationBuilder.DeleteData(
                table: "discount_type",
                keyColumn: "id",
                keyValue: new Guid("d0115ad2-4098-42f9-b1c2-1faddf373ccb"));

            migrationBuilder.DeleteData(
                table: "document_type",
                keyColumn: "id",
                keyValue: new Guid("4ba01043-3d4d-440f-85ca-79f7c6fd52f2"));

            migrationBuilder.DeleteData(
                table: "document_type",
                keyColumn: "id",
                keyValue: new Guid("de3b98d3-9281-439c-a014-0d87e38cdb5a"));

            migrationBuilder.DeleteData(
                table: "document_type",
                keyColumn: "id",
                keyValue: new Guid("e8a3bf49-f083-443e-9749-00f54f7bc4bb"));

            migrationBuilder.DeleteData(
                table: "role",
                keyColumn: "id",
                keyValue: new Guid("1160be54-0d90-425d-aae1-e30491121809"));

            migrationBuilder.DeleteData(
                table: "role",
                keyColumn: "id",
                keyValue: new Guid("4c64b60f-eb58-4c28-b4ee-8d5bf850b3b6"));

            migrationBuilder.DeleteData(
                table: "role",
                keyColumn: "id",
                keyValue: new Guid("c96127a9-12dd-4211-85ed-8079504231ca"));

            migrationBuilder.DeleteData(
                table: "tooth_status",
                keyColumn: "id",
                keyValue: new Guid("23ab8f4c-1944-46df-80d9-dc137752f649"));

            migrationBuilder.DeleteData(
                table: "tooth_status",
                keyColumn: "id",
                keyValue: new Guid("49bc7706-a3d4-4927-a4d8-9c505dbd426a"));

            migrationBuilder.DeleteData(
                table: "tooth_status",
                keyColumn: "id",
                keyValue: new Guid("58921fa0-25c3-45f4-976c-ea17379a98ed"));

            migrationBuilder.DeleteData(
                table: "tooth_status",
                keyColumn: "id",
                keyValue: new Guid("665eb447-6d2e-4889-97b0-ea80c931c7bd"));
        }
    }
}
