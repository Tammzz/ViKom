import { API_URL } from '../shared/config';
import { getAuthHeader } from './AuthService';
import type { User } from '../types';

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

// fetches all patients
export async function fetchPatients(): Promise<User[]> {
  const response = await fetch(`${API_URL}/api/patients`, {
    headers: { ...headers, ...getAuthHeader() },
  });
  return handleResponse(response);
}

// fetches patient by ID
export async function fetchPatientById(id: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/patients/${id}`, {
    headers: { ...headers, ...getAuthHeader() },
  });
  return handleResponse(response);
}

// creates new patient
export async function createPatient(patient: Partial<User>): Promise<void> {
  const response = await fetch(`${API_URL}/api/patients`, {
    method: 'POST',
    headers: { ...headers, ...getAuthHeader() },
    body: JSON.stringify(patient),
  });
  if (!response.ok) {
    throw new Error('Failed to create patient');
  }
}

// updates patient information
export async function updatePatient(id: string, patient: Partial<User>): Promise<void> {
  const response = await fetch(`${API_URL}/api/patients/${id}`, {
    method: 'PUT',
    headers: { ...headers, ...getAuthHeader() },
    body: JSON.stringify(patient),
  });
  if (!response.ok) {
    throw new Error('Failed to update patient');
  }
}

// deletes patient
export async function deletePatient(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/patients/${id}`, {
    method: 'DELETE',
    headers: { ...headers, ...getAuthHeader() },
  });
  if (!response.ok) {
    throw new Error('Failed to delete patient');
  }
}
