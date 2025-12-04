import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { getUserInfo } from '../services/AuthService';
import PatientService from '../services/PatientService';
import { fetchPersonnel } from '../services/PersonnelService';
import { fetchWeekAvailability } from '../services/AvailabilityService';
import type { Appointment, PatientListDto, User, AvailabilitySlot, DayAvailability } from '../types';

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
    tasks: initialData?.tasks || '',
    startTime: '',
    endTime: '',
    status: 'Booked',
  });

  // Dropdown options
  const [patients, setPatients] = useState<PatientListDto[]>([]);
  const [personnel, setPersonnel] = useState<User[]>([]);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [allDaysData, setAllDaysData] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingDates, setLoadingDates] = useState<boolean>(false);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Loads initial data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Loads patients if personnel
        if (isPersonnel) {
          const patientList = await PatientService.getAll();
          setPatients(patientList);
        }

        // Loads all personnel for selection
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

  // Loads available dates when personnel is selected
  useEffect(() => {
    const loadAvailableDates = async () => {
      if (!selectedPersonnelId) {
        setAvailableDates([]);
        setAllDaysData([]);
        return;
      }

      try {
        setLoadingDates(true);
        
        // Fetches next 4 weeks of availability data
        const today = new Date();
        const startDate = today.toISOString().split('T')[0];
        const weekData = await fetchWeekAvailability(selectedPersonnelId, startDate);
        
        // Extracts dates that have available (unbooked) slots
        const datesWithSlots = weekData.days
          .filter(day => {
            // Checks if day has windows with available slots
            const hasAvailableSlots = day.windows.some(window => 
              window.isAvailable && 
              window.slots && 
              window.slots.some(slot => !slot.isBooked)
            );
            return hasAvailableSlots;
          })
          .map(day => day.date);
        
        setAvailableDates(datesWithSlots);
        setAllDaysData(weekData.days);
      } catch (err) {
        console.error('Failed to load available dates:', err);
        setAvailableDates([]);
        setAllDaysData([]);
      } finally {
        setLoadingDates(false);
      }
    };

    loadAvailableDates();
  }, [selectedPersonnelId]);

  // Loads available time slots when date is selected
  useEffect(() => {
    if (!selectedDate || allDaysData.length === 0) {
      setAvailableSlots([]);
      return;
    }

    try {
      setLoadingSlots(true);
      
      // Finds the day data for selected date
      const dayData = allDaysData.find(day => day.date === selectedDate);
      if (!dayData) {
        setAvailableSlots([]);
        return;
      }

      // Extracts all unbooked slots from available windows
      const slots: AvailabilitySlot[] = [];
      dayData.windows.forEach(window => {
        if (window.isAvailable && window.slots) {
          const unbookedSlots = window.slots.filter(slot => !slot.isBooked);
          slots.push(...unbookedSlots);
        }
      });

      setAvailableSlots(slots);
    } catch (err) {
      console.error('Failed to load time slots:', err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDate, allDaysData]);

  // Handles personnel selection
  const handlePersonnelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const personnelId = e.target.value;
    setSelectedPersonnelId(personnelId);
    // Resets date and slot selection when personnel changes
    setSelectedDate('');
    setFormData(prev => ({ ...prev, availabilityId: 0 }));
    if (errors.personnelId || errors.date || errors.availabilityId) {
      setErrors(prev => ({ 
        ...prev, 
        personnelId: '', 
        date: '', 
        availabilityId: '' 
      }));
    }
  };

  // Handles date selection
  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    // Resets slot selection when date changes
    setFormData(prev => ({ ...prev, availabilityId: 0 }));
    if (errors.date || errors.availabilityId) {
      setErrors(prev => ({ ...prev, date: '', availabilityId: '' }));
    }
  };

  // Handles time slot selection
  const handleSlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slotId = Number(e.target.value);
    setFormData(prev => ({ ...prev, availabilityId: slotId }));
    if (errors.availabilityId) {
      setErrors(prev => ({ ...prev, availabilityId: '' }));
    }
  };

  // Handles task input changes
  const handleTaskChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, tasks: value }));
    if (errors.tasks) {
      setErrors(prev => ({ ...prev, tasks: '' }));
    }
  };

  // Handles patient selection
  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, patientId: value }));
    if (errors.patientId) {
      setErrors(prev => ({ ...prev, patientId: '' }));
    }
  };

  // Gets selected slot details for display
  const selectedSlot = availableSlots.find(slot => slot.id === formData.availabilityId);

  // Validates form before submission
  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (isPersonnel && !formData.patientId) {
      newErrors.patientId = 'Please select a patient';
    }

    if (!selectedPersonnelId) {
      newErrors.personnelId = 'Please select personnel';
    }

    if (!selectedDate) {
      newErrors.date = 'Please select a date';
    }

    if (!formData.availabilityId || formData.availabilityId === 0) {
      newErrors.availabilityId = 'Please select a time slot';
    }

    // Validates that tasks field contains at least one task
    if (!formData.tasks.trim()) {
      newErrors.tasks = 'At least one task is required';
    } else {
      // Checks that tasks are comma-separated and not empty
      const taskList = formData.tasks.split(',').map(t => t.trim()).filter(t => t.length > 0);
      if (taskList.length === 0) {
        newErrors.tasks = 'At least one valid task is required';
      }
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
          <Form.Label>Client <span className="text-danger">*</span></Form.Label>
          <Form.Select
            value={formData.patientId}
            onChange={handlePatientChange}
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
        <Form.Label>Personnel <span className="text-danger">*</span></Form.Label>
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

      {/* Date selection - populated after personnel selection */}
      <Form.Group className="mb-3">
        <Form.Label>Date <span className="text-danger">*</span></Form.Label>
        {loadingDates ? (
          <div className="text-center py-2">
            <Spinner animation="border" size="sm" role="status">
              <span className="visually-hidden">Loading dates...</span>
            </Spinner>
          </div>
        ) : (
          <>
            <Form.Select
              value={selectedDate}
              onChange={handleDateChange}
              isInvalid={!!errors.date}
              disabled={!selectedPersonnelId}
            >
              <option value="">
                {selectedPersonnelId 
                  ? '-- Select Date --' 
                  : '-- First select personnel --'}
              </option>
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('en-GB', { 
                    weekday: 'short', 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.date}
            </Form.Control.Feedback>
            {selectedPersonnelId && availableDates.length === 0 && !loadingDates && (
              <Form.Text className="text-muted">
                No available dates for this personnel member.
              </Form.Text>
            )}
          </>
        )}
      </Form.Group>

      {/* Time slot selection - populated after date selection */}
      <Form.Group className="mb-3">
        <Form.Label>Time Slot <span className="text-danger">*</span></Form.Label>
        {loadingSlots ? (
          <div className="text-center py-2">
            <Spinner animation="border" size="sm" role="status">
              <span className="visually-hidden">Loading time slots...</span>
            </Spinner>
          </div>
        ) : (
          <>
            <Form.Select
              value={formData.availabilityId}
              onChange={handleSlotChange}
              isInvalid={!!errors.availabilityId}
              disabled={!selectedDate}
            >
              <option value="0">
                {selectedDate 
                  ? '-- Select Time Slot --' 
                  : '-- First select date --'}
              </option>
              {availableSlots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.startTime} - {slot.endTime}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.availabilityId}
            </Form.Control.Feedback>
            {selectedDate && availableSlots.length === 0 && !loadingSlots && (
              <Form.Text className="text-muted">
                No available time slots for this date.
              </Form.Text>
            )}
          </>
        )}
      </Form.Group>

      {/* Display selected slot time info */}
      {selectedSlot && (
        <Alert variant="info" className="mb-3">
          <small>
            <i className="bi bi-info-circle me-2"></i>
            Appointment will be scheduled from <strong>{selectedSlot.startTime}</strong> to <strong>{selectedSlot.endTime}</strong>
          </small>
        </Alert>
      )}

      {/* Tasks field - comma-separated list */}
      <Form.Group className="mb-3">
        <Form.Label>Task(s) <span className="text-danger">*</span></Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={formData.tasks}
          onChange={handleTaskChange}
          placeholder="Enter tasks separated by commas (e.g., Groceries, Medication, Vitals)"
          isInvalid={!!errors.tasks}
        />
        <Form.Text className="text-muted">
          Separate multiple tasks with commas. Each task will display as a badge.
        </Form.Text>
        <Form.Control.Feedback type="invalid">
          {errors.tasks}
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
