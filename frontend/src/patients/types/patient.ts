import type { AppointmentSummary } from '../../appointments/types/appointment';

// Patient list item for table display
export interface PatientListDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  totalAppointments: number;
  lastAppointmentDate: string;
}

// Patient details with appointments
export interface PatientDetailsDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  appointments: AppointmentSummary[];
}
