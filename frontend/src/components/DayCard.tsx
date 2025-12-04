import React from 'react';
import { Badge } from 'react-bootstrap';
import type { DayAvailability, AvailabilityWindow } from '../types';
import { formatTime12Hour } from '../utils/dateUtils';

interface DayCardProps {
  dayData: DayAvailability;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  onClick: (date: string, window?: AvailabilityWindow) => void;
}

const DayCard: React.FC<DayCardProps> = ({ 
  dayData, 
  dayName, 
  dayNumber, 
  isToday, 
  onClick 
}) => {
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'Available':
        return 'bg-success';
      case 'Unavailable':
        return 'bg-danger';
      case 'Free':
      default:
        return 'bg-secondary';
    }
  };

  const handleClick = () => {
    // If there's a window, pass the first one (for edit)
    const window = dayData.windows.length > 0 ? dayData.windows[0] : undefined;
    onClick(dayData.date, window);
  };

  return (
    <div 
      className={`day-card ${isToday ? 'today' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div className="day-card-header">
        <div className="day-name">{dayName}</div>
        <div className="day-number">{dayNumber}</div>
      </div>

      <div className="day-card-body">
        <Badge className={`status-badge ${getStatusBadgeClass(dayData.status)}`}>
          {dayData.status}
        </Badge>

        {/* Show appointment previews */}
        {dayData.appointments.length > 0 && (
          <div className="appointments-preview mt-2">
            {dayData.appointments.slice(0, 2).map((appointment) => (
              <div key={appointment.id} className="appointment-preview-item">
                <div className="text-muted small">
                  {formatTime12Hour(appointment.startTime)}
                </div>
                <div className="small text-truncate">
                  {appointment.patientName}
                </div>
              </div>
            ))}
            {dayData.appointments.length > 2 && (
              <div className="text-muted small">
                +{dayData.appointments.length - 2} more
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayCard;
