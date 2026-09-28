import React, { useState } from 'react';
import { Stethoscope, X } from 'lucide-react';
import { Patient, VisitRecord } from '../types';

interface AddVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onVisitAdded: (visit: VisitRecord) => void;
}

export const AddVisitModal: React.FC<AddVisitModalProps> = ({
  isOpen,
  onClose,
  patient,
  onVisitAdded,
}) => {
  const [formData, setFormData] = useState({
    hospitalName: 'Dakar Principal Hospital',
    doctorName: 'Dr. Ousmane Sow',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    prescriptions: '',
    followUpDate: '',
    clinicalNotes: '',
  });
  const [loading, setLoading] = useState(false);
  const [aiSupport, setAiSupport] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  if (!isOpen) return null;

  const handleFetchAiSupport = async () => {
    if (!formData.symptoms.trim()) return;
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/clinical-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: formData.symptoms,
          patientHistory: patient.medicalHistory,
        }),
      });
      const data = await res.json();
      setAiSupport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      patientId: patient.id,
      hospitalName: formData.hospitalName,
      doctorName: formData.doctorName,
      diagnosis: formData.diagnosis,
      symptoms: formData.symptoms.split(',').map((s) => s.trim()),
      treatment: formData.treatment,
      prescriptions: formData.prescriptions.split(',').map((p) => p.trim()).filter(Boolean),
      followUpDate: formData.followUpDate,
      clinicalNotes: formData.clinicalNotes,
    };

    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      onVisitAdded(data);
      setLoading(false);
      onClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-6 h-6 text-emerald-300" />
            <h2 className="text-lg font-bold">New Consultation & Diagnosis: {patient.fullName}</h2>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Hospital Name</label>
              <input
                type="text"
                required
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Attending Doctor</label>
              <input
                type="text"
                required
                value={formData.doctorName}
                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase">Symptoms (comma separated)</label>
              <button
                type="button"
                onClick={handleFetchAiSupport}
                disabled={loadingAi}
                className="text-xs text-emerald-700 font-semibold hover:underline flex items-center space-x-1"
              >
                <span>✨ Get AI Clinical Support</span>
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Fever, persistent cough, fatigue"
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>

          {/* AI Clinical Decision Support suggestions */}
          {aiSupport && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 space-y-2">
              <p className="font-bold flex items-center space-x-1">
                <span>🤖 AI Clinical Decision Support Suggestions:</span>
              </p>
              <p><strong>Suggested Diagnoses:</strong> {aiSupport.suggestedDiagnoses?.join(', ')}</p>
              <p><strong>Recommended Tests:</strong> {aiSupport.recommendedTests?.join(', ')}</p>
              <p><strong>Treatment Guidelines:</strong> {aiSupport.treatmentGuidelines}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Diagnosis</label>
            <input
              type="text"
              required
              placeholder="e.g. Acute Malaria / Bronchitis"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Treatment Protocol</label>
              <input
                type="text"
                required
                placeholder="e.g. Antimalarial course & hydration"
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Follow-up Date</label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Prescriptions (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Coartem, Paracetamol"
              value={formData.prescriptions}
              onChange={(e) => setFormData({ ...formData, prescriptions: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Clinical Notes</label>
            <textarea
              rows={3}
              required
              placeholder="Detailed physical examination and consultation notes..."
              value={formData.clinicalNotes}
              onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm"
            >
              {loading ? 'Saving Record...' : 'Save Consultation Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
