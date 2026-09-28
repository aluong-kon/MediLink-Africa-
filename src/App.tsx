import React, { useState, useEffect } from 'react';
import { UserRole, Patient, VisitRecord, LabRecord, PrescriptionRecord, AuditLog } from './types';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { PatientDetailView } from './components/PatientDetailView';
import { QrScannerModal } from './components/QrScannerModal';
import { PatientRegistrationModal } from './components/PatientRegistrationModal';
import { BreakGlassModal } from './components/BreakGlassModal';
import { AuditLogDrawer } from './components/AuditLogDrawer';
import { AddVisitModal } from './components/AddVisitModal';
import { AddLabModal } from './components/AddLabModal';
import { AddPrescriptionModal } from './components/AddPrescriptionModal';
import { Search, QrCode, Stethoscope, ArrowRight } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('Doctor');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [labs, setLabs] = useState<LabRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isBreakGlassOpen, setIsBreakGlassOpen] = useState(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false);
  const [isAddLabOpen, setIsAddLabOpen] = useState(false);
  const [isAddRxOpen, setIsAddRxOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pRes, vRes, lRes, rRes, aRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/visits'),
        fetch('/api/labs'),
        fetch('/api/prescriptions'),
        fetch('/api/audit-logs'),
      ]);

      const pData = await pRes.json();
      const vData = await vRes.json();
      const lData = await lRes.json();
      const rData = await rRes.json();
      const aData = await aRes.json();

      setPatients(pData);
      setVisits(vData);
      setLabs(lData);
      setPrescriptions(rData);
      setAuditLogs(aData);

      // Default select first patient for convenience if none selected
      if (pData.length > 0 && !selectedPatient) {
        setSelectedPatient(pData[0]);
      }
    } catch (err) {
      console.error("Error loading EHR data:", err);
    }
  };

  const handleSelectPatient = async (patient: Patient, scanMethod: string = 'QR_SCAN') => {
    setSelectedPatient(patient);

    // Log audit trail
    const newLog = {
      doctorName: currentRole === 'Doctor' ? 'Dr. Ousmane Sow' : `${currentRole} User`,
      hospitalName: 'Dakar Principal Regional Hospital',
      patientId: patient.id,
      patientName: patient.fullName,
      accessType: scanMethod,
      deviceInfo: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Workstation',
      reason: scanMethod === 'QR_SCAN' ? 'Scanned digital health card QR token' : 'Manual patient record lookup',
      granted: true,
    };

    try {
      const res = await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
      const logData = await res.json();
      setAuditLogs((prev) => [logData, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBreakGlassGranted = async (patient: Patient, reason: string) => {
    setSelectedPatient(patient);
    const newLog = {
      doctorName: 'Dr. Jean-Paul K., ER Specialist',
      hospitalName: 'Mulago National Referral Hospital, Kampala',
      patientId: patient.id,
      patientName: patient.fullName,
      accessType: 'EMERGENCY_BREAK_GLASS' as const,
      deviceInfo: 'Emergency Ward Secure Terminal',
      reason: reason,
      granted: true,
    };

    try {
      const res = await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
      const logData = await res.json();
      setAuditLogs((prev) => [logData, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nationalId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
        onOpenBreakGlass={() => setIsBreakGlassOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar
          currentRole={currentRole}
          onSelectRole={setCurrentRole}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
          onOpenBreakGlass={() => setIsBreakGlassOpen(true)}
          onOpenRegister={() => setIsRegisterOpen(true)}
        />

        {/* Main App Content Area */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50">
          {currentRole === 'Patient' ? (
            // Patient Portal View: shows their own profile card & history
            selectedPatient ? (
              <PatientDetailView
                patient={selectedPatient}
                visits={visits}
                labs={labs}
                prescriptions={prescriptions}
                currentRole={currentRole}
                onAddVisitClick={() => setIsAddVisitOpen(true)}
                onAddLabClick={() => setIsAddLabOpen(true)}
                onAddRxClick={() => setIsAddRxOpen(true)}
              />
            ) : (
              <div className="text-center py-20 text-slate-500">Loading patient profile...</div>
            )
          ) : (
            // Clinician / Staff View: Patient Search / Directory & Selected Record
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Patient Registry & QR Gateway</h2>
                  <p className="text-xs text-slate-500">Scan QR codes or select a patient to access cloud EHR records instantly.</p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search by name, ID, national ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-64 sm:w-80"
                    />
                  </div>
                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 shadow-sm shrink-0 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Scan QR</span>
                  </button>
                </div>
              </div>

              {/* Patients Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient, 'MANUAL_LOOKUP')}
                    className={`bg-white rounded-xl p-5 border transition cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group ${
                      selectedPatient?.id === patient.id ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/20' : 'border-slate-200 hover:border-teal-400'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={patient.photoUrl}
                        alt={patient.fullName}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 group-hover:border-teal-500 shrink-0"
                      />
                      <div className="space-y-1 overflow-hidden">
                        <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-teal-900">
                          {patient.fullName}
                        </h3>
                        <p className="text-xs text-slate-500">ID: {patient.id}</p>
                        <p className="text-xs text-slate-500">DOB: {patient.dob} ({patient.gender})</p>
                        <p className="text-xs font-semibold text-rose-600">Blood Group: {patient.bloodGroup}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium">
                        {patient.medicalHistory.chronicDiseases.length > 0 ? patient.medicalHistory.chronicDiseases[0] : 'Stable'}
                      </span>
                      <span className="text-xs font-semibold text-teal-600 flex items-center space-x-1 group-hover:translate-x-1 transition">
                        <span>Open Record</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Patient Detailed View */}
              {selectedPatient && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <div className="bg-slate-900 text-white px-6 py-3 rounded-xl mb-6 flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-3">
                      <Stethoscope className="w-5 h-5 text-teal-400" />
                      <span className="font-bold text-sm">Active EHR Session: {selectedPatient.fullName}</span>
                    </div>
                    <span className="text-xs bg-teal-950 text-teal-300 px-3 py-1 rounded-full border border-teal-800 font-mono">
                      Token Verified
                    </span>
                  </div>

                  <PatientDetailView
                    patient={selectedPatient}
                    visits={visits}
                    labs={labs}
                    prescriptions={prescriptions}
                    currentRole={currentRole}
                    onAddVisitClick={() => setIsAddVisitOpen(true)}
                    onAddLabClick={() => setIsAddLabOpen(true)}
                    onAddRxClick={() => setIsAddRxOpen(true)}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        patients={patients}
        onSelectPatient={handleSelectPatient}
      />

      <PatientRegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegisterSuccess={(newPatient) => {
          setPatients((prev) => [newPatient, ...prev]);
          handleSelectPatient(newPatient, 'QR_SCAN');
        }}
      />

      <BreakGlassModal
        isOpen={isBreakGlassOpen}
        onClose={() => setIsBreakGlassOpen(false)}
        patients={patients}
        onBreakGlassGranted={handleBreakGlassGranted}
      />

      <AuditLogDrawer
        isOpen={isAuditLogsOpen}
        onClose={() => setIsAuditLogsOpen(false)}
        logs={auditLogs}
      />

      {selectedPatient && (
        <>
          <AddVisitModal
            isOpen={isAddVisitOpen}
            onClose={() => setIsAddVisitOpen(false)}
            patient={selectedPatient}
            onVisitAdded={(newVisit) => {
              setVisits((prev) => [newVisit, ...prev]);
              loadData();
            }}
          />

          <AddLabModal
            isOpen={isAddLabOpen}
            onClose={() => setIsAddLabOpen(false)}
            patient={selectedPatient}
            onLabAdded={(newLab) => {
              setLabs((prev) => [newLab, ...prev]);
            }}
          />

          <AddPrescriptionModal
            isOpen={isAddRxOpen}
            onClose={() => setIsAddRxOpen(false)}
            patient={selectedPatient}
            onRxAdded={(newRx) => {
              setPrescriptions((prev) => [newRx, ...prev]);
            }}
          />
        </>
      )}
    </div>
  );
}

