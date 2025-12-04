import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import * as AuthService from './AuthService';

/**
 * Login page component that handles user authentication.
 * Provides a form for users to enter credentials and access the system.
 */
const LoginPage: React.FC = () => {
  // stores username input value
  const [userName, setUserName] = useState('');
  
  // stores password input value
  const [password, setPassword] = useState('');
  
  // stores error message to display to user
  const [error, setError] = useState('');
  
  // provides navigation function for redirecting after successful login
  const navigate = useNavigate();

  /**
   * Handles login form submission.
   * Validates credentials and redirects to dashboard on success.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // prevents default form submission behavior
    e.preventDefault();
    
    // clears any previous error messages
    setError('');

    // attempts to authenticate user with provided credentials
    const success = await AuthService.login({ userName, password });
    
    // redirects to dashboard if login successful
    if (success) {
      navigate('/dashboard');
    } else {
      // displays error message if login fails
      setError('Invalid username or password');
    }
  };

  return (
    // centers login form on page with max width constraint
    <Container className="mt-5" style={{ maxWidth: '400px' }}>
      <Card>
        <Card.Body>
          {/* displays login page title */}
          <h2 className="text-center mb-4">Login</h2>
          
          {/* conditionally displays error alert if error exists */}
          {error && <Alert variant="danger">{error}</Alert>}
          
          {/* login form with submit handler */}
          <Form onSubmit={handleSubmit}>
            {/* username input field */}
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </Form.Group>
            
            {/* password input field */}
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            
            {/* submit button */}
            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPage;
