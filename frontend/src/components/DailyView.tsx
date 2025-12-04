import React from 'react';
import { Table, Badge, Button } from 'react-bootstrap';
import type { DayAvailability, AvailabilityWindow } from '../types';
import { formatTime12Hour } from '../utils/dateUtils';
import TaskBadges from './TaskBadges';

interface DailyViewProps {
  dayData: DayAvailability;
  onEdit: (window: AvailabilityWindow) => void;
  onDelete: (windowId: number) => void;
}

const DailyView: React.FC<DailyViewProps> = ({ dayData, onEdit, onDelete }) => {
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'Completed':
        return 'badge bg-success';
      case 'Cancelled':
        return 'badge bg-danger';
      case 'Booked':
      default:
        return 'badge bg-primary';
    }
  };

  return (
    <div>
      {/* Availability Windows Section */}
      {dayData.windows.length > 0 && (
        <div className="mb-4">
          <h5 className="mb-3">Availability Windows</h5>
          <div className="card border-1 border-dark bg-white overflow-hidden">
            <div className="card-body p-0">
              <Table hover className="mb-0 availability-detail-table">
                <thead className="table-light">
                  <tr>
                    <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Time Range</th>
                    <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Status</th>
                    <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Slots</th>
                    <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Notes</th>
                    <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dayData.windows.map((window) => (
                    <React.Fragment key={window.id}>
                      <tr>
                        <td className="py-3 px-4 text-dark">
                          {formatTime12Hour(window.startTime)} - {formatTime12Hour(window.endTime)}
                        </td>
                        <td className="py-3 px-4 text-dark">
                          <Badge className={window.isAvailable ? 'bg-success' : 'bg-danger'}>
                            {window.isAvailable ? 'Available' : 'Unavailable'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-dark">
                          {window.slots && window.slots.length > 0 ? (
                            <div className="small">
                              {window.slots.filter(s => s.isBooked).length} booked / {window.slots.length} total
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-dark">
                          {window.notes || <span className="text-muted">-</span>}
                        </td>
                        <td className="py-3 px-4 text-dark">
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => onEdit(window)}
                            >
                              <i className="bi bi-pencil me-1"></i>Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => window.id && onDelete(window.id)}
                              disabled={window.slots?.some(s => s.isBooked)}
                            >
                              <i className="bi bi-trash me-1"></i>Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {/* Show slots if any are booked */}
                      {window.slots && window.slots.some(s => s.isBooked) && (
                        <tr className="bg-light">
                          <td colSpan={5} className="py-2 px-4">
                            <div className="small ps-4">
                              <strong>Booked Slots:</strong>
                              {window.slots
                                .filter(s => s.isBooked)
                                .map((slot, idx) => (
                                  <span key={slot.id} className="ms-2 text-muted">
                                    {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                                    {idx < window.slots!.filter(s => s.isBooked).length - 1 ? ',' : ''}
                                  </span>
                                ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Appointments Section */}
      {dayData.appointments.length > 0 && (
        <div className="mb-4">
          <h5 className="mb-3">Appointments</h5>
          <div className="card border-1 border-dark bg-white overflow-hidden">
            <div className="card-body p-0">
              <Table hover className="mb-0 availability-detail-table">
                <thead className="table-light">
                  <tr>
                    <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Time</th>
                    <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Patient</th>
                    <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Task(s)</th>
                    <th className="fw-bold text-dark py-3 px-4 border-bottom border-dark">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dayData.appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="py-3 px-4 text-dark">
                        {formatTime12Hour(appointment.startTime)} - {formatTime12Hour(appointment.endTime)}
                      </td>
                      <td className="py-3 px-4 text-dark">{appointment.patientName}</td>
                      <td className="py-3 px-4 text-dark">
                        <TaskBadges tasks={appointment.tasks} variant="secondary" />
                      </td>
                      <td className="py-3 px-4 text-dark">
                        <span className={getStatusBadgeClass(appointment.status)}>
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {dayData.windows.length === 0 && dayData.appointments.length === 0 && (
        <div className="card border-1 border-dark bg-light">
          <div className="card-body p-4">
            <div className="text-center py-4">
              <i className="bi bi-calendar-x display-4 text-muted mb-3 d-block"></i>
              <p className="text-dark mb-0">No availability or appointments for this day.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyView;
