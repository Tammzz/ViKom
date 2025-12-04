import React, { useState, useEffect } from 'react';
import { Container, Button, Alert } from 'react-bootstrap';
import { getUserInfo } from '../services/AuthService';
import AppointmentService from '../services/AppointmentService';
import AppointmentModal from '../components/AppointmentModal';
import AppointmentDeleteModal from '../components/AppointmentDeleteModal';
import TaskBadges from '../components/TaskBadges';
import type { Appointment } from '../types';
import '../css/AppointmentListPage.css';

const AppointmentListPage: React.FC = () => {
  const userInfo = getUserInfo();
  const isPersonnel = userInfo?.role === 'Personnel' || userInfo?.role === 'Admin';

  // State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [appointmentToDelete, setAppointmentToDelete] = useState<{ id: number; description: string } | null>(null);

  // Load appointments
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

  useEffect(() => {
    loadAppointments();
  }, []);

  // Filter appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  // Handlers
  const handleCreate = () => {
    setSelectedAppointment(undefined);
    setShowModal(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleDelete = (appointment: Appointment) => {
    if (appointment.id) {
      setAppointmentToDelete({
        id: appointment.id,
        description: appointment.tasks,
      });
      setShowDeleteModal(true);
    }
  };

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

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'Completed':
        return 'bg-success';
      case 'Cancelled':
        return 'bg-secondary';
      case 'Booked':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  };

  // Check if appointment is within 24 hours
  const isWithin24Hours = (appointment: Appointment): boolean => {
    if (!appointment.date || !appointment.startTime) return false;
    
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.startTime}`);
    const now = new Date();
    const hoursUntil = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntil < 24;
  };

  // Check if appointment can be modified
  const canModify = (appointment: Appointment): boolean => {
    return !isWithin24Hours(appointment) && appointment.status === 'Booked';
  };

  if (loading) {
    return (
      <Container fluid className={isPersonnel ? 'personnel-page' : ''}>
        <p>Loading appointments...</p>
      </Container>
    );
  }

  return (
    <div className={isPersonnel ? 'personnel-page' : ''}>
      <Container fluid>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <div className="mb-4">
          <p className="text-muted mb-0 fs-5 lh-base">
            View and manage all your appointments in one place.
          </p>
        </div>

        {/* Book Appointment Button */}
        <div className="mb-4">
          <Button variant="primary" onClick={handleCreate}>
            <i className="bi bi-calendar-plus me-2"></i>Book New Appointment
          </Button>
        </div>

        <div className="mt-4">
          {/* Tab Navigation */}
          <ul className="nav nav-tabs border-bottom mb-4" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link fw-semibold text-dark ${activeTab === 'upcoming' ? 'active' : ''}`}
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
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link fw-semibold text-dark ${activeTab === 'past' ? 'active' : ''}`}
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
          {/* Tab Content */}
          <div className="tab-content">
            {/* Upcoming Appointments Tab */}
            {activeTab === 'upcoming' && (
              <div className="tab-pane fade show active">
                <div className="card border-1 border-dark bg-light">
                  <div className="card-body p-4">
                    {upcomingAppointments.length > 0 ? (
                      <div className="vstack gap-3">
                        {upcomingAppointments.map((appointment) => {
                          const within24Hours = isWithin24Hours(appointment);
                          const modifiable = canModify(appointment);
                          
                          return (
                            <div key={appointment.id} className="border border-dark rounded p-3 bg-white">
                              <div className="row align-items-center">
                                <div className="col-md-8">
                                  <div className="d-flex align-items-start gap-3">
                                    <div>
                                      <i className="bi bi-calendar-event text-dark fs-2"></i>
                                    </div>
                                    <div className="flex-grow-1">
                                      <div className="d-flex align-items-center gap-2 mb-2">
                                        <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                                          {appointment.status}
                                        </span>
                                      </div>
                                      <div className="mb-2">
                                        <TaskBadges tasks={appointment.tasks} variant="secondary" />
                                      </div>
                                      <p className="mb-2 text-dark lh-lg">
                                        {appointment.date && new Date(appointment.date).toLocaleDateString('en-GB', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric',
                                        })}{' '}
                                        at {appointment.startTime} - {appointment.endTime}
                                      </p>
                                      {appointment.personnelName && (
                                        <p className="mb-0 text-muted lh-lg">
                                          With {appointment.personnelName}
                                        </p>
                                      )}
                                      {isPersonnel && appointment.patientName && (
                                        <p className="mb-0 text-muted lh-lg">
                                          Patient: {appointment.patientName}
                                        </p>
                                      )}
                                      {within24Hours && appointment.status === 'Booked' && (
                                        <small className="text-warning d-block mt-2">
                                          <i className="bi bi-exclamation-triangle me-1"></i>
                                          Cancellations must be made at least 24 hours before
                                        </small>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4 text-end">
                                  <div className="d-flex gap-2 justify-content-end mt-2">
                                    <Button
                                      variant="outline-secondary"
                                      size="sm"
                                      onClick={() => handleEdit(appointment)}
                                      disabled={!modifiable}
                                      title={!modifiable ? 'Cannot edit within 24 hours or if not booked' : 'Edit appointment'}
                                    >
                                      <i className="bi bi-pencil"></i> Change
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => handleDelete(appointment)}
                                      disabled={!modifiable}
                                      title={!modifiable ? 'Cannot cancel within 24 hours or if not booked' : 'Cancel appointment'}
                                    >
                                      <i className="bi bi-trash"></i>{' '}
                                      {isPersonnel ? 'Delete' : 'Cancel'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <i className="bi bi-calendar-x display-4 text-muted mb-3 d-block"></i>
                        <h5 className="text-muted mb-3">No upcoming appointments</h5>
                        <p className="text-muted fs-5 lh-base mb-4">
                          You have no appointments scheduled.
                        </p>
                        <Button variant="primary" onClick={handleCreate}>
                          <i className="bi bi-calendar-plus me-2"></i>Book Your First Appointment
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Past Appointments Tab */}
            {activeTab === 'past' && (
              <div className="tab-pane fade show active">
                <div className="card border-1 border-dark bg-light">
                  <div className="card-body p-4">
                    {pastAppointments.length > 0 ? (
                      <div className="vstack gap-3">
                        {pastAppointments.map((appointment) => (
                          <div key={appointment.id} className="border border-dark rounded p-3 bg-white">
                            <div className="row align-items-center">
                              <div className="col-md-8">
                                <div className="d-flex align-items-start gap-3">
                                  <div>
                                    <i className="bi bi-calendar-check text-success fs-2"></i>
                                  </div>
                                  <div>
                                    <div className="mb-2">
                                      <span className={`badge ${getStatusBadgeClass(appointment.status)}`}>
                                        {appointment.status}
                                      </span>
                                    </div>
                                    <div className="mb-2">
                                      <TaskBadges tasks={appointment.tasks} variant="secondary" />
                                    </div>
                                    <p className="mb-2 text-dark lh-lg">
                                      {appointment.date && new Date(appointment.date).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                      })}{' '}
                                      at {appointment.startTime} - {appointment.endTime}
                                    </p>
                                    {appointment.personnelName && (
                                      <p className="mb-0 text-muted lh-lg">
                                        With {appointment.personnelName}
                                      </p>
                                    )}
                                    {isPersonnel && appointment.patientName && (
                                      <p className="mb-0 text-muted lh-lg">
                                        Patient: {appointment.patientName}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <i className="bi bi-calendar-x display-4 text-muted mb-3 d-block"></i>
                        <h5 className="text-muted mb-3">No past appointments</h5>
                        <p className="text-muted fs-5 lh-base">
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

        {/* Modals */}
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
      </Container>
    </div>
  );
};

export default AppointmentListPage;
