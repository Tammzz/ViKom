import React, { useState, useEffect } from 'react';
import { getUserInfo } from '../auth/AuthService';
import AppointmentService from '../services/AppointmentService';
import AppointmentModal from '../components/AppointmentModal';
import AppointmentDeleteModal from '../components/AppointmentDeleteModal';
import TaskBadges from '../components/TaskBadges';
import type { Appointment } from '../types';
import '../css/AppointmentListPage.css';

const AppointmentListPage: React.FC = () => {
  // gets current user information
  const userInfo = getUserInfo();
  const isPersonnel = userInfo?.role === 'Personnel' || userInfo?.role === 'Admin';

  // State management
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Modal state management
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [appointmentToDelete, setAppointmentToDelete] = useState<{ id: number; description: string } | null>(null);

  // loads all appointments from the server
  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await AppointmentService.getAll();
      setAppointments(data);
    } catch (err) {
      setError('Failed to load appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // loads appointments on component mount
  useEffect(() => {
    loadAppointments();
  }, []);

  // filters appointments into upcoming and past categories
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // filters and sorts upcoming appointments
  const upcomingAppointments = appointments.filter((apt) => {
    if (!apt.date) return false;
    const aptDate = new Date(apt.date);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate >= today;
  }).sort((a, b) => {
    const dateA = new Date(a.date || '');
    const dateB = new Date(b.date || '');
    return dateA.getTime() - dateB.getTime();
  });

  // filters and sorts past appointments
  const pastAppointments = appointments.filter((apt) => {
    if (!apt.date) return false;
    const aptDate = new Date(apt.date);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate < today;
  }).sort((a, b) => {
    const dateA = new Date(a.date || '');
    const dateB = new Date(b.date || '');
    return dateB.getTime() - dateA.getTime();
  });

  // opens modal to create new appointment
  const handleCreate = () => {
    setSelectedAppointment(undefined);
    setShowModal(true);
  };

  // opens modal to edit existing appointment
  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  // opens delete confirmation modal
  const handleDelete = (appointment: Appointment) => {
    if (appointment.id) {
      setAppointmentToDelete({
        id: appointment.id,
        description: appointment.tasks,
      });
      setShowDeleteModal(true);
    }
  };

  // submits appointment data (create or update)
  const handleSubmit = async (data: Appointment) => {
    if (data.id) {
      await AppointmentService.update(data.id, data);
    } else {
      await AppointmentService.create({
        patientId: data.patientId,
        availabilityId: data.availabilityId,
        tasks: data.tasks,
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status,
      });
    }
    await loadAppointments();
  };

  // confirms and executes appointment deletion
  const handleConfirmDelete = async () => {
    if (appointmentToDelete) {
      try {
        await AppointmentService.delete(appointmentToDelete.id);
        await loadAppointments();
      } catch (err) {
        setError('Failed to delete appointment');
        console.error(err);
      }
    }
  };

  // returns appropriate badge class based on status
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'Completed':
        return 'status-completed';
      case 'Cancelled':
        return 'status-cancelled';
      case 'Booked':
        return 'status-booked';
      default:
        return 'status-default';
    }
  };

  // checks if appointment is within 24 hours
  const isWithin24Hours = (appointment: Appointment): boolean => {
    if (!appointment.date || !appointment.startTime) return false;
    
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.startTime}`);
    const now = new Date();
    const hoursUntil = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntil < 24;
  };

  // checks if appointment can be modified
  const canModify = (appointment: Appointment): boolean => {
    return !isWithin24Hours(appointment) && appointment.status === 'Booked';
  };

  // renders loading state
  if (loading) {
    return (
      <div className={`appointment-list-page ${isPersonnel ? 'personnel-page' : ''}`}>
        <p>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className={`appointment-list-page ${isPersonnel ? 'personnel-page' : ''}`}>
      {/* displays error message if present */}
      {error && (
        <div className="error-alert">
          <span>{error}</span>
          <button className="error-close" onClick={() => setError('')}>
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {/* main page title */}
      <h1 className="page-title">My Appointments</h1>

      {/* page subtitle */}
      <div className="page-subtitle">
        <p>View and manage all your appointments in one place.</p>
      </div>

      {/* creates new appointment button */}
      <div className="create-btn-wrapper">
        <button className="btn-create" onClick={handleCreate}>
          <i className="bi bi-calendar-plus"></i>Book New Appointment
        </button>
      </div>

      <div className="tabs-container">
        {/* provides tab navigation for upcoming and past appointments */}
        <ul className="tab-navigation" role="tablist">
          <li className="tab-item" role="presentation">
            <button
              className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
              id="upcoming-tab"
              aria-selected={activeTab === 'upcoming'}
              aria-controls="upcoming-panel"
              onClick={() => setActiveTab('upcoming')}
              type="button"
              role="tab"
            >
              Upcoming
            </button>
          </li>
          <li className="tab-item" role="presentation">
            <button
              className={`tab-button ${activeTab === 'past' ? 'active' : ''}`}
              id="past-tab"
              aria-selected={activeTab === 'past'}
              aria-controls="past-panel"
              onClick={() => setActiveTab('past')}
              type="button"
              role="tab"
            >
              Past
            </button>
          </li>
        </ul>

        {/* displays tab content based on active tab */}
        <div className="tab-content">
          {/* Upcoming Appointments Tab */}
          {activeTab === 'upcoming' && (
            <div className="tab-panel">
              <div className="appointments-card">
                <div className="appointments-body">
                  {upcomingAppointments.length > 0 ? (
                    <div className="appointments-list">
                      {upcomingAppointments.map((appointment) => {
                        const within24Hours = isWithin24Hours(appointment);
                        const modifiable = canModify(appointment);
                        
                        return (
                          <div key={appointment.id} className="appointment-item">
                            <div className="appointment-content">
                              <div className="appointment-main">
                                <div className="appointment-icon">
                                  <i className="bi bi-calendar-event"></i>
                                </div>
                                <div className="appointment-details">
                                  <div className="appointment-status-badges">
                                    <span className={`status-badge ${getStatusBadgeClass(appointment.status)}`}>
                                      {appointment.status}
                                    </span>
                                  </div>
                                  <div className="appointment-tasks">
                                    <TaskBadges tasks={appointment.tasks} variant="secondary" />
                                  </div>
                                  <p className="appointment-datetime">
                                    {appointment.date && new Date(appointment.date).toLocaleDateString('en-GB', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })}{' '}
                                    at {appointment.startTime} - {appointment.endTime}
                                  </p>
                                  {appointment.personnelName && (
                                    <p className="appointment-personnel">
                                      With {appointment.personnelName}
                                    </p>
                                  )}
                                  {isPersonnel && appointment.patientName && (
                                    <p className="appointment-patient">
                                      Patient: {appointment.patientName}
                                    </p>
                                  )}
                                  {within24Hours && appointment.status === 'Booked' && (
                                    <small className="appointment-warning">
                                      <i className="bi bi-exclamation-triangle"></i>
                                      Cancellations must be made at least 24 hours before
                                    </small>
                                  )}
                                </div>
                              </div>
                              <div className="appointment-actions">
                                <button
                                  className="btn-edit"
                                  onClick={() => handleEdit(appointment)}
                                  disabled={!modifiable}
                                  title={!modifiable ? 'Cannot edit within 24 hours or if not booked' : 'Edit appointment'}
                                >
                                  <i className="bi bi-pencil"></i> Change
                                </button>
                                <button
                                  className="btn-delete"
                                  onClick={() => handleDelete(appointment)}
                                  disabled={!modifiable}
                                  title={!modifiable ? 'Cannot cancel within 24 hours or if not booked' : 'Cancel appointment'}
                                >
                                  <i className="bi bi-trash"></i> {isPersonnel ? 'Delete' : 'Cancel'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="appointments-empty">
                      <i className="empty-icon bi bi-calendar-x"></i>
                      <h2 className="empty-title">No upcoming appointments</h2>
                      <p className="empty-text">
                        You have no appointments scheduled.
                      </p>
                      <button className="btn-create" onClick={handleCreate}>
                        <i className="bi bi-calendar-plus"></i>Book Your First Appointment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Past Appointments Tab */}
          {activeTab === 'past' && (
            <div className="tab-panel">
              <div className="appointments-card">
                <div className="appointments-body">
                  {pastAppointments.length > 0 ? (
                    <div className="appointments-list">
                      {pastAppointments.map((appointment) => (
                        <div key={appointment.id} className="appointment-item">
                          <div className="appointment-content">
                            <div className="appointment-main">
                              <div className="appointment-icon success">
                                <i className="bi bi-calendar-check"></i>
                              </div>
                              <div className="appointment-details">
                                <div className="appointment-status-badges">
                                  <span className={`status-badge ${getStatusBadgeClass(appointment.status)}`}>
                                    {appointment.status}
                                  </span>
                                </div>
                                <div className="appointment-tasks">
                                  <TaskBadges tasks={appointment.tasks} variant="secondary" />
                                </div>
                                <p className="appointment-datetime">
                                  {appointment.date && new Date(appointment.date).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}{' '}
                                  at {appointment.startTime} - {appointment.endTime}
                                </p>
                                {appointment.personnelName && (
                                  <p className="appointment-personnel">
                                    With {appointment.personnelName}
                                  </p>
                                )}
                                {isPersonnel && appointment.patientName && (
                                  <p className="appointment-patient">
                                    Patient: {appointment.patientName}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="appointments-empty">
                      <i className="empty-icon bi bi-calendar-x"></i>
                      <h2 className="empty-title">No past appointments</h2>
                      <p className="empty-text">
                        Your appointment history will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* appointment modals */}
      <AppointmentModal
        show={showModal}
        onClose={() => setShowModal(false)}
        initialData={selectedAppointment}
        onSubmit={handleSubmit}
      />

      <AppointmentDeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        appointmentDescription={appointmentToDelete?.description}
      />
    </div>
  );
};

export default AppointmentListPage;
