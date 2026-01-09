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

export default function PatientsPage() {
  const { data: patients, error } = useSWR('patients', () => api.patient.getAll());

  if (error) return <div>Failed to load patients.</div>;
  if (!patients) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Patients</h1>
        <Button asChild>
          <Link href="/patients/new">Add New Patient</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell>{patient.person.first_name} {patient.person.last_name}</TableCell>
              <TableCell>{patient.person.email}</TableCell>
              <TableCell>{patient.person.phone_number}</TableCell>
              <TableCell>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/patients/${patient.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}