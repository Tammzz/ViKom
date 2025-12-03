// Availability model based on HomeCareApp.Models.Availability
export interface Availability {
  id?: number;
  personnelId: string;
  date: string; // ISO date string
  startTime: string; // TimeSpan represented as string "HH:mm:ss"
  endTime: string;
  notes?: string;
}

// Availability create/update DTO
export interface AvailabilityDto {
  personnelId?: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

// Availability summary for dashboard display
export interface AvailabilitySummary {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  hasAppointment: boolean;
}
