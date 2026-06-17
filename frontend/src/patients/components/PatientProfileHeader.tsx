import React from 'react';
import { Button } from 'react-bootstrap';
import type { PatientDetailsDto } from '../types/patient';
import Avatar from '../../components/common/Avatar';
import StatTile from '../../components/common/StatTile';
import IconButton from '../../components/common/IconButton';
import './PatientProfileHeader.css';

interface PatientProfileHeaderProps {
  patient: PatientDetailsDto;
  onCall: () => void;
  onEdit: () => void;
}

/**
 * Full-width patient profile header: avatar, name, inline contact chips,
 * an at-a-glance KPI strip and the primary actions (Ring pasient / Rediger).
 */
const PatientProfileHeader: React.FC<PatientProfileHeaderProps> = ({ patient, onCall, onEdit }) => {
  const contactChips = [
    { icon: 'envelope', value: patient.email },
    { icon: 'telephone', value: patient.phoneNumber },
    { icon: 'geo-alt', value: patient.address },
  ].filter((chip) => chip.value);

  return (
    <div className="vk-profile-header border-dark">
      <div className="vk-profile-header-top">
        <div className="vk-profile-identity">
          <Avatar name={patient.fullName} size="lg" />
          <div className="vk-profile-identity-text">
            <p className="vk-profile-eyebrow">Profil</p>
            <h1 className="vk-profile-name">{patient.fullName}</h1>
            <div className="vk-profile-chips">
              <span className="vk-profile-chip vk-profile-chip-role">Pasient</span>
              {contactChips.map((chip) => (
                <span key={chip.icon} className="vk-profile-chip">
                  <i className={`bi bi-${chip.icon}`} aria-hidden="true"></i>
                  {chip.value}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="vk-profile-actions">
          <Button variant="primary" onClick={onCall}>
            <i className="bi bi-telephone-outbound me-2" aria-hidden="true"></i>
            Ring pasient
          </Button>
          <IconButton icon="pencil" title="Rediger" onClick={onEdit} />
        </div>
      </div>

      <div className="vk-profile-stats">
        <StatTile icon="calendar2-week" label="Totalt antall avtaler" value={patient.totalAppointments} />
        <StatTile icon="calendar-event" label="Kommende avtaler" value={patient.upcomingAppointments.length} />
        <StatTile icon="clock-history" label="Tidligere avtaler" value={patient.pastAppointments.length} />
        <StatTile icon="calendar-check" label="Siste avtale" value={patient.lastAppointmentDate || 'Aldri'} />
      </div>
    </div>
  );
};

export default PatientProfileHeader;
