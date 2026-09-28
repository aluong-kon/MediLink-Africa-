import React from 'react';
import { UserRole } from '../types';
import { Shield, LayoutDashboard, Users, FlaskConical, Pill, Building2, UserCheck, FileText, AlertTriangle, QrCode } from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenScanner: () => void;
  onOpenAuditLogs: () => void;
  onOpenBreakGlass: () => void;
  onOpenRegister: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  onSelectRole,
  onOpenScanner,
  onOpenAuditLogs,
  onOpenBreakGlass,
  onOpenRegister,
}) => {
  const roles: UserRole[] = ['Doctor', 'Patient', 'Nurse', 'Laboratory', 'Pharmacist', 'Administrator', 'Receptionist'];

  return (
    <aside className="w-64 bg-slate-900 flex flex-col shrink-0 border-r border-slate-800">
      {/* Brand / Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center shadow-sm shadow-teal-500/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white tracking-tight">MediLink Africa</span>
            <p className="text-[10px] text-teal-400 font-medium tracking-wide">Secure Cloud EHR</p>
          </div>
        </div>
      </div>

      {/* Navigation / Role Selector */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
          Switch User Role
        </div>
        {roles.map((r) => {
          const isActive = currentRole === r;
          return (
            <button
              key={r}
              onClick={() => onSelectRole(r)}
              className={`w-full text-left rounded-md px-3 py-2 flex items-center gap-3 text-sm font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-teal-400 border-l-4 border-teal-500 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              {r === 'Doctor' && <LayoutDashboard className="w-4 h-4" />}
              {r === 'Patient' && <Users className="w-4 h-4" />}
              {r === 'Nurse' && <Shield className="w-4 h-4" />}
              {r === 'Laboratory' && <FlaskConical className="w-4 h-4" />}
              {r === 'Pharmacist' && <Pill className="w-4 h-4" />}
              {r === 'Administrator' && <Building2 className="w-4 h-4" />}
              {r === 'Receptionist' && <UserCheck className="w-4 h-4" />}
              <span>{r} Portal</span>
            </button>
          );
        })}

        <div className="pt-6 border-t border-slate-800 mt-6 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
            Secure Actions
          </div>
          <button
            onClick={onOpenScanner}
            className="w-full text-left text-slate-300 hover:bg-slate-800 hover:text-white rounded-md px-3 py-2 flex items-center gap-3 text-sm font-medium transition cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-teal-400" />
            <span>Scan QR Code</span>
          </button>
          <button
            onClick={onOpenRegister}
            className="w-full text-left text-slate-300 hover:bg-slate-800 hover:text-white rounded-md px-3 py-2 flex items-center gap-3 text-sm font-medium transition cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-teal-400" />
            <span>Register Patient</span>
          </button>
          <button
            onClick={onOpenAuditLogs}
            className="w-full text-left text-slate-300 hover:bg-slate-800 hover:text-white rounded-md px-3 py-2 flex items-center gap-3 text-sm font-medium transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-teal-400" />
            <span>Audit Logs</span>
          </button>
          <button
            onClick={onOpenBreakGlass}
            className="w-full text-left text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 rounded-md px-3 py-2 flex items-center gap-3 text-sm font-medium transition cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Break-Glass Access</span>
          </button>
        </div>
      </nav>

      {/* User Footer Profile */}
      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-teal-400">
            {currentRole === 'Doctor' ? 'DO' : currentRole.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-white font-medium">
              {currentRole === 'Doctor' ? 'Dr. Chike Obi' : `${currentRole} User`}
            </p>
            <p className="text-[11px] text-slate-500">Active Role: {currentRole}</p>
          </div>
        </div>
        <div className="px-3 py-2 bg-emerald-950/30 text-teal-400 text-[10px] rounded border border-emerald-900/50 flex items-center justify-center uppercase font-bold tracking-widest shadow-inner">
          Encrypted Session
        </div>
      </div>
    </aside>
  );
};
