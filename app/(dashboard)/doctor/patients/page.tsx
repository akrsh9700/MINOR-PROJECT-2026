'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Patient } from '@/types/medical-record';

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    try {
      const response = await fetch('/api/patients');
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Patients</h1>

      <div className="grid gap-4">
        {patients.map((patient) => (
          <Link
            key={patient.id}
            href={`/doctor/patients/${patient.id}`}
            className="block"
          >
            <div className="bg-white border rounded-lg p-4 hover:shadow-md transition">
              <h3 className="font-semibold">
                {patient.firstName} {patient.lastName}
              </h3>
              <p className="text-sm text-gray-600">
                Phone: {patient.phoneNumber}
              </p>
              <p className="text-sm text-gray-600">
                Blood Type: {patient.bloodType || 'N/A'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}