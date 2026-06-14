using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;
using ClinicApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicApi.Models.Entities;

namespace ClinicApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvitationController : ControllerBase
    {
        private readonly IStaffService _staffService;
        private readonly IAuth0ManagementService _auth0Service;
        private readonly IEmailService _emailService;
        private readonly IRoleService _roleService;

        public InvitationController(
            IStaffService staffService,
            IAuth0ManagementService auth0Service,
            IEmailService emailService,
            IRoleService roleService)
        {
            _staffService = staffService;
            _auth0Service = auth0Service;
            _emailService = emailService;
            _roleService = roleService;
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpPost]
        public async Task<IActionResult> InviteStaff(InvitationDto invitation)
        {
            try
            {
                // 1. Get role name
                var role = await _roleService.GetRoleByIdAsync(invitation.role_id);
                if (role == null) return BadRequest("Invalid role ID");

                // 2. Create Staff & Person (initially inactive)
                var staffDto = new StaffDTO
                {
                    role_id = invitation.role_id,
                    specialty_id = invitation.specialty_id,
                    license_number = invitation.license_number,
                    is_active = false,
                    person = new PersonDTO
                    {
                        first_name = invitation.first_name,
                        last_name = invitation.last_name,
                        email = invitation.email
                    }
                };

                var createdStaff = await _staffService.CreateStaffAsync(staffDto);

                // 3. Create Auth0 User
                var auth0UserId = await _auth0Service.CreateUserAsync(
                    invitation.email, 
                    role.name, 
                    createdStaff.id.ToString(), 
                    createdStaff.person_id.ToString()
                );

                // 4. Store Auth0 ID in Person.a_identifier
                createdStaff.person.a_identifier = auth0UserId;
                await _staffService.UpdateStaffAsync(createdStaff.id.Value, createdStaff);

                // 5. Generate Password Reset / Invitation Link
                var invitationLink = await _auth0Service.GeneratePasswordResetLinkAsync(auth0UserId);

                // 6. Send Invitation Email
                await _emailService.SendEmailAsync(
                    invitation.email,
                    "Invitation to join BellaDent Clinic Portal",
                    $"Hello {invitation.first_name},<br/><br/>You have been invited to join the BellaDent Clinic Portal as a {role.name}.<br/><br/>Please click the link below to set your password and access your account:<br/><br/><a href='{invitationLink}'>Join BellaDent</a><br/><br/>Welcome aboard!"
                );

                return CreatedAtAction(nameof(InviteStaff), new { id = createdStaff.id }, createdStaff);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("complete-profile")]
        public async Task<IActionResult> CompleteProfile(CompleteProfileDto request)
        {
            try
            {
                if (!Guid.TryParse(request.staff_id, out var staffId))
                    return BadRequest("Invalid staff ID");

                var staff = await _staffService.GetStaffByIdAsync(staffId);
                if (staff == null) return NotFound("Staff not found");

                // 1. Mark staff active
                staff.is_active = true;
                await _staffService.UpdateStaffAsync(staffId, staff);

                // 2. Clear needs_profile_completion in Auth0
                if (!string.IsNullOrEmpty(staff.person.a_identifier))
                {
                    await _auth0Service.UpdateUserMetadataAsync(staff.person.a_identifier, new
                    {
                        needs_profile_completion = false
                    });
                }

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
