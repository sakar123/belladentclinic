'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import {
  Table,
  Tbody as TableBody,
  Td as TableCell,
  Th as TableHead,
  Thead as TableHeader,
  Tr as TableRow,
} from '@/components/ui/table';

export default function BillingPage() {
  const { data: billings, error } = useSWR('billings', () => api.billing.getAll());

  if (error) return <div>Failed to load billing history.</div>;
  if (!billings) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Billing History</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Amount Paid</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {billings.map((billing) => (
            <TableRow key={billing.id}>
              <TableCell>{billing.patient?.person?.first_name} {billing.patient?.person?.last_name}</TableCell>
              <TableCell>${billing.total_amount}</TableCell>
              <TableCell>${billing.amount_paid}</TableCell>
              <TableCell>{new Date(billing.due_date).toLocaleDateString()}</TableCell>
              <TableCell>{billing.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}