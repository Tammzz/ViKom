// Components
export { default as LoginPage } from './components/LoginPage';
export { default as RegisterPage } from './components/RegisterPage';

// Guards
export { default as PrivateRoute } from './guards/PrivateRoute';
export { default as PersonnelOnlyRoute } from './guards/PersonnelOnlyRoute';
export { default as PatientOnlyRoute } from './guards/PatientOnlyRoute';
export { default as PublicOnlyRoute } from './guards/PublicOnlyRoute';

// Service
export * from './AuthService';
