import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { Patient } from '../types';

interface BreakGlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onBreakGlassGranted: (patient: Patient, reason: string) => void;
}

export const BreakGlassModal: React.FC<BreakGlassModalProps> = ({
  isOpen,
  onClose,
  patients,
  onBreakGlassGranted,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [justification, setJustification] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Jean-Paul K., Emergency Specialist');
  const [hospitalName, setHospitalName] = useState('Mulago National Referral Hospital, Kampala');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) return;

    const patient = patients.find((p) => p.id === selectedPatientId);
    if (!patient) return;

    onBreakGlassGranted(patient, justification);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border-2 border-rose-500 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-rose-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-rose-200 animate-pulse" />
            <h2 className="text-lg font-bold">Emergency "Break Glass" Access Protocol</h2>
          </div>
          <button onClick={onClose} className="text-rose-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900 space-y-2">
            <p className="font-semibold flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Strict Security & Audit Warning</span>
            </p>
            <p>
              You are about to invoke emergency override access without standard patient QR consent. This action is logged permanently with device metadata and reported directly to Hospital Administrators for compliance review.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Select Patient for Emergency Access
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} (ID: {p.id} - {p.nationalId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Clinician Name</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Facility Name</label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Mandatory Clinical Justification <span className="text-rose-600">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Patient unconscious in trauma ward following road traffic accident; unable to present QR code or provide consent."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg shadow-sm transition flex items-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Confirm Emergency Override</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
