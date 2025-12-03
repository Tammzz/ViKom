import React from 'react';
import { Modal, Button } from 'react-bootstrap';

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
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Appointment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete this appointment?</p>
        {appointmentDescription && (
          <p className="text-muted">
            <strong>Task:</strong> {appointmentDescription}
          </p>
        )}
        <p className="text-danger">This action cannot be undone.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleConfirm}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AppointmentDeleteModal;
