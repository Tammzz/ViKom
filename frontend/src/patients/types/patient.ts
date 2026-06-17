import type { AppointmentSummary } from '../../appointments/types/appointment';

// Patient list item for table display
export interface PatientListDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  supabaseProfileId?: string | null;
  totalAppointments: number;
  lastAppointmentDate: string;
}

// A single logged call to a patient's TV profile
export interface CallLogDto {
  id: number;
  patientId: string;
  personnelId: string;
  personnelName: string;
  startedAt: string; // ISO date-time string
  status: string; // "Initiated" | "Answered" | "Declined" | "Ended" | "Missed"
}

// Patient details with appointments
export interface PatientDetailsDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  supabaseProfileId?: string | null;
  totalAppointments: number;
  lastAppointmentDate: string;
  notes?: string | null;
  notesUpdatedAt?: string | null;
  upcomingAppointments: AppointmentSummary[];
  pastAppointments: AppointmentSummary[];
  recentCalls: CallLogDto[];
}

// Payload for updating a patient's contact details
export interface PatientUpdateDto {
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
}
