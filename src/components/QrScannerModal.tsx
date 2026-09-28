import React, { useState } from 'react';
import { QrCode, X, Camera, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { Patient } from '../types';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onSelectPatient: (patient: Patient, scanMethod: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  patients,
  onSelectPatient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateScan = (patient: Patient) => {
    setScanning(true);
    setScanSuccess(`Verified secure QR token for ${patient.fullName}`);
    setTimeout(() => {
      setScanning(false);
      setScanSuccess(null);
      onSelectPatient(patient, 'QR_SCAN');
      onClose();
    }, 800);
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nationalId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode className="w-6 h-6 text-emerald-300" />
            <h2 className="text-lg font-bold">MediLink Secure QR Code Scanner</h2>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Viewfinder Simulation Box */}
          <div className="relative bg-gray-900 rounded-xl p-6 text-center text-white flex flex-col items-center justify-center h-52 border-2 border-dashed border-emerald-500/50 shadow-inner">
            {scanning ? (
              <div className="space-y-3 animate-pulse">
                <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
                <p className="text-emerald-200 font-medium">{scanSuccess}</p>
              </div>
            ) : (
              <>
                <div className="absolute inset-4 border-2 border-emerald-400/40 rounded-lg pointer-events-none flex items-center justify-center">
                  <div className="w-32 h-32 border border-dashed border-emerald-300/60 rounded-md animate-pulse"></div>
                </div>
                <Camera className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
                <p className="text-sm font-medium text-gray-200">
                  Align patient's digital health card QR code within camera viewfinder
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Server verifies cryptographic token instantly with zero records stored in QR
                </p>
              </>
            )}
          </div>

          {/* Quick Select Patient for Demo Testing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">
                Or Select Patient for Instant Simulated Scan:
              </label>
              <div className="relative w-48">
                <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => handleSimulateScan(patient)}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition group"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={patient.photoUrl}
                      alt={patient.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-gray-300 group-hover:border-emerald-500"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm group-hover:text-emerald-900">
                        {patient.fullName}
                      </h4>
                      <p className="text-xs text-gray-500">
                        ID: {patient.id} • DOB: {patient.dob} • Blood: {patient.bloodGroup}
                      </p>
                    </div>
                  </div>
                  <button className="bg-emerald-100 text-emerald-800 text-xs font-medium px-3 py-1.5 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition">
                    Scan QR
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>🔒 End-to-end encrypted TLS session</span>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 font-medium">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
