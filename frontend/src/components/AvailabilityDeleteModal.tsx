import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface AvailabilityDeleteModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  availabilityDate?: string;
  isBooked?: boolean;
}

const AvailabilityDeleteModal: React.FC<AvailabilityDeleteModalProps> = ({
  show,
  onClose,
  onConfirm,
  availabilityDate,
  isBooked,
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting availability:', error);
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Availability Slot</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isBooked ? (
          <div>
            <p className="text-danger">
              <strong>This availability slot is already booked and cannot be deleted.</strong>
            </p>
            {availabilityDate && (
              <p className="text-muted">
                <strong>Date:</strong> {new Date(availabilityDate).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <div>
            <p>Are you sure you want to delete this availability slot?</p>
            {availabilityDate && (
              <p className="text-muted">
                <strong>Date:</strong> {new Date(availabilityDate).toLocaleDateString()}
              </p>
            )}
            <p className="text-danger">This action cannot be undone.</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>
          {isBooked ? 'Close' : 'Cancel'}
        </Button>
        {!isBooked && (
          <Button variant="danger" onClick={handleConfirm}>
            Delete
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default AvailabilityDeleteModal;
