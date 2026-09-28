import React from 'react';
import { FileText, X, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLog[];
}

export const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-300" />
            <h2 className="text-lg font-bold">System Audit Trail & Access Logs</h2>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-emerald-50 border-b border-emerald-100 text-xs text-emerald-900 flex items-center space-x-2">
          <Shield className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Every QR scan, record update, and emergency break-glass event is cryptographically audited for HIPAA and GDPR compliance.</span>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-gray-50">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`bg-white rounded-xl p-4 border shadow-xs space-y-2 ${
                log.accessType === 'EMERGENCY_BREAK_GLASS'
                  ? 'border-rose-300 bg-rose-50/30'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">{log.timestamp}</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    log.accessType === 'EMERGENCY_BREAK_GLASS'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : log.accessType === 'QR_SCAN'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {log.accessType}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Patient: {log.patientName} <span className="text-xs text-gray-500">({log.patientId})</span>
                  </h4>
                  <p className="text-xs text-gray-700 font-medium mt-0.5">
                    Clinician: {log.doctorName} @ {log.hospitalName}
                  </p>
                </div>
                <div className="text-right">
                  {log.granted ? (
                    <span className="inline-flex items-center text-xs text-emerald-700 font-medium">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Granted
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs text-rose-700 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Denied
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-600 bg-gray-100/80 p-2.5 rounded-lg space-y-1">
                <p>
                  <strong className="text-gray-700">Reason / Context:</strong> {log.reason}
                </p>
                <p className="text-gray-500">
                  <strong className="text-gray-600">Device:</strong> {log.deviceInfo}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center shrink-0">
          <span>Total Audit Entries: {logs.length}</span>
          <button onClick={onClose} className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
