'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import Button from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';

export default function AppointmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const { data: appointment, error } = useSWR(id ? `appointments/${id}` : null, () => api.appointment.getById(id));

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      await api.appointments.delete(id);
      router.push('/appointments');
    }
  };

  if (error) return <div>Failed to load appointment details.</div>;
  if (!appointment) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Appointment Details</h1>
      <div className="space-y-4">
        <p><strong>Patient:</strong> {appointment.patient?.person?.first_name} {appointment.patient?.person?.last_name}</p>
        <p><strong>Staff:</strong> {appointment.staff?.person?.first_name} {appointment.staff?.person?.last_name}</p>
        <p><strong>Start Time:</strong> {new Date(appointment.appointment_start_time).toLocaleString()}</p>
        <p><strong>Duration:</strong> {appointment.duration_minutes} minutes</p>
        <p><strong>Status:</strong> {appointment.status?.name}</p>
        <p><strong>Reason for Visit:</strong> {appointment.reason_for_visit}</p>
        <p><strong>Notes:</strong> {appointment.notes}</p>
      </div>
      <div className="mt-6 space-x-4">
        <Button>Reschedule</Button>
        <Button variant="destructive" onClick={handleCancel}>Cancel Appointment</Button>
      </div>
    </div>
  );
}
