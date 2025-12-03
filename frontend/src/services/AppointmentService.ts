import { API_URL } from '../shared/config';
import { getAuthHeader } from './AuthService';
import type { Appointment, AppointmentCreateDto } from '../types';

const headers = {
  'Content-Type': 'application/json',
};

// handles API response
async function handleResponse(response: Response) {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

// fetches all appointments
export async function fetchAppointments(): Promise<Appointment[]> {
  const response = await fetch(`${API_URL}/api/appointments`, {
    headers: { ...headers, ...getAuthHeader() },
  });
  return handleResponse(response);
}

// fetches appointment by ID
export async function fetchAppointmentById(id: number): Promise<Appointment> {
  const response = await fetch(`${API_URL}/api/appointments/${id}`, {
    headers: { ...headers, ...getAuthHeader() },
  });
  return handleResponse(response);
}

// fetches appointments by patient ID
export async function fetchAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
  const response = await fetch(`${API_URL}/api/appointments/patient/${patientId}`, {
    headers: { ...headers, ...getAuthHeader() },
  });
  return handleResponse(response);
}

// creates new appointment
export async function createAppointment(appointment: AppointmentCreateDto): Promise<Appointment> {
  const response = await fetch(`${API_URL}/api/appointments`, {
    method: 'POST',
    headers: { ...headers, ...getAuthHeader() },
    body: JSON.stringify(appointment),
  });
  return handleResponse(response);
}

// updates existing appointment
export async function updateAppointment(id: number, appointment: Appointment): Promise<void> {
  const response = await fetch(`${API_URL}/api/appointments/${id}`, {
    method: 'PUT',
    headers: { ...headers, ...getAuthHeader() },
    body: JSON.stringify(appointment),
  });
  if (!response.ok) {
    throw new Error('Failed to update appointment');
  }
}

// deletes appointment
export async function deleteAppointment(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/appointments/${id}`, {
    method: 'DELETE',
    headers: { ...headers, ...getAuthHeader() },
  });
  if (!response.ok) {
    throw new Error('Failed to delete appointment');
  }
}
