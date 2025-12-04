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
    <Navbar bg="white" expand="lg" className="mb-4 navbar-container">
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
              <NavDropdown title={userInfo.userName} id="account-dropdown" align="end">
                <NavDropdown.ItemText>{userInfo.fullName}</NavDropdown.ItemText>
                <NavDropdown.ItemText className="nav-userrole">{userInfo.role}</NavDropdown.ItemText>
                <NavDropdown.Divider />
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
