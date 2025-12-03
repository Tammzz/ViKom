import React from 'react';
import { Container } from 'react-bootstrap';

const DashboardPage: React.FC = () => {
  return (
    <Container className="mt-4">
      <h2>Dashboard</h2>
      <p>Welcome to the HomeCare Dashboard. Role-specific content will be displayed here.</p>
    </Container>
  );
};

export default DashboardPage;
