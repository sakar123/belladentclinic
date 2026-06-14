using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicApi.Migrations
{
    /// <inheritdoc />
    public partial class AddVisualCuesAndSurfaces : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_treatment_tooth_tooth_id",
                table: "treatment");

            migrationBuilder.DropIndex(
                name: "IX_treatment_tooth_id",
                table: "treatment");

            migrationBuilder.DropColumn(
                name: "tooth_id",
                table: "treatment");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "document_type");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "document_type");

            migrationBuilder.AddColumn<DateTime>(
                name: "completed_at",
                table: "treatment",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "treatment",
                type: "character varying(25)",
                maxLength: 25,
                nullable: false,
                defaultValue: "Planned");

            migrationBuilder.AddColumn<string>(
                name: "surfaces",
                table: "treatment",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "treatment_scope",
                table: "treatment",
                type: "character varying(25)",
                maxLength: 25,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "resulting_tooth_status_id",
                table: "service",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "visual_cue_code",
                table: "service",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "date_of_birth",
                table: "person",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "notes",
                table: "payment",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "line_item_type",
                table: "billing_line_item",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "service_id",
                table: "billing_line_item",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "issue_date",
                table: "billing",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "due_date",
                table: "billing",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<string>(
                name: "notes",
                table: "billing",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "notification_topic",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    category = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    audience_scope = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "Any"),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notification_topic", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "person_channel_suppression",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    person_id = table.Column<Guid>(type: "uuid", nullable: false),
                    channel = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    contact_value = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    reason = table.Column<string>(type: "text", nullable: false),
                    suppressed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_person_channel_suppression", x => x.id);
                    table.ForeignKey(
                        name: "FK_person_channel_suppression_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "person_contact_method",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    person_id = table.Column<Guid>(type: "uuid", nullable: false),
                    channel = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    contact_value = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    is_primary = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_verified = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    verified_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_person_contact_method", x => x.id);
                    table.ForeignKey(
                        name: "FK_person_contact_method_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "service_tooth_scope",
                columns: table => new
                {
                    service_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tooth_scope = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_service_tooth_scope", x => new { x.service_id, x.tooth_scope });
                    table.ForeignKey(
                        name: "FK_service_tooth_scope_service_service_id",
                        column: x => x.service_id,
                        principalTable: "service",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "treatment_tooth",
                columns: table => new
                {
                    tooth_id = table.Column<Guid>(type: "uuid", nullable: false),
                    treatment_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_treatment_tooth", x => new { x.tooth_id, x.treatment_id });
                    table.ForeignKey(
                        name: "FK_treatment_tooth_tooth_tooth_id",
                        column: x => x.tooth_id,
                        principalTable: "tooth",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_treatment_tooth_treatment_treatment_id",
                        column: x => x.treatment_id,
                        principalTable: "treatment",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "notification_template",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    topic_id = table.Column<Guid>(type: "uuid", nullable: false),
                    channel = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    audience_scope = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "Any"),
                    provider = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "AmazonSES"),
                    subject_template = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    body_text = table.Column<string>(type: "text", nullable: true),
                    body_html = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notification_template", x => x.id);
                    table.ForeignKey(
                        name: "FK_notification_template_notification_topic_topic_id",
                        column: x => x.topic_id,
                        principalTable: "notification_topic",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "person_notification_preference",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    person_id = table.Column<Guid>(type: "uuid", nullable: false),
                    topic_id = table.Column<Guid>(type: "uuid", nullable: false),
                    channel = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    is_enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    opt_in_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Implicit"),
                    opted_in_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    opted_out_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    source = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_person_notification_preference", x => x.id);
                    table.ForeignKey(
                        name: "FK_person_notification_preference_notification_topic_topic_id",
                        column: x => x.topic_id,
                        principalTable: "notification_topic",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_person_notification_preference_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "notification_campaign",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    topic_id = table.Column<Guid>(type: "uuid", nullable: false),
                    template_id = table.Column<Guid>(type: "uuid", nullable: true),
                    channel = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    audience_scope = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "Any"),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Draft"),
                    scheduled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    launched_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    filter_criteria_json = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notification_campaign", x => x.id);
                    table.ForeignKey(
                        name: "FK_notification_campaign_notification_template_template_id",
                        column: x => x.template_id,
                        principalTable: "notification_template",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_notification_campaign_notification_topic_topic_id",
                        column: x => x.topic_id,
                        principalTable: "notification_topic",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "notification",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    topic_id = table.Column<Guid>(type: "uuid", nullable: false),
                    template_id = table.Column<Guid>(type: "uuid", nullable: true),
                    campaign_id = table.Column<Guid>(type: "uuid", nullable: true),
                    appointment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    staff_id = table.Column<Guid>(type: "uuid", nullable: true),
                    channel = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    provider = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "AmazonSES"),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Queued"),
                    subject_rendered = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    body_rendered_text = table.Column<string>(type: "text", nullable: true),
                    body_rendered_html = table.Column<string>(type: "text", nullable: true),
                    scheduled_for = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    processed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    error_message = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notification", x => x.id);
                    table.ForeignKey(
                        name: "FK_notification_appointment_appointment_id",
                        column: x => x.appointment_id,
                        principalTable: "appointment",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_notification_notification_campaign_campaign_id",
                        column: x => x.campaign_id,
                        principalTable: "notification_campaign",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_notification_notification_template_template_id",
                        column: x => x.template_id,
                        principalTable: "notification_template",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_notification_notification_topic_topic_id",
                        column: x => x.topic_id,
                        principalTable: "notification_topic",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_notification_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_notification_staff_staff_id",
                        column: x => x.staff_id,
                        principalTable: "staff",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "notification_recipient",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    notification_id = table.Column<Guid>(type: "uuid", nullable: false),
                    person_id = table.Column<Guid>(type: "uuid", nullable: false),
                    contact_method_id = table.Column<Guid>(type: "uuid", nullable: true),
                    recipient_address = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    recipient_type = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "Primary"),
                    delivery_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Queued"),
                    provider_message_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    sent_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    delivered_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    opened_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    clicked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    failed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    failure_reason = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notification_recipient", x => x.id);
                    table.ForeignKey(
                        name: "FK_notification_recipient_notification_notification_id",
                        column: x => x.notification_id,
                        principalTable: "notification",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_notification_recipient_person_contact_method_contact_method~",
                        column: x => x.contact_method_id,
                        principalTable: "person_contact_method",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_notification_recipient_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "notification_provider_event",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    notification_recipient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    provider = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "AmazonSES"),
                    event_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    event_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    payload = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notification_provider_event", x => x.id);
                    table.ForeignKey(
                        name: "FK_notification_provider_event_notification_recipient_notifica~",
                        column: x => x.notification_recipient_id,
                        principalTable: "notification_recipient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.InsertData(
                table: "specialty",
                columns: new[] { "id", "description", "name" },
                values: new object[] { new Guid("a5f1f0fe-7e51-4b0f-8ccf-3b9e0e24f001"), "General practice", "General Dentistry" });

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

            migrationBuilder.CreateIndex(
                name: "IX_service_resulting_tooth_status_id",
                table: "service",
                column: "resulting_tooth_status_id");

            migrationBuilder.CreateIndex(
                name: "IX_billing_line_item_service_id",
                table: "billing_line_item",
                column: "service_id");

            migrationBuilder.CreateIndex(
                name: "IX_notification_appointment_id",
                table: "notification",
                column: "appointment_id");

            migrationBuilder.CreateIndex(
                name: "IX_notification_campaign_id",
                table: "notification",
                column: "campaign_id");

            migrationBuilder.CreateIndex(
                name: "IX_notification_patient_id",
                table: "notification",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_notification_staff_id",
                table: "notification",
                column: "staff_id");

            migrationBuilder.CreateIndex(
                name: "IX_notification_template_id",
                table: "notification",
                column: "template_id");

            migrationBuilder.CreateIndex(
                name: "IX_notification_topic_id",
                table: "notification",
                column: "topic_id");

            migrationBuilder.CreateIndex(
                name: "IX_notification_campaign_template_id",
                table: "notification_campaign",
                column: "template_id");

            migrationBuilder.CreateIndex(
                name: "IX_notification_campaign_topic_id",
                table: "notification_campaign",
                column: "topic_id");

            migrationBuilder.CreateIndex(
                name: "IX_notification_provider_event_notification_recipient_id",
                table: "notification_provider_event",
                column: "notification_recipient_id");

            migrationBuilder.CreateIndex(
                name: "IX_notification_recipient_contact_method_id",
                table: "notification_recipient",
                column: "contact_method_id");

            migrationBuilder.CreateIndex(
                name: "IX_notification_recipient_notification_id_person_id_recipient_~",
                table: "notification_recipient",
                columns: new[] { "notification_id", "person_id", "recipient_address" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_notification_recipient_person_id",
                table: "notification_recipient",
                column: "person_id");

            migrationBuilder.CreateIndex(
                name: "IX_notification_template_code",
                table: "notification_template",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_notification_template_topic_id",
                table: "notification_template",
                column: "topic_id");

            migrationBuilder.CreateIndex(
                name: "IX_notification_topic_code",
                table: "notification_topic",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_person_channel_suppression_person_id_channel_contact_value",
                table: "person_channel_suppression",
                columns: new[] { "person_id", "channel", "contact_value" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_person_contact_method_person_id_channel_contact_value",
                table: "person_contact_method",
                columns: new[] { "person_id", "channel", "contact_value" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_person_notification_preference_person_id_topic_id_channel",
                table: "person_notification_preference",
                columns: new[] { "person_id", "topic_id", "channel" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_person_notification_preference_topic_id",
                table: "person_notification_preference",
                column: "topic_id");

            migrationBuilder.CreateIndex(
                name: "IX_treatment_tooth_treatment_id",
                table: "treatment_tooth",
                column: "treatment_id");

            migrationBuilder.AddForeignKey(
                name: "FK_billing_line_item_service_service_id",
                table: "billing_line_item",
                column: "service_id",
                principalTable: "service",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_service_tooth_status_resulting_tooth_status_id",
                table: "service",
                column: "resulting_tooth_status_id",
                principalTable: "tooth_status",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_billing_line_item_service_service_id",
                table: "billing_line_item");

            migrationBuilder.DropForeignKey(
                name: "FK_service_tooth_status_resulting_tooth_status_id",
                table: "service");

            migrationBuilder.DropTable(
                name: "notification_provider_event");

            migrationBuilder.DropTable(
                name: "person_channel_suppression");

            migrationBuilder.DropTable(
                name: "person_notification_preference");

            migrationBuilder.DropTable(
                name: "service_tooth_scope");

            migrationBuilder.DropTable(
                name: "treatment_tooth");

            migrationBuilder.DropTable(
                name: "notification_recipient");

            migrationBuilder.DropTable(
                name: "notification");

            migrationBuilder.DropTable(
                name: "person_contact_method");

            migrationBuilder.DropTable(
                name: "notification_campaign");

            migrationBuilder.DropTable(
                name: "notification_template");

            migrationBuilder.DropTable(
                name: "notification_topic");

            migrationBuilder.DropIndex(
                name: "IX_service_resulting_tooth_status_id",
                table: "service");

            migrationBuilder.DropIndex(
                name: "IX_billing_line_item_service_id",
                table: "billing_line_item");

            migrationBuilder.DeleteData(
                table: "specialty",
                keyColumn: "id",
                keyValue: new Guid("a5f1f0fe-7e51-4b0f-8ccf-3b9e0e24f001"));

            migrationBuilder.DropColumn(
                name: "completed_at",
                table: "treatment");

            migrationBuilder.DropColumn(
                name: "status",
                table: "treatment");

            migrationBuilder.DropColumn(
                name: "surfaces",
                table: "treatment");

            migrationBuilder.DropColumn(
                name: "treatment_scope",
                table: "treatment");

            migrationBuilder.DropColumn(
                name: "resulting_tooth_status_id",
                table: "service");

            migrationBuilder.DropColumn(
                name: "visual_cue_code",
                table: "service");

            migrationBuilder.DropColumn(
                name: "notes",
                table: "payment");

            migrationBuilder.DropColumn(
                name: "line_item_type",
                table: "billing_line_item");

            migrationBuilder.DropColumn(
                name: "service_id",
                table: "billing_line_item");

            migrationBuilder.DropColumn(
                name: "notes",
                table: "billing");

            migrationBuilder.AddColumn<Guid>(
                name: "tooth_id",
                table: "treatment",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<DateTime>(
                name: "date_of_birth",
                table: "person",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "date",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "document_type",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "document_type",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AlterColumn<DateTime>(
                name: "issue_date",
                table: "billing",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "date");

            migrationBuilder.AlterColumn<DateTime>(
                name: "due_date",
                table: "billing",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "date");

            migrationBuilder.UpdateData(
                table: "discount_type",
                keyColumn: "id",
                keyValue: new Guid("782b35f4-1252-4de6-a710-9b2681112f7f"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(2000), new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(2000) });

            migrationBuilder.UpdateData(
                table: "discount_type",
                keyColumn: "id",
                keyValue: new Guid("d0115ad2-4098-42f9-b1c2-1faddf373ccb"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(1580), new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(1580) });

            migrationBuilder.UpdateData(
                table: "document_type",
                keyColumn: "id",
                keyValue: new Guid("4ba01043-3d4d-440f-85ca-79f7c6fd52f2"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(1240), new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(1240) });

            migrationBuilder.UpdateData(
                table: "document_type",
                keyColumn: "id",
                keyValue: new Guid("de3b98d3-9281-439c-a014-0d87e38cdb5a"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(780), new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(780) });

            migrationBuilder.UpdateData(
                table: "document_type",
                keyColumn: "id",
                keyValue: new Guid("e8a3bf49-f083-443e-9749-00f54f7bc4bb"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(1240), new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(1240) });

            migrationBuilder.UpdateData(
                table: "tooth_status",
                keyColumn: "id",
                keyValue: new Guid("23ab8f4c-1944-46df-80d9-dc137752f649"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(3240), new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(3240) });

            migrationBuilder.UpdateData(
                table: "tooth_status",
                keyColumn: "id",
                keyValue: new Guid("49bc7706-a3d4-4927-a4d8-9c505dbd426a"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(3640), new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(3640) });

            migrationBuilder.UpdateData(
                table: "tooth_status",
                keyColumn: "id",
                keyValue: new Guid("58921fa0-25c3-45f4-976c-ea17379a98ed"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(3640), new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(3640) });

            migrationBuilder.UpdateData(
                table: "tooth_status",
                keyColumn: "id",
                keyValue: new Guid("665eb447-6d2e-4889-97b0-ea80c931c7bd"),
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(3630), new DateTime(2026, 1, 8, 22, 56, 44, 606, DateTimeKind.Utc).AddTicks(3640) });

            migrationBuilder.CreateIndex(
                name: "IX_treatment_tooth_id",
                table: "treatment",
                column: "tooth_id");

            migrationBuilder.AddForeignKey(
                name: "FK_treatment_tooth_tooth_id",
                table: "treatment",
                column: "tooth_id",
                principalTable: "tooth",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
