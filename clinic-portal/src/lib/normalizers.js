function coerceGender(value) {
  if (value === undefined || value === null || value === "") return "";
  const mapNum = { 0: "Male", 1: "Female", 2: "Other", 3: "PreferNotToSay" };
  if (typeof value === "number") return mapNum[value] ?? String(value);
  const s = String(value).trim();
  const lower = s.toLowerCase();
  if (["male", "m"].includes(lower)) return "Male";
  if (["female", "f"].includes(lower)) return "Female";
  if (["other"].includes(lower)) return "Other";
  if (["prefernottosay", "prefer not to say", "na", "n/a", "unspecified"].includes(lower.replace(/\s+/g, ""))) return "PreferNotToSay";
  // If already a valid enum token, keep as-is
  if (["Male", "Female", "Other", "PreferNotToSay"].includes(s)) return s;
  return s;
}

export function normalizePatient(p) {
  if (!p || typeof p !== 'object') return p;
  const person = p.person || {};
  return {
    ...p,
    firstName: p.firstName ?? person.firstName ?? person.first_name ?? '',
    lastName: p.lastName ?? person.lastName ?? person.last_name ?? '',
    email: p.email ?? person.email ?? '',
    phone: p.phone ?? person.phone ?? person.phoneNumber ?? person.phone_number ?? '',
    gender: coerceGender(p.gender ?? person.gender ?? ''),
    dob: p.dob ?? person.dob ?? person.dateOfBirth ?? person.date_of_birth ?? '',
    address: p.address ?? person.address ?? '',
  };
}

export function normalizeStaff(s, roleMap = {}) {
  if (!s || typeof s !== 'object') return s;
  const person = s.person || {};
  const roleName = roleMap[s.roleId] || roleMap[s.role_id] || s.role || s.position || '';
  return {
    ...s,
    firstName: s.firstName ?? person.firstName ?? person.first_name ?? '',
    lastName: s.lastName ?? person.lastName ?? person.last_name ?? '',
    email: s.email ?? person.email ?? '',
    phone: s.phone ?? person.phone ?? person.phoneNumber ?? person.phone_number ?? '',
    gender: coerceGender(s.gender ?? person.gender ?? ''),
    dob: s.dob ?? person.dob ?? person.dateOfBirth ?? person.date_of_birth ?? '',
    address: s.address ?? person.address ?? '',
    role: roleName,
  };
}
