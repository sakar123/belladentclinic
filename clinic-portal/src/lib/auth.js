export const ROLE_CLAIM = 'https://clinic.app/roles';
export const PATIENT_ID_CLAIM = 'https://clinic.app/patient_id';
export const STAFF_ID_CLAIM = 'https://clinic.app/staff_id';

export const ROLE_TIERS = {
  AdminOnly: ['Administrator'],
  ClinicalOrAbove: ['Administrator', 'Dentist', 'Oral Surgeon', 'Orthodontist', 'Endodontist', 'Periodontist', 'Prosthodontist'],
  SupportOrAbove: ['Administrator', 'Dentist', 'Oral Surgeon', 'Orthodontist', 'Endodontist', 'Periodontist', 'Prosthodontist', 'Hygienist', 'Radiologist'],
  AllStaff: ['Administrator', 'Dentist', 'Oral Surgeon', 'Orthodontist', 'Endodontist', 'Periodontist', 'Prosthodontist', 'Hygienist', 'Radiologist', 'Receptionist'],
  BillingStaff: ['Administrator', 'Dentist', 'Oral Surgeon', 'Orthodontist', 'Endodontist', 'Periodontist', 'Prosthodontist', 'Receptionist'],
  SalesStaff: ['Administrator', 'Receptionist']
};

export function getRoles(user) {
  if (!user) return [];
  const roles = user[ROLE_CLAIM] || user.roles || [];
  return Array.isArray(roles) ? roles : [];
}

export function hasRole(user, role) {
  if (!user) return false;
  const needle = String(role || '').toLowerCase();
  return getRoles(user).some((r) => String(r).toLowerCase() === needle);
}

export function hasAccess(user, tierName) {
  if (!user) return false;
  const allowedRoles = ROLE_TIERS[tierName] || [];
  const userRoles = getRoles(user);
  return userRoles.some(role => allowedRoles.includes(role));
}

export function isAdmin(user) {
  return hasRole(user, 'Administrator');
}

export function isStaff(user) {
  const roles = getRoles(user);
  return roles.length > 0; // In this app, anyone with a role in Auth0 is staff
}

export function isPatient(user) {
  return !!user[PATIENT_ID_CLAIM];
}

export function getPatientIdFromUser(user) {
  return user ? user[PATIENT_ID_CLAIM] : undefined;
}

export function getStaffIdFromUser(user) {
  return user ? user[STAFF_ID_CLAIM] : undefined;
}
