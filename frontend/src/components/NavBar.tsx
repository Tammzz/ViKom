import React from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import * as AuthService from '../auth/AuthService';
import '../css/NavBar.css';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = AuthService.isAuthenticated();
  const userInfo = AuthService.getUserInfo();

  // handles logout action
  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  return (
    <Navbar bg="white" expand="lg" className="navbar-container">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          <img 
            src="/HomeCareApp-Logo.png" 
            alt="Carely Logo" 
            className="navbar-logo d-inline-block align-top"
          />
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbar-nav" />
        
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            {isAuthenticated && userInfo ? (
              // displays user dropdown when authenticated
              <div className="user-dropdown-wrapper">
                <NavDropdown 
                  title={userInfo.fullName} 
                  id="account-dropdown" 
                  align="end"
                  className="user-dropdown"
                >
                  <NavDropdown.Item onClick={handleLogout} className="dropdown-logout">
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </div>
            ) : (
              // displays login and register buttons when not authenticated
              <div className="auth-buttons-wrapper">
                <Nav.Link as={Link} to="/login" className="auth-btn-login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="auth-btn-register">
                  Register
                </Nav.Link>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
