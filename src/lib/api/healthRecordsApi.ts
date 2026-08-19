import { apiClient } from "@/lib/apiClient";

export interface Prescription {
  _id?: string;
  babyId: any;
  doctorId: any;
  uploadedByParent?: boolean;
  fileUrl?: string;
  medicalNotes?: string;
  nutritionRecommendations?: string;
  medicines?: {
    name: string;
    dosage: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }[];
  vitals?: {
    weight?: string;
    temperature?: string;
    bp?: string;
  };
  nextVisitDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getPrescriptions(babyId: string): Promise<Prescription[]> {
  const response = await apiClient.get(`/prescriptions/baby/${babyId}`);
  return response.data.data || [];
}

export async function getPrescriptionById(id: string): Promise<Prescription> {
  const response = await apiClient.get(`/prescriptions/${id}`);
  return response.data.data;
}

export interface VaccinationRecord {
  _id?: string;
  babyId: string;
  vaccineName: string;
  status: 'pending' | 'given' | 'missed';
  givenDate?: string;
  administeredBy?: string;
  notes?: string;
}

export async function getVaccinationSchedule(babyId: string): Promise<any[]> {
  const response = await apiClient.get(`/vaccinations/${babyId}/schedule`);
  return response.data.data || [];
}

export async function upsertVaccination(babyId: string, payload: Partial<VaccinationRecord>): Promise<VaccinationRecord> {
  const response = await apiClient.post(`/vaccinations/${babyId}`, payload);
  return response.data.data;
}
