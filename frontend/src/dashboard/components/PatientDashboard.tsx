import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPatientDashboard } from '../services/DashboardService';
import TaskBadges from '../../components/common/TaskBadges';
import StatusBadge from '../../components/common/StatusBadge';
import type { PatientViewModel } from '../types/dashboard';
import './PatientDashboard.css';

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
      } catch {
        setError('Kunne ikke laste dashboarddata');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="patient-dashboard">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="patient-dashboard">
        <p className="error-message">{error || 'Kunne ikke laste dashboard'}</p>
      </div>
    );
  }

  return (
    <div className="patient-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1 className="welcome-title">Velkommen tilbake, {dashboard.patientName}!</h1>
        {dashboard.upcomingAppointments.length > 0 ? (
          <p className="welcome-subtitle">
            Du har {dashboard.upcomingAppointments.length} avtale
            {dashboard.upcomingAppointments.length > 1 ? 'r' : ''} i vente.
          </p>
        ) : (
          <p className="welcome-subtitle">Du har ingen avtaler i dag.</p>
        )}
      </div>

      <div className="dashboard-content">
        {/* First Row - Action Cards and Care Team */}
        <div className="dashboard-top-row">
          {/* Book Appointment Card */}
          <Link to="/appointments" className="cta-link">
            <div className="cta-card">
              <i className="cta-icon bi bi-calendar-check"></i>
              <h3 className="cta-title">Bestill avtale</h3>
            </div>
          </Link>

          {/* Contact Caregiver Card */}
          <a href="#" className="cta-link" onClick={(e) => e.preventDefault()}>
            <div className="cta-card">
              <i className="cta-icon bi bi-envelope"></i>
              <h3 className="cta-title">Kontakt helsehjelp</h3>
            </div>
          </a>
          {/* Care Team Card */}
          <div className="care-team-card" id="careTeam">
            <div className="care-team-body">
              <h2 className="care-team-title">Mitt omsorgsteam</h2>
              {dashboard.availableCaregivers.length > 0 ? (
                <div className="caregivers-list">
                  {dashboard.availableCaregivers.map((caregiver) => {
                    const formattedDate = caregiver.nextAvailableDate 
                      ? new Date(caregiver.nextAvailableDate).toLocaleDateString('nb-NO', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      : 'Ingen ledig tid';
                    
                    return (
                      <div key={caregiver.personnelId} className="caregiver-item">
                        <p className="caregiver-name">
                          <i className="bi bi-person-fill"></i> {caregiver.personnelName}
                        </p>
                        <p className="caregiver-availability">
                          Neste ledige: {formattedDate}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="care-team-empty">
                  <i className="empty-icon bi bi-people"></i>
                  <p className="empty-text">Ingen omsorgspersoner tilgjengelig akkurat nå.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Second Row - Upcoming and Recent Appointments */}
        <div className="dashboard-bottom-row">
          {/* Upcoming Appointments */}
          <div className="appointments-card">
            <div className="appointments-body">
              <div className="appointments-header">
                <h2 className="appointments-title">Kommende avtaler</h2>
                <Link to="/appointments" className="btn btn-secondary btn-sm">
                  +
                </Link>
              </div>
              {dashboard.upcomingAppointments.length > 0 ? (
                <div className="appointments-list">
                  {dashboard.upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="appointment-item"
                    >
                      <div className="appointment-left">
                        <p className="appointment-personnel">{appointment.personnelName}</p>
                        <div className="appointment-badges">
                          <TaskBadges tasks={appointment.tasks} variant="secondary" />
                        </div>
                      </div>
                      <div className="appointment-right">
                        <div className="appointment-date">
                          {new Date(appointment.date).toLocaleDateString('nb-NO', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="appointment-time">{appointment.startTime}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="appointments-empty">
                  <i className="empty-icon bi bi-calendar-x"></i>
                  <p className="empty-text">Ingen kommende avtaler planlagt.</p>
                  <Link to="/appointments" className="book-btn">
                    <i className="bi bi-plus-circle"></i>Bestill avtale
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="appointments-card">
            <div className="appointments-body">
              <div className="appointments-header">
                <h2 className="appointments-title">Siste avtaler</h2>
                <Link to="/appointments?tab=past" className="btn btn-secondary btn-sm">
                  +
                </Link>
              </div>
              {dashboard.appointmentHistory.length > 0 ? (
                <div className="appointments-list">
                  {dashboard.appointmentHistory.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="appointment-item">
                      <div className="appointment-content">
                        <div className="appointment-main">
                          <div className="appointment-details">
                            <div className="appointment-top-row">
                              <p className="appointment-datetime">
                                {appointment.date && new Date(appointment.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'short',
                                  day: 'numeric',
                                })}{' '}
                                • {appointment.startTime} - {appointment.endTime}
                              </p>
                              {(appointment.status === 'Completed' || appointment.status === 'Cancelled') && (
                                <StatusBadge status={appointment.status} />
                              )}
                            </div>
                            <p className="appointment-personnel">
                              <i className="bi bi-person-fill"></i> {appointment.personnelName}
                            </p>
                            <div className="appointment-tasks">
                              <TaskBadges tasks={appointment.tasks} variant="secondary" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="appointments-empty">
                  <i className="empty-icon bi bi-calendar-x"></i>
                  <p className="empty-text">Ingen avtalehistorikk tilgjengelig.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
