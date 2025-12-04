import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import { fetchPersonnelDashboard } from '../services/DashboardService';
import TaskBadges from './TaskBadges';
import type { PersonnelViewModel } from '../types';
import '../css/PersonnelDashboard.css';

// personnel dashboard component
const PersonnelDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<PersonnelViewModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // fetches dashboard data on mount
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await fetchPersonnelDashboard();
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
    <Container fluid className="personnel-dashboard">
      {/* Welcome Section */}
      <div className="mb-4">
        <h2 className="fw-bold mb-2">Welcome back, {dashboard.personnelName}!</h2>
        <p className="text-muted mb-0">Here's an overview of your schedule and patients</p>
      </div>

      {/* Quick Stats Overview */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="stat-card border-1 border-dark bg-light bg-gradient h-100">
            <Card.Body className="p-4 text-dark">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="fw-bold mb-1">{dashboard.totalPatients}</h2>
                  <p className="mb-0">Patients</p>
                </div>
                <div>
                  <i className="bi bi-people-fill fs-1 opacity-75"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stat-card border-1 border-dark bg-light bg-gradient h-100">
            <Card.Body className="p-4 text-dark">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="fw-bold mb-1">{dashboard.appointmentsThisWeek}</h2>
                  <p className="mb-0">This Week</p>
                </div>
                <div>
                  <i className="bi bi-calendar-check-fill fs-1 opacity-75"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stat-card border-1 border-dark bg-light bg-gradient h-100">
            <Card.Body className="p-4 text-dark">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="fw-bold mb-1">{dashboard.pendingAppointments}</h2>
                  <p className="mb-0">Pending</p>
                </div>
                <div>
                  <i className="bi bi-clock-fill fs-1 opacity-75"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stat-card border-1 border-dark bg-light bg-gradient h-100">
            <Card.Body className="p-4 text-dark">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="fw-bold mb-1">{dashboard.cancelledAppointments}</h2>
                  <p className="mb-0">Cancelled</p>
                </div>
                <div>
                  <i className="bi bi-x-circle-fill fs-1 opacity-75"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        {/* Upcoming Appointments */}
        <Col md={7}>
          <Card className="border bg-light h-100">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4 text-dark">Upcoming Appointments</h5>
              {dashboard.upcomingAppointments.length > 0 ? (
                <div className="table-responsive rounded overflow-hidden border border-dark">
                  <Table hover className="bg-white mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Patient Name</th>
                        <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Task</th>
                        <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Date</th>
                        <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.upcomingAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td className="py-3 px-4 text-dark border-0">{appointment.patientName}</td>
                          <td className="py-3 px-4 text-dark border-0">
                            <TaskBadges tasks={appointment.tasks} variant="secondary" />
                          </td>
                          <td className="py-3 px-4 text-dark border-0">
                            {new Date(appointment.date).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-4 text-dark border-0">{appointment.startTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-calendar-x display-4 text-muted mb-3 d-block"></i>
                  <p className="text-dark mb-0">No upcoming appointments scheduled.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col md={5}>
          <Card className="border bg-light h-100">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4 text-dark">Recent Activity</h5>
              {dashboard.recentAppointments.length > 0 ? (
                <div className="table-responsive rounded overflow-hidden border border-dark">
                  <Table hover className="bg-white mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Patient Name</th>
                        <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Task</th>
                        <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Date</th>
                        <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.recentAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td className="py-3 px-4 text-dark border-0">{appointment.patientName}</td>
                          <td className="py-3 px-4 text-dark border-0">
                            <TaskBadges tasks={appointment.tasks} variant="secondary" />
                          </td>
                          <td className="py-3 px-4 text-dark border-0">
                            {new Date(appointment.date).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-4 text-dark border-0">{appointment.startTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-clock-history display-4 text-muted mb-3 d-block"></i>
                  <p className="text-dark mb-0">No recent activity to display.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* This Week's Schedule */}
      <Card className="border bg-light">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0 text-dark">Upcoming Availability</h5>
          </div>

          {dashboard.upcomingAvailability.length > 0 ? (
            <div className="table-responsive rounded overflow-hidden border border-dark">
              <Table hover className="bg-white mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Date</th>
                    <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Start Time</th>
                    <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">End Time</th>
                    <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Notes</th>
                    <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.upcomingAvailability.map((availability) => (
                    <tr key={availability.id}>
                      <td className="py-3 px-4 text-dark border-0">
                        {new Date(availability.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 text-dark border-0">{availability.startTime}</td>
                      <td className="py-3 px-4 text-dark border-0">{availability.endTime}</td>
                      <td className="py-3 px-4 text-dark border-0">{availability.notes || '-'}</td>
                      <td className="py-3 px-4 text-dark border-0">
                        {availability.isBooked ? (
                          <span className="badge bg-secondary">Booked</span>
                        ) : (
                          <span className="badge bg-success">Available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="bi bi-calendar-x display-4 text-muted mb-3 d-block"></i>
              <p className="text-dark mb-0">No upcoming availability scheduled.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PersonnelDashboard;
