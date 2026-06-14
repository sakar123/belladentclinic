"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export default function EditStaffPage() {
  const { id } = useParams();
  const router = useRouter();
  const { notify } = useToast();
  const { data: staff, error } = useSWR(id ? `staff-${id}` : null, () => api.staff.getById(id));
  const { data: roles } = useSWR('roles', () => api.role.getAll());

  const [v, setV] = useState({
    firstName: '', lastName: '', email: '', phoneNumber: '', gender: '', address: '', dob: '',
    roleId: '', licenseNumber: '', isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!staff) return;
    const p = staff.person || {};
    setV({
      firstName: p.first_name || staff.firstName || '',
      lastName: p.last_name || staff.lastName || '',
      email: p.email || staff.email || '',
      phoneNumber: p.phone_number || staff.phone || '',
      gender: p.gender || staff.gender || '',
      address: p.address || staff.address || '',
      dob: (p.date_of_birth ? String(p.date_of_birth).slice(0,10) : (staff.dob || '') ),
      roleId: staff.role_id || staff.roleId || '',
      licenseNumber: staff.license_number || staff.licenseNumber || '',
      isActive: typeof staff.is_active === 'boolean' ? staff.is_active : (staff.isActive ?? true),
    });
  }, [staff]);

  if (error) return <div className="text-red-600 p-4">Failed to load staff.</div>;
  if (!staff) return <div className="p-4">Loading…</div>;

  const validate = () => {
    const err = {};
    if (!v.firstName) err.firstName = 'Required';
    if (!v.lastName) err.lastName = 'Required';
    if (!v.email) err.email = 'Required';
    if (!v.phoneNumber) err.phoneNumber = 'Required';
    if (!v.roleId) err.roleId = 'Required';
    if (!v.licenseNumber) err.licenseNumber = 'Required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onSave = async () => {
    setSaving(true);
    try {
      if (!validate()) { setSaving(false); return; }
      const dobIso = v.dob ? new Date(v.dob).toISOString() : undefined;
      const payload = {
        person: {
          firstName: v.firstName,
          lastName: v.lastName,
          email: v.email,
          phoneNumber: v.phoneNumber,
          gender: v.gender || undefined, // omit if blank
          address: v.address,
          dateOfBirth: dobIso,
        },
        roleId: v.roleId,
        licenseNumber: v.licenseNumber,
        isActive: !!v.isActive,
      };
      await api.staff.update(id, payload);
      notify({ title: 'Staff saved' });
      router.push('/admin/staff');
    } catch (e) {
      notify({ title: 'Failed to save', description: e?.info?.message || e?.message || 'Please check inputs' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit Staff</h1>
          <p className="text-sm text-app-muted">Update staff details</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/staff')}>Cancel</Button>
          <Button onClick={onSave} disabled={saving}>Save</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-app-muted mb-1">First name</div>
            <Input value={v.firstName} onChange={(e) => setV({ ...v, firstName: e.target.value })} />
            {errors.firstName && <div className="text-xs text-red-600 mt-1">{errors.firstName}</div>}
          </div>
          <div>
            <div className="text-xs text-app-muted mb-1">Last name</div>
            <Input value={v.lastName} onChange={(e) => setV({ ...v, lastName: e.target.value })} />
            {errors.lastName && <div className="text-xs text-red-600 mt-1">{errors.lastName}</div>}
          </div>
          <div>
            <div className="text-xs text-app-muted mb-1">Email</div>
            <Input type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
            {errors.email && <div className="text-xs text-red-600 mt-1">{errors.email}</div>}
          </div>
          <div>
            <div className="text-xs text-app-muted mb-1">Phone</div>
            <Input value={v.phoneNumber} onChange={(e) => setV({ ...v, phoneNumber: e.target.value })} />
            {errors.phoneNumber && <div className="text-xs text-red-600 mt-1">{errors.phoneNumber}</div>}
          </div>
          <div>
            <div className="text-xs text-app-muted mb-1">Gender</div>
            <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={v.gender} onChange={(e) => setV({ ...v, gender: e.target.value })}>
              <option value="">Unspecified</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <div>
            <div className="text-xs text-app-muted mb-1">Date of birth</div>
            <Input type="date" value={v.dob} onChange={(e) => setV({ ...v, dob: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <div className="text-xs text-app-muted mb-1">Address</div>
            <Input value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} />
          </div>
          <div>
            <div className="text-xs text-app-muted mb-1">Role</div>
            <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={v.roleId} onChange={(e) => setV({ ...v, roleId: e.target.value })}>
              <option value="">Select…</option>
              {(roles||[]).map(r => (<option key={r.id} value={r.id}>{r.name || r.title || r.id}</option>))}
            </select>
            {errors.roleId && <div className="text-xs text-red-600 mt-1">{errors.roleId}</div>}
          </div>
          <div>
            <div className="text-xs text-app-muted mb-1">License number</div>
            <Input value={v.licenseNumber} onChange={(e) => setV({ ...v, licenseNumber: e.target.value })} />
            {errors.licenseNumber && <div className="text-xs text-red-600 mt-1">{errors.licenseNumber}</div>}
          </div>
          <div>
            <div className="text-xs text-app-muted mb-1">Active</div>
            <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={String(v.isActive)} onChange={(e) => setV({ ...v, isActive: e.target.value === 'true' })}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
