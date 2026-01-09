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

export default function ServicesPage() {
  const { data: services, error } = useSWR('services', () => api.service.getAll());

  if (error) return <div>Failed to load services.</div>;
  if (!services) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Services</h1>
        <Button asChild>
          <Link href="/admin/services/new">Add New Service</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell>{service.name}</TableCell>
              <TableCell>${service.cost}</TableCell>
              <TableCell>{service.specialty?.name}</TableCell>
              <TableCell>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/services/${service.id}`}>Edit</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
