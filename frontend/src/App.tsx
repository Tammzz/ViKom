import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './auth/PrivateRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AppointmentListPage from './pages/AppointmentListPage';
import AvailabilityPage from './pages/AvailabilityPage';
import PatientListPage from './pages/PatientListPage';
import PersonnelListPage from './pages/PersonnelListPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/appointments" element={<PrivateRoute><AppointmentListPage /></PrivateRoute>} />
          <Route path="/availability" element={<PrivateRoute><AvailabilityPage /></PrivateRoute>} />
          <Route path="/patients" element={<PrivateRoute><PatientListPage /></PrivateRoute>} />
          <Route path="/personnel" element={<PrivateRoute><PersonnelListPage /></PrivateRoute>} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
