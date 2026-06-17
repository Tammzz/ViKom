import type { TimelineItem } from '../../components/common/Timeline';
import type { AppointmentSummary } from '../../appointments/types/appointment';
import type { CallLogDto, PatientDetailsDto } from '../types/patient';

// Internal shape: a timeline item plus the timestamp used for sorting.
interface DatedItem extends TimelineItem {
  sortKey: number;
}

const formatNoDate = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('nb-NO', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatNoDateTime = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('nb-NO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const appointmentSortKey = (a: AppointmentSummary): number => {
  const d = new Date(a.date);
  return isNaN(d.getTime()) ? 0 : d.getTime();
};

const callLabel = (status: string): { title: string; variant: TimelineItem['variant'] } => {
  switch (status.toLowerCase()) {
    case 'answered':
      return { title: 'Videosamtale besvart', variant: 'success' };
    case 'declined':
      return { title: 'Anrop avvist', variant: 'danger' };
    case 'missed':
      return { title: 'Tapt anrop', variant: 'warning' };
    case 'ended':
      return { title: 'Samtale avsluttet', variant: 'secondary' };
    default:
      return { title: 'Ringte pasient', variant: 'primary' };
  }
};

/**
 * Builds a chronological activity feed (newest first) from the patient's real
 * data: upcoming + past appointments, recent calls and the last notes update.
 */
export function buildPatientActivity(patient: PatientDetailsDto, limit = 8): TimelineItem[] {
  const items: DatedItem[] = [];

  for (const appt of patient.upcomingAppointments) {
    items.push({
      id: `appt-up-${appt.id}`,
      title: 'Kommende avtale',
      meta: appt.personnelName ? `Ansvarlig: ${appt.personnelName}` : undefined,
      date: appt.formattedDateTime || formatNoDate(appt.date),
      icon: 'calendar-event',
      variant: 'primary',
      sortKey: appointmentSortKey(appt),
    });
  }

  for (const appt of patient.pastAppointments) {
    const isCancelled = appt.status.toLowerCase() === 'cancelled';
    items.push({
      id: `appt-past-${appt.id}`,
      title: isCancelled ? 'Avlyst avtale' : 'Gjennomført avtale',
      meta: appt.personnelName ? `Ansvarlig: ${appt.personnelName}` : undefined,
      date: appt.formattedDateTime || formatNoDate(appt.date),
      icon: isCancelled ? 'calendar-x' : 'calendar-check',
      variant: isCancelled ? 'danger' : 'success',
      sortKey: appointmentSortKey(appt),
    });
  }

  for (const call of patient.recentCalls as CallLogDto[]) {
    const { title, variant } = callLabel(call.status);
    items.push({
      id: `call-${call.id}`,
      title,
      meta: call.personnelName ? `Av: ${call.personnelName}` : undefined,
      date: formatNoDateTime(call.startedAt),
      icon: 'telephone',
      variant,
      sortKey: new Date(call.startedAt).getTime() || 0,
    });
  }

  if (patient.notesUpdatedAt) {
    items.push({
      id: 'notes-updated',
      title: 'Notat oppdatert',
      date: formatNoDate(patient.notesUpdatedAt),
      icon: 'pencil-square',
      variant: 'info',
      sortKey: new Date(patient.notesUpdatedAt).getTime() || 0,
    });
  }

  return items
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, limit)
    .map(({ sortKey, ...item }) => item);
}
