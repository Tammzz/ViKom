// Appointment model based on HomeCareApp.Models.Appointment
export interface Appointment {
  id?: number;
  clientId: string;
  availabilityId: number;
  taskDescription: string;
  startTime: string; // TimeSpan represented as string "HH:mm:ss"
  endTime: string;
  status: 'Booked' | 'Completed' | 'Cancelled';
}

// Appointment create DTO
export interface AppointmentCreateDto {
  clientId?: string;
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
