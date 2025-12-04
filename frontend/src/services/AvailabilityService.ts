import { API_URL } from '../shared/config';
import { getAuthHeader } from '../auth/AuthService';
import type { 
  Availability, 
  AvailabilityDto,
  WeekAvailability,
  DayAvailability,
  AvailabilityWindow,
  CreateAvailabilityWindowDto,
  UpdateAvailabilityWindowDto
} from '../types';

const headers = {
  'Content-Type': 'application/json',
};

// handles API response
async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.text();
    console.error('API Error Response:', errorData);
    throw new Error(`Network response was not ok: ${response.status} - ${errorData}`);
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

// fetches free availability slots (not booked)
export async function fetchFreeAvailability(): Promise<Availability[]> {
  const response = await fetch(`${API_URL}/api/availability/free`, {
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
    throw new Error('Network response was not ok');
  }
}

// deletes availability slot
export async function deleteAvailability(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/availability/${id}`, {
    method: 'DELETE',
    headers: { ...headers, ...getAuthHeader() },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
}

// ============ NEW WINDOW-BASED FUNCTIONS ============

// fetches week availability (7 days)
export async function fetchWeekAvailability(
  personnelId: string,
  startDate: string
): Promise<WeekAvailability> {
  const response = await fetch(
    `${API_URL}/api/availability/week/${personnelId}?startDate=${startDate}`,
    { headers: { ...headers, ...getAuthHeader() } }
  );
  return handleResponse(response);
}

// fetches day availability (single day with windows and appointments)
export async function fetchDayAvailability(
  personnelId: string,
  date: string
): Promise<DayAvailability> {
  const response = await fetch(
    `${API_URL}/api/availability/day/${personnelId}?date=${date}`,
    { headers: { ...headers, ...getAuthHeader() } }
  );
  return handleResponse(response);
}

// creates availability window
export async function createAvailabilityWindow(
  window: CreateAvailabilityWindowDto
): Promise<AvailabilityWindow> {
  const response = await fetch(`${API_URL}/api/availability/window`, {
    method: 'POST',
    headers: { ...headers, ...getAuthHeader() },
    body: JSON.stringify(window),
  });
  return handleResponse(response);
}

// updates availability window
export async function updateAvailabilityWindow(
  id: number,
  window: UpdateAvailabilityWindowDto
): Promise<AvailabilityWindow> {
  const response = await fetch(`${API_URL}/api/availability/window/${id}`, {
    method: 'PUT',
    headers: { ...headers, ...getAuthHeader() },
    body: JSON.stringify(window),
  });
  return handleResponse(response);
}

// deletes availability window
export async function deleteAvailabilityWindow(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/availability/window/${id}`, {
    method: 'DELETE',
    headers: { ...headers, ...getAuthHeader() },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to delete availability window');
  }
}
