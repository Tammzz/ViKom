import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Alert, Badge, Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import { getUserInfo } from '../../auth/AuthService';
import PatientService from '../services/PatientService';
import type { PatientDetailsDto } from '../types/patient';
import SectionCard from '../../components/common/SectionCard';
import IconButton from '../../components/common/IconButton';
import InfoRow from '../../components/common/InfoRow';
import EmptyState from '../../components/common/EmptyState';
import Timeline from '../../components/common/Timeline';
import CallModal from '../../components/common/CallModal';
import AppointmentCard from '../../appointments/components/AppointmentCard';
import PatientProfileHeader from '../components/PatientProfileHeader';
import PatientNotesCard from '../components/PatientNotesCard';
import EditPatientModal from '../components/EditPatientModal';
import { buildPatientActivity } from '../utils/patientActivity';
import './PatientDetailsPage.css';

const PAST_PREVIEW_COUNT = 3;

type RightTab = 'upcoming' | 'past' | 'activity' | 'calls';

const callStatusMeta = (status: string): { label: string; variant: string } => {
  switch (status.toLowerCase()) {
    case 'answered':
      return { label: 'Besvart', variant: 'success' };
    case 'declined':
      return { label: 'Avvist', variant: 'danger' };
    case 'missed':
      return { label: 'Tapt', variant: 'warning' };
    case 'ended':
      return { label: 'Avsluttet', variant: 'secondary' };
    default:
      return { label: 'Ringte', variant: 'info' };
  }
};

