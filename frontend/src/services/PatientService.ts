import { API_URL } from '../shared/config';
import { getAuthHeader } from './AuthService';
import type { PatientListDto, PatientDetailsDto } from '../types';

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

// fetches all patients (Personnel/Admin only)
export async function fetchPatients(): Promise<PatientListDto[]> {
  const response = await fetch(`${API_URL}/api/patients`, {
    headers: { ...headers, ...getAuthHeader() },
  });
  return handleResponse(response);
}

// fetches patient details with appointments
export async function fetchPatientById(id: string): Promise<PatientDetailsDto> {
  const response = await fetch(`${API_URL}/api/patients/${id}`, {
    headers: { ...headers, ...getAuthHeader() },
  });
  return handleResponse(response);
}
