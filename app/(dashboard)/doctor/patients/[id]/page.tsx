'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { MedicalRecord, Patient } from '@/types/medical-record';

export default function PatientDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  
  // ADD TYPES HERE - this is what you're missing!
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPatientData = useCallback(async () => {
    try {
      const patientRes = await fetch(`/api/patients/${params.id}`);
      const patientData = await patientRes.json();
      setPatient(patientData);

      const recordsRes = await fetch(`/api/medical-records/doctor?patientId=${params.id}`);
      const recordsData = await recordsRes.json();
      setRecords(recordsData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchPatientData();
    }
  }, [params.id, fetchPatientData]);

  if (loading) return <div>Loading...</div>;
  if (!patient) return <div>Patient not found</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">
          {patient.firstName} {patient.lastName}
        </h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Phone:</span> {patient.phoneNumber}
          </div>
          <div>
            <span className="font-medium">Blood Type:</span> {patient.bloodType || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Date of Birth:</span>{' '}
            {new Date(patient.dateOfBirth).toLocaleDateString()}
          </div>
        </div>

        <button
          onClick={() => router.push(`/doctor/patients/${params.id}/add-record`)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Record
        </button>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Medical History</h2>
        {records.length === 0 ? (
          <p className="text-gray-600">No records yet</p>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="bg-white border rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  {new Date(record.visitDate).toLocaleDateString()}
                </p>
                <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
                <p><strong>Treatment:</strong> {record.treatment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}