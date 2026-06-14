'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { withRole } from '@/components/withAuth';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { http } from '@/lib/http';

function InviteStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    roleId: '',
    specialtyId: '',
    licenseNumber: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesData, specialtiesData] = await Promise.all([
          http.get('/lookup/roles'),
          http.get('/specialty')
        ]);
        setRoles(rolesData || []);
        setSpecialties(specialtiesData || []);
      } catch (err) {
        console.error('Failed to fetch lookups', err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await http.post('/invitation', formData);
      router.push('/admin/staff');
    } catch (err) {
      alert(`Error: ${err.message || 'Failed to send invitation'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Invite Staff Member</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={formData.firstName}
            onChange={e => setFormData({...formData, firstName: e.target.value})}
            required
          />
          <Input
            label="Last Name"
            value={formData.lastName}
            onChange={e => setFormData({...formData, lastName: e.target.value})}
            required
          />
        </div>
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={e => setFormData({...formData, email: e.target.value})}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            className="w-full border border-gray-300 rounded-md p-2"
            value={formData.roleId}
            onChange={e => setFormData({...formData, roleId: e.target.value})}
            required
          >
            <option value="">Select a role...</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Specialty (Optional)</label>
          <select
            className="w-full border border-gray-300 rounded-md p-2"
            value={formData.specialtyId}
            onChange={e => setFormData({...formData, specialtyId: e.target.value})}
          >
            <option value="">None</option>
            {specialties.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <Input
          label="License Number (Optional)"
          value={formData.licenseNumber}
          onChange={e => setFormData({...formData, licenseNumber: e.target.value})}
        />

        <div className="pt-4 flex gap-4">
          <Button type="submit" loading={loading}>Send Invitation</Button>
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

export default withRole(InviteStaffPage, 'AdminOnly');
