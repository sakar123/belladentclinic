'use client';

import { useState } from 'react';
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
import { useRouter } from 'next/navigation';
import Combobox from "@/components/ui/combobox";
import Dialog, { DialogBody, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function NewAppointmentPage() {
  const router = useRouter();
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
    await api.appointment.create({
      patient_id: patientId,
      staff_id: staffId,
      status_id: statusId,
      appointment_start_time: startTime,
      duration_minutes: duration,
      reason_for_visit: reason,
      notes: notes,
    });
    router.push('/appointments');
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Schedule New Appointment</h1>
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