'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { http } from '@/lib/http';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';

export default function OnboardingPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: '',
    address: '',
    date_of_birth: '',
    gender: 'Other'
  });

  const staffId = user?.['https://clinic.app/staff_id'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!staffId) return;

    setLoading(true);
    try {
      // 1. Update staff/person details
      await http.put(`/staff/${staffId}`, {
        roleId: user['https://clinic.app/roles']?.[0],
        person: {
          firstName: user.given_name || '',
          lastName: user.family_name || '',
          email: user.email,
          ...formData
        }
      });

      // 2. Mark profile as complete
      await http.post('/invitation/complete-profile', { staffId });

      // 3. Force re-login to update claims
      logout();
    } catch (err) {
      alert('Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
        <p className="text-gray-600 mb-6">Welcome to BellaDent! Please provide a few more details to get started.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Phone Number"
            value={formData.phone_number}
            onChange={e => setFormData({...formData, phone_number: e.target.value})}
            required
          />
          <Input
            label="Address"
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
            required
          />
          <Input
            label="Date of Birth"
            type="date"
            value={formData.date_of_birth}
            onChange={e => setFormData({...formData, date_of_birth: e.target.value})}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2"
              value={formData.gender}
              onChange={e => setFormData({...formData, gender: e.target.value})}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <Button type="submit" className="w-full" loading={loading}>Finish Setup</Button>
        </form>
      </div>
    </div>
  );
}
