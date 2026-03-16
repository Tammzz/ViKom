import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as AuthService from '../../auth/AuthService';
import AppointmentService from '../services/AppointmentService';
import AppointmentModal from '../components/AppointmentModal';
import AppointmentDeleteModal from '../components/AppointmentDeleteModal';
import TaskBadges from '../../components/common/TaskBadges';
import StatusBadge from '../../components/common/StatusBadge';
import type { Appointment } from '../types/appointment';
import './AppointmentListPage.css';

type PersonnelTab = 'all' | 'scheduled' | 'inprogress' | 'completed';

type PatientTab = 'upcoming' | 'past';

const formatDateNorwegian = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('nb-NO', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const AppointmentListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const userInfo = AuthService.getUserInfo();
  const role = userInfo?.role;

  // State management
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Modal state management
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [appointmentToDelete, setAppointmentToDelete] = useState<{ id: number; description: string } | null>(null);

  // Active tab state (depends on user role)
  const [activeTab, setActiveTab] = useState<PersonnelTab | PatientTab>(() => {
    if (role === 'Personnel') {
      return (tabParam as PersonnelTab) || 'all';
    }
    return (tabParam === 'past' ? 'past' : 'upcoming') as PatientTab;
  });

  // loads appointments from the server based on role
  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      let data: Appointment[] = [];
      if (role === 'Patient' && userInfo?.userId) {
        data = await AppointmentService.getByPatientId(userInfo.userId);
      } else if (role === 'Personnel' && userInfo?.userId) {
        data = await AppointmentService.getByPersonnelId(userInfo.userId);
      } else {
        data = await AppointmentService.getAll();
      }

      setAppointments(data);
    } catch {
      setError('Kunne ikke laste avtaler');
    } finally {
      setLoading(false);
    }
  };

  // loads appointments on component mount
  useEffect(() => {
    loadAppointments();
  }, []);

  // handle updates to appointment status (start/complete)
  const handleStatusUpdate = async (appointment: Appointment, newStatus: 'InProgress' | 'Completed') => {
    if (!appointment.id) return;
    try {
      await AppointmentService.update(appointment.id, { ...appointment, status: newStatus });
      await loadAppointments();
    } catch {
      setError('Kunne ikke oppdatere avtalen.');
    }
  };

  // filters for patient view
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments
    .filter((apt) => {
      if (!apt.date) return false;
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate >= today;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || '');
      const dateB = new Date(b.date || '');
      return dateA.getTime() - dateB.getTime();
    });

  const pastAppointments = appointments
    .filter((apt) => {
      if (!apt.date) return false;
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate < today;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || '');
      const dateB = new Date(b.date || '');
      return dateB.getTime() - dateA.getTime();
    });

  // filters for personnel view
  const scheduledAppointments = appointments.filter((a) => a.status === 'Booked');
  const inProgressAppointments = appointments.filter((a) => a.status === 'InProgress');
  const completedAppointments = appointments.filter((a) => a.status === 'Completed');
  const allActiveAppointments = [...scheduledAppointments, ...inProgressAppointments].sort((a, b) => {
    const dateA = new Date(a.date || '');
    const dateB = new Date(b.date || '');
    if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime();
    return a.startTime.localeCompare(b.startTime);
  });

  // checks if appointment is within 24 hours (for patient modifications)
  const isWithin24Hours = (appointment: Appointment): boolean => {
    if (!appointment.date || !appointment.startTime) return false;

    const appointmentDateTime = new Date(`${appointment.date}T${appointment.startTime}`);
    const now = new Date();
    const hoursUntil = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursUntil < 24;
  };

  // checks if patient appointment can be modified
  const canModify = (appointment: Appointment): boolean => {
    return !isWithin24Hours(appointment) && appointment.status === 'Booked';
  };

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
      } catch {
        setError('Kunne ikke slette avtalen');
      }
    }
  };

  // renders loading state
  if (loading) {
    return (
      <div className="appointment-list-page">
        <p>Laster avtaler...</p>
      </div>
    );
  }

  // Render UI for personnel (nurse) view
  if (role === 'Personnel') {
    const showList = (tab: PersonnelTab) => {
      const list =
        tab === 'all'
          ? allActiveAppointments
          : tab === 'scheduled'
          ? scheduledAppointments
          : tab === 'inprogress'
          ? inProgressAppointments
          : completedAppointments;

      if (list.length === 0) {
        return (
          <div className="appointments-empty">
            <i className="empty-icon bi bi-calendar-x"></i>
            <h2 className="empty-title">Ingen avtaler</h2>
            <p className="empty-text">
              Det finnes ingen avtaler som matcher dette filteret.
            </p>
          </div>
        );
      }

      return (
        <div className="appointments-list">
          {list.map((appointment) => {
            const isBooked = appointment.status === 'Booked';
            const isInProgress = appointment.status === 'InProgress';
            const isCompleted = appointment.status === 'Completed';

            return (
              <div key={appointment.id} className="appointment-item">
                <div className="appointment-content">
                  <div className="appointment-main">
                    <div className="appointment-icon">
                      <i className="bi bi-calendar-event"></i>
                    </div>
                    <div className="appointment-details">
                      <div className="appointment-top-row">
                        <p className="appointment-datetime">
                          {formatDateNorwegian(appointment.date)}
                          {appointment.startTime ? ` • ${appointment.startTime} - ${appointment.endTime}` : ''}
                        </p>
                        <div className="appointment-status-badges">
                          <StatusBadge status={appointment.status} />
                        </div>
                      </div>

                      {appointment.patientName && (
                        <p className="appointment-personnel">
                          Pasient: {appointment.patientName}
                        </p>
                      )}

                      <div className="appointment-tasks">
                        <TaskBadges tasks={appointment.tasks} variant="secondary" />
                      </div>

                      {isCompleted && (
                        <small className="appointment-warning">
                          Oppgaven er fullført.
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="appointment-actions">
                    {isBooked && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleStatusUpdate(appointment, 'InProgress')}
                      >
                        Start
                      </button>
                    )}
                    {isInProgress && (
                      <button
                        className="btn btn-success"
                        onClick={() => handleStatusUpdate(appointment, 'Completed')}
                      >
                        Fullfør
                      </button>
                    )}
                    {isCompleted && (
                      <span className="badge bg-success">Oppgave fullført</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <div className="appointment-list-page personnel-page">
        {error && (
          <div className="error-alert">
            <span>{error}</span>
            <button className="error-close" onClick={() => setError('')}>
              <i className="bi bi-x"></i>
            </button>
          </div>
        )}

        <h1 className="page-title">Mine pasientavtaler</h1>
        <div className="page-subtitle">
          <p>Start og fullfør oppgaver for pasientene dine direkte her.</p>
        </div>

        <div className="tabs-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <button
              className="btn btn-warning"
              type="button"
              onClick={() => setActiveTab('completed')}
            >
              Rydd opp fullførte
            </button>
            <ul className="tab-navigation" role="tablist">
              <li className="tab-item" role="presentation">
                <button
                  className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                  type="button"
                  role="tab"
                  onClick={() => setActiveTab('all')}
                >
                  Alle ({allActiveAppointments.length})
                </button>
              </li>
              <li className="tab-item" role="presentation">
                <button
                  className={`tab-button ${activeTab === 'scheduled' ? 'active' : ''}`}
                  type="button"
                  role="tab"
                  onClick={() => setActiveTab('scheduled')}
                >
                  Planlagt ({scheduledAppointments.length})
                </button>
              </li>
              <li className="tab-item" role="presentation">
                <button
                  className={`tab-button ${activeTab === 'inprogress' ? 'active' : ''}`}
                  type="button"
                  role="tab"
                  onClick={() => setActiveTab('inprogress')}
                >
                  Pågår ({inProgressAppointments.length})
                </button>
              </li>
              <li className="tab-item" role="presentation">
                <button
                  className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
                  type="button"
                  role="tab"
                  onClick={() => setActiveTab('completed')}
                >
                  Fullført ({completedAppointments.length})
                </button>
              </li>
            </ul>
          </div>

          <div className="tab-content">
            <div className="tab-panel">
              <div className="appointments-card">
                <div className="appointments-body">
                  {showList(activeTab as PersonnelTab)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-list-page">
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
      <h1 className="page-title">Mine avtaler</h1>

      {/* page subtitle */}
      <div className="page-subtitle">
        <p>Se og administrer alle dine avtaler på ett sted.</p>
      </div>

      {/* creates new appointment button */}
      <div className="create-btn-wrapper">
        <button className="btn-create" onClick={handleCreate}>
          <i className="bi bi-calendar-plus"></i>Ny avtale
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
              Kommende
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
              Tidligere
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
                                
                                  <div className="appointment-top-row">
                                    <p className="appointment-datetime">
                                      {appointment.date && formatDateNorwegian(appointment.date)}
                                      {appointment.startTime ? ` • ${appointment.startTime} - ${appointment.endTime}` : ''}
                                    </p>
                                    <div className="appointment-status-badges">
                                      <StatusBadge status={appointment.status} />
                                    </div>
                                  </div>

                                  {appointment.personnelName && (
                                    <p className="appointment-personnel">
                                      {appointment.personnelName}
                                    </p>
                                  )}

                                  <div className="appointment-tasks">
                                    <TaskBadges tasks={appointment.tasks} variant="secondary" />
                                  </div>

                                  {within24Hours && appointment.status === 'Booked' && (
                                    <small className="appointment-warning">
                                      <i className="bi bi-exclamation-triangle"></i>
                                      Avbestilling må skje minst 24 timer før
                                    </small>
                                  )}
                                </div>
                              </div>
                              <div className="appointment-actions">
                                <button
                                  className="btn btn-secondary btn-edit"
                                  onClick={() => handleEdit(appointment)}
                                  disabled={!modifiable}
                                  title={!modifiable ? 'Kan ikke endres innen 24 timer eller hvis ikke planlagt' : 'Endre avtale'}
                                >
                                  <i className="bi bi-pencil"></i> Endre
                                </button>
                                <button
                                  className="btn btn-danger btn-delete"
                                  onClick={() => handleDelete(appointment)}
                                  disabled={!modifiable}
                                  title={!modifiable ? 'Kan ikke avbestilles innen 24 timer eller hvis ikke planlagt' : 'Avbryt avtale'}
                                >
                                  <i className="bi bi-trash"></i> Avbryt
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
                      <h2 className="empty-title">Ingen kommende avtaler</h2>
                      <p className="empty-text">
                        Du har ingen planlagte avtaler.
                      </p>
                      <button className="btn-create" onClick={handleCreate}>
                        <i className="bi bi-calendar-plus"></i>Book første avtale
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
                                <div className={`appointment-icon ${appointment.status === 'Completed' ? 'secondary' : appointment.status === 'Cancelled' ? 'secondary' : ''}`}>
                                  <i className={`bi ${appointment.status === 'Completed' ? 'bi-calendar-check' : appointment.status === 'Cancelled' ? 'bi-calendar-x' : 'bi-calendar-event'}`}></i>
                                </div>
                              <div className="appointment-details">

                                <div className="appointment-top-row">
                                  <p className="appointment-datetime">
                                    {appointment.date && formatDateNorwegian(appointment.date)}
                                    {appointment.startTime ? ` • ${appointment.startTime} - ${appointment.endTime}` : ''}
                                  </p>

                                  <div className="appointment-status-badges">
                                    <StatusBadge status={appointment.status} />
                                  </div>
                                </div>

                                {appointment.personnelName && (
                                  <p className="appointment-personnel">
                                    {appointment.personnelName}
                                  </p>
                                )}

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
                      <h2 className="empty-title">Ingen tidligere avtaler</h2>
                      <p className="empty-text">
                        Historikken vises her.
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
