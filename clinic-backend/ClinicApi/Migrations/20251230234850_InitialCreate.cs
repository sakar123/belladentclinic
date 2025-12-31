using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "appointment_status",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_appointment_status", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "discount_type",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    discount_name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    discount_percentage = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_discount_type", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "document_type",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    document_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_document_type", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "person",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    first_name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    last_name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    date_of_birth = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    gender = table.Column<string>(type: "text", nullable: true),
                    email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    phone_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    a_identifier = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_person", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "role",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_role", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "specialty",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_specialty", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tooth_status",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tooth_status", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "patient",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    person_id = table.Column<Guid>(type: "uuid", nullable: false),
                    emergency_contact_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    emergency_contact_phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient", x => x.id);
                    table.ForeignKey(
                        name: "FK_patient_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "service",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    specialty_id = table.Column<Guid>(type: "uuid", nullable: true),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    cost = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_service", x => x.id);
                    table.ForeignKey(
                        name: "FK_service_specialty_specialty_id",
                        column: x => x.specialty_id,
                        principalTable: "specialty",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "staff",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    person_id = table.Column<Guid>(type: "uuid", nullable: false),
                    role_id = table.Column<Guid>(type: "uuid", nullable: false),
                    specialty_id = table.Column<Guid>(type: "uuid", nullable: true),
                    license_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_staff", x => x.id);
                    table.ForeignKey(
                        name: "FK_staff_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_staff_role_role_id",
                        column: x => x.role_id,
                        principalTable: "role",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_staff_specialty_specialty_id",
                        column: x => x.specialty_id,
                        principalTable: "specialty",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "billing",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    issue_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    due_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    total_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false, defaultValue: 0.00m),
                    amount_paid = table.Column<decimal>(type: "numeric(18,2)", nullable: false, defaultValue: 0.00m),
                    status = table.Column<string>(type: "text", nullable: false, defaultValue: "Draft"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_billing", x => x.id);
                    table.ForeignKey(
                        name: "FK_billing_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "sale_item",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    discount_id = table.Column<Guid>(type: "uuid", nullable: true),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: true),
                    cost = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sale_item", x => x.id);
                    table.ForeignKey(
                        name: "FK_sale_item_discount_type_discount_id",
                        column: x => x.discount_id,
                        principalTable: "discount_type",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_sale_item_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tooth",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tooth_number = table.Column<int>(type: "integer", nullable: false),
                    tooth_name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    tooth_status_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tooth", x => x.id);
                    table.ForeignKey(
                        name: "FK_tooth_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tooth_tooth_status_tooth_status_id",
                        column: x => x.tooth_status_id,
                        principalTable: "tooth_status",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "appointment",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    staff_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status_id = table.Column<Guid>(type: "uuid", nullable: false),
                    appointment_start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    duration_minutes = table.Column<int>(type: "integer", nullable: false),
                    reason_for_visit = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_appointment", x => x.id);
                    table.ForeignKey(
                        name: "FK_appointment_appointment_status_status_id",
                        column: x => x.status_id,
                        principalTable: "appointment_status",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_appointment_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_appointment_staff_staff_id",
                        column: x => x.staff_id,
                        principalTable: "staff",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "payment",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    billing_id = table.Column<Guid>(type: "uuid", nullable: false),
                    amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    payment_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    method = table.Column<string>(type: "text", nullable: false),
                    transaction_ref = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_payment", x => x.id);
                    table.ForeignKey(
                        name: "FK_payment_billing_billing_id",
                        column: x => x.billing_id,
                        principalTable: "billing",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "treatment",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    appointment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    staff_id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tooth_id = table.Column<Guid>(type: "uuid", nullable: false),
                    notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_treatment", x => x.id);
                    table.ForeignKey(
                        name: "FK_treatment_appointment_appointment_id",
                        column: x => x.appointment_id,
                        principalTable: "appointment",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_treatment_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_treatment_service_service_id",
                        column: x => x.service_id,
                        principalTable: "service",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_treatment_staff_staff_id",
                        column: x => x.staff_id,
                        principalTable: "staff",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_treatment_tooth_tooth_id",
                        column: x => x.tooth_id,
                        principalTable: "tooth",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "billing_line_item",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    billing_id = table.Column<Guid>(type: "uuid", nullable: false),
                    treatment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    unit_price = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    discount_percentage = table.Column<decimal>(type: "numeric(5,2)", nullable: false, defaultValue: 0.00m),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_billing_line_item", x => x.id);
                    table.ForeignKey(
                        name: "FK_billing_line_item_billing_billing_id",
                        column: x => x.billing_id,
                        principalTable: "billing",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_billing_line_item_treatment_treatment_id",
                        column: x => x.treatment_id,
                        principalTable: "treatment",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "document",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tooth_id = table.Column<Guid>(type: "uuid", nullable: true),
                    treatment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    patient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    document_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                    upload_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    is_sensitive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    document_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_document", x => x.id);
                    table.ForeignKey(
                        name: "FK_document_document_type_document_type_id",
                        column: x => x.document_type_id,
                        principalTable: "document_type",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_document_patient_patient_id",
                        column: x => x.patient_id,
                        principalTable: "patient",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_document_tooth_tooth_id",
                        column: x => x.tooth_id,
                        principalTable: "tooth",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_document_treatment_treatment_id",
                        column: x => x.treatment_id,
                        principalTable: "treatment",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "prescription",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    treatment_id = table.Column<Guid>(type: "uuid", nullable: false),
                    drug_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    dosage = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    instructions = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "text", nullable: true),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_prescription", x => x.id);
                    table.ForeignKey(
                        name: "FK_prescription_treatment_treatment_id",
                        column: x => x.treatment_id,
                        principalTable: "treatment",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_appointment_patient_id",
                table: "appointment",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_appointment_staff_id",
                table: "appointment",
                column: "staff_id");

            migrationBuilder.CreateIndex(
                name: "IX_appointment_status_id",
                table: "appointment",
                column: "status_id");

            migrationBuilder.CreateIndex(
                name: "IX_appointment_status_name",
                table: "appointment_status",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_billing_patient_id",
                table: "billing",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_billing_line_item_billing_id",
                table: "billing_line_item",
                column: "billing_id");

            migrationBuilder.CreateIndex(
                name: "IX_billing_line_item_treatment_id",
                table: "billing_line_item",
                column: "treatment_id");

            migrationBuilder.CreateIndex(
                name: "IX_document_document_type_id",
                table: "document",
                column: "document_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_document_patient_id",
                table: "document",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_document_tooth_id",
                table: "document",
                column: "tooth_id");

            migrationBuilder.CreateIndex(
                name: "IX_document_treatment_id",
                table: "document",
                column: "treatment_id");

            migrationBuilder.CreateIndex(
                name: "IX_patient_person_id",
                table: "patient",
                column: "person_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_payment_billing_id",
                table: "payment",
                column: "billing_id");

            migrationBuilder.CreateIndex(
                name: "IX_prescription_treatment_id",
                table: "prescription",
                column: "treatment_id");

            migrationBuilder.CreateIndex(
                name: "IX_sale_item_discount_id",
                table: "sale_item",
                column: "discount_id");

            migrationBuilder.CreateIndex(
                name: "IX_sale_item_patient_id",
                table: "sale_item",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_service_specialty_id",
                table: "service",
                column: "specialty_id");

            migrationBuilder.CreateIndex(
                name: "IX_staff_person_id",
                table: "staff",
                column: "person_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_staff_role_id",
                table: "staff",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_staff_specialty_id",
                table: "staff",
                column: "specialty_id");

            migrationBuilder.CreateIndex(
                name: "IX_tooth_patient_id_tooth_number",
                table: "tooth",
                columns: new[] { "patient_id", "tooth_number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_tooth_tooth_status_id",
                table: "tooth",
                column: "tooth_status_id");

            migrationBuilder.CreateIndex(
                name: "IX_tooth_status_code",
                table: "tooth_status",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_treatment_appointment_id",
                table: "treatment",
                column: "appointment_id");

            migrationBuilder.CreateIndex(
                name: "IX_treatment_patient_id",
                table: "treatment",
                column: "patient_id");

            migrationBuilder.CreateIndex(
                name: "IX_treatment_service_id",
                table: "treatment",
                column: "service_id");

            migrationBuilder.CreateIndex(
                name: "IX_treatment_staff_id",
                table: "treatment",
                column: "staff_id");

            migrationBuilder.CreateIndex(
                name: "IX_treatment_tooth_id",
                table: "treatment",
                column: "tooth_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "billing_line_item");

            migrationBuilder.DropTable(
                name: "document");

            migrationBuilder.DropTable(
                name: "payment");

            migrationBuilder.DropTable(
                name: "prescription");

            migrationBuilder.DropTable(
                name: "sale_item");

            migrationBuilder.DropTable(
                name: "document_type");

            migrationBuilder.DropTable(
                name: "billing");

            migrationBuilder.DropTable(
                name: "treatment");

            migrationBuilder.DropTable(
                name: "discount_type");

            migrationBuilder.DropTable(
                name: "appointment");

            migrationBuilder.DropTable(
                name: "service");

            migrationBuilder.DropTable(
                name: "tooth");

            migrationBuilder.DropTable(
                name: "appointment_status");

            migrationBuilder.DropTable(
                name: "staff");

            migrationBuilder.DropTable(
                name: "patient");

            migrationBuilder.DropTable(
                name: "tooth_status");

            migrationBuilder.DropTable(
                name: "role");

            migrationBuilder.DropTable(
                name: "specialty");

            migrationBuilder.DropTable(
                name: "person");
        }
    }
}