const formatCallTime = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('nb-NO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const PatientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const userInfo = getUserInfo();
  const isPersonnel = userInfo?.role === 'Personnel';

  const [patient, setPatient] = useState<PatientDetailsDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [infoMessage, setInfoMessage] = useState<string>('');
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showAllPast, setShowAllPast] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<RightTab>('upcoming');

  const loadPatient = useCallback(async () => {
    if (!id) {
      setError('Mangler pasient-ID.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setInfoMessage('');
      const data = await PatientService.getById(id);
      setPatient(data);
    } catch (err) {
      setError('Kunne ikke laste pasientdetaljer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  // Lightweight refetch that doesn't flash the full-page spinner (used after a
  // call is logged so the communication history stays current).
  const refreshPatient = useCallback(async () => {
    if (!id) return;
    try {
      const data = await PatientService.getById(id);
      setPatient(data);
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  const deviceStatus = useMemo(() => {
    if (!patient) {
      return { label: 'Ukjent', variant: 'secondary' as const };
    }

    if (patient.supabaseProfileId) {
      return { label: 'Koblet til TV-profil', variant: 'success' as const };
    }

    return { label: 'Ikke koblet til TV-profil', variant: 'warning' as const };
  }, [patient]);

  const handleCallClick = () => {
    setShowCallModal(true);
  };

  const handleCallModalHide = () => {
    setShowCallModal(false);
    refreshPatient();
  };

  if (loading) {
    return (
      <Container fluid className={isPersonnel ? 'personnel-page' : ''}>
        <div className="d-flex align-items-center gap-2 py-4">
          <Spinner animation="border" size="sm" />
          <span>Laster pasientdetaljer...</span>
        </div>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container fluid className={isPersonnel ? 'personnel-page' : ''}>
        <Alert variant="danger">Fant ikke pasientdata.</Alert>
        <Link to="/patients" className="btn btn-outline-dark">
          Tilbake til pasientlisten
        </Link>
      </Container>
    );
  }

  const pastAppointments = patient.pastAppointments ?? [];
  const visiblePast = showAllPast ? pastAppointments : pastAppointments.slice(0, PAST_PREVIEW_COUNT);
  const recentCalls = patient.recentCalls ?? [];

  const tabs: { key: RightTab; label: string; icon: string; count?: number }[] = [
    { key: 'upcoming', label: 'Kommende avtaler', icon: 'calendar-event', count: patient.upcomingAppointments.length },
    { key: 'past', label: 'Tidligere avtaler', icon: 'clock-history', count: pastAppointments.length },
    { key: 'activity', label: 'Aktivitet', icon: 'activity' },
    { key: 'calls', label: 'Anropslogg', icon: 'telephone', count: recentCalls.length },
  ];

  return (
    <Container fluid className={`patient-details-page ${isPersonnel ? 'personnel-page' : ''}`}>
      <nav className="vk-breadcrumb" aria-label="Brødsmulesti">
        <Link to="/patients" className="vk-breadcrumb-back">
          <i className="bi bi-arrow-left" aria-hidden="true"></i>
          Pasienter
        </Link>
        <span className="vk-breadcrumb-sep">/</span>
        <span className="vk-breadcrumb-current">{patient.fullName}</span>
      </nav>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {infoMessage && (
        <Alert variant="info" dismissible onClose={() => setInfoMessage('')}>
          {infoMessage}
        </Alert>
      )}

      <PatientProfileHeader
        patient={patient}
        onCall={handleCallClick}
        onEdit={() => setShowEditModal(true)}
      />

      <Row className="g-4">
        <Col lg={4}>
          <div className="vk-card-stack">
            <SectionCard
              title="Pasientinformasjon"
              icon="person-vcard"
              action={
                <IconButton icon="pencil" title="Rediger" onClick={() => setShowEditModal(true)} />
              }
            >
              <InfoRow icon="envelope" label="E-post" value={patient.email} />
              <InfoRow icon="telephone" label="Telefon" value={patient.phoneNumber} />
              <InfoRow icon="geo-alt" label="Adresse" value={patient.address} />
            </SectionCard>

            <SectionCard title="TV-profil" icon="tv">
              <InfoRow
                label="Status"
                value={
                  <Badge
                    bg={deviceStatus.variant === 'success' ? '' : deviceStatus.variant}
                    className={deviceStatus.variant === 'success' ? 'vk-tv-status-connected' : ''}
                  >
                    {deviceStatus.label}
                  </Badge>
                }
              />
              <InfoRow
                label="Profil-ID"
                value={patient.supabaseProfileId}
                emptyText="Ikke koblet"
              />
            </SectionCard>

            <PatientNotesCard
              patientId={patient.id}
              initialNotes={patient.notes}
              notesUpdatedAt={patient.notesUpdatedAt}
              onSaved={(notes) =>
                setPatient((prev) =>
                  prev ? { ...prev, notes, notesUpdatedAt: new Date().toISOString() } : prev,
                )
              }
            />
          </div>
        </Col>

        <Col lg={8}>
          <div className="vk-tabs-card">
            <ul className="vk-tabs-nav" role="tablist">
              {tabs.map((tab) => (
                <li key={tab.key} className="vk-tabs-item" role="presentation">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    className={`vk-tab-button ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <i className={`bi bi-${tab.icon}`} aria-hidden="true"></i>
                    <span className="vk-tab-label">{tab.label}</span>
                    {tab.count !== undefined && <span className="vk-tab-count">{tab.count}</span>}
                  </button>
                </li>
              ))}
            </ul>

            <div className="vk-tabs-content">
              {activeTab === 'upcoming' &&
                (patient.upcomingAppointments.length === 0 ? (
                  <EmptyState icon="calendar-x" text="Ingen kommende avtaler." />
                ) : (
                  <div className="d-grid gap-3">
                    {patient.upcomingAppointments.map((appointment) => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                ))}

              {activeTab === 'past' &&
                (pastAppointments.length === 0 ? (
                  <EmptyState icon="calendar2-x" text="Ingen tidligere avtaler." />
                ) : (
                  <>
                    <div className="d-grid gap-3">
                      {visiblePast.map((appointment) => (
                        <AppointmentCard key={appointment.id} appointment={appointment} />
                      ))}
                    </div>
                    {pastAppointments.length > PAST_PREVIEW_COUNT && (
                      <div className="text-center mt-3">
                        <Button variant="link" className="p-0 text-dark" onClick={() => setShowAllPast((v) => !v)}>
                          {showAllPast ? 'Vis færre' : `Vis alle (${pastAppointments.length})`}
                        </Button>
                      </div>
                    )}
                  </>
                ))}

              {activeTab === 'activity' && (
                <Timeline
                  items={buildPatientActivity(patient)}
                  emptyText="Ingen registrert aktivitet enda."
                />
              )}

              {activeTab === 'calls' &&
                (recentCalls.length === 0 ? (
                  <EmptyState icon="telephone-x" text="Ingen registrerte anrop." />
                ) : (
                  <div className="vk-call-log">
                    {recentCalls.map((call) => {
                      const meta = callStatusMeta(call.status);
                      return (
                        <div key={call.id} className="vk-call-log-item">
                          <div className="vk-call-log-main">
                            <i className="bi bi-telephone-outbound vk-call-log-icon" aria-hidden="true"></i>
                            <div>
                              <div className="fw-semibold">{call.personnelName || 'Helsepersonell'}</div>
                              <div className="text-muted small">{formatCallTime(call.startedAt)}</div>
                            </div>
                          </div>
                          <Badge bg={meta.variant}>{meta.label}</Badge>
                        </div>
                      );
                    })}
                  </div>
                ))}
            </div>
          </div>
        </Col>
      </Row>

      <EditPatientModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        patient={patient}
        onSaved={(updated) => setPatient(updated)}
      />

      <CallModal
        show={showCallModal}
        onHide={handleCallModalHide}
        targetSupabaseProfileId={patient.supabaseProfileId}
        patientId={patient.id}
        patientName={patient.fullName}
      />
    </Container>
  );
};

export default PatientDetailsPage;
