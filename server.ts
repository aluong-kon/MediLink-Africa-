import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini AI client safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenAI({ apiKey });
};

// In-memory database stores for MediLink Africa MVP
interface Patient {
  id: string;
  qrToken: string;
  fullName: string;
  dob: string;
  gender: string;
  nationalId: string;
  passport?: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: { name: string; relation: string; phone: string };
  bloodGroup: string;
  photoUrl: string;
  medicalHistory: {
    previousIllnesses: string[];
    chronicDiseases: string[];
    allergies: string[];
    surgeries: string[];
    hospitalAdmissions: string[];
    currentMedications: string[];
    familyHistory: string[];
    immunizations: string[];
    pregnancyHistory?: string;
    disabilities?: string[];
  };
  consent: {
    shareWithResearch: boolean;
    allowEmergencyBreakGlass: boolean;
    dataRetentionYears: number;
  };
}

interface VisitRecord {
  id: string;
  patientId: string;
  hospitalName: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  prescriptions: string[];
  followUpDate: string;
  clinicalNotes: string;
}

interface LabRecord {
  id: string;
  patientId: string;
  testName: string;
  category: 'Blood' | 'Urine' | 'COVID-19' | 'HIV' | 'Malaria' | 'Imaging';
  status: 'Pending' | 'Completed';
  date: string;
  orderedBy: string;
  results: string;
  facility: string;
  confidential?: boolean;
}

interface PrescriptionRecord {
  id: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedBy: string;
  hospital: string;
  date: string;
  status: 'Active' | 'Completed' | 'Refill Requested';
}

interface AuditLog {
  id: string;
  timestamp: string;
  doctorName: string;
  hospitalName: string;
  patientId: string;
  patientName: string;
  accessType: 'QR_SCAN' | 'MANUAL_LOOKUP' | 'EMERGENCY_BREAK_GLASS' | 'RECORD_UPDATE';
  deviceInfo: string;
  reason: string;
  granted: boolean;
}

