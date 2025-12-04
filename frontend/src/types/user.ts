// User model based on HomeCareApp.Models.User
export interface User {
  id: string;
  userName?: string;
  email: string;
  fullName: string;
  role: 'Personnel' | 'Patient';
  phoneNumber?: string;
}

// Login DTO
export interface LoginDto {
  userName: string;
  password: string;
}

// Register DTO - matches backend RegisterDto structure
export interface RegisterDto {
  userName: string;
  email: string;
  password: string;
  fullName: string;
  role: 'Personnel' | 'Patient';
  phoneNumber?: string;
}
