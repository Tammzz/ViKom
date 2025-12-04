import { API_URL } from "../shared/config";
import { getAuthHeader } from '../auth/AuthService';
import type { PatientViewModel, PersonnelViewModel } from '../types';

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

// fetches patient dashboard data
export async function fetchPatientDashboard(): Promise<PatientViewModel> {
  const response = await fetch(`${API_URL}/api/dashboard/patient`, {
    headers: { ...headers, ...getAuthHeader() },
  });
  return handleResponse(response);
}

// fetches personnel dashboard data
export async function fetchPersonnelDashboard(): Promise<PersonnelViewModel> {
  const response = await fetch(`${API_URL}/api/dashboard/personnel`, {
    headers: { ...headers, ...getAuthHeader() },
  });
  return handleResponse(response);
}
