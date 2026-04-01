'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import Combobox from "@/components/ui/combobox";
import Dialog, { DialogBody, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import TeethSelector from '@/components/dental/teeth-selector';

export default function NewAppointmentPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { notify } = useToast();
  const [patientId, setPatientId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [statusId, setStatusId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const { data: patients } = useSWR('patients', () => api.patient.getAll());
  const { data: staff } = useSWR('staff', () => api.staff.getAll());
  const { data: statuses } = useSWR('appointmentStatus', () => api.lookup.appointmentStatus.getAll());
  const { data: allTeeth } = useSWR('teeth', () => api.teeth.getAll());
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePatientSelect = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleConfirmPatient = () => {
    setPatientId(selectedPatient.id);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // append current selection to notes for context (names + numbers)
    let finalNotes = notes;
    if (selectedFdi.size > 0) {
      const items = Array.from(selectedFdi)
        .map(n => patientTeeth.find(t => Number(t.tooth_number) === Number(n)))
        .filter(Boolean)
        .map(t => `Tooth ${t.tooth_number}${t.tooth_name ? ` (${t.tooth_name})` : ''}`);
      const prefix = items.length > 0 ? `Teeth selected: ${items.length} • ${items.join(', ')}` : `Teeth selected: ${selectedFdi.size}`;
      finalNotes = finalNotes ? `${prefix} | ${finalNotes}` : prefix;
    }
    await api.appointment.create({
      patient_id: patientId,
      staff_id: staffId,
      status_id: statusId,
      appointment_start_time: startTime,
      duration_minutes: duration,
      reason_for_visit: reason,
      notes: finalNotes,
    });
    notify({ title: 'Appointment scheduled' });
    router.push('/appointments');
  };

  // Seed from query params (patientId and selected teeth)
  const prePatient = search?.get('patientId') || '';
  const preTeeth = search?.get('teeth') || '';
  const selectedTeeth = preTeeth ? preTeeth.split(',').filter(Boolean) : [];
  
  // Initialize from query once with human-friendly tooth summary
  useEffect(() => {
    if (!prePatient && selectedTeeth.length === 0) return;
    setPatientId(prev => prev || prePatient);
    if (selectedTeeth.length > 0 && (allTeeth||[]).length > 0) {
      const items = (allTeeth || [])
        .filter(t => t.patient_id === (prePatient || patientId))
        .filter(t => selectedTeeth.includes(t.id))
        .map(t => `Tooth ${t.tooth_number}${t.tooth_name ? ` (${t.tooth_name})` : ''}`);
      const summary = items.length > 0 ? `Teeth selected: ${items.length} • ${items.join(', ')}` : `Teeth selected: ${selectedTeeth.length}`;
      setNotes(prev => prev || summary);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTeeth]);

  const selectedPatientById = useMemo(() => (patients||[]).find(p => p.id === patientId), [patients, patientId]);
  const patientTeeth = useMemo(() => (allTeeth||[]).filter(t => t.patient_id === patientId), [allTeeth, patientId]);
  // default dentition visibility based on DOB
  const ageYears = useMemo(() => {
    const dob = selectedPatientById?.person?.date_of_birth ? new Date(selectedPatientById.person.date_of_birth) : null;
    if (!dob) return null;
    const today = new Date();
    return (today.getFullYear() - dob.getFullYear() - ((today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) ? 1 : 0));
  }, [selectedPatientById]);
  const [showPermanent, setShowPermanent] = useState(true);
  const [showPrimary, setShowPrimary] = useState(false);
  useEffect(() => {
    if (ageYears === null) return;
    setShowPrimary(ageYears < 14);
    setShowPermanent(!(ageYears < 14));
  }, [ageYears]);

  // selected teeth by FDI number in this page
  const [selectedFdi, setSelectedFdi] = useState(new Set());
  // Preselect from query param ids once teeth are loaded
  useEffect(() => {
    if (selectedTeeth.length === 0 || (patientTeeth||[]).length === 0) return;
    const numbers = selectedTeeth
      .map(id => (patientTeeth.find(t => t.id === id)?.tooth_number))
      .filter(Boolean)
      .map(Number);
    if (numbers.length > 0) setSelectedFdi(new Set(numbers));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientTeeth.length]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-3xl font-bold">Schedule New Appointment</h1>
        <Button variant="destructive" onClick={() => router.push('/appointments')} className="rounded-full h-10 w-10 p-0 flex items-center justify-center" title="Cancel">
          <span className="text-xl">×</span>
        </Button>
      </div>
      {(selectedTeeth.length > 0 || selectedFdi.size > 0) && (
        <div className="mb-4 text-sm text-app-muted">Preselected teeth: {selectedTeeth.length || selectedFdi.size} selected</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="patient">Patient</Label>
          <Combobox
            options={patients?.map(p => ({ value: p.id, label: `${p.person.first_name} ${p.person.last_name}` })) || []}
            value={patientId}
            onChange={handlePatientSelect}
            placeholder="Select a patient"
          />
        </div>
        {patientId && (
          <div className="rounded border border-app-border p-3">
            <div className="flex items-center justify-between mb-2 text-sm">
              <div className="font-medium">Select Teeth (optional)</div>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={showPermanent} onChange={(e)=>setShowPermanent(e.target.checked)} /> Permanent</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={showPrimary} onChange={(e)=>setShowPrimary(e.target.checked)} /> Primary</label>
              </div>
            </div>
            <TeethSelector
              showPermanent={showPermanent}
              showPrimary={showPrimary}
              selectMode="multiple"
              value={Array.from(selectedFdi)}
              onChange={(next) => setSelectedFdi(new Set((next||[]).map(Number)))}
            />
          </div>
        )}
        <div>
          <Label htmlFor="staff">Staff</Label>
          <Select onValueChange={setStaffId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a staff member" />
            </SelectTrigger>
            <SelectContent>
              {staff?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.person.first_name} {s.person.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select onValueChange={setStatusId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              {statuses?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="reason">Reason for Visit</Label>
          <Input
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <Button type="submit">Schedule Appointment</Button>
      </form>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogBody>
          <DialogHeader>
            <DialogTitle>Confirm Patient</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <p><strong>Name:</strong> {selectedPatient.person.first_name} {selectedPatient.person.last_name}</p>
              <p><strong>Email:</strong> {selectedPatient.person.email}</p>
              <p><strong>Phone:</strong> {selectedPatient.person.phone_number}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmPatient}>Confirm</Button>
          </DialogFooter>
        </DialogBody>
      </Dialog>
    </div>
  );
}
