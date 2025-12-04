import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';

/**
 * Registration page component that allows new users to create an account.
 * Includes form validation and error handling.
 */
const RegisterPage: React.FC = () => {
  // stores all registration form field values in a single state object
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    phoneNumber: ''
  });
  
  // stores error message to display to user
  const [error, setError] = useState('');
  
  // stores success message to display to user
  const [success, setSuccess] = useState('');

  /**
   * Handles changes to any form input field.
   * Updates the corresponding field in formData state.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Handles registration form submission.
   * Validates input and attempts to create new user account.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // prevents default form submission behavior
    e.preventDefault();
    
    // clears any previous messages
    setError('');
    setSuccess('');

    // validates that password and confirm password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // validates password meets minimum length requirement
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      // TODO: implements registration API call when backend endpoint is ready
      // const response = await fetch('http://localhost:5000/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     userName: formData.userName,
      //     password: formData.password,
      //     fullName: formData.fullName,
      //     email: formData.email,
      //     phoneNumber: formData.phoneNumber
      //   })
      // });

      // if (response.ok) {
      //   setSuccess('Registration successful! Redirecting to login...');
      //   setTimeout(() => navigate('/login'), 2000);
      // } else {
      //   const data = await response.json();
      //   setError(data.message || 'Registration failed');
      // }

      // displays placeholder message until backend registration is implemented
      setError('Registration is not yet implemented. Please contact an administrator.');
      
    } catch (err) {
      // handles any unexpected errors during registration process
      setError('An error occurred during registration');
      console.error('Registration error:', err);
    }
  };

  return (
    // centers registration form on page with max width constraint
    <Container className="mt-5" style={{ maxWidth: '500px' }}>
      <Card>
        <Card.Body>
          {/* displays registration page title */}
          <h2 className="text-center mb-4">Create Account</h2>
          
          {/* conditionally displays error alert if error exists */}
          {error && <Alert variant="danger">{error}</Alert>}
          
          {/* conditionally displays success alert if success message exists */}
          {success && <Alert variant="success">{success}</Alert>}
          
          {/* registration form with submit handler */}
          <Form onSubmit={handleSubmit}>
            {/* full name input field */}
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* email input field */}
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* phone number input field */}
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* username input field */}
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* password input field */}
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* confirm password input field for validation */}
            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* submit button */}
            <Button variant="primary" type="submit" className="w-100 mb-3">
              Register
            </Button>

            {/* link to login page for existing users */}
            <div className="text-center">
              <span>Already have an account? </span>
              <Link to="/login">Login here</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RegisterPage;
