import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { getUserInfo } from '../auth/AuthService';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const userInfo = getUserInfo();
  const role = userInfo?.role;

  // checks if current route matches the given path
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sidebar bg-light border-end">
      {/* Brand logo at the top of sidebar */}
      <div className="sidebar-brand">
        <Link to="/dashboard">
          <img 
            src="/HomeCareApp-Logo.png" 
            alt="HomeCareApp Logo" 
            className="sidebar-logo"
          />
        </Link>
      </div>

      {/* Navigation links */}
      <Nav className="flex-column sidebar-nav">
        {/* Dashboard - available to all roles */}
        <Nav.Link 
          as={Link} 
          to="/dashboard" 
          className={isActive('/dashboard') ? 'active' : ''}
        >
          Dashboard
        </Nav.Link>

        {/* Patient navigation */}
        {role === 'Patient' && (
          <Nav.Link 
            as={Link} 
            to="/appointments" 
            className={isActive('/appointments') ? 'active' : ''}
          >
            My Appointments
          </Nav.Link>
        )}

        {/* Personnel navigation */}
        {role === 'Personnel' && (
          <>
            <Nav.Link 
              as={Link} 
              to="/availability" 
              className={isActive('/availability') ? 'active' : ''}
            >
              My Calendar
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/patients" 
              className={isActive('/patients') ? 'active' : ''}
            >
              My Patients
            </Nav.Link>
          </>
        )}
      </Nav>
    </div>
  );
};

export default Sidebar;
