import React from 'react';
import { Navigate } from 'react-router-dom';
import * as AuthService from './AuthService';

interface PersonnelOnlyRouteProps {
  children: React.ReactElement;
}

// protects routes that only personnel can access
const PersonnelOnlyRoute: React.FC<PersonnelOnlyRouteProps> = ({ children }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  const userInfo = AuthService.getUserInfo();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Only allow personnel to access
  if (userInfo?.role !== 'Personnel') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default PersonnelOnlyRoute;
