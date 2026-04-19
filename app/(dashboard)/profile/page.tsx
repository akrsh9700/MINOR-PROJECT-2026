'use client';

import { useState, useEffect } from 'react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  city: string;
  emergencyContact: string;
  bloodType?: string;
  gender: string;
  dateOfBirth: string;
  user?: {
    email: string;
  };
}

interface ProfileFormData {
  phoneNumber: string;
  address: string;
  city: string;
  emergencyContact: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    phoneNumber: '',
    address: '',
    city: '',
    emergencyContact: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      setProfile(data);
      setFormData({
        phoneNumber: data.phoneNumber || '',
        address: data.address || '',
        city: data.city || '',
        emergencyContact: data.emergencyContact || ''
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        fetchProfile();
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="font-semibold mb-2">Basic Information</h2>
        <p><strong>Name:</strong> {profile?.firstName} {profile?.lastName}</p>
        <p><strong>Email:</strong> {profile?.user?.email}</p>
        <p><strong>Gender:</strong> {profile?.gender}</p>
        <p><strong>Blood Type:</strong> {profile?.bloodType || 'Not set'}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold">Update Contact Information</h2>

        <div>
          <label className="block font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Emergency Contact</label>
          <input
            type="tel"
            value={formData.emergencyContact}
            onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? 'Saving...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}