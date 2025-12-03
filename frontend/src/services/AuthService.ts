import { API_URL } from '../shared/config';
import type { LoginDto, RegisterDto } from '../types';

// stores JWT token in localStorage
export function setToken(token: string): void {
  localStorage.setItem('jwt', token);
}

// retrieves JWT token from localStorage
export function getToken(): string | null {
  return localStorage.getItem('jwt');
}

// removes JWT token from localStorage
export function logout(): void {
  localStorage.removeItem('jwt');
}

// checks if user is currently authenticated
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

// logs in user and stores JWT token
export async function login(loginDto: LoginDto): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginDto),
    });

    if (response.ok) {
      const data = await response.json();
      setToken(data.token);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

// registers new user
export async function register(registerDto: RegisterDto): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerDto),
    });

    return response.ok;
  } catch (error) {
    console.error('Register error:', error);
    return false;
  }
}

// gets authorization header for authenticated requests
export function getAuthHeader(): Record<string, string> {
  const token = getToken();
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }
  return {};
}
