import React, { useState } from 'react';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import './TaskSelectionPage.css';

// Mock allowed tasks for the patient
const allowedTasks = [
  { id: 1, name: 'Medisinhjelp', description: 'Hjelp med å ta medisiner til riktig tid' },
  { id: 2, name: 'Blodtrykks- og pulsmonitorering', description: 'Regelmessige målinger av blodtrykk og hjertefrekvens' },
  { id: 3, name: 'Matinnkjøp', description: 'Hjelp med å handle matvarer' },
  { id: 4, name: 'Lett rengjøring', description: 'Hjelp med husarbeid og rengjøring' },
  { id: 5, name: 'Måltidsforberedelse', description: 'Hjelp med matlaging og måltider' },
  { id: 6, name: 'Digital hjelp', description: 'Hjelp med datamaskin, telefon eller internett' },
  { id: 7, name: 'Transport', description: 'Hjelp med å komme seg til avtaler' },
  { id: 8, name: 'Selskap', description: 'Noen å snakke med og være sammen med' },
];

const TaskSelectionPage: React.FC = () => {
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Handle task selection
  const handleTaskChange = (taskId: number, checked: boolean) => {
    if (checked) {
      setSelectedTasks([...selectedTasks, taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission - in real app, this would send to backend
    console.log('Selected tasks:', selectedTasks);
    console.log('Additional notes:', additionalNotes);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="task-selection-page">
        <Card className="success-card">
          <Card.Body className="text-center">
            <i className="bi bi-check-circle-fill success-icon"></i>
            <h2 className="success-title">Forespørsel sendt!</h2>
            <p className="success-text">
              Din forespørsel er sendt. En omsorgsperson vil se på den og kontakte deg snart.
            </p>
            <Button variant="primary" onClick={() => setSubmitted(false)}>
              Send en ny forespørsel
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="task-selection-page">
      <h1 className="mb-3 fw-bold">Be om hjemmesykepleie</h1>
      <div className="mb-4">
        <p className="text-dark mb-0 fs-5 lh-base">
          Velg tjenestene du trenger hjelp med. En omsorgsperson vil se på forespørselen og planlegge et besøk.
        </p>
      </div>

      {/* Task Selection Form */}
      <Card className="task-selection-card">
        <Card.Header>
          <h2 className="card-title">Tilgjengelige tjenester</h2>
          <p className="card-subtitle">Merk av alle tjenester du ønsker hjelp med</p>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <div className="tasks-grid">
              {allowedTasks.map((task) => (
                <div key={task.id} className="task-option">
                  <Form.Check
                    type="checkbox"
                    id={`task-${task.id}`}
                    label={
                      <div className="task-label">
                        <strong>{task.name}</strong>
                        <p className="task-description">{task.description}</p>
                      </div>
                    }
                    checked={selectedTasks.includes(task.id)}
                    onChange={(e) => handleTaskChange(task.id, e.target.checked)}
                    className="task-checkbox"
                  />
                </div>
              ))}
            </div>

            {/* Additional Notes */}
            <div className="additional-notes-section">
              <Form.Group>
                <Form.Label>
                  <strong>Tilleggsinformasjon (valgfritt)</strong>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Vennligst legg inn ekstra informasjon om behov, preferanser eller spesielle instruksjoner..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="notes-textarea"
                />
                <Form.Text className="text-muted">
                  Denne informasjonen hjelper omsorgspersonene å forberede seg bedre.
                </Form.Text>
              </Form.Group>
            </div>

            {/* Submit Button */}
            <div className="submit-section">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={selectedTasks.length === 0}
                className="submit-btn"
              >
                Send forespørsel
              </Button>
              {selectedTasks.length === 0 && (
                <Alert variant="info" className="selection-alert">
                  Velg minst én tjeneste for å fortsette.
                </Alert>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TaskSelectionPage;