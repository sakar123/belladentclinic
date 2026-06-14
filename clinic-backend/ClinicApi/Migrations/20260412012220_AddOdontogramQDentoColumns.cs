using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicApi.Migrations
{
    /// <inheritdoc />
    public partial class AddOdontogramQDentoColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "color",
                table: "tooth_status",
                type: "character varying(7)",
                maxLength: 7,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "recession",
                table: "periomeasurement",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "surfacepricingtier",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_id = table.Column<Guid>(type: "uuid", nullable: false),
                    min_surfaces = table.Column<int>(type: "integer", nullable: false),
                    max_surfaces = table.Column<int>(type: "integer", nullable: false),
                    multiplier = table.Column<decimal>(type: "numeric(5,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_surfacepricingtier", x => x.id);
                    table.ForeignKey(
                        name: "FK_surfacepricingtier_service_service_id",
                        column: x => x.service_id,
                        principalTable: "service",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "discount_type",
                keyColumn: "id",
                keyValue: new Guid("782b35f4-1252-4de6-a710-9b2681112f7f"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 4, 12, 1, 22, 19, 598, DateTimeKind.Utc).AddTicks(2160), new DateTime(2026, 4, 12, 1, 22, 19, 598, DateTimeKind.Utc).AddTicks(2160) });

            migrationBuilder.UpdateData(
                table: "discount_type",
                keyColumn: "id",
                keyValue: new Guid("d0115ad2-4098-42f9-b1c2-1faddf373ccb"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 4, 12, 1, 22, 19, 598, DateTimeKind.Utc).AddTicks(1760), new DateTime(2026, 4, 12, 1, 22, 19, 598, DateTimeKind.Utc).AddTicks(1760) });

            migrationBuilder.UpdateData(
                table: "tooth_status",
                keyColumn: "id",
                keyValue: new Guid("23ab8f4c-1944-46df-80d9-dc137752f649"),
                columns: new[] { "color", "created_at", "updated_at" },
                values: new object[] { null, new DateTime(2026, 4, 12, 1, 22, 19, 598, DateTimeKind.Utc).AddTicks(4030), new DateTime(2026, 4, 12, 1, 22, 19, 598, DateTimeKind.Utc).AddTicks(4030) });

            migrationBuilder.UpdateData(
                table: "tooth_status",
                keyColumn: "id",
                keyValue: new Guid("49bc7706-a3d4-4927-a4d8-9c505dbd426a"),
                columns: new[] { "color", "created_at", "updated_at" },
                values: new object[] { null, new DateTime(2026, 4, 12, 1, 22, 19, 598, DateTimeKind.Utc).AddTicks(4420), new DateTime(2026, 4, 12, 1, 22, 19, 598, DateTimeKind.Utc).AddTicks(4420) });

            migrationBuilder.UpdateData(
                table: "tooth_status",
                keyColumn: "id",
                keyValue: new Guid("58921fa0-25c3-45f4-976c-ea17379a98ed"),
                columns: new[] { "color", "created_at", "updated_at" },
                values: new object[] { null, new DateTime(2026, 4, 12, 1, 22, 19, 598, DateTimeKind.Utc).AddTicks(4420), new DateTime(2026, 4, 12, 1, 22, 19, 598, DateTimeKind.Utc).AddTicks(4420) });

            migrationBuilder.UpdateData(
                table: "tooth_status",
                keyColumn: "id",
                keyValue: new Guid("665eb447-6d2e-4889-97b0-ea80c931c7bd"),
                columns: new[] { "color", "created_at", "updated_at" },
                values: new object[] { null, new DateTime(2026, 4, 12, 1, 22, 19, 598, DateTimeKind.Utc).AddTicks(4420), new DateTime(2026, 4, 12, 1, 22, 19, 598, DateTimeKind.Utc).AddTicks(4420) });

            migrationBuilder.CreateIndex(
                name: "IX_surfacepricingtier_service_id",
                table: "surfacepricingtier",
                column: "service_id");

            // Upsert canonical tooth statuses with colors
            migrationBuilder.Sql(@"
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'HEALTHY', 'Healthy', '#22c55e', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'TEMPORARY', 'Temporary', '#38bdf8', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'CARIES', 'Caries', '#ef4444', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'FILLED', 'Filled', '#64748b', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'DEFECTIVE_RESTORATION', 'Defective Restoration', '#f97316', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'NON_CARIES_LESION', 'Non-Caries Lesion', '#a855f7', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'PULPITIS', 'Pulpitis', '#ef4444', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'NECROSIS', 'Necrosis', '#7f1d1d', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'RESORPTION', 'Resorption', '#ef4444', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'APICAL_LESION', 'Apical Lesion', '#ef4444', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'RCT', 'Root Canal Treatment', '#e11d48', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'POST', 'Radicular Post', '#94a3b8', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'ROOT', 'Root (Severely Destroyed)', '#c084fc', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'FRACTURED', 'Fracture', '#f97316', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'MISSING', 'Missing', '#94a3b8', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'EXTRACTED', 'Extracted', '#94a3b8', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'PERIODONTITIS', 'Periodontitis', '#f97316', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'MOBILITY', 'Mobility', '#eab308', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'CROWNED', 'Crown', '#d4a44a', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'BRIDGE', 'Bridge', '#b8860b', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'SPLINT', 'Splint', '#9ca3af', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'PONTIC', 'Pontic', '#78716c', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'IMPLANT', 'Implant', '#0ea5e9', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'IMPACTED', 'Impacted', '#6366f1', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'DENTURE', 'Denture', '#fb7185', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'CALCULUS', 'Calculus', '#f59e0b', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'VENEER', 'Veneer', '#e2e8f0', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
INSERT INTO tooth_status (id, code, description, color, created_at, updated_at) VALUES (uuid_generate_v4(), 'ABSCESSED', 'Abscessed', '#dc2626', NOW(), NOW()) ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, color = EXCLUDED.color, updated_at = NOW();
");

            // Seed visual_cue_code on services by name pattern
            migrationBuilder.Sql(@"
UPDATE service SET visual_cue_code = 'FILLING'     WHERE visual_cue_code IS NULL AND (LOWER(name) LIKE '%filling%' OR LOWER(name) LIKE '%amalgam%' OR LOWER(name) LIKE '%composite%');
UPDATE service SET visual_cue_code = 'ROOT_CANAL'  WHERE visual_cue_code IS NULL AND (LOWER(name) LIKE '%root canal%' OR LOWER(name) LIKE '%endodont%');
UPDATE service SET visual_cue_code = 'CROWN'       WHERE visual_cue_code IS NULL AND LOWER(name) LIKE '%crown%';
UPDATE service SET visual_cue_code = 'EXTRACTION'  WHERE visual_cue_code IS NULL AND (LOWER(name) LIKE '%extraction%' OR LOWER(name) LIKE '%extract%');
UPDATE service SET visual_cue_code = 'IMPLANT'     WHERE visual_cue_code IS NULL AND LOWER(name) LIKE '%implant%';
UPDATE service SET visual_cue_code = 'BRIDGE'      WHERE visual_cue_code IS NULL AND LOWER(name) LIKE '%bridge%';
UPDATE service SET visual_cue_code = 'CALCULUS'    WHERE visual_cue_code IS NULL AND (LOWER(name) LIKE '%scaling%' OR LOWER(name) LIKE '%calculus%');
UPDATE service SET visual_cue_code = 'BRACKET'     WHERE visual_cue_code IS NULL AND (LOWER(name) LIKE '%bracket%' OR LOWER(name) LIKE '%braces%');
UPDATE service SET visual_cue_code = 'VENEER'      WHERE visual_cue_code IS NULL AND LOWER(name) LIKE '%veneer%';
UPDATE service SET visual_cue_code = 'SEALANT'     WHERE visual_cue_code IS NULL AND LOWER(name) LIKE '%sealant%';
UPDATE service SET visual_cue_code = 'SPLINT'      WHERE visual_cue_code IS NULL AND LOWER(name) LIKE '%splint%';
UPDATE service SET visual_cue_code = 'DENTURE'     WHERE visual_cue_code IS NULL AND LOWER(name) LIKE '%denture%';
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "surfacepricingtier");

            migrationBuilder.DropColumn(
                name: "color",
                table: "tooth_status");

            migrationBuilder.DropColumn(
                name: "recession",
                table: "periomeasurement");

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
        }
    }
}
