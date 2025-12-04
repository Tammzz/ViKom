import { API_URL } from '../shared/config';
import { getAuthHeader } from '../auth/AuthService';
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

// Note: Personnel management endpoints are placeholders for Admin phase
// These will be fully implemented in Phase 7 (Admin Module)

// fetches all personnel (Admin only)
export async function fetchPersonnel(): Promise<User[]> {
  const response = await fetch(`${API_URL}/api/personnel`, {
    headers: { ...headers, ...getAuthHeader() },
  });
  return handleResponse(response);
}

// fetches personnel member by ID (Admin only)
export async function fetchPersonnelById(id: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/personnel/${id}`, {
    headers: { ...headers, ...getAuthHeader() },
  });
  return handleResponse(response);
}

// creates new personnel member (Admin only)
export async function createPersonnel(personnel: Partial<User>): Promise<void> {
  const response = await fetch(`${API_URL}/api/personnel`, {
    method: 'POST',
    headers: { ...headers, ...getAuthHeader() },
    body: JSON.stringify(personnel),
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
}

// updates personnel member information (Admin only)
export async function updatePersonnel(id: string, personnel: Partial<User>): Promise<void> {
  const response = await fetch(`${API_URL}/api/personnel/${id}`, {
    method: 'PUT',
    headers: { ...headers, ...getAuthHeader() },
    body: JSON.stringify(personnel),
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
}

// deletes personnel member (Admin only)
export async function deletePersonnel(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/personnel/${id}`, {
    method: 'DELETE',
    headers: { ...headers, ...getAuthHeader() },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
}
