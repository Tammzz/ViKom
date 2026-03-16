import React, { useState, useEffect } from 'react';
import { Container, Table, Alert } from 'react-bootstrap';
import { getUserInfo } from '../../auth/AuthService';
import PatientService from '../services/PatientService';
import type { PatientListDto } from '../types/patient';
import './PatientListPage.css';

const PatientListPage: React.FC = () => {
  const userInfo = getUserInfo();
  const isPersonnel = userInfo?.role === 'Personnel';

  // State
  const [patients, setPatients] = useState<PatientListDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Load patients
  const loadPatients = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await PatientService.getAll();
      setPatients(data);
    } catch (err) {
      setError('Kunne ikke laste pasienter');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // Format date from backend (dd/MM/yyyy)
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return dateString; // Backend already formats as dd/MM/yyyy
  };

  if (loading) {
    return (
      <Container fluid className={isPersonnel ? 'personnel-page' : ''}>
        <p>Laster pasienter...</p>
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

        <h1 className="mb-3 fw-bold">Mine pasienter</h1>

        <div className="mb-4">
          <p className="text-dark mb-0 fs-5 lh-base">
            Se og administrer alle pasientene dine.
          </p>
        </div>

        {patients.length === 0 ? (
          <div className="card border-1 border-dark bg-light">
            <div className="card-body p-4">
              <div className="text-center py-4">
                <i className="bi bi-people display-4 text-muted mb-3 d-block"></i>
                <p className="text-dark mb-0">Ingen pasienter funnet.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card border-1 border-dark bg-white mt-3 overflow-hidden">
            <div className="card-body p-0">
              <Table hover className="mb-0 bg-white rounded patient-table">
                <thead className="table-light">
                  <tr>
                    <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Navn</th>
                    <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">E-post</th>
                    <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Telefon</th>
                    <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Totalt antall avtaler</th>
                    <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Siste avtaledato</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id}>
                      <td className="py-3 px-4 text-dark">{patient.fullName}</td>
                      <td className="py-3 px-4 text-dark">{patient.email}</td>
                      <td className="py-3 px-4 text-dark">{patient.phoneNumber}</td>
                      <td className="py-3 px-4 text-dark">{patient.totalAppointments}</td>
                      <td className="py-3 px-4 text-dark">{formatDate(patient.lastAppointmentDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default PatientListPage;
