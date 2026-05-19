// Mock data for the Alatyon Lab Result System
// This simulates the data that would come from your backend API

export const mockPatient = {
  id: "AL-9021",
  mrn: "882-01",
  firstName: "Alex",
  lastName: "Johnson",
  fullName: "Alex Johnson",
  avatar: null,
  dateOfBirth: "1985-03-15",
  gender: "Male",
  phone: "+1 (555) 123-4567",
  email: "alex.johnson@email.com",
  address: "123 Medical Center Drive, Suite 100",
};

export const mockHealthMetrics = {
  heartRate: 72,
  heartRateStatus: "normal",
  latestLabResult: {
    name: "Comprehensive Metabolic",
    value: 95,
    unit: "mg/dL",
    status: "Normal Range",
    date: "Oct 20, 2024",
  },
  totalTests: 12,
  lastVisitDate: "Oct 15, 2025",
};

export const mockNextCheckup = {
  title: "Next Wellness Checkup",
  doctor: "Dr. Sarah Mitchell",
  location: "Building C, Room 402",
  date: "Nov 12, 2025",
  time: "10:30 AM",
};

export const mockResultHistory = [
  {
    id: "LR-99283",
    name: "CBC With Differential",
    category: "General Health Panel",
    status: "COMPLETED",
    date: "Oct 15, 2025",
    icon: "blood",
  },
  {
    id: "LR-99284",
    name: "Lipid Panel",
    category: "Cholesterol & Triglycerides",
    status: "COMPLETED",
    date: "Sep 12, 2024",
    icon: "lipid",
  },
  {
    id: "LR-99285",
    name: "HbA1c Level",
    category: "Diabetes Screening",
    status: "COMPLETED",
    date: "Aug 05, 2024",
    icon: "glucose",
  },
];

export const mockLabResults = [
  {
    id: "LR-99283",
    testName: "CBC",
    fullName: "Complete Blood Count",
    result: "Normal",
    normalRange: "13.5-17.5",
    status: "Normal",
    date: "Oct 15",
  },
  {
    id: "LR-99284",
    testName: "Glucose",
    fullName: "Fasting Plasma Glucose",
    result: "110",
    resultNumeric: 110,
    normalRange: "70-99",
    status: "High",
    date: "Oct 15",
  },
  {
    id: "LR-99285",
    testName: "Cholesterol",
    fullName: "Total Serum Level",
    result: "185",
    resultNumeric: 185,
    normalRange: "< 200",
    status: "Normal",
    date: "Oct 12",
  },
];

export const mockPatientRecordsSummary = {
  lastUpdate: "Oct 15, 2024",
  verifiedBy: "Dr. Sarah Vane",
  healthStatus: "Stable",
  healthStatusDescription: "Overall vital parameters are within acceptable therapeutic windows.",
};

export const mockResultDetails = {
  id: "LR-99283",
  panelId: "LP-441",
  patientName: "Johnathan Doe",
  patientId: "MRN-882190",
  dateOfCollection: "October 24, 2024 • 08:30 AM",
  referringPhysician: "Dr. Amelia Vance",
  isVerified: true,
  lipidProfile: [
    {
      name: "Total Cholesterol",
      method: "Serum Enzymatic Method",
      result: 195,
      unit: "mg/dL",
      referenceRange: "< 200 mg/dL",
      status: "NORMAL",
    },
    {
      name: "HDL (Good)",
      method: "Direct Method",
      result: 45,
      unit: "mg/dL",
      referenceRange: "> 60 mg/dL",
      status: "LOW",
    },
    {
      name: "LDL (Bad)",
      method: "Calculated Value",
      result: 130,
      unit: "mg/dL",
      referenceRange: "< 100 mg/dL",
      status: "HIGH",
    },
    {
      name: "Triglycerides",
      method: "GPO-PAP Method",
      result: 142,
      unit: "mg/dL",
      referenceRange: "< 150 mg/dL",
      status: "NORMAL",
    },
  ],
  clinicalInterpretation:
    "The patient exhibits borderline high LDL levels and sub-optimal HDL concentration. This combination suggests a moderate cardiovascular risk profile. Recommended dietary adjustments focusing on unsaturated fats and increased physical activity are advised. Repeat screening is recommended in 3 months.",
  healthTrend: {
    metric: "Total Cholesterol Trend",
    change: "+5% from last year",
    direction: "up",
  },
  nextAction: {
    title: "Schedule Nutrition Consultation",
    buttonText: "Book Now",
  },
};
