import React, { useState } from 'react';
import { Card, Button, Form, Badge } from 'react-bootstrap';
import TaskBadges from '../components/common/TaskBadges';
import './PlanningOverviewPage.css';

// Mock visits data
const mockVisits = [
  {
    id: 1,
    patientName: 'Jane Smith',
    address: '123 Main St',
    area: 'Sentrum',
    taskType: 'Fysisk',
    tasks: 'Medisinhåndtering, Blodtrykksmåling',
    date: '2026-03-15',
    time: '10:00',
    status: 'Planlagt'
  },
  {
    id: 2,
    patientName: 'John Doe',
    address: '456 Oak Ave',
    area: 'Forstad',
    taskType: 'Digital',
    tasks: 'Digital hjelp - e-postoppsett',
    date: '2026-03-15',
    time: '14:00',
    status: 'Planlagt'
  },
  {
    id: 3,
    patientName: 'Alice Johnson',
    address: '789 Pine Rd',
    area: 'Sentrum',
    taskType: 'Fysisk',
    tasks: 'Handle matvarer, Lett rengjøring',
    date: '2026-03-16',
    time: '09:00',
    status: 'Planlagt'
  },
  {
    id: 4,
    patientName: 'Bob Wilson',
    address: '321 Elm St',
    area: 'Forstad',
    taskType: 'Fysisk',
    tasks: 'Matlaging, Selskap',
    date: '2026-03-16',
    time: '11:00',
    status: 'Planlagt'
  },
  {
    id: 5,
    patientName: 'Carol Brown',
    address: '654 Maple Dr',
    area: 'Landlig',
    taskType: 'Digital',
    tasks: 'Digital hjelp - telefonoppsett',
    date: '2026-03-17',
    time: '13:00',
    status: 'Venter'
  },
];

const PlanningOverviewPage: React.FC = () => {
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>('Alle');
  const [areaFilter, setAreaFilter] = useState<string>('Alle');

  // Get unique task types and areas
  const taskTypes = ['Alle', ...Array.from(new Set(mockVisits.map(v => v.taskType)))];
  const areas = ['Alle', ...Array.from(new Set(mockVisits.map(v => v.area)))];

  // Filter visits
  const filteredVisits = mockVisits.filter(visit => {
    const matchesTaskType = taskTypeFilter === 'Alle' || visit.taskType === taskTypeFilter;
    const matchesArea = areaFilter === 'Alle' || visit.area === areaFilter;
    return matchesTaskType && matchesArea;
  });

  return (
    <div className="planning-overview-page">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Oversikt over planlagte besøk</h1>
        <p className="page-subtitle">Planlegg og organiser hjemmebesøk etter område og oppgavetype</p>
      </div>

      {/* Filters */}
      <Card className="filters-card">
        <Card.Body>
          <div className="filters-grid">
            <Form.Group>
              <Form.Label><strong>Oppgavetype</strong></Form.Label>
              <Form.Select
                value={taskTypeFilter}
                onChange={(e) => setTaskTypeFilter(e.target.value)}
              >
                {taskTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label><strong>Område</strong></Form.Label>
              <Form.Select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
              >
                {areas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
        </Card.Body>
      </Card>

      {/* Main Content Grid */}
      <div className="planning-content">
        {/* Visits List */}
        <div className="visits-section">
          <Card className="visits-card">
            <Card.Header>
              <h2 className="card-title">Planlagte besøk ({filteredVisits.length})</h2>
            </Card.Header>
            <Card.Body>
              {filteredVisits.length > 0 ? (
                <div className="visits-list">
                  {filteredVisits.map((visit) => (
                    <div key={visit.id} className="visit-item">
                      <div className="visit-header">
                        <div className="visit-main">
                          <h3 className="patient-name">{visit.patientName}</h3>
                          <p className="visit-address"><i className="bi bi-geo-alt-fill"></i> {visit.address}</p>
                        </div>
                        <div className="visit-meta">
                          <Badge bg={visit.taskType === 'Digital' ? 'info' : 'secondary'} className="task-type-badge">
                            {visit.taskType}
                          </Badge>
                          <Badge bg="light" text="dark" className="area-badge">
                            {visit.area}
                          </Badge>
                        </div>
                      </div>
                      <div className="visit-details">
                        <div className="visit-datetime">
                          <i className="bi bi-calendar-event-fill"></i>
                          {new Date(visit.date).toLocaleDateString('nb-NO', {
                            month: 'short',
                            day: 'numeric',
                          })} kl. {visit.time}
                        </div>
                        <div className="visit-status">
                          <Badge bg={visit.status === 'Planlagt' ? 'success' : 'warning'}>
                            {visit.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="visit-tasks">
                        <TaskBadges tasks={visit.tasks} />
                      </div>
                      <div className="visit-actions">
                        <Button variant="outline-primary" size="sm">
                          Vis detaljer
                        </Button>
                        <Button variant="outline-secondary" size="sm">
                          Endre tidspunkt
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <i className="bi bi-calendar-x empty-icon"></i>
                  <p className="empty-text">Ingen besøk matcher valgte filtre.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Map Placeholder */}
        <div className="map-section">
          <Card className="map-card">
            <Card.Header>
              <h2 className="card-title">Karte over områder</h2>
            </Card.Header>
            <Card.Body className="map-body">
              <div className="map-placeholder">
                <div className="map-content">
                  <i className="bi bi-geo-alt-fill map-icon"></i>
                  <h3 className="map-title">Interaktiv kart</h3>
                  <p className="map-text">
                    Kartvisning for å planlegge besøk etter område og optimalisere ruter.
                  </p>
                  <div className="map-areas">
                    <div className="map-area downtown">
                      <span className="area-label">Sentrum</span>
                      <span className="area-count">2 besøk</span>
                    </div>
                    <div className="map-area suburb">
                      <span className="area-label">Forstad</span>
                      <span className="area-count">2 besøk</span>
                    </div>
                    <div className="map-area rural">
                      <span className="area-label">Landlig</span>
                      <span className="area-count">1 besøk</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlanningOverviewPage;