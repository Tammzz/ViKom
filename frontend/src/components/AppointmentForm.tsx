import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { getUserInfo } from '../services/AuthService';
import PatientService from '../services/PatientService';
import { fetchFreeAvailability } from '../services/AvailabilityService';
import type { Appointment, PatientListDto, Availability } from '../types';

interface AppointmentFormProps {
  initialData?: Appointment;
  onSubmit: (data: Appointment) => void;
  onCancel: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const userInfo = getUserInfo();
  const isPersonnel = userInfo?.role === 'Personnel' || userInfo?.role === 'Admin';

  // Form state
  const [formData, setFormData] = useState<Appointment>({
    id: initialData?.id,
    patientId: initialData?.patientId || userInfo?.userId || '',
    availabilityId: initialData?.availabilityId || 0,
    taskDescription: initialData?.taskDescription || '',
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    status: initialData?.status || 'Booked',
  });

  // Dropdown options
  const [patients, setPatients] = useState<PatientListDto[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load dropdown data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load patients if personnel
        if (isPersonnel) {
          const patientList = await PatientService.getAll();
          setPatients(patientList);
        }

        // Load free availability slots
        const freeSlots = await fetchFreeAvailability();
        setAvailabilities(freeSlots);
      } catch (err) {
        console.error('Failed to load form data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isPersonnel]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
        ...prev,
        [name]: name === 'availabilityId' ? Number(value) : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (isPersonnel && !formData.patientId) {
      newErrors.patientId = 'Please select a patient';
    }

    if (!formData.availabilityId || formData.availabilityId === 0) {
      newErrors.availabilityId = 'Please select an available slot';
    }

    if (!formData.taskDescription.trim()) {
      newErrors.taskDescription = 'Task description is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit(formData);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      {/* Patient selection (Personnel only) */}
      {isPersonnel && (
        <Form.Group className="mb-3">
          <Form.Label>Client</Form.Label>
          <Form.Select
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            isInvalid={!!errors.patientId}
          >
            <option value="">-- Select Patient --</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.fullName}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.patientId}
          </Form.Control.Feedback>
        </Form.Group>
      )}

      {/* Availability slot selection */}
      <Form.Group className="mb-3">
        <Form.Label>Available Day/Slot</Form.Label>
        <Form.Select
          name="availabilityId"
          value={formData.availabilityId}
          onChange={handleChange}
          isInvalid={!!errors.availabilityId}
        >
          <option value="0">-- Select Availability --</option>
          {availabilities.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.personnelName || 'Unknown'} - {new Date(slot.date).toLocaleDateString('en-GB')} {slot.startTime} - {slot.endTime}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors.availabilityId}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Task description */}
      <Form.Group className="mb-3">
        <Form.Label>Task(s)</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="taskDescription"
          value={formData.taskDescription}
          onChange={handleChange}
          placeholder="e.g., medication reminder"
          isInvalid={!!errors.taskDescription}
        />
        <Form.Control.Feedback type="invalid">
          {errors.taskDescription}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Start time */}
      <Form.Group className="mb-3">
        <Form.Label>Start</Form.Label>
        <Form.Control
          type="time"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          isInvalid={!!errors.startTime}
        />
        <Form.Control.Feedback type="invalid">
          {errors.startTime}
        </Form.Control.Feedback>
      </Form.Group>

      {/* End time */}
      <Form.Group className="mb-3">
        <Form.Label>End</Form.Label>
        <Form.Control
          type="time"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          isInvalid={!!errors.endTime}
        />
        <Form.Control.Feedback type="invalid">
          {errors.endTime}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Status */}
      <Form.Group className="mb-3">
        <Form.Label>Status</Form.Label>
        <Form.Select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Booked">Booked</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </Form.Select>
      </Form.Group>

      {/* Buttons */}
      <div className="d-flex gap-2">
        <Button variant="primary" type="submit">
          {initialData ? 'Update' : 'Create'}
        </Button>
        <Button variant="outline-secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Form>
  );
};

export default AppointmentForm;
