// Appointment model based on backend.DTOs.AppointmentDto
export interface Appointment {
  id?: number;
  patientId: string;
  patientName?: string;
  availabilityId: number;
  personnelId?: string;
  personnelName?: string;
  date?: string;
  // Stores comma-separated list of tasks (e.g., "Medication, Vitals, Exercises")
  tasks: string;
  startTime: string; // TimeSpan represented as string "HH:mm:ss" or "HH:mm"
  endTime: string;
  status: 'Booked' | 'InProgress' | 'Completed' | 'Cancelled';
}

// Appointment create DTO
export interface AppointmentCreateDto {
  patientId?: string;
  availabilityId: number;
  // Stores comma-separated list of tasks (e.g., "Medication, Vitals, Exercises")
  tasks: string;
  startTime: string;
  endTime: string;
  status?: string;
}

// Appointment summary for dashboard display
export interface AppointmentSummary {
  id: number;
  patientName: string;
  personnelName: string;
  // Stores comma-separated list of tasks (e.g., "Medication, Vitals, Exercises")
  tasks: string;
  date: string; // ISO date string
  startTime: string;
  endTime: string;
  status: string;
  formattedDateTime?: string;
}
