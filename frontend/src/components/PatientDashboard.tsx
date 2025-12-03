import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchPatientDashboard } from '../services/DashboardService';
import type { PatientViewModel } from '../types';
import '../css/PatientDashboard.css';

// patient dashboard component
const PatientDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<PatientViewModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // fetches dashboard data on mount
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await fetchPatientDashboard();
        setDashboard(data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <Container className="mt-4">
        <p>Loading dashboard...</p>
      </Container>
    );
  }

  if (error || !dashboard) {
    return (
      <Container className="mt-4">
        <p className="text-danger">{error || 'Unable to load dashboard'}</p>
      </Container>
    );
  }

  return (
    <Container fluid className="patient-dashboard">
      {/* Welcome Section */}
      <div className="mb-5">
        <h2 className="fw-bold mb-3">Welcome back, {dashboard.patientName}!</h2>
        {dashboard.upcomingAppointments.length > 0 ? (
          <p className="text-muted mb-0 fs-5 lh-base">
            You have {dashboard.upcomingAppointments.length} appointment
            {dashboard.upcomingAppointments.length > 1 ? 's' : ''} coming up.
          </p>
        ) : (
          <p className="text-muted mb-0 fs-5 lh-base">You have no appointments scheduled today.</p>
        )}
      </div>

      <Row className="g-4">
        {/* Left Column */}
        <Col lg={8}>
          {/* Action Cards */}
          <Row className="g-3 mb-4">
            <Col md={6}>
              <Link to="/appointments" className="text-decoration-none">
                <Card className="cta-card border-1 border-dark bg-light h-100 text-center py-4">
                  <Card.Body>
                    <i className="bi bi-calendar-check display-1 text-secondary mb-3"></i>
                    <h5 className="card-title text-dark mb-0">Book appointment</h5>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
            <Col md={6}>
              <a href="#careTeam" className="text-decoration-none">
                <Card className="cta-card border-1 border-dark bg-light h-100 text-center py-4">
                  <Card.Body>
                    <i className="bi bi-envelope display-1 text-secondary mb-3"></i>
                    <h5 className="card-title text-dark mb-0">Contact caregiver</h5>
                  </Card.Body>
                </Card>
              </a>
            </Col>
          </Row>

          {/* Upcoming Appointments */}
          <Card className="border-1 border-dark bg-light">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0 text-dark">Upcoming Appointments</h5>
                <Link to="/appointments" className="btn btn-secondary btn-sm">
                  view all
                </Link>
              </div>
              {dashboard.upcomingAppointments.length > 0 ? (
                <div className="vstack gap-3">
                  {dashboard.upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-white border rounded p-3 d-flex justify-content-between align-items-start"
                    >
                      <div>
                        <h5 className="mb-2 fw-semibold text-dark lh-base">
                          {appointment.taskDescription}
                        </h5>
                        <p className="mb-0 text-muted lh-lg">{appointment.personnelName}</p>
                      </div>
                      <div className="text-end">
                        <div className="text-dark fw-semibold lh-lg">
                          {new Date(appointment.date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                          })}
                        </div>
                        <div className="text-dark lh-lg">{appointment.startTime}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-calendar-x display-4 text-muted mb-3 d-block"></i>
                  <p className="text-muted mb-3">No upcoming appointments scheduled.</p>
                  <Link to="/appointments" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>Book appointment
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Care Team */}
        <Col lg={4}>
          <Card className="border-1 border-dark bg-light h-100" id="careTeam">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4 text-dark">My Care Team</h5>
              {dashboard.availableCaregivers.length > 0 ? (
                <div className="vstack gap-3">
                  {dashboard.availableCaregivers.map((caregiver) => (
                    <div key={caregiver.personnelId} className="bg-white border rounded p-3">
                      <h5 className="mb-2 fw-semibold text-dark lh-base">
                        {caregiver.personnelName}
                      </h5>
                      <p className="mb-2 text-dark lh-lg">{caregiver.email}</p>
                      <p className="mb-0 text-muted lh-lg">
                        Next: {caregiver.formattedNextAvailable || caregiver.nextAvailableDate}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-people display-4 text-muted mb-3 d-block"></i>
                  <p className="text-muted mb-0 small">No caregivers currently available.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PatientDashboard;
