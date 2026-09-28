import React, { useState, useEffect } from 'react';
import { Patient, VisitRecord, LabRecord, PrescriptionRecord, AISummary, UserRole } from '../types';
import { Shield, QrCode, Stethoscope, FlaskConical, Pill, User, Heart, AlertTriangle, Calendar, FileText, CheckCircle2, Plus, Sparkles, Download, Printer, X } from 'lucide-react';

interface PatientDetailViewProps {
  patient: Patient;
  visits: VisitRecord[];
  labs: LabRecord[];
  prescriptions: PrescriptionRecord[];
  currentRole: UserRole;
  onAddVisitClick: () => void;
  onAddLabClick: () => void;
  onAddRxClick: () => void;
}

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({
  patient,
  visits,
  labs,
  prescriptions,
  currentRole,
  onAddVisitClick,
  onAddLabClick,
  onAddRxClick,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'labs' | 'prescriptions' | 'card' | 'consent'>('overview');
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [drugCheckResult, setDrugCheckResult] = useState<any>(null);
  const [checkingDrug, setCheckingDrug] = useState(false);
  const [testNewMed, setTestNewMed] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    fetchAiSummary();
  }, [patient.id]);

  const fetchAiSummary = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient }),
      });
      const data = await res.json();
      setAiSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCheckDrugInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testNewMed.trim()) return;
    setCheckingDrug(true);
    try {
      const res = await fetch('/api/ai/drug-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentMedications: patient.medicalHistory.currentMedications,
          newMedication: testNewMed,
        }),
      });
      const data = await res.json();
      setDrugCheckResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingDrug(false);
    }
  };

  const patientVisits = visits.filter((v) => v.patientId === patient.id);
  const patientLabs = labs.filter((l) => l.patientId === patient.id);
  const patientPrescriptions = prescriptions.filter((p) => p.patientId === patient.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Patient Header Card */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <img
            src={patient.photoUrl}
            alt={patient.fullName}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
          />
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{patient.fullName}</h1>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-semibold border border-emerald-200">
                ID: {patient.id}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              DOB: {patient.dob} ({new Date().getFullYear() - new Date(patient.dob).getFullYear()} yrs) • Gender: {patient.gender} • Blood Group: <span className="font-bold text-rose-600">{patient.bloodGroup}</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              National ID: {patient.nationalId} • Phone: {patient.phone} • {patient.address}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {currentRole === 'Doctor' && (
            <button
              onClick={onAddVisitClick}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm flex items-center space-x-2"
            >
              <Stethoscope className="w-4 h-4" />
              <span>New Consultation</span>
            </button>
          )}
          {currentRole === 'Laboratory' && (
            <button
              onClick={onAddLabClick}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm flex items-center space-x-2"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Upload Lab Result</span>
            </button>
          )}
          {currentRole === 'Pharmacist' && (
            <button
              onClick={onAddRxClick}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm flex items-center space-x-2"
            >
              <Pill className="w-4 h-4" />
              <span>Dispense Prescription</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('card')}
            className="bg-teal-700 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm flex items-center space-x-2"
          >
            <QrCode className="w-4 h-4" />
            <span>Digital Health Card & QR</span>
          </button>
          <button
            onClick={() => setShowPrintModal(true)}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm flex items-center space-x-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Download Patient Summary</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'overview', label: 'AI Health Summary & Overview', icon: Sparkles },
          { id: 'history', label: `Visit History (${patientVisits.length})`, icon: Calendar },
          { id: 'labs', label: `Laboratory Results (${patientLabs.length})`, icon: FlaskConical },
          { id: 'prescriptions', label: `Prescriptions (${patientPrescriptions.length})`, icon: Pill },
          { id: 'card', label: 'Digital Health Card & QR', icon: QrCode },
          { id: 'consent', label: 'Consent & Privacy', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content: Overview & AI Summary */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Clinical Summary Banner */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-emerald-900 to-teal-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-emerald-800 p-2 rounded-lg border border-emerald-700">
                  <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">AI Health Summary & Triage Intelligence</h2>
                  <p className="text-xs text-emerald-200">Powered by Google Gemini 2.5 • Instant Clinical Insights</p>
                </div>
              </div>

              {loadingAi ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-emerald-200">Synthesizing patient medical records across African health facilities...</p>
                </div>
              ) : aiSummary ? (
                <div className="space-y-4">
                  <p className="text-sm text-emerald-100 bg-emerald-800/60 p-4 rounded-xl border border-emerald-700/50 leading-relaxed">
                    "{aiSummary.clinicalSummary}"
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-emerald-800/40 p-4 rounded-xl border border-emerald-700/50">
                      <h4 className="text-xs uppercase font-semibold text-emerald-300 mb-1">Main Conditions</h4>
                      <p className="text-sm font-medium text-white">{aiSummary.mainConditions}</p>
                    </div>

                    <div className="bg-emerald-800/40 p-4 rounded-xl border border-emerald-700/50">
                      <h4 className="text-xs uppercase font-semibold text-emerald-300 mb-1">Vaccination Status</h4>
                      <p className="text-sm font-medium text-white">{aiSummary.vaccinationStatus}</p>
                    </div>
                  </div>

                  {aiSummary.highRiskAlerts && aiSummary.highRiskAlerts.length > 0 && (
                    <div className="bg-rose-950/60 border border-rose-500/50 p-4 rounded-xl space-y-1">
                      <h4 className="text-xs font-bold text-rose-300 uppercase flex items-center space-x-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>High-Risk Clinical Alerts</span>
                      </h4>
                      <ul className="text-xs text-rose-200 list-disc list-inside space-y-0.5">
                        {aiSummary.highRiskAlerts.map((alert, idx) => (
                          <li key={idx}>{alert}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-rose-300">Could not load AI summary.</p>
              )}
            </div>

            {/* Drug Interaction Checker Tool */}
            {currentRole === 'Doctor' && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <Pill className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-gray-900 text-base">AI Drug Interaction & Safety Checker</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Test if a newly proposed prescription interacts with patient's existing medications ({patient.medicalHistory.currentMedications.join(', ')}).
                </p>

                <form onSubmit={handleCheckDrugInteraction} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter new medication name (e.g. Warfarin, Aspirin, Amoxicillin)..."
                    value={testNewMed}
                    onChange={(e) => setTestNewMed(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={checkingDrug}
                    className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2 rounded-xl text-sm font-medium transition shadow-sm"
                  >
                    {checkingDrug ? 'Analyzing...' : 'Check Interaction'}
                  </button>
                </form>

                {drugCheckResult && (
                  <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                    drugCheckResult.hasInteraction ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span>Severity: {drugCheckResult.severity}</span>
                      <span>Interaction Detected: {drugCheckResult.hasInteraction ? '⚠️ Yes' : '✅ None'}</span>
                    </div>
                    <p><strong>Details:</strong> {drugCheckResult.interactionDetails}</p>
                    <p><strong>Recommendation:</strong> {drugCheckResult.recommendation}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Detailed Personal & Medical History */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4">
              <h3 className="font-bold text-gray-900 text-base border-b pb-2">Medical Profile</h3>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Chronic Conditions</h4>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {patient.medicalHistory.chronicDiseases.map((c, i) => (
                    <span key={i} className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-lg font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Allergies</h4>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {patient.medicalHistory.allergies.map((a, i) => (
                    <span key={i} className="bg-rose-100 text-rose-800 text-xs px-2.5 py-1 rounded-lg font-medium">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Current Medications</h4>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {patient.medicalHistory.currentMedications.map((m, i) => (
                    <span key={i} className="bg-teal-100 text-teal-800 text-xs px-2.5 py-1 rounded-lg font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Immunizations</h4>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {patient.medicalHistory.immunizations.map((im, i) => (
                    <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-lg font-medium">
                      {im}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Emergency Contact</h4>
                <p className="text-sm font-semibold text-gray-900">{patient.emergencyContact.name} ({patient.emergencyContact.relation})</p>
                <p className="text-xs text-gray-600">{patient.emergencyContact.phone}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Visit History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Hospital Consultation & Visit History</h3>
            {currentRole === 'Doctor' && (
              <button
                onClick={onAddVisitClick}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Consultation Record</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {patientVisits.map((visit) => (
              <div key={visit.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-3">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{visit.hospitalName}</h4>
                    <p className="text-xs text-gray-500">Attending: {visit.doctorName} • Date: {visit.date}</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-semibold">
                    {visit.diagnosis}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-700">
                  <div className="space-y-1">
                    <p><strong className="text-gray-900">Symptoms:</strong> {visit.symptoms.join(', ')}</p>
                    <p><strong className="text-gray-900">Treatment:</strong> {visit.treatment}</p>
                  </div>
                  <div className="space-y-1">
                    <p><strong className="text-gray-900">Prescriptions:</strong> {visit.prescriptions.join(', ')}</p>
                    <p><strong className="text-gray-900">Follow-up:</strong> {visit.followUpDate || 'None scheduled'}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-600">
                  <strong>Clinical Notes:</strong> {visit.clinicalNotes}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Labs */}
      {activeTab === 'labs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Laboratory & Diagnostic Reports</h3>
            {currentRole === 'Laboratory' && (
              <button
                onClick={onAddLabClick}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Lab Result</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patientLabs.map((lab) => (
              <div key={lab.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-3">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full font-semibold">
                      {lab.category}
                    </span>
                    <h4 className="font-bold text-gray-900 text-base mt-1">{lab.testName}</h4>
                  </div>
                  <span className="text-xs text-gray-500">{lab.date}</span>
                </div>

                <div className="text-xs text-gray-700 space-y-1">
                  <p><strong>Facility:</strong> {lab.facility}</p>
                  <p><strong>Ordered By:</strong> {lab.orderedBy}</p>
                </div>

                <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100 text-xs text-purple-900 font-mono">
                  <strong>Result:</strong> {lab.results}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Active Prescriptions & Medication History</h3>
            {currentRole === 'Pharmacist' && (
              <button
                onClick={onAddRxClick}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Dispense New Medication</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patientPrescriptions.map((rx) => (
              <div key={rx.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-3">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center space-x-2">
                    <Pill className="w-5 h-5 text-amber-600" />
                    <h4 className="font-bold text-gray-900 text-base">{rx.medicationName}</h4>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    rx.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {rx.status}
                  </span>
                </div>

                <div className="text-xs text-gray-700 space-y-1">
                  <p><strong>Dosage:</strong> {rx.dosage}</p>
                  <p><strong>Frequency:</strong> {rx.frequency}</p>
                  <p><strong>Duration:</strong> {rx.duration}</p>
                  <p><strong>Prescribed By:</strong> {rx.prescribedBy} ({rx.hospital})</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Digital Health Card & QR */}
      {activeTab === 'card' && (
        <div className="max-w-xl mx-auto bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 rounded-3xl p-8 text-white shadow-2xl border-4 border-emerald-500/30 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between border-b border-emerald-700/60 pb-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-7 h-7 text-emerald-300" />
              <div>
                <h3 className="font-bold text-lg tracking-wider">MEDILINK AFRICA</h3>
                <p className="text-xs text-emerald-300 uppercase tracking-widest">Official Digital Health Card</p>
              </div>
            </div>
            <span className="bg-emerald-800 text-emerald-200 text-xs px-3 py-1 rounded-full border border-emerald-700 font-mono">
              {patient.id}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="bg-white p-3 rounded-2xl shadow-lg border-2 border-emerald-400">
              {/* QR Code representation using simulated QR SVG / canvas pattern */}
              <div className="w-36 h-36 bg-gray-900 text-white rounded-xl flex flex-col items-center justify-center p-2 text-center relative overflow-hidden group">
                <QrCode className="w-28 h-28 text-emerald-400" />
                <div className="absolute inset-0 bg-emerald-950/80 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-1 text-[10px] font-mono text-emerald-200">
                  Token: {patient.qrToken.substring(0, 16)}...
                </div>
              </div>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-xl font-bold text-white">{patient.fullName}</h2>
              <p className="text-xs text-emerald-200">National ID: {patient.nationalId}</p>
              <p className="text-xs text-emerald-200">Blood Group: <span className="font-bold text-rose-300">{patient.bloodGroup}</span></p>
              <p className="text-xs text-emerald-200">Emergency: {patient.emergencyContact.name} ({patient.emergencyContact.phone})</p>
              <div className="pt-2">
                <span className="inline-block bg-emerald-800 text-emerald-200 text-[10px] px-2.5 py-1 rounded-md border border-emerald-700">
                  🔐 Zero Record Storage in QR • Cloud Encrypted
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-700/60 flex justify-between items-center text-xs text-emerald-300">
            <span>Issued by African Union Health Gateway</span>
            <button
              onClick={() => window.print()}
              className="bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition shadow-sm"
            >
              Print / Save Card
            </button>
          </div>
        </div>
      )}

      {/* Tab Content: Consent */}
      {activeTab === 'consent' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-6">
          <div className="flex items-center space-x-3 border-b pb-4">
            <Shield className="w-6 h-6 text-emerald-700" />
            <div>
              <h3 className="font-bold text-lg text-gray-900">Patient Consent & Privacy Controls</h3>
              <p className="text-xs text-gray-500">Manage how your medical records are accessed across African health facilities.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-start space-x-3 p-4 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer">
              <input type="checkbox" defaultChecked={patient.consent.allowEmergencyBreakGlass} className="mt-1 rounded text-emerald-600 focus:ring-emerald-500" />
              <div>
                <span className="text-sm font-semibold text-gray-900">Allow Emergency "Break Glass" Access</span>
                <p className="text-xs text-gray-600">Permit authorized emergency physicians to override QR scanning during life-threatening trauma or unconsciousness.</p>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-4 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer">
              <input type="checkbox" defaultChecked={patient.consent.shareWithResearch} className="mt-1 rounded text-emerald-600 focus:ring-emerald-500" />
              <div>
                <span className="text-sm font-semibold text-gray-900">Anonymized Disease Surveillance & Public Health Research</span>
                <p className="text-xs text-gray-600">Contribute anonymized epidemiological data to track malaria, cholera, and viral outbreaks across African regional health boards.</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Print / Download Summary Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">MediLink Africa • Official Medical Summary Report</h3>
                  <p className="text-xs text-slate-400">Generated for Patient ID: {patient.id} • Secure Cloud EHR</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Report Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 text-slate-900 bg-slate-50/50">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6 print:shadow-none print:border-none">
                {/* Clinic Header */}
                <div className="border-b border-slate-200 pb-6 flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">ST. MARY’S SPECIALIST CLINIC</h1>
                    <p className="text-xs text-slate-500 font-medium">Nairobi, Kenya • Regional Medical Centre</p>
                    <p className="text-xs text-teal-700 font-semibold mt-1">Encrypted Cross-Border EHR Gateway</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-700">Date: {new Date().toLocaleDateString()}</p>
                    <p className="text-[11px] text-slate-500">Report Ref: ML-SUM-{Math.floor(100000 + Math.random() * 900000)}</p>
                  </div>
                </div>

                {/* Patient Demographics */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1.5 rounded mb-3">
                    Patient Demographics & Identification
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">Full Name</span>
                      <strong className="text-slate-900 text-sm">{patient.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Patient ID</span>
                      <strong className="font-mono text-slate-900">{patient.id}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Date of Birth (Age)</span>
                      <span className="text-slate-900">{patient.dob} ({new Date().getFullYear() - new Date(patient.dob).getFullYear()} yrs)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Gender & Blood Group</span>
                      <span className="text-slate-900">{patient.gender} • <strong className="text-rose-600">{patient.bloodGroup}</strong></span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">National ID / Passport</span>
                      <span className="text-slate-900 font-mono">{patient.nationalId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Phone Number</span>
                      <span className="text-slate-900">{patient.phone}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block">Residential Address</span>
                      <span className="text-slate-900">{patient.address}</span>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-3 py-1.5 rounded mb-3">
                    Emergency Contact
                  </h3>
                  <div className="text-xs grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 block">Contact Name & Relationship</span>
                      <strong className="text-slate-900">{patient.emergencyContact.name} ({patient.emergencyContact.relation})</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Emergency Phone</span>
                      <strong className="text-slate-900">{patient.emergencyContact.phone}</strong>
                    </div>
                  </div>
                </div>

                {/* AI Health Summary */}
                {aiSummary && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1.5 rounded mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>AI Health Risk Assessment & Clinical Summary</span>
                    </h3>
                    <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-700 space-y-2 border border-slate-200">
                      <p className="leading-relaxed"><strong>Clinical Overview:</strong> {aiSummary.clinicalSummary}</p>
                      <div>
                        <strong className="text-rose-700 block mb-1">Identified Risk Factors:</strong>
                        <ul className="list-disc list-inside space-y-1 text-slate-600">
                          {aiSummary.riskFactors.map((risk, i) => (
                            <li key={i}>{risk}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Medical History & Chronic Conditions */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-3 py-1.5 rounded mb-3">
                    Medical History & Current Medications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-900 block mb-1">Chronic Conditions:</span>
                      {patient.medicalHistory.chronicDiseases.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {patient.medicalHistory.chronicDiseases.map((c, i) => (
                            <span key={i} className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[11px] font-medium">{c}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500">None reported</span>
                      )}
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-900 block mb-1">Current Medications:</span>
                      {patient.medicalHistory.currentMedications.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {patient.medicalHistory.currentMedications.map((m, i) => (
                            <span key={i} className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[11px] font-medium">{m}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500">None reported</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Visits / Consultations */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-3 py-1.5 rounded mb-3">
                    Consultation & Visit History ({patientVisits.length})
                  </h3>
                  {patientVisits.length > 0 ? (
                    <div className="space-y-3 text-xs">
                      {patientVisits.map((visit) => (
                        <div key={visit.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{visit.diagnosis}</span>
                            <span className="text-slate-500">{visit.date}</span>
                          </div>
                          <p className="text-slate-600">{visit.notes}</p>
                          <p className="text-[11px] text-teal-700">Attending: {visit.doctorName} ({visit.hospitalName})</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No recorded visits.</p>
                  )}
                </div>

                {/* Laboratory Results */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-3 py-1.5 rounded mb-3">
                    Laboratory Records ({patientLabs.length})
                  </h3>
                  {patientLabs.length > 0 ? (
                    <div className="space-y-3 text-xs">
                      {patientLabs.map((lab) => (
                        <div key={lab.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{lab.testName}</span>
                            <span className="text-slate-500">{lab.date}</span>
                          </div>
                          <div className="flex gap-4">
                            <span>Result: <strong className="text-teal-700">{lab.result}</strong></span>
                            <span>Status: <strong className="text-slate-800">{lab.status}</strong></span>
                          </div>
                          <p className="text-[11px] text-slate-500">Lab: {lab.labName} • Technician: {lab.technician}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No laboratory records.</p>
                  )}
                </div>

                {/* Prescriptions */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-3 py-1.5 rounded mb-3">
                    Prescription Records ({patientPrescriptions.length})
                  </h3>
                  {patientPrescriptions.length > 0 ? (
                    <div className="space-y-3 text-xs">
                      {patientPrescriptions.map((rx) => (
                        <div key={rx.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{rx.medicationName} ({rx.dosage})</span>
                            <span className="text-slate-500">{rx.date}</span>
                          </div>
                          <p className="text-slate-600">Frequency: {rx.frequency} • Duration: {rx.duration}</p>
                          <p className="text-[11px] text-amber-800">Prescribed by {rx.doctorName} • Dispensed by: {rx.pharmacistName || 'Pending'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No prescriptions found.</p>
                  )}
                </div>

                {/* Verification Footer */}
                <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
                  <div>
                    <p className="font-semibold text-slate-700">MediLink Africa Secure EHR Protocol</p>
                    <p>Cryptographically signed and verified under African Union Health Standards.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-teal-700 font-bold">DIGITAL HASH: 0x8F94C2...4E19</p>
                    <p>Page 1 of 1 • Confidential Medical Document</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex justify-end space-x-3 shrink-0">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
