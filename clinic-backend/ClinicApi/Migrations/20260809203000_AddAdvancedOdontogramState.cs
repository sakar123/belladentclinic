using System;
using ClinicApi.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicApi.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(DentalClinicContext))]
    [Migration("20260809203000_AddAdvancedOdontogramState")]
    public partial class AddAdvancedOdontogramState : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "odontogram_audit_event",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "uuid_generate_v4()"),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    event_type = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    payload = table.Column<string>(type: "jsonb", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_odontogram_audit_event", x => x.id);
                    table.ForeignKey(
                        name: "FK_odontogram_audit_event_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "odontogram_plan_item",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "uuid_generate_v4()"),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    appointment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    treatment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    backend_tooth_number = table.Column<int>(type: "integer", nullable: true),
                    advanced_tooth_number = table.Column<int>(type: "integer", nullable: true),
                    axis = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    from_json = table.Column<string>(type: "jsonb", nullable: true),
                    to_json = table.Column<string>(type: "jsonb", nullable: false),
                    proposed_service_id = table.Column<Guid>(type: "uuid", nullable: true),
                    proposed_surfaces = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "Draft"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_odontogram_plan_item", x => x.id);
                    table.ForeignKey(
                        name: "FK_odontogram_plan_item_appointment_appointment_id",
                        column: x => x.appointment_id,
                        principalTable: "appointment",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_odontogram_plan_item_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_odontogram_plan_item_service_proposed_service_id",
                        column: x => x.proposed_service_id,
                        principalTable: "service",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_odontogram_plan_item_treatment_treatment_id",
                        column: x => x.treatment_id,
                        principalTable: "treatment",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "odontogram_tooth_state",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "uuid_generate_v4()"),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tooth_id = table.Column<Guid>(type: "uuid", nullable: true),
                    backend_tooth_number = table.Column<int>(type: "integer", nullable: false),
                    advanced_tooth_number = table.Column<int>(type: "integer", nullable: false),
                    chart_kind = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    state_json = table.Column<string>(type: "jsonb", nullable: false),
                    state_hash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    note = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_odontogram_tooth_state", x => x.id);
                    table.ForeignKey(
                        name: "FK_odontogram_tooth_state_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_odontogram_tooth_state_tooth_tooth_id",
                        column: x => x.tooth_id,
                        principalTable: "tooth",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_odontogram_audit_event_patient_id",
                table: "odontogram_audit_event",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_odontogram_plan_item_appointment_id",
                table: "odontogram_plan_item",
                column: "appointment_id");

            migrationBuilder.CreateIndex(
                name: "IX_odontogram_plan_item_patient_id",
                table: "odontogram_plan_item",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_odontogram_plan_item_proposed_service_id",
                table: "odontogram_plan_item",
                column: "proposed_service_id");

            migrationBuilder.CreateIndex(
                name: "IX_odontogram_plan_item_treatment_id",
                table: "odontogram_plan_item",
                column: "treatment_id");

            migrationBuilder.CreateIndex(
                name: "IX_odontogram_tooth_state_patient_id_chart_kind_backend_tooth_number",
                table: "odontogram_tooth_state",
                columns: new[] { "patient_id", "chart_kind", "backend_tooth_number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_odontogram_tooth_state_tooth_id",
                table: "odontogram_tooth_state",
                column: "tooth_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "odontogram_audit_event");
            migrationBuilder.DropTable(name: "odontogram_plan_item");
            migrationBuilder.DropTable(name: "odontogram_tooth_state");
        }
    }
}
