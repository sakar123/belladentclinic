"use client";
import { useEffect, useMemo, useState } from "react";
import { http } from "../../lib/http";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";
import Skeleton from "../../components/ui/skeleton";
import { Table, Thead, Tbody, Tr, Th, Td } from "../../components/ui/table";
import Link from "next/link";
import { ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";
import Dialog, { DialogBody, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { useToast } from "../../components/ui/toast";
// Auth disabled for dev
import { normalizePatient } from "../../lib/normalizers";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState({ key: "lastName", dir: "asc" });
  const [openCreate, setOpenCreate] = useState(false);
  const [edit, setEdit] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const { notify } = useToast();
  const canManage = true;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await http.get("/api/Patient");
        if (!mounted) return;
        setPatients(Array.isArray(data) ? data.map(normalizePatient) : []);
      } catch (e) {
        console.error(e);
        if (mounted) setPatients([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = [...patients];
    base.sort((a, b) => {
      const av = (a[sort.key] || "").toString().toLowerCase();
      const bv = (b[sort.key] || "").toString().toLowerCase();
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    if (!needle) return base;
    return base.filter((p) => {
      const fullName = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
      return (
        fullName.includes(needle) ||
        (p.email || "").toLowerCase().includes(needle) ||
        (p.phone || "").toLowerCase().includes(needle)
      );
    });
  }, [patients, q, sort]);

  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Patients</h1>
        <p className="text-sm text-app-muted">Search and manage patient records</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-lg">
          <Input
            placeholder="Search by name, email, or phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="text-black"
          />
        </div>
        {canManage && (
          <Button onClick={() => setOpenCreate(true)}>New Patient</Button>
        )}
      </div>

      <div className="rounded-xl border border-app-border bg-app-surface elevate">
        <div className="overflow-x-auto">
          <Table>
            <Thead>
              <Tr>
                <Th className="min-w-[160px]">Name</Th>
                <Th className="min-w-[160px]">
                  <button className="inline-flex items-center gap-1" onClick={() => toggleSort("lastName")}>
                    Last name <ArrowUpDown size={14} className="text-app-muted" />
                  </button>
                </Th>
                <Th className="min-w-[220px]">
                  <button className="inline-flex items-center gap-1" onClick={() => toggleSort("email")}>
                    Email <ArrowUpDown size={14} className="text-app-muted" />
                  </button>
                </Th>
                <Th className="min-w-[140px]">Phone</Th>
                <Th className="w-[220px] text-right pr-4">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading && (
                [...Array(6)].map((_, i) => (
                  <Tr key={i}>
                    <Td colSpan={5}>
                      <Skeleton className="h-8 w-full" />
                    </Td>
                  </Tr>
                ))
              )}
              {!loading && filtered.map((p) => (
                <Tr key={p.id}>
                  <Td>{`${p.firstName || ""} ${p.lastName || ""}`.trim()}</Td>
                  <Td>{p.lastName || "—"}</Td>
                  <Td>{p.email || "—"}</Td>
                  <Td>{p.phone || "—"}</Td>
                  <Td className="text-right pr-4">
                    <div className="inline-flex gap-2">
                      <Button as={Link} href={`/patients/${p.id}`} size="sm">View</Button>
                      {canManage && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => setEdit(p)}>Edit</Button>
                          <Button size="sm" variant="outline" onClick={() => setToDelete(p)}>Delete</Button>
                        </>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
              {!loading && filtered.length === 0 && (
                <Tr>
                  <Td colSpan={5} className="text-center text-app-muted py-10">No patients found.</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </div>
      </div>

      <CreatePatientDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={async () => {
          try {
            const data = await http.get("/api/Patient");
            setPatients(Array.isArray(data) ? data.map(normalizePatient) : []);
            notify({ title: "Patient created" });
          } catch (e) {
            notify({ title: 'Failed to refresh', description: String(e?.message || e) });
          }
        }}
      />
      <CreatePatientDialog
        open={!!edit}
        initial={edit}
        onClose={() => setEdit(null)}
        onCreated={async () => {
          try {
            const data = await http.get("/api/Patient");
            setPatients(Array.isArray(data) ? data.map(normalizePatient) : []);
            notify({ title: "Patient updated" });
          } catch (e) {
            notify({ title: 'Failed to refresh', description: String(e?.message || e) });
          }
        }}
      />
      <ConfirmDialog
        open={!!toDelete}
        title="Delete Patient"
        body={toDelete ? `Are you sure you want to delete ${toDelete.firstName || ''} ${toDelete.lastName || ''}?` : ''}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          try {
            await http.del(`/api/Patient/${toDelete.id}`);
            const data = await http.get("/api/Patient");
            setPatients(Array.isArray(data) ? data : []);
            notify({ title: 'Patient deleted' });
          } catch (e) {
            notify({ title: 'Delete failed', description: String(e?.message || e) });
          } finally {
            setToDelete(null);
          }
        }}
      />
    </motion.div>
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

function CreatePatientDialog({ open, onClose, onCreated, initial }) {
  const [v, setV] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    if (open) {
      const i = initial || {};
      setV({
        firstName: i.firstName || "",
        lastName: i.lastName || "",
        email: i.email || "",
        phone: i.phone || "",
        gender: i.gender || "",
        dob: toLocalDate(i.dob),
        address: i.address || "",
        emergencyContactName: i.emergencyContactName || "",
        emergencyContactPhone: i.emergencyContactPhone || "",
      });
      setErrors({});
    }
  }, [open, initial]);

  const validate = () => {
    const err = {};
    if (!v.firstName) err.firstName = "Required";
    if (!v.lastName) err.lastName = "Required";
    if (!v.email) err.email = "Required";
    if (!v.phone) err.phone = "Required";
    if (!v.gender) err.gender = "Required";
    if (!v.dob) err.dob = "Required";
    if (!v.address) err.address = "Required";
    if (!v.emergencyContactName) err.emergencyContactName = "Required";
    if (!v.emergencyContactPhone) err.emergencyContactPhone = "Required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Always send UTC ISO string for DOB to satisfy timestamptz
      const dob = (() => {
        if (!v.dob) return undefined;
        const d = new Date(v.dob);
        return isNaN(d) ? undefined : d.toISOString();
      })();
      // Backend expects numeric enum (0:Male,1:Female,2:Other,3:PreferNotToSay)
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
        emergencyContactName: v.emergencyContactName,
        emergencyContactPhone: v.emergencyContactPhone,
      };
      if (initial?.id) {
        await http.put(`/api/Patient/${initial.id}`, payload);
      } else {
        await http.post('/api/Patient', payload);
      }
      onClose();
      await onCreated?.();
    } catch (e) {
      notify({ title: initial?.id ? 'Failed to update patient' : 'Failed to create patient', description: String(e?.message || e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={submit}>
        <DialogHeader>
          <DialogTitle>{initial?.id ? 'Edit Patient' : 'New Patient'}</DialogTitle>
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
            <Field label="Gender">
              <Input placeholder="e.g., Male/Female/Other" value={v.gender} onChange={(e) => setV({ ...v, gender: e.target.value })} />
              {errors.gender && <div className="mt-1 text-xs text-red-600">{errors.gender}</div>}
            </Field>
            <Field label="Date of birth">
              <Input type="date" value={v.dob} onChange={(e) => setV({ ...v, dob: e.target.value })} />
              {errors.dob && <div className="mt-1 text-xs text-red-600">{errors.dob}</div>}
            </Field>
            <Field label="Address" className="md:col-span-2">
              <Input value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} />
              {errors.address && <div className="mt-1 text-xs text-red-600">{errors.address}</div>}
            </Field>
            <Field label="Emergency contact name">
              <Input value={v.emergencyContactName} onChange={(e) => setV({ ...v, emergencyContactName: e.target.value })} />
              {errors.emergencyContactName && <div className="mt-1 text-xs text-red-600">{errors.emergencyContactName}</div>}
            </Field>
            <Field label="Emergency contact phone">
              <Input value={v.emergencyContactPhone} onChange={(e) => setV({ ...v, emergencyContactPhone: e.target.value })} />
              {errors.emergencyContactPhone && <div className="mt-1 text-xs text-red-600">{errors.emergencyContactPhone}</div>}
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
        <Button variant="accent" onClick={onConfirm}>Confirm</Button>
      </DialogFooter>
    </Dialog>
  );
}

function toLocalDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
