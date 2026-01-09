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
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Manage Lookups</h1>
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
