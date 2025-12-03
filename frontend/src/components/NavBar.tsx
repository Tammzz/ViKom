import React from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import * as AuthService from '../services/AuthService';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = AuthService.isAuthenticated();

  // handles logout action
  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-3">
      <Container fluid>
        <Navbar.Brand href="/dashboard">HomeCare App</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            {isAuthenticated ? (
              <NavDropdown title="Account" id="account-dropdown" align="end">
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link href="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
