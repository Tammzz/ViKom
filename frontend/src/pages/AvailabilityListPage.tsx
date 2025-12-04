import React, { useState, useEffect } from 'react';
import { Container, Button, Alert } from 'react-bootstrap';
import { getUserInfo } from '../auth/AuthService';
import { fetchAvailabilityByPersonnel, createAvailability, updateAvailability, deleteAvailability } from '../services/AvailabilityService';
import AvailabilityModal from '../components/AvailabilityModal';
import AvailabilityDeleteModal from '../components/AvailabilityDeleteModal';
import type { Availability, AvailabilityDto } from '../types';
import '../css/AvailabilityListPage.css';

const AvailabilityListPage: React.FC = () => {
  const userInfo = getUserInfo();
  const personnelId = userInfo?.userId || '';

  // State
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | undefined>();
  const [availabilityToDelete, setAvailabilityToDelete] = useState<{ id: number; date: string; isBooked: boolean } | null>(null);

  // Load availabilities
  const loadAvailabilities = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAvailabilityByPersonnel(personnelId);
      setAvailabilities(data);
    } catch (err) {
      setError('Failed to load availability slots');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (personnelId) {
      loadAvailabilities();
    }
  }, [personnelId]);

  // Handlers
  const handleCreate = () => {
    setSelectedAvailability(undefined);
    setShowModal(true);
  };

  const handleEdit = (availability: Availability) => {
    setSelectedAvailability(availability);
    setShowModal(true);
  };

  const handleDelete = (availability: Availability) => {
    if (availability.id) {
      setAvailabilityToDelete({
        id: availability.id,
        date: availability.date,
        isBooked: availability.isBooked || false,
      });
      setShowDeleteModal(true);
    }
  };

  const handleSubmit = async (data: Availability) => {
    try {
      const availabilityDto: AvailabilityDto = {
        personnelId: personnelId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
      };

      if (data.id) {
        await updateAvailability(data.id, availabilityDto);
      } else {
        await createAvailability(availabilityDto);
      }
      await loadAvailabilities();
    } catch (err) {
      setError('Failed to save availability slot');
      console.error(err);
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (availabilityToDelete && !availabilityToDelete.isBooked) {
      try {
        await deleteAvailability(availabilityToDelete.id);
        await loadAvailabilities();
      } catch (err) {
        console.error(err);
        throw err;
      }
    }
  };
  const getStatusBadgeClass = (isBooked: boolean): string => {
    return isBooked ? 'badge bg-secondary' : 'badge bg-success';
  };

  const getStatusText = (isBooked: boolean): string => {
    return isBooked ? 'Booked' : 'Available';
  };

  const isPastDate = (dateString: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const availabilityDate = new Date(dateString);
    availabilityDate.setHours(0, 0, 0, 0);
    
    return availabilityDate < today;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeString: string): string => {
    // Handle TimeSpan format "HH:mm:ss" or "HH:mm"
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes} ${ampm}`;
    }
    return timeString;
  };

  if (loading) {
    return (
      <Container fluid>
        <p>Loading availability slots...</p>
      </Container>
    );
  }

  return (
    <Container fluid>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="mb-4">
        <p className="text-muted mb-0 fs-5 lh-base">
          Manage your availability schedule to help patients book appointments.
        </p>
      </div>

      {/* Add Availability Button */}
      <div className="mb-4">
        <Button variant="primary" onClick={handleCreate}>
          <i className="bi bi-calendar-plus me-2"></i>Add Availability Slot
        </Button>
      </div>

      {/* Availability Table */}
      <div className="availability-table-container">
        <div className="card border-1 border-dark bg-light">
          <div className="card-body p-4">
            {availabilities.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 availability-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availabilities.map((availability) => (
                      <tr key={availability.id}>
                        <td>{formatDate(availability.date)}</td>
                        <td>{formatTime(availability.startTime)}</td>
                        <td>{formatTime(availability.endTime)}</td>
                        <td>
                          <span className={getStatusBadgeClass(availability.isBooked || false)}>
                            {getStatusText(availability.isBooked || false)}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEdit(availability)}
                              disabled={availability.isBooked || isPastDate(availability.date)}
                            >
                              <i className="bi bi-pencil me-1"></i>Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(availability)}
                              disabled={availability.isBooked || isPastDate(availability.date)}
                            >
                              <i className="bi bi-trash me-1"></i>Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-calendar-x display-4 text-muted"></i>
                <p className="text-muted mt-3">No availability slots found.</p>
                <Button variant="primary" onClick={handleCreate}>
                  Add Your First Availability Slot
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AvailabilityModal
        show={showModal}
        onClose={() => setShowModal(false)}
        initialData={selectedAvailability}
        onSubmit={handleSubmit}
      />

      <AvailabilityDeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        availabilityDate={availabilityToDelete?.date}
        isBooked={availabilityToDelete?.isBooked}
      />
    </Container>
  );
};

export default AvailabilityListPage;
