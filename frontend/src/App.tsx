import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './auth/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AppointmentListPage from './pages/AppointmentListPage';
import AvailabilityCalendarPage from './pages/AvailabilityCalendarPage';
import PatientListPage from './pages/PatientListPage';
import PersonnelListPage from './pages/PersonnelListPage';
import UsersPage from './pages/UsersPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/patients" element={<PrivateRoute><PatientListPage /></PrivateRoute>} />
          <Route path="/personnel" element={<PrivateRoute><PersonnelListPage /></PrivateRoute>} />
          <Route path="/appointments" element={<PrivateRoute><AppointmentListPage /></PrivateRoute>} />
          <Route path="/availability" element={<PrivateRoute><AvailabilityCalendarPage /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
