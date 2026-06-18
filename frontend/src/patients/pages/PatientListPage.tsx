import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Container, Spinner } from 'react-bootstrap';
import { getUserInfo } from '../../auth/AuthService';
import PatientService from '../services/PatientService';
import type { PatientListDto } from '../types/patient';
import DataTable, { type DataTableColumn } from '../../components/common/DataTable';

const PatientListPage: React.FC = () => {
  const userInfo = getUserInfo();
  const isPersonnel = userInfo?.role === 'Personnel';
  const navigate = useNavigate();

  const [patients, setPatients] = useState<PatientListDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

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

  const columns: DataTableColumn<PatientListDto>[] = [
    {
      key: 'fullName',
      header: 'Navn',
      style: { minWidth: '160px' },
      render: (patient) => (
        <Link
          to={`/patients/${patient.id}`}
          className="fw-semibold text-dark text-decoration-none"
          onClick={(e) => e.stopPropagation()}
        >
          {patient.fullName}
        </Link>
      ),
    },
    { key: 'email', header: 'E-post' },
    { key: 'phoneNumber', header: 'Telefon' },
    {
      key: 'address',
      header: 'Adresse',
      style: { minWidth: '180px' },
      render: (patient) => patient.address || 'Ikke oppgitt',
    },
    { key: 'totalAppointments', header: 'Totalt avtaler', style: { width: '150px' } },
    {
      key: 'lastAppointmentDate',
      header: 'Siste avtaledato',
      render: (patient) => patient.lastAppointmentDate || 'N/A',
    },
  ];

  if (loading) {
    return (
      <Container fluid className={isPersonnel ? 'personnel-page' : ''}>
        <div className="d-flex align-items-center gap-2 py-4">
          <Spinner animation="border" size="sm" />
          <span>Laster pasienter...</span>
        </div>
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

      <h1 className="fw-bold mb-2">Mine pasienter</h1>
      <p className="text-dark fs-5 mb-4">Se og administrer alle pasientene dine.</p>

      <DataTable
        columns={columns}
        data={patients}
        rowKey={(patient) => patient.id}
        onRowClick={(patient) => navigate(`/patients/${patient.id}`)}
        emptyIcon="people"
        emptyText="Ingen pasienter funnet."
      />
    </Container>
  );
};

export default PatientListPage;
