export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor';
  hospital?: string;
  createdAt?: string;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  contactNumber: string;
  email: string;
  hospital: string;
  status: 'active' | 'on-leave';
  patientCount?: number;
  maxCapacity: number;
  bio?: string;
  yearsOfExperience?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  contactNumber: string;
  condition: string;
  doctorId: string | Doctor;
  notes?: string;
  admissionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface AnalyticsKPIs {
  totalDoctors: number;
  totalPatients: number;
  avgPatientsPerDoctor: number;
  criticalPatients: number;
}

export interface WorkloadItem {
  specialization: string;
  doctorCount: number;
  patientCount: number;
  percentage: number;
}

export interface ConditionItem {
  _id: string;
  count: number;
}

export interface AdmissionTrendItem {
  date: string;
  admissions: number;
}

export interface RecentAssignmentItem {
  patientId: string;
  patientName: string;
  condition: string;
  admissionDate: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
}

export interface AnalyticsData {
  kpis: AnalyticsKPIs;
  patientWorkload: WorkloadItem[];
  conditionDistribution: ConditionItem[];
  admissionTrends: AdmissionTrendItem[];
  recentAssignments: RecentAssignmentItem[];
}
