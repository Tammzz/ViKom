import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { getUserInfo } from '../services/AuthService';
import PatientService from '../services/PatientService';
import { fetchPersonnel } from '../services/PersonnelService';
import { fetchAvailabilityByPersonnel } from '../services/AvailabilityService';
import type { Appointment, PatientListDto, Availability, User } from '../types';

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
    startTime: '',
    endTime: '',
    status: 'Booked',
  });

  // Dropdown options
  const [patients, setPatients] = useState<PatientListDto[]>([]);
  const [personnel, setPersonnel] = useState<User[]>([]);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>('');
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingAvailabilities, setLoadingAvailabilities] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load initial data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load patients if personnel
        if (isPersonnel) {
          const patientList = await PatientService.getAll();
          setPatients(patientList);
        }

        // Load all personnel for selection
        const personnelList = await fetchPersonnel();
        setPersonnel(personnelList.filter(p => p.role === 'Personnel'));
      } catch (err) {
        console.error('Failed to load form data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isPersonnel]);

  // Load availabilities when personnel is selected
  useEffect(() => {
    const loadAvailabilities = async () => {
      if (!selectedPersonnelId) {
        setAvailabilities([]);
        return;
      }

      try {
        setLoadingAvailabilities(true);
        const slots = await fetchAvailabilityByPersonnel(selectedPersonnelId);
        
        // Filter for future, unbooked slots
        const now = new Date();
        const futureSlots = slots.filter(slot => {
          const slotDate = new Date(slot.date);
          return !slot.isBooked && slotDate >= now;
        });
        
        setAvailabilities(futureSlots);
      } catch (err) {
        console.error('Failed to load availabilities:', err);
        setAvailabilities([]);
      } finally {
        setLoadingAvailabilities(false);
      }
    };

    loadAvailabilities();
  }, [selectedPersonnelId]);

  // Handle personnel selection
  const handlePersonnelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const personnelId = e.target.value;
    setSelectedPersonnelId(personnelId);
    // Reset availability selection when personnel changes
    setFormData(prev => ({ ...prev, availabilityId: 0 }));
    if (errors.availabilityId) {
      setErrors(prev => ({ ...prev, availabilityId: '' }));
    }
  };

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

  // Get selected availability details for display
  const selectedAvailability = availabilities.find(a => a.id === formData.availabilityId);

  // Validate form
  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (isPersonnel && !formData.patientId) {
      newErrors.patientId = 'Please select a patient';
    }

    if (!selectedPersonnelId) {
      newErrors.personnelId = 'Please select personnel';
    }

    if (!formData.availabilityId || formData.availabilityId === 0) {
      newErrors.availabilityId = 'Please select an available slot';
    }

    if (!formData.taskDescription.trim()) {
      newErrors.taskDescription = 'Task description is required';
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

      {/* Personnel selection */}
      <Form.Group className="mb-3">
        <Form.Label>Personnel</Form.Label>
        <Form.Select
          value={selectedPersonnelId}
          onChange={handlePersonnelChange}
          isInvalid={!!errors.personnelId}
        >
          <option value="">-- Select Personnel --</option>
          {personnel.map((person) => (
            <option key={person.id} value={person.id}>
              {person.fullName}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors.personnelId}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Availability slot selection */}
      <Form.Group className="mb-3">
        <Form.Label>Availability Slot</Form.Label>
        {loadingAvailabilities ? (
          <div className="text-center py-2">
            <Spinner animation="border" size="sm" role="status">
              <span className="visually-hidden">Loading slots...</span>
            </Spinner>
          </div>
        ) : (
          <>
            <Form.Select
              name="availabilityId"
              value={formData.availabilityId}
              onChange={handleChange}
              isInvalid={!!errors.availabilityId}
              disabled={!selectedPersonnelId}
            >
              <option value="0">
                {selectedPersonnelId 
                  ? '-- Select Availability Slot --' 
                  : '-- First select personnel --'}
              </option>
              {availabilities.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {new Date(slot.date).toLocaleDateString('en-GB')} — {slot.startTime} to {slot.endTime}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.availabilityId}
            </Form.Control.Feedback>
            {selectedPersonnelId && availabilities.length === 0 && !loadingAvailabilities && (
              <Form.Text className="text-muted">
                No available slots for this personnel member.
              </Form.Text>
            )}
          </>
        )}
      </Form.Group>

      {/* Display selected slot time info */}
      {selectedAvailability && (
        <Alert variant="info" className="mb-3">
          <small>
            <i className="bi bi-info-circle me-2"></i>
            This appointment will be scheduled from <strong>{selectedAvailability.startTime}</strong> to <strong>{selectedAvailability.endTime}</strong>
          </small>
        </Alert>
      )}

      {/* Task description */}
      <Form.Group className="mb-3">
        <Form.Label>Task(s)</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="taskDescription"
          value={formData.taskDescription}
          onChange={handleChange}
          placeholder="e.g., medication reminder, wound care"
          isInvalid={!!errors.taskDescription}
        />
        <Form.Control.Feedback type="invalid">
          {errors.taskDescription}
        </Form.Control.Feedback>
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
