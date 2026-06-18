import React from 'react';
import { Card } from 'react-bootstrap';
import StatusBadge from '../../components/common/StatusBadge';
import TaskBadges from '../../components/common/TaskBadges';

/** Minimal shape the card needs — satisfied by both Appointment and AppointmentSummary. */
interface AppointmentCardData {
  date?: string;
  formattedDateTime?: string;
  personnelName?: string;
  status: string;
  tasks: string;
}

interface AppointmentCardProps {
  appointment: AppointmentCardData;
  taskVariant?: string;
  /** Overrides the date/time line (defaults to formattedDateTime || date). */
  dateTimeText?: React.ReactNode;
  /** Overrides the subject line (defaults to "Ansvarlig: <personnel>"). */
  subject?: React.ReactNode;
  /** Optional note rendered below the tasks (e.g. a 24-hour warning). */
  footerNote?: React.ReactNode;
  /** Optional footer actions (buttons). */
  actions?: React.ReactNode;
}

/**
 * Compact appointment card showing date/time, a subject line, a status badge
 * and the task badges. Shared across the appointment list, dashboards and the
 * patient details page. Optional `subject`, `actions` and `footerNote` slots
 * adapt it to the personnel (patient + start/complete) and patient
 * (personnel + edit/cancel) variants.
 */
const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  taskVariant = 'secondary',
  dateTimeText,
  subject,
  footerNote,
  actions,
}) => {
  const subjectNode =
    subject !== undefined
      ? subject
      : appointment.personnelName
      ? `Ansvarlig: ${appointment.personnelName}`
      : 'Ansvarlig ikke oppgitt';

  return (
    <Card className="border-dark">
      <Card.Body>
        <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
          <div>
            <div className="fw-semibold">
              {dateTimeText ?? appointment.formattedDateTime ?? appointment.date}
            </div>
            {subjectNode && <div className="text-muted small">{subjectNode}</div>}
          </div>
          <StatusBadge status={appointment.status} className="align-self-start" />
        </div>

        <TaskBadges tasks={appointment.tasks} variant={taskVariant} />

        {footerNote && <div className="mt-3">{footerNote}</div>}
        {actions && <div className="d-flex flex-wrap gap-2 mt-3">{actions}</div>}
      </Card.Body>
    </Card>
  );
};

export default AppointmentCard;
