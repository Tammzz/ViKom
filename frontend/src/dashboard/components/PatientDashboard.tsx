import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPatientDashboard } from '../services/DashboardService';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import AppointmentCard from '../../appointments/components/AppointmentCard';
import EmptyState from '../../components/common/EmptyState';
import type { PatientViewModel } from '../types/dashboard';
import type { AppointmentSummary } from '../../appointments/types/appointment';
import './PatientDashboard.css';

const formatShortDate = (date: string) =>
  new Date(date).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });

const formatHistoryDateTime = (appointment: AppointmentSummary) => {
  const datePart = appointment.date
    ? new Date(appointment.date).toLocaleDateString('nb-NO', { weekday: 'long', month: 'short', day: 'numeric' })
    : '';
  return `${datePart} • ${appointment.startTime} - ${appointment.endTime}`;
};

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

  const upcomingCount = dashboard.upcomingAppointments.length;

  return (
    <div className="patient-dashboard">
      <PageHeader
        title={`Velkommen tilbake, ${dashboard.patientName}!`}
        subtitle={
          upcomingCount > 0
            ? `Du har ${upcomingCount} avtale${upcomingCount > 1 ? 'r' : ''} i vente.`
            : 'Du har ingen avtaler i dag.'
        }
      />

      <div className="dashboard-content">
        {/* First Row - Action Cards and Care Team */}
        <div className="dashboard-top-row">
          {/* Book Appointment Card */}
          <Link to="/appointments" className="cta-link">
            <div className="cta-card vk-hoverable">
              <i className="cta-icon bi bi-calendar-check"></i>
              <h3 className="cta-title">Bestill avtale</h3>
            </div>
          </Link>

          {/* Contact Caregiver Card */}
          <a href="#" className="cta-link" onClick={(e) => e.preventDefault()}>
            <div className="cta-card vk-hoverable">
              <i className="cta-icon bi bi-envelope"></i>
              <h3 className="cta-title">Kontakt helsehjelp</h3>
            </div>
          </a>

          {/* Care Team Card */}
          <SectionCard title="Mitt omsorgsteam" icon="people">
            {dashboard.availableCaregivers.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {dashboard.availableCaregivers.map((caregiver) => {
                  const formattedDate = caregiver.nextAvailableDate
                    ? new Date(caregiver.nextAvailableDate).toLocaleDateString('nb-NO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Ingen ledig tid';

                  return (
                    <div key={caregiver.personnelId} className="caregiver-item">
                      <p className="caregiver-name">
                        <i className="bi bi-person-fill"></i> {caregiver.personnelName}
                      </p>
                      <p className="caregiver-availability">Neste ledige: {formattedDate}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon="people" text="Ingen omsorgspersoner tilgjengelig akkurat nå." />
            )}
          </SectionCard>
        </div>

        {/* Second Row - Upcoming and Recent Appointments */}
        <div className="dashboard-bottom-row">
          {/* Upcoming Appointments */}
          <SectionCard
            title="Kommende avtaler"
            icon="calendar-check"
            action={
              <Link to="/appointments" className="btn btn-secondary btn-sm" aria-label="Se alle avtaler">
                <i className="bi bi-plus-lg"></i>
              </Link>
            }
          >
            {upcomingCount > 0 ? (
              <div className="d-flex flex-column gap-3">
                {dashboard.upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    dateTimeText={`${formatShortDate(appointment.date)} • ${appointment.startTime}`}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="calendar-x"
                text="Ingen kommende avtaler planlagt."
                action={
                  <Link to="/appointments" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>Bestill avtale
                  </Link>
                }
              />
            )}
          </SectionCard>

          {/* Recent Appointments */}
          <SectionCard
            title="Siste avtaler"
            icon="clock-history"
            action={
              <Link to="/appointments?tab=past" className="btn btn-secondary btn-sm" aria-label="Se tidligere avtaler">
                <i className="bi bi-plus-lg"></i>
              </Link>
            }
          >
            {dashboard.appointmentHistory.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {dashboard.appointmentHistory.slice(0, 5).map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    dateTimeText={formatHistoryDateTime(appointment)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState icon="calendar-x" text="Ingen avtalehistorikk tilgjengelig." />
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
