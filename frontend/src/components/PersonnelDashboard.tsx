import React, { useState, useEffect } from 'react';
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

  // renders loading state while fetching data
  if (loading) {
    return (
      <div className="personnel-dashboard">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // renders error state if data fetch fails
  if (error || !dashboard) {
    return (
      <div className="personnel-dashboard">
        <p className="error-text">{error || 'Unable to load dashboard'}</p>
      </div>
    );
  }

  return (
    <div className="personnel-dashboard">
      {/* renders welcome section with personnel name */}
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome back, {dashboard.personnelName}!</h1>
        <p className="welcome-subtitle">Here's an overview of your schedule and patients</p>
      </div>

      {/* displays quick stats overview with key metrics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <div className="stat-number">{dashboard.totalPatients}</div>
              <p className="stat-label">Patients</p>
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
              <p className="stat-label">This Week</p>
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
              <p className="stat-label">Pending</p>
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
              <p className="stat-label">Cancelled</p>
            </div>
            <div className="stat-icon">
              <i className="bi bi-x-circle-fill"></i>
            </div>
          </div>
        </div>
      </div>

      {/* displays two-column layout for appointments and activity */}
      <div className="dashboard-content">
        <div className="dashboard-left">
          {/* shows upcoming appointments table */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Upcoming Appointments</h2>
            </div>
            <div className="card-body">
              {dashboard.upcomingAppointments.length > 0 ? (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Task</th>
                        <th>Date</th>
                        <th>Time</th>
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
                            {new Date(appointment.date).toLocaleDateString('en-GB', {
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
                  <p className="empty-text">No upcoming appointments scheduled.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-right">
          {/* shows recent activity table */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Activity</h2>
            </div>
            <div className="card-body">
              {dashboard.recentAppointments.length > 0 ? (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Task</th>
                        <th>Date</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.recentAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td>{appointment.patientName}</td>
                          <td>
                            <TaskBadges tasks={appointment.tasks} variant="secondary" />
                          </td>
                          <td>
                            {new Date(appointment.date).toLocaleDateString('en-GB', {
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
                  <i className="bi bi-clock-history empty-icon"></i>
                  <p className="empty-text">No recent activity to display.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* displays upcoming availability schedule */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Upcoming Availability</h2>
        </div>
        <div className="card-body">
          {dashboard.upcomingAvailability.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Notes</th>
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
                          <span className="status-badge status-booked">Booked</span>
                        ) : (
                          <span className="status-badge status-available">Available</span>
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
              <p className="empty-text">No upcoming availability scheduled.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonnelDashboard;
