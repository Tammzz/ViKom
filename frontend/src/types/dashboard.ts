import type { AppointmentSummary, AvailabilitySummary } from './';

// Patient dashboard view model
export interface PatientViewModel {
  patientId: string;
  patientName: string;
  upcomingAppointments: AppointmentSummary[];
  appointmentHistory: AppointmentSummary[];
  availableCaregivers: CaregiverSummary[];
  totalAppointments: number;
  completedAppointments: number;
  upcomingCount: number;
}

// Caregiver summary
export interface CaregiverSummary {
  personnelId: string;
  personnelName: string;
  email: string;
  availableSlots: number;
  nextAvailableDate: string;
  formattedNextAvailable?: string;
}

// Personnel dashboard view model
export interface PersonnelViewModel {
  personnelId: string;
  personnelName: string;
  totalPatients: number;
  appointmentsThisWeek: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  upcomingAppointments: AppointmentSummary[];
  recentAppointments: AppointmentSummary[];
  upcomingAvailability: AvailabilitySummary[];
}
