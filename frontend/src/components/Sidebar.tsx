import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import '../css/sidebar.css';

const Sidebar: React.FC = () => {
  const location = useLocation();

  // checks if current route matches the given path
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sidebar bg-light border-end">
      <Nav className="flex-column p-3">
        <Nav.Link 
          as={Link} 
          to="/dashboard" 
          className={isActive('/dashboard') ? 'active' : ''}
        >
          Dashboard
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          to="/patients" 
          className={isActive('/patients') ? 'active' : ''}
        >
          Patients
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          to="/personnel" 
          className={isActive('/personnel') ? 'active' : ''}
        >
          Personnel
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          to="/appointments" 
          className={isActive('/appointments') ? 'active' : ''}
        >
          Appointments
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          to="/availability" 
          className={isActive('/availability') ? 'active' : ''}
        >
          Availability
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          to="/users" 
          className={isActive('/users') ? 'active' : ''}
        >
          Users (Admin)
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;
