import React from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import * as AuthService from '../services/AuthService';

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
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-3">
      <Container fluid>
        <Navbar.Brand href={isAuthenticated ? "/dashboard" : "/"}>HomeCare App</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            {isAuthenticated && userInfo ? (
              <NavDropdown title={userInfo.userName} id="account-dropdown" align="end">
                <NavDropdown.ItemText>{userInfo.fullName}</NavDropdown.ItemText>
                <NavDropdown.ItemText className="text-muted">{userInfo.role}</NavDropdown.ItemText>
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
