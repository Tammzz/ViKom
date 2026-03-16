import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPersonnelDashboard } from '../services/DashboardService';
import TaskBadges from '../../components/common/TaskBadges';
import StatusBadge from '../../components/common/StatusBadge';
import type { PersonnelViewModel } from '../types/dashboard';
import './PersonnelDashboard.css';

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
      } catch {
        setError('Kunne ikke laste dashboarddata');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // renders loading state while fetching data
  if (loading) {
    return (
      <div className="personnel-dashboard">
        <p>Laster dashboard...</p>
      </div>
    );
  }

  // renders error state if data fetch fails
  if (error || !dashboard) {
    return (
      <div className="personnel-dashboard">
        <p className="error-text">{error || 'Kunne ikke laste dashboard'}</p>
      </div>
    );
  }

  return (
    <div className="personnel-dashboard">
      {/* renders welcome section with personnel name */}
      <div className="welcome-section">
        <h1 className="welcome-title">Velkommen tilbake, {dashboard.personnelName}!</h1>
        <p className="welcome-subtitle">Her er en oversikt over timeplanen og pasientene dine</p>
      </div>

      {/* displays quick stats overview with key metrics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <div className="stat-number">{dashboard.totalPatients}</div>
              <p className="stat-label">Pasienter</p>
            </div>
            <div className="stat-icon">
              <i className="bi bi-people-fill"></i>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <div className="stat-number">{dashboard.appointmentsThisWeek}</div>
              <p className="stat-label">Denne uken</p>
            </div>
            <div className="stat-icon">
              <i className="bi bi-calendar-check-fill"></i>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <div className="stat-number">{dashboard.pendingAppointments}</div>
              <p className="stat-label">Planlagte</p>
            </div>
            <div className="stat-icon">
              <i className="bi bi-clock-fill"></i>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <div className="stat-number">{dashboard.cancelledAppointments}</div>
              <p className="stat-label">Avlyste</p>
            </div>
            <div className="stat-icon">
              <i className="bi bi-x-circle-fill"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar overview section */}
      <div className="card calendar-overview">
        <div className="card-header">
          <h2 className="card-title">Kalenderoversikt</h2>
        </div>
        <div className="card-body">
          <div className="calendar-grid">
            {/* Mock calendar days */}
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const hasAppointment = [5, 12, 18, 25].includes(day); // Mock days with appointments
              return (
                <div key={day} className={`calendar-day ${hasAppointment ? 'has-appointment' : ''}`}>
                  <span className="day-number">{day}</span>
                  {hasAppointment && <div className="appointment-dot"></div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* displays two-column layout for appointments and activity */}
      <div className="dashboard-content">
        <div className="dashboard-left">
          {/* shows upcoming appointments table */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Kommende avtaler</h2>
            </div>
            <div className="card-body">
              {dashboard.upcomingAppointments.length > 0 ? (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Pasient</th>
                        <th>Oppgave</th>
                        <th>Dato</th>
                        <th>Tid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.upcomingAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td>{appointment.patientName}</td>
                          <td>
                            <TaskBadges tasks={appointment.tasks} variant="secondary" />
                          </td>
                          <td>
                              {new Date(appointment.date).toLocaleDateString('nb-NO', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                            })}
                          </td>
                          <td>{appointment.startTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <i className="bi bi-calendar-x empty-icon"></i>
                  <p className="empty-text">Ingen kommende avtaler planlagt.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-right">
          {/* shows recent appointments cards */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Siste avtaler</h2>
            </div>
            <div className="card-body">
              {dashboard.recentAppointments.length > 0 ? (
                <div className="appointments-list">
                  {dashboard.recentAppointments.map((appointment) => (
                    <div key={appointment.id} className="appointment-item">
                      <div className="appointment-content">
                        <div className="appointment-main">
                        
                          <div className="appointment-details">
                            <div className="appointment-top-row">
                              <p className="appointment-datetime">
                                {appointment.date && new Date(appointment.date).toLocaleDateString('nb-NO', {
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
                            <p className="appointment-patient">
                              <i className="bi bi-person-fill"></i> {appointment.patientName}
                            </p>
                            <div className="appointment-tasks">
                              {/*<p className="appointment-patient">Task(s):</p>*/}
                              <TaskBadges tasks={appointment.tasks} variant="secondary" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <i className="bi bi-calendar-x empty-icon"></i>
                  <p className="empty-text">Ingen nylige avtaler å vise.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Tasks section */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Dagens oppgaver</h2>
        </div>
        <div className="card-body">
          <div className="tasks-list">
            {/* Mock tasks */}
            {[
              { id: 1, patient: 'Jane Smith', task: 'Medisinhåndtering', time: '10:00', completed: false },
              { id: 2, patient: 'John Doe', task: 'Sjekk av blodtrykk og puls', time: '11:30', completed: true },
              { id: 3, patient: 'Alice Johnson', task: 'Hjelp med matinnkjøp', time: '14:00', completed: false },
              { id: 4, patient: 'Bob Wilson', task: 'Digital hjelp - e-postoppsett', time: '16:00', completed: false },
            ].map((task) => (
              <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <div className="task-content">
                  <div className="task-main">
                    <p className="task-description">{task.task}</p>
                    <p className="task-patient"><i className="bi bi-person-fill"></i> {task.patient}</p>
                    <p className="task-time"><i className="bi bi-clock-fill"></i> {task.time}</p>
                  </div>
                  <div className="task-status">
                    {task.completed ? (
                      <i className="bi bi-check-circle-fill text-success"></i>
                    ) : (
                      <i className="bi bi-circle text-muted"></i>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* displays upcoming availability schedule */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Kommende tilgjengelighet</h2>
          <Link to="/availability" className="btn btn-secondary btn-sm">
            +
          </Link>
        </div>
        <div className="card-body">
          {dashboard.upcomingAvailability.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Dato</th>
                    <th>Start</th>
                    <th>Slutt</th>
                    <th>Notater</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.upcomingAvailability.map((availability) => (
                    <tr key={availability.id}>
                      <td>
                        {new Date(availability.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        })}
                      </td>
                      <td>{availability.startTime}</td>
                      <td>{availability.endTime}</td>
                      <td>{availability.notes || '-'}</td>
                      <td>
                        {availability.isBooked ? (
                          <StatusBadge status="Booked" />
                        ) : (
                          <StatusBadge status="Available" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <i className="bi bi-calendar-x empty-icon"></i>
              <p className="empty-text">Ingen planlagt tilgjengelighet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonnelDashboard;
