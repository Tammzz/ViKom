import React from 'react';
import { Badge } from 'react-bootstrap';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * Renders a status badge with appropriate Bootstrap styling based on the status value.
 * Supports: Booked, Completed, Cancelled, Available, and default statuses.
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getVariant = (status: string): string => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'booked':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'available':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getDisplayText = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <Badge 
      bg={getVariant(status)} 
      className={className}
    >
      {getDisplayText(status)}
    </Badge>
  );
};

export default StatusBadge;
