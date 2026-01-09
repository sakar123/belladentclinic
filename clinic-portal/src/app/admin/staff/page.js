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

export default function StaffPage() {
  const { data: staff, error } = useSWR('staff', () => api.staff.getAll());

  if (error) return <div>Failed to load staff.</div>;
  if (!staff) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Staff</h1>
        <Button asChild>
          <Link href="/admin/staff/new">Add New Staff</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.person.first_name} {s.person.last_name}</TableCell>
              <TableCell>{s.person.email}</TableCell>
              <TableCell>{s.person.phone_number}</TableCell>
              <TableCell>{s.role?.name}</TableCell>
              <TableCell>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/staff/${s.id}`}>Edit</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
