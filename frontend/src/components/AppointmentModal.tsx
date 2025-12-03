import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import AppointmentForm from './AppointmentForm';
import type { Appointment } from '../types';

interface AppointmentModalProps {
  show: boolean;
  onClose: () => void;
  initialData?: Appointment;
  onSubmit: (data: Appointment) => Promise<void>;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ show, onClose, initialData, onSubmit }) => {
    const [submitError, setSubmitError] = useState<string | null>(null);
    const handleSubmit = async (data: Appointment) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error submitting appointment:', error);
      setSubmitError('Failed to submit appointment. Please try again.');
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? 'Edit Appointment' : 'New Appointment'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <AppointmentForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </Modal.Body>
    </Modal>
  );
};

export default AppointmentModal;
