export const ROLE_CLAIM = process.env.NEXT_PUBLIC_AUTH0_ROLE_CLAIM || 'https://clinic.app/roles';
export const PATIENT_ID_CLAIM = process.env.NEXT_PUBLIC_AUTH0_PATIENT_ID_CLAIM || 'https://clinic.app/patient_id';

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

export function isStaff(user) {
  // Dev mode: allow all users (or no user) to act as staff
  return true;
}

export function isPatient(user) {
  // Dev mode: treat everyone as patient-capable
  return true;
}

export function getPatientIdFromUser(user) {
  if (!user) return undefined;
  return (
    user[PATIENT_ID_CLAIM] ||
    user?.user_metadata?.patientId ||
    user?.user_metadata?.personId ||
    user?.app_metadata?.patientId ||
    user?.app_metadata?.personId
  );
}
