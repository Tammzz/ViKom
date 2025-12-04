import React, { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';

interface AppointmentDeleteModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  appointmentDescription?: string;
}

const AppointmentDeleteModal: React.FC<AppointmentDeleteModalProps> = ({
  show,
  onClose,
  onConfirm,
  appointmentDescription,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setError(null);
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      
      // Extract error message from response
      let errorMessage = 'Failed to cancel appointment. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Cancel Appointment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <p>Are you sure you want to cancel this appointment?</p>
        {appointmentDescription && (
          <p className="text-muted">
            <strong>Task:</strong> {appointmentDescription}
          </p>
        )}
        <p className="text-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Note: Appointments can only be cancelled at least 24 hours before the scheduled time.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleClose} disabled={isDeleting}>
          No, Keep It
        </Button>
        <Button variant="danger" onClick={handleConfirm} disabled={isDeleting}>
          {isDeleting ? 'Cancelling...' : 'Yes, Cancel Appointment'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AppointmentDeleteModal;
