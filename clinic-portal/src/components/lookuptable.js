'use client';

import { useState } from 'react';
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
import LookupForm from './lookup-form';

export default function LookupTable({ lookupType }) {
  const { data, error, mutate } = useSWR(lookupType, api.lookup[lookupType].getAll);
  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await api.lookup[lookupType].delete(id);
      mutate();
    }
  };

  const handleFormSave = async (data) => {
    if (editingItem) {
      await api.lookup[lookupType].update(editingItem.id, data);
    } else {
      await api.lookup[lookupType].create(data);
    }
    mutate();
    setIsFormOpen(false);
  };

  if (error) return <div>Failed to load data.</div>;
  if (!data) return <div>Loading...</div>;

  const columns = Object.keys(data[0] || {});

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAdd}>Add New</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              {columns.map((col) => (
                <TableCell key={col}>{item[col]}</TableCell>
              ))}
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="ml-2"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <LookupForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleFormSave}
        item={editingItem}
        lookupType={lookupType}
        columns={columns.filter(col => col !== 'id')}
      />
    </div>
  );
}
