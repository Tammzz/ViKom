import { API_URL } from '../../config/config';
import { getAuthHeader } from '../../auth/AuthService';
import type { PatientDetailsDto, PatientListDto } from '../types/patient';

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

// Service object following demo pattern
const PatientService = {
  // fetches all patients (Personnel only - now returns linked patients)
  async getAll(): Promise<PatientListDto[]> {
    const response = await fetch(`${API_URL}/api/patients`, {
      headers: { ...headers, ...getAuthHeader() },
    });
    return handleResponse(response);
  },

  // fetches all patients regardless of links (for admin or linking purposes)
  async getAllPatients(): Promise<PatientListDto[]> {
    const response = await fetch(`${API_URL}/api/patients/all`, {
      headers: { ...headers, ...getAuthHeader() },
    });
    return handleResponse(response);
  },

  async getById(id: string): Promise<PatientDetailsDto> {
    const response = await fetch(`${API_URL}/api/patients/${id}`, {
      headers: { ...headers, ...getAuthHeader() },
    });
    return handleResponse(response);
  }
};

export default PatientService;
