import { apiClient } from "@/lib/apiClient";

export interface Appointment {
  _id?: string;
  parentId: string;
  doctorId: any;
  babyId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: "scheduled" | "completed" | "cancelled";
  meetingLink?: string;
  notes?: string;
  cancellationReason?: string;
  doctorNotes?: string;
  bookedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getAppointments(): Promise<Appointment[]> {
  const response = await apiClient.get(`/appointments`);
  return response.data.data || [];
}

export async function getBabyAppointments(babyId: string): Promise<Appointment[]> {
  const response = await apiClient.get(`/appointments/baby/${babyId}`);
  return response.data.data || [];
}

export async function createAppointment(data: Partial<Appointment>): Promise<Appointment> {
  const response = await apiClient.post(`/appointments`, data);
  return response.data.data;
}

export async function cancelAppointment(id: string, reason?: string): Promise<Appointment> {
  const response = await apiClient.patch(`/appointments/${id}/cancel`, { reason });
  return response.data.data;
}
