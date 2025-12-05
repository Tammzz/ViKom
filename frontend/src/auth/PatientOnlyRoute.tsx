import React from 'react';
import { Navigate } from 'react-router-dom';
import * as AuthService from './AuthService';

interface PatientOnlyRouteProps {
  children: React.ReactElement;
}

// protects routes that only patients can access
const PatientOnlyRoute: React.FC<PatientOnlyRouteProps> = ({ children }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  const userInfo = AuthService.getUserInfo();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Only allow patients to access
  if (userInfo?.role !== 'Patient') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default PatientOnlyRoute;
