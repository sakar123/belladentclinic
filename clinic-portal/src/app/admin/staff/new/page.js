'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';

export default function NewStaffPage() {
  const router = useRouter();
  const { notify } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [roleId, setRoleId] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const { data: roles } = useSWR('roles', () => api.role.getAll());
  const { data: specialties } = useSWR('specialties', () => api.specialty.getAll());

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.staff.create({
      person: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: phone,
        address: address,
        date_of_birth: dateOfBirth,
        gender: gender,
      },
      role_id: roleId,
      specialty_id: specialtyId,
      license_number: licenseNumber,
      is_active: true,
    });
    notify({ title: 'Staff added' });
    router.push('/admin/staff');
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-3xl font-bold">Add New Staff Member</h1>
        <Button variant="destructive" onClick={() => router.push('/admin/staff')} className="rounded-full h-10 w-10 p-0 flex items-center justify-center" title="Cancel">
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
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={setRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="specialty">Specialty</Label>
            <Select onValueChange={setSpecialtyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="licenseNumber">License Number</Label>
          <Input id="licenseNumber" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
        </div>
        <Button type="submit">Add Staff Member</Button>
      </form>
    </div>
  );
}