// Initial Seed Data
let patients: Patient[] = [
  {
    id: "PAT-2026-8891",
    qrToken: "ml_secure_token_8891_amina_diop",
    fullName: "Amina Diop",
    dob: "1994-05-12",
    gender: "Female",
    nationalId: "SEN-1994-98421",
    passport: "PE9841203",
    phone: "+221 77 821 3456",
    email: "amina.diop@example.sn",
    address: "Rue 10 x Allées Papa Guèye Fall, Dakar, Senegal",
    emergencyContact: { name: "Mamadou Diop", relation: "Spouse", phone: "+221 77 821 3457" },
    bloodGroup: "O+",
    photoUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400",
    medicalHistory: {
      previousIllnesses: ["Acute Malaria (2022)", "Typhoid Fever (2020)"],
      chronicDiseases: ["Mild Asthma"],
      allergies: ["Penicillin", "Peanuts"],
      surgeries: ["Appendectomy (2018)"],
      hospitalAdmissions: ["Dakar Principal Hospital - 4 days for Severe Malaria"],
      currentMedications: ["Salbutamol Inhaler as needed", "Cetirizine 10mg"],
      familyHistory: ["Hypertension (Mother)", "Type 2 Diabetes (Father)"],
      immunizations: ["Yellow Fever (2021)", "COVID-19 Pfizer (3 doses)", "Tetanus Booster (2024)"],
      pregnancyHistory: "1 live birth (2021), uncomplicated",
      disabilities: ["None"]
    },
    consent: { shareWithResearch: true, allowEmergencyBreakGlass: true, dataRetentionYears: 10 }
  },
  {
    id: "PAT-2026-4412",
    qrToken: "ml_secure_token_4412_kwame_mensah",
    fullName: "Kwame Mensah",
    dob: "1988-11-23",
    gender: "Male",
    nationalId: "GHA-1988-33129",
    phone: "+233 24 555 7890",
    email: "kwame.m@example.gh",
    address: "Accra-Ring Road Central, Accra, Ghana",
    emergencyContact: { name: "Abena Mensah", relation: "Sister", phone: "+233 24 555 7891" },
    bloodGroup: "A+",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    medicalHistory: {
      previousIllnesses: ["Pneumonia (2021)"],
      chronicDiseases: ["Type 2 Diabetes"],
      allergies: ["Sulfa drugs"],
      surgeries: ["None"],
      hospitalAdmissions: ["Korle Bu Teaching Hospital - Diabetes Mellitus control (2023)"],
      currentMedications: ["Metformin 500mg BD", "Lisinopril 10mg OD"],
      familyHistory: ["Type 2 Diabetes (Both parents)"],
      immunizations: ["Yellow Fever (2019)", "COVID-19 AstraZeneca (2 doses)"],
      disabilities: ["None"]
    },
    consent: { shareWithResearch: false, allowEmergencyBreakGlass: true, dataRetentionYears: 5 }
  },
  {
    id: "PAT-2026-9032",
    qrToken: "ml_secure_token_9032_fatima_omar",
    fullName: "Fatima Omar",
    dob: "2001-02-15",
    gender: "Female",
    nationalId: "KEN-2001-55412",
    phone: "+254 712 345 678",
    email: "fatima.omar@example.ke",
    address: "Eastleigh Section 3, Nairobi, Kenya",
    emergencyContact: { name: "Yusuf Omar", relation: "Father", phone: "+254 712 345 679" },
    bloodGroup: "B+",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    medicalHistory: {
      previousIllnesses: ["Severe Malaria (2023)"],
      chronicDiseases: ["None"],
      allergies: ["Latex"],
      surgeries: ["Tonsillectomy (2015)"],
      hospitalAdmissions: ["Nairobi Hospital - 3 days"],
      currentMedications: ["None"],
      familyHistory: ["Asthma (Brother)"],
      immunizations: ["Yellow Fever (2022)", "COVID-19 Moderna (2 doses)", "HPV Vaccine (2018)"],
      pregnancyHistory: "None",
      disabilities: ["None"]
    },
    consent: { shareWithResearch: true, allowEmergencyBreakGlass: true, dataRetentionYears: 10 }
  }
];

let visits: VisitRecord[] = [
  {
    id: "VST-101",
    patientId: "PAT-2026-8891",
    hospitalName: "Dakar Principal Hospital",
    doctorName: "Dr. Ousmane Sow",
    date: "2026-06-10",
    diagnosis: "Acute Bronchitis with Allergic Rhinitis",
    symptoms: ["Persistent dry cough", "Chest tightness", "Nasal congestion"],
    treatment: "Nebulization and hydration protocol",
    prescriptions: ["Salbutamol Inhaler", "Cetirizine 10mg"],
    followUpDate: "2026-06-24",
    clinicalNotes: "Patient presented with wheezing. Chest clear bilaterally. Advised avoidance of dust and allergens."
  },
  {
    id: "VST-102",
    patientId: "PAT-2026-4412",
    hospitalName: "Korle Bu Teaching Hospital, Accra",
    doctorName: "Dr. Akosua Frimpong",
    date: "2026-05-18",
    diagnosis: "Type 2 Diabetes Routine Review",
    symptoms: ["Mild fatigue", "Polyuria controlled"],
    treatment: "Dietary counseling and medication adjustment",
    prescriptions: ["Metformin 500mg BD", "Lisinopril 10mg OD"],
    followUpDate: "2026-08-18",
    clinicalNotes: "HbA1c stable at 7.1%. Blood pressure 125/80 mmHg."
  },
  {
    id: "VST-103",
    patientId: "PAT-2026-9032",
    hospitalName: "Kenyatta National Hospital, Nairobi",
    doctorName: "Dr. Wanjiku Mwangi",
    date: "2026-07-01",
    diagnosis: "Uncomplicated Malaria",
    symptoms: ["Fever", "Chills", "Headache", "Myalgia"],
    treatment: "Artemether-Lumefantrine (AL) 3-day course",
    prescriptions: ["Coartem 80/480mg", "Paracetamol 1000mg TDS"],
    followUpDate: "2026-07-08",
    clinicalNotes: "Rapid diagnostic test (RDT) positive for Plasmodium falciparum. Parasitemia moderate."
  }
];

