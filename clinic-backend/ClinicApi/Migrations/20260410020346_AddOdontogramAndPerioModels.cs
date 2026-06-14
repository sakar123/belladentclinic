using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicApi.Migrations
{
    /// <inheritdoc />
    public partial class AddOdontogramAndPerioModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "periostatus",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    staff_id = table.Column<Guid>(type: "uuid", nullable: false),
                    examination_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    smoker = table.Column<bool>(type: "boolean", nullable: false),
                    bone_loss = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_periostatus", x => x.id);
                    table.ForeignKey(
                        name: "FK_periostatus_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_periostatus_staff_staff_id",
                        column: x => x.staff_id,
                        principalTable: "staff",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "treatmenttoothsurface",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    treatment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tooth_id = table.Column<Guid>(type: "uuid", nullable: false),
                    surface = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_treatmenttoothsurface", x => x.id);
                    table.ForeignKey(
                        name: "FK_treatmenttoothsurface_tooth_tooth_id",
                        column: x => x.tooth_id,
                        principalTable: "tooth",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_treatmenttoothsurface_treatment_treatment_id",
                        column: x => x.treatment_id,
                        principalTable: "treatment",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "periomeasurement",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    perio_status_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tooth_number = table.Column<int>(type: "integer", nullable: false),
                    site_index = table.Column<int>(type: "integer", nullable: false),
                    pocket_depth = table.Column<int>(type: "integer", nullable: false),
                    clinical_attachment_level = table.Column<int>(type: "integer", nullable: false),
                    gingival_margin = table.Column<int>(type: "integer", nullable: false),
                    bleeding_on_probing = table.Column<bool>(type: "boolean", nullable: false),
                    mobility = table.Column<int>(type: "integer", nullable: false),
                    furcation = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_periomeasurement", x => x.id);
                    table.ForeignKey(
                        name: "FK_periomeasurement_periostatus_perio_status_id",
                        column: x => x.perio_status_id,
                        principalTable: "periostatus",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "discount_type",
                keyColumn: "id",
                keyValue: new Guid("782b35f4-1252-4de6-a710-9b2681112f7f"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 4, 10, 2, 3, 46, 376, DateTimeKind.Utc).AddTicks(3490), new DateTime(2026, 4, 10, 2, 3, 46, 376, DateTimeKind.Utc).AddTicks(3490) });

            migrationBuilder.UpdateData(
                table: "discount_type",
                keyColumn: "id",
                keyValue: new Guid("d0115ad2-4098-42f9-b1c2-1faddf373ccb"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 4, 10, 2, 3, 46, 376, DateTimeKind.Utc).AddTicks(3090), new DateTime(2026, 4, 10, 2, 3, 46, 376, DateTimeKind.Utc).AddTicks(3090) });

            migrationBuilder.UpdateData(
                table: "tooth_status",
                keyColumn: "id",
                keyValue: new Guid("23ab8f4c-1944-46df-80d9-dc137752f649"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 4, 10, 2, 3, 46, 376, DateTimeKind.Utc).AddTicks(5500), new DateTime(2026, 4, 10, 2, 3, 46, 376, DateTimeKind.Utc).AddTicks(5500) });

            migrationBuilder.UpdateData(
                table: "tooth_status",
                keyColumn: "id",
                keyValue: new Guid("49bc7706-a3d4-4927-a4d8-9c505dbd426a"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 4, 10, 2, 3, 46, 376, DateTimeKind.Utc).AddTicks(5940), new DateTime(2026, 4, 10, 2, 3, 46, 376, DateTimeKind.Utc).AddTicks(5940) });

            migrationBuilder.UpdateData(
                table: "tooth_status",
                keyColumn: "id",
                keyValue: new Guid("58921fa0-25c3-45f4-976c-ea17379a98ed"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 4, 10, 2, 3, 46, 376, DateTimeKind.Utc).AddTicks(5940), new DateTime(2026, 4, 10, 2, 3, 46, 376, DateTimeKind.Utc).AddTicks(5940) });

            migrationBuilder.UpdateData(
                table: "tooth_status",
                keyColumn: "id",
                keyValue: new Guid("665eb447-6d2e-4889-97b0-ea80c931c7bd"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 4, 10, 2, 3, 46, 376, DateTimeKind.Utc).AddTicks(5940), new DateTime(2026, 4, 10, 2, 3, 46, 376, DateTimeKind.Utc).AddTicks(5940) });

            migrationBuilder.CreateIndex(
                name: "IX_periomeasurement_perio_status_id",
                table: "periomeasurement",
                column: "perio_status_id");

            migrationBuilder.CreateIndex(
                name: "IX_periostatus_patient_id",
                table: "periostatus",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_periostatus_staff_id",
                table: "periostatus",
                column: "staff_id");

            migrationBuilder.CreateIndex(
                name: "IX_treatmenttoothsurface_tooth_id",
                table: "treatmenttoothsurface",
                column: "tooth_id");

            migrationBuilder.CreateIndex(
                name: "IX_treatmenttoothsurface_treatment_id",
                table: "treatmenttoothsurface",
                column: "treatment_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "periomeasurement");

            migrationBuilder.DropTable(
                name: "treatmenttoothsurface");

            migrationBuilder.DropTable(
                name: "periostatus");

            migrationBuilder.UpdateData(
                table: "discount_type",
                keyColumn: "id",
                keyValue: new Guid("782b35f4-1252-4de6-a710-9b2681112f7f"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 4, 6, 4, 4, 50, 786, DateTimeKind.Utc).AddTicks(4120), new DateTime(2026, 4, 6, 4, 4, 50, 786, DateTimeKind.Utc).AddTicks(4120) });

            migrationBuilder.UpdateData(
                table: "discount_type",
                keyColumn: "id",
                keyValue: new Guid("d0115ad2-4098-42f9-b1c2-1faddf373ccb"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 4, 6, 4, 4, 50, 786, DateTimeKind.Utc).AddTicks(3710), new DateTime(2026, 4, 6, 4, 4, 50, 786, DateTimeKind.Utc).AddTicks(3710) });

            migrationBuilder.UpdateData(
                table: "tooth_status",
                keyColumn: "id",
                keyValue: new Guid("23ab8f4c-1944-46df-80d9-dc137752f649"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 4, 6, 4, 4, 50, 786, DateTimeKind.Utc).AddTicks(6150), new DateTime(2026, 4, 6, 4, 4, 50, 786, DateTimeKind.Utc).AddTicks(6150) });

            migrationBuilder.UpdateData(
                table: "tooth_status",
                keyColumn: "id",
                keyValue: new Guid("49bc7706-a3d4-4927-a4d8-9c505dbd426a"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 4, 6, 4, 4, 50, 786, DateTimeKind.Utc).AddTicks(6550), new DateTime(2026, 4, 6, 4, 4, 50, 786, DateTimeKind.Utc).AddTicks(6550) });

            migrationBuilder.UpdateData(
                table: "tooth_status",
                keyColumn: "id",
                keyValue: new Guid("58921fa0-25c3-45f4-976c-ea17379a98ed"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 4, 6, 4, 4, 50, 786, DateTimeKind.Utc).AddTicks(6540), new DateTime(2026, 4, 6, 4, 4, 50, 786, DateTimeKind.Utc).AddTicks(6540) });

            migrationBuilder.UpdateData(
                table: "tooth_status",
                keyColumn: "id",
                keyValue: new Guid("665eb447-6d2e-4889-97b0-ea80c931c7bd"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 4, 6, 4, 4, 50, 786, DateTimeKind.Utc).AddTicks(6540), new DateTime(2026, 4, 6, 4, 4, 50, 786, DateTimeKind.Utc).AddTicks(6540) });
        }
    }
}
