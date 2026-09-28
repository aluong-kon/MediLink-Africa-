import React from 'react';
import { UserRole } from '../types';
import { Shield, Stethoscope, User, FlaskConical, Pill, Building2, UserCheck, CheckCircle2 } from 'lucide-react';

interface RoleBannerProps {
  currentRole: UserRole;
  onOpenScanner: () => void;
  onOpenRegister: () => void;
}

export const RoleBanner: React.FC<RoleBannerProps> = ({ currentRole, onOpenScanner, onOpenRegister }) => {
  const getRoleDetails = () => {
    switch (currentRole) {
      case 'Patient':
        return {
          title: 'Patient Portal',
          desc: 'View your digital health card, QR code, medical history, lab results, and manage your health consent settings.',
          icon: User,
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'Doctor':
        return {
          title: 'Clinician / Physician Portal',
          desc: 'Scan patient QR codes instantly, review AI health summaries, check drug interactions, and update consultation records.',
          icon: Stethoscope,
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
      case 'Nurse':
        return {
          title: 'Nursing Station & Triage',
          desc: 'Record patient vital signs (blood pressure, temperature, pulse), update nursing care notes, and manage ward admissions.',
          icon: CheckCircle2,
          badgeColor: 'bg-teal-100 text-teal-800 border-teal-200'
        };
      case 'Laboratory':
        return {
          title: 'Laboratory Diagnostics',
          desc: 'Review test orders, upload secure lab results (blood, malaria, COVID-19, HIV with privacy controls), and notify clinicians.',
          icon: FlaskConical,
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case 'Pharmacist':
        return {
          title: 'Hospital Pharmacy & Dispensing',
          desc: 'Review electronic prescriptions, check drug allergies, dispense medication, and log refill history.',
          icon: Pill,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      case 'Administrator':
        return {
          title: 'Hospital Administration & Compliance',
          desc: 'Monitor facility activity metrics, audit logs, RBAC access controls, and emergency break-glass justifications.',
          icon: Building2,
          badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
        };
      case 'Receptionist':
        return {
          title: 'Patient Registration & Check-In',
          desc: 'Register new patients, issue digital health cards with secure QR tokens, and facilitate rapid facility check-ins.',
          icon: UserCheck,
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
        };
    }
  };

  const details = getRoleDetails();
  const IconComponent = details.icon;

  return (
    <div className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className={`p-3 rounded-xl border ${details.badgeColor} flex items-center justify-center shrink-0`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-gray-900">{details.title}</h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${details.badgeColor}`}>
                Active Role: {currentRole}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-0.5">{details.desc}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end md:self-auto">
          {currentRole === 'Doctor' && (
            <button
              onClick={onOpenScanner}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm flex items-center space-x-2"
            >
              <span>Scan Patient QR</span>
            </button>
          )}
          {currentRole === 'Receptionist' && (
            <button
              onClick={onOpenRegister}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm flex items-center space-x-2"
            >
              <span>New Patient Registration</span>
            </button>
          )}
          <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>HIPAA / GDPR Aligned • End-to-End Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