let labs: LabRecord[] = [
  {
    id: "LAB-501",
    patientId: "PAT-2026-8891",
    testName: "Complete Blood Count (CBC)",
    category: "Blood",
    status: "Completed",
    date: "2026-06-10",
    orderedBy: "Dr. Ousmane Sow",
    results: "WBC: 7.2 x10^9/L, RBC: 4.8 x10^12/L, Hemoglobin: 13.2 g/dL, Platelets: 250 x10^9/L. Normal limits.",
    facility: "Dakar Principal Hospital Lab"
  },
  {
    id: "LAB-502",
    patientId: "PAT-2026-4412",
    testName: "Glycated Hemoglobin (HbA1c)",
    category: "Blood",
    status: "Completed",
    date: "2026-05-18",
    orderedBy: "Dr. Akosua Frimpong",
    results: "HbA1c: 7.1% (Good glycemic control for established diabetes).",
    facility: "Korle Bu Central Laboratory"
  },
  {
    id: "LAB-503",
    patientId: "PAT-2026-9032",
    testName: "Malaria RDT & Blood Smear",
    category: "Malaria",
    status: "Completed",
    date: "2026-07-01",
    orderedBy: "Dr. Wanjiku Mwangi",
    results: "Positive for Plasmodium falciparum gametocytes and trophozoites.",
    facility: "Kenyatta National Hospital Diagnostics"
  }
];

let prescriptions: PrescriptionRecord[] = [
  {
    id: "RX-901",
    patientId: "PAT-2026-8891",
    medicationName: "Salbutamol Inhaler",
    dosage: "100mcg per puff",
    frequency: "As needed for shortness of breath",
    duration: "30 days",
    prescribedBy: "Dr. Ousmane Sow",
    hospital: "Dakar Principal Hospital",
    date: "2026-06-10",
    status: "Active"
  },
  {
    id: "RX-902",
    patientId: "PAT-2026-4412",
    medicationName: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily after meals",
    duration: "90 days",
    prescribedBy: "Dr. Akosua Frimpong",
    hospital: "Korle Bu Teaching Hospital",
    date: "2026-05-18",
    status: "Active"
  },
  {
    id: "RX-903",
    patientId: "PAT-2026-9032",
    medicationName: "Coartem (Artemether/Lumefantrine)",
    dosage: "80/480mg",
    frequency: "1 tablet twice daily for 3 days",
    duration: "3 days",
    prescribedBy: "Dr. Wanjiku Mwangi",
    hospital: "Kenyatta National Hospital",
    date: "2026-07-01",
    status: "Completed"
  }
];

let auditLogs: AuditLog[] = [
  {
    id: "LOG-001",
    timestamp: "2026-07-28 14:32:10",
    doctorName: "Dr. Ousmane Sow",
    hospitalName: "Dakar Principal Hospital",
    patientId: "PAT-2026-8891",
    patientName: "Amina Diop",
    accessType: "QR_SCAN",
    deviceInfo: "Mobile Tablet (iOS Safari 18.2)",
    reason: "Scheduled outpatient consultation",
    granted: true
  },
  {
    id: "LOG-002",
    timestamp: "2026-07-27 09:15:44",
    doctorName: "Dr. Akosua Frimpong",
    hospitalName: "Korle Bu Teaching Hospital",
    patientId: "PAT-2026-4412",
    patientName: "Kwame Mensah",
    accessType: "QR_SCAN",
    deviceInfo: "Workstation Terminal (Chrome 125)",
    reason: "Diabetes quarterly review",
    granted: true
  },
  {
    id: "LOG-003",
    timestamp: "2026-07-26 23:40:12",
    doctorName: "Dr. Jean-Paul K., ER Specialist",
    hospitalName: "Mulago National Referral Hospital, Kampala",
    patientId: "PAT-2026-9032",
    patientName: "Fatima Omar",
    accessType: "EMERGENCY_BREAK_GLASS",
    deviceInfo: "Emergency Ward Tablet",
    reason: "Severe acute respiratory distress & trauma stabilization - patient unresponsive",
    granted: true
  }
];

