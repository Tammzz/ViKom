import { API_URL } from '../shared/config';
import type { LoginDto, RegisterDto } from '../types';

interface UserInfo {
  userName: string;
  fullName: string;
  role: string;
  userId: string;
}

// stores JWT token in localStorage
export function setToken(token: string): void {
  localStorage.setItem('jwt', token);
}

// retrieves JWT token from localStorage
export function getToken(): string | null {
  return localStorage.getItem('jwt');
}

// stores user info in localStorage
export function setUserInfo(userInfo: UserInfo): void {
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
}

// retrieves user info from localStorage
export function getUserInfo(): UserInfo | null {
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) return null;
  
  try {
    return JSON.parse(userInfo);
  } catch (error) {
    console.error('Failed to parse user info:', error);
    localStorage.removeItem('userInfo');
    return null;
  }
}
// removes JWT token and user info from localStorage
export function logout(): void {
  localStorage.removeItem('jwt');
  localStorage.removeItem('userInfo');
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
      setUserInfo({
        userName: data.userName,
        fullName: data.fullName,
        role: data.role,
        userId: data.userId
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

/**
 * Registers a new user account.
 * Sends user information to backend and returns result with error details if applicable.
 * 
 * @param registerDto - User registration data including username, email, password, role, etc.
 * @returns Promise with success status and optional error message
 */
export async function register(registerDto: RegisterDto): Promise<{ success: boolean; message?: string }> {
  try {
    // sends POST request to registration endpoint
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerDto),
    });

    // handles successful registration
    if (response.ok) {
      return { success: true };
    }

    // extracts error details from response
    const errorData = await response.json();
    
    // formats validation errors if present
    if (errorData.errors) {
      const errorMessages = Object.values(errorData.errors).flat().join(', ');
      return { success: false, message: errorMessages };
    }

    // returns generic error message
    return { success: false, message: errorData.message || 'Registration failed' };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, message: 'Network error. Please try again.' };
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
