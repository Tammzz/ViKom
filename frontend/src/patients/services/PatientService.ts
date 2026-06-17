import { API_URL } from '../../config/config';
import { getAuthHeader } from '../../auth/AuthService';
import type { CallLogDto, PatientDetailsDto, PatientListDto, PatientUpdateDto } from '../types/patient';

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
  },

  // updates a patient's contact details, returns the refreshed patient
  async update(id: string, dto: PatientUpdateDto): Promise<PatientDetailsDto> {
    const response = await fetch(`${API_URL}/api/patients/${id}`, {
      method: 'PUT',
      headers: { ...headers, ...getAuthHeader() },
      body: JSON.stringify(dto),
    });
    return handleResponse(response);
  },

  // updates the free-text care note for a patient
  async updateNotes(id: string, notes: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/patients/${id}/notes`, {
      method: 'PUT',
      headers: { ...headers, ...getAuthHeader() },
      body: JSON.stringify({ notes }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  },

  // records a new call to the patient, returns the created log entry
  async createCall(id: string): Promise<CallLogDto> {
    const response = await fetch(`${API_URL}/api/patients/${id}/calls`, {
      method: 'POST',
      headers: { ...headers, ...getAuthHeader() },
    });
    return handleResponse(response);
  },

  // updates the outcome/status of a logged call
  async updateCall(id: string, callId: number, status: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/patients/${id}/calls/${callId}`, {
      method: 'PUT',
      headers: { ...headers, ...getAuthHeader() },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  },
};

export default PatientService;