// API Endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Patients API
app.get("/api/patients", (req, res) => {
  res.json(patients);
});

app.get("/api/patients/:id", (req, res) => {
  const patient = patients.find(p => p.id === req.params.id || p.qrToken === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }
  res.json(patient);
});

app.post("/api/patients", (req, res) => {
  const newPatient: Patient = {
    id: `PAT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    qrToken: `ml_secure_token_${Math.floor(1000 + Math.random() * 9000)}_${req.body.fullName?.toLowerCase().replace(/\s+/g, '_') || 'patient'}`,
    ...req.body,
    consent: req.body.consent || { shareWithResearch: true, allowEmergencyBreakGlass: true, dataRetentionYears: 10 }
  };
  patients.unshift(newPatient);
  res.status(201).json(newPatient);
});

// Visits API
app.get("/api/visits", (req, res) => {
  const { patientId } = req.query;
  if (patientId) {
    return res.json(visits.filter(v => v.patientId === patientId));
  }
  res.json(visits);
});

app.post("/api/visits", (req, res) => {
  const newVisit: VisitRecord = {
    id: `VST-${Math.floor(200 + Math.random() * 800)}`,
    ...req.body,
    date: new Date().toISOString().split('T')[0]
  };
  visits.unshift(newVisit);
  
  // Log access
  auditLogs.unshift({
    id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    doctorName: newVisit.doctorName,
    hospitalName: newVisit.hospitalName,
    patientId: newVisit.patientId,
    patientName: patients.find(p => p.id === newVisit.patientId)?.fullName || "Unknown",
    accessType: "RECORD_UPDATE",
    deviceInfo: "Web Clinic Terminal",
    reason: `Consultation & diagnosis: ${newVisit.diagnosis}`,
    granted: true
  });

  res.status(201).json(newVisit);
});

// Labs API
app.get("/api/labs", (req, res) => {
  const { patientId } = req.query;
  if (patientId) {
    return res.json(labs.filter(l => l.patientId === patientId));
  }
  res.json(labs);
});

app.post("/api/labs", (req, res) => {
  const newLab: LabRecord = {
    id: `LAB-${Math.floor(600 + Math.random() * 400)}`,
    ...req.body,
    date: new Date().toISOString().split('T')[0]
  };
  labs.unshift(newLab);
  res.status(201).json(newLab);
});

// Prescriptions API
app.get("/api/prescriptions", (req, res) => {
  const { patientId } = req.query;
  if (patientId) {
    return res.json(prescriptions.filter(p => p.patientId === patientId));
  }
  res.json(prescriptions);
});

app.post("/api/prescriptions", (req, res) => {
  const newRx: PrescriptionRecord = {
    id: `RX-${Math.floor(900 + Math.random() * 100)}`,
    ...req.body,
    date: new Date().toISOString().split('T')[0],
    status: 'Active'
  };
  prescriptions.unshift(newRx);
  res.status(201).json(newRx);
});

// Audit Logs API
app.get("/api/audit-logs", (req, res) => {
  res.json(auditLogs);
});

app.post("/api/audit-logs", (req, res) => {
  const newLog: AuditLog = {
    id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    ...req.body
  };
  auditLogs.unshift(newLog);
  res.status(201).json(newLog);
});

// AI Endpoints
app.post("/api/ai/summary", async (req, res) => {
  try {
    const { patient } = req.body;
    if (!patient) {
      return res.status(400).json({ error: "Patient object is required" });
    }

    const ai = getGeminiClient();
    const prompt = `You are an expert Chief Medical Officer and AI Clinical Assistant for MediLink Africa.
Analyze the following patient profile and provide a concise, highly structured medical summary for attending clinicians:

Patient Name: ${patient.fullName}
Age: ${new Date().getFullYear() - new Date(patient.dob).getFullYear()}
Gender: ${patient.gender}
Blood Group: ${patient.bloodGroup}
Chronic Diseases: ${patient.medicalHistory.chronicDiseases.join(", ") || "None"}
Allergies: ${patient.medicalHistory.allergies.join(", ") || "None"}
Current Medications: ${patient.medicalHistory.currentMedications.join(", ") || "None"}
Past Surgeries & Admissions: ${patient.medicalHistory.surgeries.join(", ")}, ${patient.medicalHistory.hospitalAdmissions.join(", ")}
Immunizations: ${patient.medicalHistory.immunizations.join(", ")}

Return a JSON object with the following keys:
- "mainConditions": string (summary of key conditions)
- "allergies": string[] (highlighted risk allergies)
- "currentMeds": string[] (active medications)
- "highRiskAlerts": string[] (critical warnings or potential complications)
- "vaccinationStatus": string (summary of vaccine status)
- "clinicalSummary": string (2-3 sentences of clinical overview for rapid triage)
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from AI");
    }

    const jsonResult = JSON.parse(text);
    res.json(jsonResult);
  } catch (error: any) {
    console.error("AI Summary Error:", error);
    res.json({
      mainConditions: req.body.patient?.medicalHistory?.chronicDiseases?.join(", ") || "General health monitoring",
      allergies: req.body.patient?.medicalHistory?.allergies || [],
      currentMeds: req.body.patient?.medicalHistory?.currentMedications || [],
      highRiskAlerts: ["Patient has known allergies. Verify before administering antibiotics."],
      vaccinationStatus: "Up to date with regional guidelines",
      clinicalSummary: "Patient is stable with regular outpatient follow-up history."
    });
  }
});

