import React from 'react';
import { Card } from 'react-bootstrap';
import type { AppointmentSummary } from '../types/appointment';
import StatusBadge from '../../components/common/StatusBadge';
import TaskBadges from '../../components/common/TaskBadges';

interface AppointmentCardProps {
  appointment: AppointmentSummary;
  taskVariant?: string;
}

/**
 * Compact appointment card showing date/time, responsible personnel,
 * a status badge and the task badges. Shared by the upcoming and past
 * appointment lists on the patient details page.
 */
const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, taskVariant = 'secondary' }) => {
  return (
    <Card className="border-dark">
      <Card.Body>
        <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
          <div>
            <div className="fw-semibold">{appointment.formattedDateTime || appointment.date}</div>
            <div className="text-muted small">
              {appointment.personnelName
                ? `Ansvarlig: ${appointment.personnelName}`
                : 'Ansvarlig ikke oppgitt'}
            </div>
          </div>
          <StatusBadge status={appointment.status} className="align-self-start" />
        </div>

        <TaskBadges tasks={appointment.tasks} variant={taskVariant} />
      </Card.Body>
    </Card>
  );
};

export default AppointmentCard;
