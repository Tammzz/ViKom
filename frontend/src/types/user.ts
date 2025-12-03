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
  email: string;
  password: string;
}

// Register DTO
export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  role?: string;
}
