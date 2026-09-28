import React from 'react';
import { QrCode, AlertTriangle, UserCheck } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenScanner: () => void;
  onOpenAuditLogs: () => void;
  onOpenBreakGlass: () => void;
  onOpenRegister: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onOpenScanner,
  onOpenAuditLogs,
  onOpenBreakGlass,
  onOpenRegister,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-xs">
      <div className="flex items-center gap-4 text-sm">
        <span className="text-slate-400">Location:</span>
        <span className="font-medium text-slate-900">St. Mary’s Specialist Clinic, Nairobi</span>
        <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full border border-teal-200 font-semibold">
          Active Role: {currentRole}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {currentRole === 'Doctor' && (
          <button
            onClick={onOpenScanner}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors shadow-sm shadow-teal-900/20 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Patient QR Code</span>
          </button>
        )}
        {currentRole === 'Receptionist' && (
          <button
            onClick={onOpenRegister}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors shadow-sm shadow-teal-900/20 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Register Patient</span>
          </button>
        )}
        <button
          onClick={onOpenAuditLogs}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          Audit Logs
        </button>
        <button
          onClick={onOpenBreakGlass}
          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Break Glass</span>
        </button>
      </div>
    </header>
  );
};

