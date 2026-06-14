"use client";

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function EditServicePage() {
  const { id } = useParams();
  const router = useRouter();
  const { notify } = useToast();
  const { data: service, error, isLoading, mutate } = useSWR(id ? `service-${id}` : null, () => api.service.getById(id));
  const { data: specialties } = useSWR('specialties', () => api.specialty.getAll());

  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');

  useEffect(() => {
    if (service) {
      setName(service.name || '');
      setCost(String(service.cost ?? ''));
      setSpecialtyId(service.specialty_id || service.specialty?.id || '');
    }
  }, [service]);

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.service.update(id, { name, cost: Number(cost || 0), specialty_id: specialtyId || null });
      notify({ title: 'Service updated' });
      await mutate();
      router.push('/admin/services');
    } catch (err) {
      notify({ title: 'Failed to update service', description: String(err?.info || err?.message || err) });
    }
  };

  if (error) return <div className="text-red-600">Failed to load service.</div>;
  if (isLoading || !service) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Service</h1>
          <p className="text-sm text-app-muted">Update details for {service?.name || 'Service'}</p>
        </div>
        <Button variant="destructive" onClick={() => router.push('/admin/services')} className="rounded-full h-10 w-10 p-0 flex items-center justify-center" title="Cancel">
          <span className="text-xl">×</span>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div>
              <div className="text-xs text-app-muted mb-1">Name</div>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <div className="text-xs text-app-muted mb-1">Cost (Rs)</div>
              <Input type="number" min="0" step="1" value={cost} onChange={(e) => setCost(e.target.value)} />
            </div>
            <div>
              <div className="text-xs text-app-muted mb-1">Specialty</div>
              <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)}>
                <option value="">General</option>
                {(specialties || []).map((sp) => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
            </div>
            <div className="text-right">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

