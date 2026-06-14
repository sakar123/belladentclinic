"use client";
import { useMemo } from "react";
import Input from "../ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";

export default function AudienceFilterForm({ audienceType, filters, setFilters, roles = [], specialties = [] }) {
  const roleOptions = useMemo(() => roles.map(r => ({ value: r.id, label: r.name })), [roles]);
  const specialtyOptions = useMemo(() => specialties.map(s => ({ value: s.id, label: s.name })), [specialties]);

  const update = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

  if (audienceType === 'Staff') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-app-muted mb-1">Role</div>
          <Select value={filters.roleId || ''} onValueChange={(v) => update('roleId', v || null)}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Any role" /></SelectTrigger>
            <SelectContent>
              {roleOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="text-xs text-app-muted mb-1">Specialty</div>
          <Select value={filters.specialtyId || ''} onValueChange={(v) => update('specialtyId', v || null)}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Any specialty" /></SelectTrigger>
            <SelectContent>
              {specialtyOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="text-xs text-app-muted mb-1">Active</div>
          <Select
            value={filters.isActive === true ? 'true' : filters.isActive === false ? 'false' : ''}
            onValueChange={(v) => update('isActive', v === '' ? null : v === 'true')}
          >
            <SelectTrigger className="w-full"><SelectValue placeholder="Any" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  // Patient
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <div className="text-xs text-app-muted mb-1">Has Email</div>
        <Select
          value={filters.hasEmail === true ? 'true' : filters.hasEmail === false ? 'false' : 'true'}
          onValueChange={(v) => update('hasEmail', v === '' ? null : v === 'true')}
        >
          <SelectTrigger className="w-full"><SelectValue placeholder="Any" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <div className="text-xs text-app-muted mb-1">Marketing Enabled</div>
        <Select
          value={filters.marketingEnabled === true ? 'true' : filters.marketingEnabled === false ? 'false' : ''}
          onValueChange={(v) => update('marketingEnabled', v === '' ? null : v === 'true')}
        >
          <SelectTrigger className="w-full"><SelectValue placeholder="Any" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <div className="text-xs text-app-muted mb-1">Birthday Month</div>
        <Input type="number" min={1} max={12} placeholder="1-12" value={filters.birthdayMonth || ''} onChange={(e) => update('birthdayMonth', e.target.value ? Number(e.target.value) : null)} />
      </div>
      <div>
        <div className="text-xs text-app-muted mb-1">Inactive Since (days)</div>
        <Input type="number" min={0} placeholder="e.g. 90" value={filters.inactiveSinceDays || ''} onChange={(e) => update('inactiveSinceDays', e.target.value ? Number(e.target.value) : null)} />
      </div>
      <div>
        <div className="text-xs text-app-muted mb-1">Appointments between (start)</div>
        <Input type="datetime-local" value={filters.appointmentBetweenStart || ''} onChange={(e) => update('appointmentBetweenStart', e.target.value || null)} />
      </div>
      <div>
        <div className="text-xs text-app-muted mb-1">Appointments between (end)</div>
        <Input type="datetime-local" value={filters.appointmentBetweenEnd || ''} onChange={(e) => update('appointmentBetweenEnd', e.target.value || null)} />
      </div>
    </div>
  );
}
