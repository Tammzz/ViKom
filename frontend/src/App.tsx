import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import { 
  LoginPage, 
  RegisterPage, 
  PrivateRoute, 
  PersonnelOnlyRoute,
  PublicOnlyRoute
} from './auth';
import HomePage from './home/HomePage';
import { DashboardPage } from './dashboard';
import { AppointmentListPage } from './appointments';
import { AvailabilityCalendarPage } from './availability';
import { PatientListPage } from './patients';
import { 
  VisitExecutionPage,
  TaskSelectionPage,
  PreferredTimePage,
  PlanningOverviewPage
} from './visits';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/patients" element={<PrivateRoute><PatientListPage /></PrivateRoute>} />
          <Route path="/appointments" element={<PrivateRoute><AppointmentListPage /></PrivateRoute>} />
          <Route path="/availability" element={<PersonnelOnlyRoute><AvailabilityCalendarPage /></PersonnelOnlyRoute>} />
          
          {/* New visit-related routes */}
          <Route path="/visit-execution" element={<PrivateRoute><VisitExecutionPage /></PrivateRoute>} />
          <Route path="/task-selection" element={<PrivateRoute><TaskSelectionPage /></PrivateRoute>} />
          <Route path="/preferred-time" element={<PrivateRoute><PreferredTimePage /></PrivateRoute>} />
          <Route path="/planning" element={<PrivateRoute><PlanningOverviewPage /></PrivateRoute>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
