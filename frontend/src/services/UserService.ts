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

// fetches all users (Admin only)
export async function fetchUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/api/users`, {
    headers: { ...headers, ...getAuthHeader() },
  });
  return handleResponse(response);
}

// fetches user by ID (Admin only)
export async function fetchUserById(id: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    headers: { ...headers, ...getAuthHeader() },
  });
  return handleResponse(response);
}

// fetches users by role (Admin only)
export async function fetchUsersByRole(role: 'Personnel' | 'Patient'): Promise<User[]> {
  const response = await fetch(`${API_URL}/api/users/role/${role}`, {
    headers: { ...headers, ...getAuthHeader() },
  });
  return handleResponse(response);
}

// updates user information (Admin only)
export async function updateUser(id: string, user: Partial<User>): Promise<void> {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'PUT',
    headers: { ...headers, ...getAuthHeader() },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
}

// deletes user (Admin only)
export async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'DELETE',
    headers: { ...headers, ...getAuthHeader() },
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
}
