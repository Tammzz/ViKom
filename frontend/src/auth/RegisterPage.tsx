import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import * as AuthService from './AuthService';

/**
 * Registration page component that allows new users to create an account.
 * Includes form validation, role selection, and error handling.
 * Integrates with AuthService for API communication.
 */
const RegisterPage: React.FC = () => {
  // stores all registration form field values in a single state object
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    role: 'Patient' as 'Personnel' | 'Patient'
  });
  
  // stores error message to display to user
  const [error, setError] = useState('');
  
  // stores success message to display to user
  const [success, setSuccess] = useState('');
  
  // tracks whether registration request is in progress
  const [isLoading, setIsLoading] = useState(false);
  
  // provides navigation function for redirecting after successful registration
  const navigate = useNavigate();

  /**
   * Handles changes to any form input or select field.
   * Updates the corresponding field in formData state.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Handles registration form submission.
   * Validates input and attempts to create new user account via AuthService.
   * Redirects to login page on success.
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

    // validates email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // sets loading state to disable form during submission
    setIsLoading(true);

    try {
      // prepares registration data matching backend RegisterDto structure
      const registerDto = {
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
        phoneNumber: formData.phoneNumber || undefined
      };

      // calls AuthService to register new user
      const result = await AuthService.register(registerDto);

      // handles successful registration
      if (result.success) {
        setSuccess('Registration successful! Redirecting to login...');
        // redirects to login page after 2 seconds
        setTimeout(() => navigate('/login'), 2000);
      } else {
        // displays error message from backend
        setError(result.message || 'Registration failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      // handles any unexpected errors during registration process
      setError('An error occurred during registration. Please try again.');
      console.error('Registration error:', err);
      setIsLoading(false);
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </Form.Group>

            {/* phone number input field - optional */}
            <Form.Group className="mb-3">
              <Form.Label>Phone Number (Optional)</Form.Label>
              <Form.Control
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </Form.Group>

            {/* role selection dropdown */}
            <Form.Group className="mb-3">
              <Form.Label>I am registering as</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="Patient">Patient</option>
                <option value="Personnel">Personnel (Healthcare Provider)</option>
              </Form.Select>
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
                disabled={isLoading}
              />
              <Form.Text className="text-muted">
                Must be at least 6 characters long
              </Form.Text>
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
                disabled={isLoading}
              />
            </Form.Group>

            {/* submit button - disabled during loading with spinner */}
            <Button variant="primary" type="submit" className="w-100 mb-3" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register'}
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
