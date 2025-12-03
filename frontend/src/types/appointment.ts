// Appointment model based on backend.DTOs.AppointmentDto
export interface Appointment {
  id?: number;
  patientId: string;
  patientName?: string;
  availabilityId: number;
  personnelId?: string;
  personnelName?: string;
  date?: string;
  taskDescription: string;
  startTime: string; // TimeSpan represented as string "HH:mm:ss" or "HH:mm"
  endTime: string;
  status: 'Booked' | 'Completed' | 'Cancelled';
}

// Appointment create DTO
export interface AppointmentCreateDto {
  patientId?: string;
  availabilityId: number;
  taskDescription: string;
  startTime: string;
  endTime: string;
  status?: string;
}

// Appointment summary for dashboard display
export interface AppointmentSummary {
  id: number;
  patientName: string;
  personnelName: string;
  taskDescription: string;
  date: string; // ISO date string
  startTime: string;
  endTime: string;
  status: string;
  formattedDateTime?: string;
}
