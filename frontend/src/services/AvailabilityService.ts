import { API_URL } from '../shared/config';
import { getAuthHeader } from './AuthService';
import type { Availability, AvailabilityDto } from '../types';

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

// fetches all availability slots
export async function fetchAvailability(): Promise<Availability[]> {
  const response = await fetch(`${API_URL}/api/availability`, {
    headers: { ...headers, ...getAuthHeader() },
  });
  return handleResponse(response);
}

// fetches availability by ID
export async function fetchAvailabilityById(id: number): Promise<Availability> {
  const response = await fetch(`${API_URL}/api/availability/${id}`, {
    headers: { ...headers, ...getAuthHeader() },
  });
  return handleResponse(response);
}

// fetches availability by personnel ID
export async function fetchAvailabilityByPersonnel(personnelId: string): Promise<Availability[]> {
  const response = await fetch(`${API_URL}/api/availability/personnel/${personnelId}`, {
    headers: { ...headers, ...getAuthHeader() },
  });
  return handleResponse(response);
}

// creates new availability slot
export async function createAvailability(availability: AvailabilityDto): Promise<Availability> {
  const response = await fetch(`${API_URL}/api/availability`, {
    method: 'POST',
    headers: { ...headers, ...getAuthHeader() },
    body: JSON.stringify(availability),
  });
  return handleResponse(response);
}

// updates existing availability slot
export async function updateAvailability(id: number, availability: AvailabilityDto): Promise<void> {
  const response = await fetch(`${API_URL}/api/availability/${id}`, {
    method: 'PUT',
    headers: { ...headers, ...getAuthHeader() },
    body: JSON.stringify(availability),
  });
  if (!response.ok) {
    throw new Error('Failed to update availability');
  }
}

// deletes availability slot
export async function deleteAvailability(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/availability/${id}`, {
    method: 'DELETE',
    headers: { ...headers, ...getAuthHeader() },
  });
  if (!response.ok) {
    throw new Error('Failed to delete availability');
  }
}
