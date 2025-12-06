import React from 'react';
import { getUserInfo } from '../../auth/AuthService';
import PersonnelDashboard from '../components/PersonnelDashboard';
import PatientDashboard from '../components/PatientDashboard';

// role-based dashboard wrapper
const DashboardPage: React.FC = () => {
  const userInfo = getUserInfo();

  // renders appropriate dashboard based on user role
  if (userInfo?.role === 'Personnel') {
    return <PersonnelDashboard />;
  }

  if (userInfo?.role === 'Patient') {
    return <PatientDashboard />;
  }

  return (
    <div className="container mt-5">
      <p className="text-muted">Unable to load dashboard. Please log in again.</p>
    </div>
  );
};

export default DashboardPage;
