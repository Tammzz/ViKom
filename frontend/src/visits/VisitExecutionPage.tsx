import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import TaskBadges from '../components/common/TaskBadges';
import PageHeader from '../components/common/PageHeader';
import SectionCard from '../components/common/SectionCard';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';
import './VisitExecutionPage.css';

// Mock data for visit
const mockVisit = {
  id: 1,
  patientName: 'Jane Smith',
  patientAddress: 'Hagegata 25, 0653 Oslo',
  patientPhone: '+47 900 00 101',
  date: '2026-03-15',
  startTime: '10:00',
  endTime: '11:00',
  status: 'Pågår',
  tasks: 'Medisinhåndtering, Blodtrykksmåling, Lett rengjøring'
};

const mockTasks = [
  { id: 1, description: 'Gi morgenmedisin', completed: false },
  { id: 2, description: 'Mål blodtrykk og puls', completed: false },
  { id: 3, description: 'Hjelp med lett rengjøring', completed: false },
  { id: 4, description: 'Sjekk medisinering', completed: true },
  { id: 5, description: 'Gi selskap og samtale', completed: true },
];

const VisitExecutionPage: React.FC = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [notes, setNotes] = useState('');

  // Filter tasks based on hide completed toggle
  const displayedTasks = hideCompleted ? tasks.filter(task => !task.completed) : tasks;

  // Toggle task completion
  const toggleTask = (taskId: number) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="visit-execution-page">
      <PageHeader
        title="Gjennomfør besøk"
        subtitle="Dokumenter og fullfør oppgaver for dette besøket."
      />

      <div className="visit-topbar">
        <p className="visit-breadcrumb">Pasient {'>'} Avtalt besøk</p>
        <div className="visit-top-actions">
          <Button variant="secondary" size="sm">Lagre</Button>
          <Button variant="primary" size="sm">Fullfør</Button>
          <Button variant="secondary" size="sm">Avslutt</Button>
        </div>
      </div>

      <div className="visit-grid-layout">
        <div className="visit-grid-left">
          <SectionCard title="Pasientoversikt" className="patient-info-card">
            <div className="patient-details">
              <div className="detail-row">
                <strong>Navn:</strong> {mockVisit.patientName}
              </div>
              <div className="detail-row">
                <strong>Adresse:</strong> {mockVisit.patientAddress}
              </div>
              <div className="detail-row">
                <strong>Telefon:</strong> {mockVisit.patientPhone}
              </div>
              <div className="detail-row">
                <strong>Tidspunkt:</strong> {mockVisit.startTime} - {mockVisit.endTime}
              </div>
              <div className="detail-row">
                <strong>Status:</strong> <StatusBadge status="InProgress" />
              </div>
              <div className="detail-row">
                <strong>Planlagte oppgaver:</strong>
                <div className="tasks-badges">
                  <TaskBadges tasks={mockVisit.tasks} />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Pasientens addresse" className="patient-map-card" bodyClassName="patient-map-body p-0">
            <div className="patient-map-placeholder">
              <i className="bi bi-geo-alt-fill"></i>
            </div>
          </SectionCard>
        </div>

        <div className="visit-grid-right">
          <SectionCard
            title="Oppgaveliste"
            className="task-checklist-card"
            action={
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setHideCompleted(!hideCompleted)}
              >
                {hideCompleted ? 'Vis fullførte' : 'Skjul fullførte'}
              </Button>
            }
          >
            {displayedTasks.length > 0 ? (
              <div className="task-list">
                {displayedTasks.map((task) => (
                  <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                    <div className="task-content">
                      <div className="task-description">{task.description}</div>
                      <Button
                        variant={task.completed ? 'success' : 'outline-secondary'}
                        size="sm"
                        onClick={() => toggleTask(task.id)}
                        className="task-toggle-btn"
                      >
                        {task.completed ? '✓ Fullført' : 'Marker som fullført'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="check-circle-fill" text="Alle oppgaver er fullført!" />
            )}
          </SectionCard>

          <SectionCard title="Notater" className="visit-notes-card">
            <textarea
              className="visit-notes-input"
              placeholder="Skriv notater fra besøket..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default VisitExecutionPage;