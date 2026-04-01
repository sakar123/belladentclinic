'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LookupTable from '@/components/lookuptable';

export default function LookupsPage() {
  const lookups = [
    { name: 'Appointment Status', value: 'appointmentStatus' },
    { name: 'Document Types', value: 'documentTypes' },
    { name: 'Discount Types', value: 'discountTypes' },
    { name: 'Roles', value: 'roles' },
    { name: 'Tooth Status', value: 'toothStatus' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lookups</h1>
        <p className="text-sm text-app-muted">Manage reference data and enums</p>
      </div>
      <Tabs defaultValue="appointmentStatus">
        <TabsList>
          {lookups.map((lookup) => (
            <TabsTrigger key={lookup.value} value={lookup.value}>
              {lookup.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {lookups.map((lookup) => (
          <TabsContent key={lookup.value} value={lookup.value}>
            <LookupTable lookupType={lookup.value} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
