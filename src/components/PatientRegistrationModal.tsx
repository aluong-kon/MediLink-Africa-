import React, { useState } from 'react';
import { UserCheck, X, Plus, Trash2 } from 'lucide-react';
import { Patient } from '../types';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (patient: Patient) => void;
}

export const PatientRegistrationModal: React.FC<PatientRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '1995-06-10',
    gender: 'Female',
    nationalId: '',
    phone: '',
    email: '',
    address: '',
    bloodGroup: 'O+',
    emergencyName: '',
    emergencyRelation: 'Spouse',
    emergencyPhone: '',
    chronicDisease: '',
    allergy: '',
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newPatientPayload = {
      fullName: formData.fullName || 'New Patient',
      dob: formData.dob,
      gender: formData.gender,
      nationalId: formData.nationalId || `REG-${Math.floor(100000 + Math.random() * 900000)}`,
      phone: formData.phone || '+254 700 000 000',
      email: formData.email || 'patient@example.com',
      address: formData.address || 'Nairobi, Kenya',
      emergencyContact: {
        name: formData.emergencyName || 'Emergency Contact',
        relation: formData.emergencyRelation,
        phone: formData.emergencyPhone || '+254 700 000 001',
      },
      bloodGroup: formData.bloodGroup,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      medicalHistory: {
        previousIllnesses: ['None reported'],
        chronicDiseases: formData.chronicDisease ? [formData.chronicDisease] : ['None'],
        allergies: formData.allergy ? [formData.allergy] : ['None'],
        surgeries: ['None'],
        hospitalAdmissions: ['None'],
        currentMedications: ['None'],
        familyHistory: ['None reported'],
        immunizations: ['COVID-19 Vaccinated'],
      }
    };

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatientPayload),
      });
      const data = await res.json();
      onRegisterSuccess(data);
      setLoading(false);
      onClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-emerald-300" />
            <h2 className="text-lg font-bold">Register New Patient & Generate QR Card</h2>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Amina Diallo"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">National ID / Refugee ID</label>
              <input
                type="text"
                required
                placeholder="e.g. KEN-2026-99182"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                required
                placeholder="+254 712 345 678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Emergency Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Contact Name"
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Relation (e.g. Spouse)"
                value={formData.emergencyRelation}
                onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Initial Medical Alert Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Known Chronic Disease (e.g. Asthma, Hypertension)"
                value={formData.chronicDisease}
                onChange={(e) => setFormData({ ...formData, chronicDisease: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Allergies (e.g. Penicillin, Peanuts)"
                value={formData.allergy}
                onChange={(e) => setFormData({ ...formData, allergy: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
            >
              {loading ? 'Generating QR & Profile...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
