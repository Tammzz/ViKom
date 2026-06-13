import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Container, ListGroup, Row, Spinner } from 'react-bootstrap';
import { getUserInfo } from '../../auth/AuthService';
import PatientService from '../services/PatientService';
import type { PatientDetailsDto } from '../types/patient';
import StatusBadge from '../../components/common/StatusBadge';
import TaskBadges from '../../components/common/TaskBadges';
import CallModal from '../../components/common/CallModal';

const PatientDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const userInfo = getUserInfo();
    const isPersonnel = userInfo?.role === 'Personnel';

    const [patient, setPatient] = useState<PatientDetailsDto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [infoMessage, setInfoMessage] = useState<string>('');
    const [showCallModal, setShowCallModal] = useState<boolean>(false);

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

    return (
        <Container fluid className={isPersonnel ? 'personnel-page' : ''}>
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

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3 mb-4">
                <div>
                    <p className="text-muted mb-1 text-uppercase small fw-semibold">Pasientprofil</p>
                    <h1 className="fw-bold mb-2">{patient.fullName}</h1>
                    <p className="mb-0 text-dark">Oversikt over kontaktinformasjon, kobling og kommende avtaler.</p>
                </div>

                <div className="d-flex flex-column align-items-md-end gap-2">
                    <Badge bg={deviceStatus.variant} className="align-self-start align-self-md-end">
                        {deviceStatus.label}
                    </Badge>
                    <Button variant="primary" onClick={handleCallClick}>
                        Ring pasient
                    </Button>
                    <Link to="/patients" className="btn btn-outline-dark">
                        Tilbake til pasientlisten
                    </Link>
                </div>
            </div>

            <Row className="g-4">
                <Col lg={5}>
                    <Card className="h-100 border-dark">
                        <Card.Header className="bg-light border-dark fw-semibold">Pasientinformasjon</Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="px-0 d-flex justify-content-between gap-3 bg-light">
                                    <span className="fw-semibold">E-post</span>
                                    <span className="text-end">{patient.email || 'Ikke oppgitt'}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="px-0 d-flex justify-content-between gap-3 bg-light">
                                    <span className="fw-semibold">Telefon</span>
                                    <span className="text-end">{patient.phoneNumber || 'Ikke oppgitt'}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="px-0 d-flex justify-content-between gap-3 bg-light">
                                    <span className="fw-semibold">Adresse</span>
                                    <span className="text-end">{patient.address || 'Ikke oppgitt'}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="px-0 d-flex justify-content-between gap-3 bg-light">
                                    <span className="fw-semibold">TV-profil</span>
                                    <span className="text-end text-break">{patient.supabaseProfileId || 'Ikke koblet'}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="px-0 d-flex justify-content-between gap-3 bg-light">
                                    <span className="fw-semibold">Totalt antall avtaler</span>
                                    <span className="text-end">{patient.totalAppointments}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="px-0 d-flex justify-content-between gap-3 bg-light">
                                    <span className="fw-semibold">Siste avtaledato</span>
                                    <span className="text-end">{patient.lastAppointmentDate || 'Aldri'}</span>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={7}>
                    <Card className="h-100 border-dark">
                        <Card.Header className="bg-light border-dark fw-semibold">Kommende avtaler</Card.Header>
                        <Card.Body>
                            {patient.upcomingAppointments.length === 0 ? (
                                <div className="text-center py-4 text-muted">Ingen kommende avtaler.</div>
                            ) : (
                                <div className="d-grid gap-3">
                                    {patient.upcomingAppointments.map((appointment) => (
                                        <Card key={appointment.id} className="border-secondary-subtle">
                                            <Card.Body>
                                                <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
                                                    <div>
                                                        <div className="fw-semibold">{appointment.formattedDateTime || appointment.date}</div>
                                                        <div className="text-muted small">
                                                            {appointment.personnelName ? `Ansvarlig: ${appointment.personnelName}` : 'Ansvarlig ikke oppgitt'}
                                                        </div>
                                                    </div>
                                                    <StatusBadge status={appointment.status} className="align-self-start" />
                                                </div>

                                                <TaskBadges tasks={appointment.tasks} variant="primary" />
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {patient && (
                <CallModal
                    show={showCallModal}
                    onHide={() => setShowCallModal(false)}
                    targetSupabaseProfileId={patient.supabaseProfileId}
                    patientName={patient.fullName}
                />
            )}
        </Container>
    );
};

export default PatientDetailsPage;