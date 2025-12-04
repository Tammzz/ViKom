import React from 'react';
import { Modal } from 'react-bootstrap';
import AvailabilityWindowForm from './AvailabilityWindowForm';
import type { AvailabilityWindow, CreateAvailabilityWindowDto, UpdateAvailabilityWindowDto } from '../types';

interface AvailabilityWindowModalProps {
  show: boolean;
  onClose: () => void;
  initialData?: AvailabilityWindow;
  selectedDate: string;
  onSubmit: (data: CreateAvailabilityWindowDto | UpdateAvailabilityWindowDto) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const AvailabilityWindowModal: React.FC<AvailabilityWindowModalProps> = ({
  show,
  onClose,
  initialData,
  selectedDate,
  onSubmit,
  onDelete,
}) => {
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: CreateAvailabilityWindowDto | UpdateAvailabilityWindowDto) => {
    try {
      setSubmitError(null);
      setIsSubmitting(true);
      await onSubmit(data);
      onClose();
    } catch (error: any) {
      console.error('Error submitting availability window:', error);
      setSubmitError(error.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    if (!window.confirm('Are you sure you want to delete this availability window?')) {
      return;
    }

    try {
      setSubmitError(null);
      setIsSubmitting(true);
      await onDelete();
      onClose();
    } catch (error: any) {
      console.error('Error deleting availability window:', error);
      setSubmitError(error.message || 'Failed to delete. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitError(null);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {initialData ? 'Edit Availability' : 'Create Availability'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {submitError && (
          <div className="alert alert-danger" role="alert">
            {submitError}
          </div>
        )}
        <AvailabilityWindowForm
          initialData={initialData}
          selectedDate={selectedDate}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          onDelete={onDelete ? handleDelete : undefined}
          isSubmitting={isSubmitting}
        />
      </Modal.Body>
    </Modal>
  );
};

export default AvailabilityWindowModal;
