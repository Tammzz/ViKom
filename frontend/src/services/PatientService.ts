import { API_URL } from '../shared/config';
import { getAuthHeader } from '../auth/AuthService';
import type { PatientListDto } from '../types';

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
  // fetches all patients (Personnel/Admin only)
  async getAll(): Promise<PatientListDto[]> {
    const response = await fetch(`${API_URL}/api/patients`, {
      headers: { ...headers, ...getAuthHeader() },
    });
    return handleResponse(response);
  }
};

export default PatientService;
