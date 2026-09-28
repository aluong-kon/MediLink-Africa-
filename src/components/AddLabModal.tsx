import React, { useState } from 'react';
import { FlaskConical, X } from 'lucide-react';
import { Patient, LabRecord } from '../types';

interface AddLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onLabAdded: (lab: LabRecord) => void;
}

export const AddLabModal: React.FC<AddLabModalProps> = ({
  isOpen,
  onClose,
  patient,
  onLabAdded,
}) => {
  const [formData, setFormData] = useState({
    testName: 'Complete Blood Count (CBC)',
    category: 'Blood' as LabRecord['category'],
    orderedBy: 'Dr. Ousmane Sow',
    results: '',
    facility: 'Dakar Principal Hospital Laboratory',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      patientId: patient.id,
      testName: formData.testName,
      category: formData.category,
      status: 'Completed' as const,
      orderedBy: formData.orderedBy,
      results: formData.results,
      facility: formData.facility,
    };

    try {
      const res = await fetch('/api/labs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      onLabAdded(data);
      setLoading(false);
      onClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FlaskConical className="w-6 h-6 text-purple-300" />
            <h2 className="text-lg font-bold">Upload Lab Test Result: {patient.fullName}</h2>
          </div>
          <button onClick={onClose} className="text-purple-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Test Name</label>
            <input
              type="text"
              required
              value={formData.testName}
              onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              >
                <option value="Blood">Blood</option>
                <option value="Urine">Urine</option>
                <option value="Malaria">Malaria</option>
                <option value="HIV">HIV (Confidential)</option>
                <option value="COVID-19">COVID-19</option>
                <option value="Imaging">Imaging (X-Ray/CT)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Ordered By</label>
              <input
                type="text"
                required
                value={formData.orderedBy}
                onChange={(e) => setFormData({ ...formData, orderedBy: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Testing Facility</label>
            <input
              type="text"
              required
              value={formData.facility}
              onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Laboratory Findings & Values</label>
            <textarea
              rows={3}
              required
              placeholder="Enter numerical values, observations, or pathogen status..."
              value={formData.results}
              onChange={(e) => setFormData({ ...formData, results: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg shadow-sm"
            >
              {loading ? 'Uploading...' : 'Publish Lab Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
