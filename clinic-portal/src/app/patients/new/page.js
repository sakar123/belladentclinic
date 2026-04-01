'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';

export default function NewPatientPage() {
  const router = useRouter();
  const { notify } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.patient.create({
      person: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: phone,
        address: address,
        date_of_birth: dateOfBirth,
        gender: gender,
      },
      emergency_contact_name: emergencyContactName,
      emergency_contact_phone: emergencyContactPhone,
    });
    notify({ title: 'Patient added' });
    router.push('/patients');
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-3xl font-bold">Add New Patient</h1>
        <Button variant="destructive" onClick={() => router.push('/patients')} className="rounded-full h-10 w-10 p-0 flex items-center justify-center" title="Cancel">
          <span className="text-xl">×</span>
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input id="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Input id="gender" value={gender} onChange={(e) => setGender(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
            <Input id="emergencyContactName" value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
            <Input id="emergencyContactPhone" value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} />
          </div>
        </div>
        <Button type="submit">Add Patient</Button>
      </form>
    </div>
  );
}