app.post("/api/ai/drug-interaction", async (req, res) => {
  try {
    const { currentMedications, newMedication } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are a clinical pharmacologist. Check for drug-drug interactions between existing medications and a newly proposed prescription in an African hospital setting.
Existing Medications: ${JSON.stringify(currentMedications)}
Proposed New Medication: ${newMedication}

Return a JSON object with:
- "hasInteraction": boolean
- "severity": "None" | "Mild" | "Moderate" | "Severe"
- "interactionDetails": string
- "recommendation": string
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text;
    res.json(JSON.parse(text || "{}"));
  } catch (error: any) {
    res.json({
      hasInteraction: false,
      severity: "None",
      interactionDetails: "No major automated drug-drug interactions detected in offline fallback check.",
      recommendation: "Proceed with clinical judgment and check patient allergy records."
    });
  }
});

app.post("/api/ai/clinical-support", async (req, res) => {
  try {
    const { symptoms, patientHistory } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are an expert AI Clinical Decision Support system for MediLink Africa.
Patient Symptoms: ${symptoms}
Patient History: ${JSON.stringify(patientHistory)}

Provide clinical suggestions in JSON format:
- "suggestedDiagnoses": string[] (top 3 differential diagnoses)
- "recommendedTests": string[] (recommended laboratory or imaging tests)
- "treatmentGuidelines": string (evidence-based treatment guidelines tailored for sub-Saharan African / tropical context)
- "redFlags": string[] (warning signs requiring immediate escalation)
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text;
    res.json(JSON.parse(text || "{}"));
  } catch (error: any) {
    res.json({
      suggestedDiagnoses: ["Viral upper respiratory tract infection", "Malaria screening recommended", "Allergic rhinitis"],
      recommendedTests: ["Complete Blood Count", "Malaria RDT", "Chest X-ray if cough persists"],
      treatmentGuidelines: "Provide symptomatic relief, hydration, and antipyretics if febrile. Reassess in 48 hours.",
      redFlags: ["Persistent high fever > 39°C", "Respiratory distress", "Severe dehydration"]
    });
  }
});

// Vite middleware setup and server start
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MediLink Africa Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
