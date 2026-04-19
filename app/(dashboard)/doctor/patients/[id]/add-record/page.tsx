'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type RecordFormData = {
  symptoms: string
  diagnosis: string
  treatment: string
  notes: string
  bloodPressure: string
  temperature: string
  pulse: string
  weight: string
}

export default function AddRecordPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [formData, setFormData] = useState<RecordFormData>({
    symptoms: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    bloodPressure: '',
    temperature: '',
    pulse: '',
    weight: ''
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/medical-records/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: params.id,
          visitDate: new Date().toISOString(),
          ...formData
        })
      });

      if (response.ok) {
        alert('Medical record added successfully!');
        router.push(`/doctor/patients/${params.id}`);
      } else {
        alert('Failed to add record');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding record');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add Medical Record</h1>

      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-4">
        <div>
          <label className="block font-medium mb-1">Symptoms *</label>
          <textarea
            name="symptoms"
            required
            value={formData.symptoms}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Diagnosis *</label>
          <textarea
            name="diagnosis"
            required
            value={formData.diagnosis}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Treatment *</label>
          <textarea
            name="treatment"
            required
            value={formData.treatment}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Additional Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Blood Pressure</label>
            <input
              type="text"
              name="bloodPressure"
              placeholder="120/80"
              value={formData.bloodPressure}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Temperature</label>
            <input
              type="text"
              name="temperature"
              placeholder="98.6°F"
              value={formData.temperature}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Pulse</label>
            <input
              type="text"
              name="pulse"
              placeholder="72 BPM"
              value={formData.pulse}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Weight</label>
            <input
              type="text"
              name="weight"
              placeholder="70 kg"
              value={formData.weight}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Saving...' : 'Save Record'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border px-6 py-2 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
