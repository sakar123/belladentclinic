"use client";
import { useEffect, useMemo, useState } from "react";
import { http } from "../../lib/http";
import { Table, Thead, Tbody, Tr, Th, Td } from "../../components/ui/table";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";
import Skeleton from "../../components/ui/skeleton";
import Dialog, { DialogBody, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { useToast } from "../../components/ui/toast";
// Auth disabled for dev: no imports or gating
import Combobox from "../../components/ui/combobox";
import { normalizeStaff } from "../../lib/normalizers";

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [roleMap, setRoleMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [edit, setEdit] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const { notify } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [r, s] = await Promise.all([
          http.get('/api/Role').catch(() => []),
          http.get('/api/Staff').catch(() => []),
        ]);
        if (!mounted) return;
        const rlist = Array.isArray(r) ? r : [];
        setRoles(rlist);
        const rmap = Object.fromEntries(rlist.map((x) => [x.id, x.name || x.title || '']));
        setRoleMap(rmap);
        const slist = Array.isArray(s) ? s.map((x) => normalizeStaff(x, rmap)) : [];
        setStaff(slist);
      } catch (e) {
        if (mounted) { setRoles([]); setRoleMap({}); setStaff([]); }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = [...(staff || [])];
    if (!needle) return list;
    return list.filter((s) => (
      `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase().includes(needle) ||
      (s.email || '').toLowerCase().includes(needle) ||
      (s.phone || '').toLowerCase().includes(needle) ||
      (s.role || '').toLowerCase().includes(needle)
    ));
  }, [staff, q]);

  // Auth disabled: always render and allow managing

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Staff</h1>
          <p className="text-sm text-app-muted">Manage clinic staff</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search staff" className="w-[240px] text-black" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button variant="secondary" onClick={() => setOpenCreate(true)}>New Staff</Button>
        </div>
      </div>

      <div className="rounded-xl border border-app-border bg-app-surface elevate overflow-x-auto">
        <Table>
          <Thead>
            <Tr>
              <Th className="min-w-[200px]">Name</Th>
              <Th className="min-w-[220px]">Email</Th>
              <Th className="min-w-[140px]">Phone</Th>
              <Th className="min-w-[140px]">Role</Th>
              <Th className="w-[200px] text-right pr-4">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading && ([...Array(6)].map((_, i) => (
              <Tr key={i}><Td colSpan={4}><Skeleton className="h-8 w-full" /></Td></Tr>
            )))}
            {!loading && filtered.map((s) => (
              <Tr key={s.id}>
                <Td>{`${s.firstName || ''} ${s.lastName || ''}`.trim() || '—'}</Td>
                <Td>{s.email || '—'}</Td>
                <Td>{s.phone || '—'}</Td>
                <Td>{s.role || s.position || '—'}</Td>
                <Td className="text-right pr-4">
                  <div className="inline-flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEdit(s)}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => setToDelete(s)}>Delete</Button>
                  </div>
                </Td>
              </Tr>
            ))}
            {!loading && filtered.length === 0 && (
              <Tr><Td colSpan={4} className="text-center text-app-muted py-10">No staff found.</Td></Tr>
            )}
          </Tbody>
        </Table>
      </div>

      <CreateStaffDialog
        open={openCreate}
        roles={roles}
        onClose={() => setOpenCreate(false)}
        onCreated={async () => {
          try {
            const [r, s] = await Promise.all([
              http.get('/api/Role').catch(() => []),
              http.get('/api/Staff').catch(() => []),
            ]);
            const rlist = Array.isArray(r) ? r : [];
            const rmap = Object.fromEntries(rlist.map((x) => [x.id, x.name || x.title || '']));
            setRoles(rlist); setRoleMap(rmap);
            setStaff(Array.isArray(s) ? s.map((x) => normalizeStaff(x, rmap)) : []);
            notify({ title: 'Staff created' });
          } catch (e) {
            notify({ title: 'Failed to refresh', description: String(e?.message || e) });
          }
        }}
      />
      <CreateStaffDialog
        open={!!edit}
        initial={edit}
        roles={roles}
        onClose={() => setEdit(null)}
        onCreated={async () => {
          try {
            const [r, s] = await Promise.all([
              http.get('/api/Role').catch(() => []),
              http.get('/api/Staff').catch(() => []),
            ]);
            const rlist = Array.isArray(r) ? r : [];
            const rmap = Object.fromEntries(rlist.map((x) => [x.id, x.name || x.title || '']));
            setRoles(rlist); setRoleMap(rmap);
            setStaff(Array.isArray(s) ? s.map((x) => normalizeStaff(x, rmap)) : []);
            notify({ title: 'Staff updated' });
          } catch (e) {
            notify({ title: 'Failed to refresh', description: String(e?.message || e) });
          }
        }}
      />
      <ConfirmDialog
        open={!!toDelete}
        title="Delete Staff"
        body={toDelete ? `Are you sure you want to delete ${toDelete.firstName || ''} ${toDelete.lastName || ''}?` : ''}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          try {
            await http.del(`/api/Staff/${toDelete.id}`);
            const data = await http.get('/api/Staff');
            setStaff(Array.isArray(data) ? data.map((x) => normalizeStaff(x, roleMap)) : []);
            notify({ title: 'Staff deleted' });
          } catch (e) {
            notify({ title: 'Delete failed', description: String(e?.message || e) });
          } finally {
            setToDelete(null);
          }
        }}
      />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-1 text-app-muted text-sm">{label}</div>
      {children}
    </label>
  );
}

function CreateStaffDialog({ open, onClose, onCreated, initial, roles }) {
  const [v, setV] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    roleId: '',
    licenseNumber: '',
    gender: '',
    dob: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    if (open) {
      const i = initial || {};
      setV({
        firstName: i.firstName || '',
        lastName: i.lastName || '',
        email: i.email || '',
        phone: i.phone || '',
        roleId: i.roleId || i.role_id || '',
        licenseNumber: i.licenseNumber || i.license_number || '',
        gender: i.gender || '',
        dob: i.dob || '',
        address: i.address || '',
      });
      setErrors({});
    }
  }, [open, initial]);

  const validate = () => {
    const err = {};
    if (!v.firstName) err.firstName = 'Required';
    if (!v.lastName) err.lastName = 'Required';
    if (!v.email) err.email = 'Required';
    if (!v.phone) err.phone = 'Required';
    if (!v.roleId) err.roleId = 'Required';
    if (!v.licenseNumber) err.licenseNumber = 'Required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const genderEnum = (() => {
        const val = (v.gender || '').trim();
        const lower = val.toLowerCase();
        if (["male", "m"].includes(lower)) return "Male";
        if (["female", "f"].includes(lower)) return "Female";
        if (["other"].includes(lower)) return "Other";
        if (!val) return "PreferNotToSay";
        if (["Male", "Female", "Other", "PreferNotToSay"].includes(val)) return val;
        if (lower.replace(/\s+/g,"") === "prefernottosay") return "PreferNotToSay";
        return "PreferNotToSay";
      })();
      const dob = (() => {
        if (!v.dob) return undefined;
        const d = new Date(v.dob);
        return isNaN(d) ? undefined : d.toISOString();
      })();
      const genderEnum = (() => {
        const val = (v.gender || '').trim();
        const lower = val.toLowerCase();
        if (["male", "m", "0", "male (0)", "man"].includes(lower)) return 0;
        if (["female", "f", "1", "female (1)", "woman"].includes(lower)) return 1;
        if (["other", "2"].includes(lower)) return 2;
        if (!val) return 3;
        if (["prefernottosay", "prefer not to say", "3"].includes(lower.replace(/\s+/g, ""))) return 3;
        return 3;
      })();
      const payload = {
        person: {
          firstName: v.firstName,
          lastName: v.lastName,
          email: v.email,
          phoneNumber: v.phone,
          gender: genderEnum,
          dateOfBirth: dob,
          address: v.address,
        },
        roleId: v.roleId,
        licenseNumber: v.licenseNumber,
        isActive: true,
      };
      if (initial?.id) {
        await http.put(`/api/Staff/${initial.id}`, payload);
      } else {
        await http.post('/api/Staff', payload);
      }
      onClose();
      await onCreated?.();
    } catch (e) {
      notify({ title: initial?.id ? 'Failed to update staff' : 'Failed to create staff', description: String(e?.message || e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={submit}>
        <DialogHeader>
          <DialogTitle>{initial?.id ? 'Edit Staff' : 'New Staff'}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="First name">
              <Input value={v.firstName} onChange={(e) => setV({ ...v, firstName: e.target.value })} />
              {errors.firstName && <div className="mt-1 text-xs text-red-600">{errors.firstName}</div>}
            </Field>
            <Field label="Last name">
              <Input value={v.lastName} onChange={(e) => setV({ ...v, lastName: e.target.value })} />
              {errors.lastName && <div className="mt-1 text-xs text-red-600">{errors.lastName}</div>}
            </Field>
            <Field label="Email">
              <Input type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
              {errors.email && <div className="mt-1 text-xs text-red-600">{errors.email}</div>}
            </Field>
            <Field label="Phone">
              <Input value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} />
              {errors.phone && <div className="mt-1 text-xs text-red-600">{errors.phone}</div>}
            </Field>
            <Field label="Role">
              <Combobox value={v.roleId} onChange={(val) => setV({ ...v, roleId: val })} options={(roles||[]).map(r => ({ value: r.id, label: r.name || r.title || r.id }))} placeholder="Select role" />
              {errors.roleId && <div className="mt-1 text-xs text-red-600">{errors.roleId}</div>}
            </Field>
            <Field label="License number">
              <Input value={v.licenseNumber} onChange={(e) => setV({ ...v, licenseNumber: e.target.value })} />
              {errors.licenseNumber && <div className="mt-1 text-xs text-red-600">{errors.licenseNumber}</div>}
            </Field>
            <Field label="Gender">
              <Input placeholder="Male/Female/Other" value={v.gender} onChange={(e) => setV({ ...v, gender: e.target.value })} />
            </Field>
            <Field label="Date of birth">
              <Input type="date" value={v.dob} onChange={(e) => setV({ ...v, dob: e.target.value })} />
            </Field>
            <Field label="Address">
              <Input value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} />
            </Field>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="secondary" disabled={loading}>{initial?.id ? 'Save' : 'Create'}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

function ConfirmDialog({ open, title, body, onCancel, onConfirm }) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <div className="text-sm">{body}</div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm}>Confirm</Button>
      </DialogFooter>
    </Dialog>
  );
}
