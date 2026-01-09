'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  Tbody as TableBody,
  Td as TableCell,
  Th as TableHead,
  Thead as TableHeader,
  Tr as TableRow,
} from '@/components/ui/table';

export default function PatientDetailsPage() {
  const params = useParams();
  const { id } = params;

  const { data: patient, error } = useSWR(id ? `patients/${id}` : null, () => api.patient.getById(id));

  if (error) return <div>Failed to load patient details.</div>;
  if (!patient) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{patient.person.first_name} {patient.person.last_name}</h1>
      <div className="space-y-4 mb-6">
        <p><strong>Email:</strong> {patient.person.email}</p>
        <p><strong>Phone:</strong> {patient.person.phone_number}</p>
        <p><strong>Address:</strong> {patient.person.address}</p>
        <p><strong>Date of Birth:</strong> {new Date(patient.person.date_of_birth).toLocaleDateString()}</p>
        <p><strong>Gender:</strong> {patient.person.gender}</p>
        <p><strong>Emergency Contact:</strong> {patient.emergency_contact_name} ({patient.emergency_contact_phone})</p>
      </div>
      <Tabs defaultValue="appointments">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>
        <TabsContent value="appointments">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patient.appointments?.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.staff?.person?.first_name} {appointment.staff?.person?.last_name}</TableCell>
                  <TableCell>{new Date(appointment.appointment_start_time).toLocaleString()}</TableCell>
                  <TableCell>{appointment.status?.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="documents">
          {/* Documents table will go here */}
        </TabsContent>
        <TabsContent value="treatments">
          {/* Treatments table will go here */}
        </TabsContent>
        <TabsContent value="prescriptions">
          {/* Prescriptions table will go here */}
        </TabsContent>
      </Tabs>
    </div>
  );
}