import React, { useState } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import './PreferredTimePage.css';

// Mock available time slots
const availableSlots = [
  { id: 1, date: '2026-03-16', time: '09:00 - 10:00', available: true },
  { id: 2, date: '2026-03-16', time: '10:30 - 11:30', available: true },
  { id: 3, date: '2026-03-16', time: '14:00 - 15:00', available: true },
  { id: 4, date: '2026-03-17', time: '09:00 - 10:00', available: true },
  { id: 5, date: '2026-03-17', time: '11:00 - 12:00', available: true },
  { id: 6, date: '2026-03-17', time: '15:00 - 16:00', available: true },
  { id: 7, date: '2026-03-18', time: '10:00 - 11:00', available: true },
  { id: 8, date: '2026-03-18', time: '13:00 - 14:00', available: true },
];

const PreferredTimePage: React.FC = () => {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Handle slot selection
  const handleSlotSelect = (slotId: number) => {
    setSelectedSlot(slotId);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!selectedSlot) return;
    // Mock submission - in real app, this would send to backend
    console.log('Selected time slot:', selectedSlot);
    setSubmitted(true);
  };

  // Group slots by date
  const groupedSlots = availableSlots.reduce((groups, slot) => {
    const date = slot.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(slot);
    return groups;
  }, {} as Record<string, typeof availableSlots>);

  if (submitted) {
    const selectedSlotData = availableSlots.find(slot => slot.id === selectedSlot);
    return (
      <div className="preferred-time-page">
        <Card className="success-card">
          <Card.Body className="text-center">
            <i className="bi bi-calendar-check-fill success-icon"></i>
            <h2 className="success-title">Tidsønske sendt!</h2>
            <p className="success-text">
              Du har bedt om et besøk for <strong>{selectedSlotData?.time}</strong> den{' '}
              <strong>{new Date(selectedSlotData?.date || '').toLocaleDateString('nb-NO', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}</strong>.
            </p>
            <p className="success-text">
              En omsorgsperson bekrefter tidspunktet snart.
            </p>
            <Button variant="primary" onClick={() => {
              setSubmitted(false);
              setSelectedSlot(null);
            }}>
              Velg et annet tidspunkt
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="preferred-time-page">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Velg ønsket besøkstid</h1>
        <p className="page-subtitle">
          Velg ønsket tidsluke for hjemmebesøket. Dette er en forespørsel – endelig tid bekreftes av en omsorgsperson.
        </p>
      </div>

      {/* Time Slots */}
      <div className="time-slots-container">
        {Object.entries(groupedSlots).map(([date, slots]) => (
          <Card key={date} className="date-card">
            <Card.Header>
              <h3 className="date-title">
                {new Date(date).toLocaleDateString('nb-NO', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
            </Card.Header>
            <Card.Body>
              <div className="time-slots-grid">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`time-slot ${selectedSlot === slot.id ? 'selected' : ''} ${slot.available ? 'available' : 'unavailable'}`}
                    onClick={() => slot.available && handleSlotSelect(slot.id)}
                  >
                    <div className="time-slot-content">
                      <span className="time-text">{slot.time}</span>
                      {selectedSlot === slot.id && (
                        <i className="bi bi-check-circle-fill selected-icon"></i>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* Submit Section */}
      <div className="submit-section">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={!selectedSlot}
          className="submit-btn"
        >
          Be om dette tidspunktet
        </Button>
        {!selectedSlot && (
          <Alert variant="info" className="selection-alert">
            Velg en tidsluke for å fortsette.
          </Alert>
        )}
      </div>
    </div>
  );
};

export default PreferredTimePage;