import React from 'react';
import { Navigate } from 'react-router-dom';
import * as AuthService from '../AuthService';

interface PrivateRouteProps {
  children: React.ReactElement;
}

// protects routes that require authentication
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
