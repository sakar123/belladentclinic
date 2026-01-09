'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import Button from '@/components/ui/button';
import {
  Table,
  Tbody as TableBody,
  Td as TableCell,
  Th as TableHead,
  Thead as TableHeader,
  Tr as TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

export default function AppointmentsPage() {
  const { data, error } = useSWR('appointments', () => api.appointment.getAll());

  if (error) return <div>Failed to load appointments.</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <Button asChild>
          <Link href="/appointments/new">Schedule New Appointment</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>{appointment.patient?.person?.first_name} {appointment.patient?.person?.last_name}</TableCell>
              <TableCell>{appointment.staff?.person?.first_name} {appointment.staff?.person?.last_name}</TableCell>
              <TableCell>{new Date(appointment.appointment_start_time).toLocaleString()}</TableCell>
              <TableCell>{appointment.status?.name}</TableCell>
              <TableCell>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/appointments/${appointment.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}