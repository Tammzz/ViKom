import React, { useState, useEffect } from 'react';
import { Container, Alert, Button, ButtonGroup } from 'react-bootstrap';
import { getUserInfo } from '../services/AuthService';
import {
  fetchWeekAvailability,
  fetchDayAvailability,
  createAvailabilityWindow,
  updateAvailabilityWindow,
  deleteAvailabilityWindow,
} from '../services/AvailabilityService';
import WeeklyView from '../components/WeeklyView';
import DailyView from '../components/DailyView';
import AvailabilityWindowModal from '../components/AvailabilityWindowModal';
import type {
  WeekAvailability,
  DayAvailability,
  AvailabilityWindow,
  CreateAvailabilityWindowDto,
  UpdateAvailabilityWindowDto,
} from '../types';
import {
  getMonday,
  getSunday,
  formatDateISO,
  formatWeekRange,
  formatDateLong,
  parseISODate,
  addWeeks,
  addDays,
} from '../utils/dateUtils';
import '../css/AvailabilityCalendarPage.css';

type ViewMode = 'week' | 'day';

const AvailabilityCalendarPage: React.FC = () => {
  const userInfo = getUserInfo();
  const personnelId = userInfo?.userId || '';

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [weekData, setWeekData] = useState<WeekAvailability | null>(null);
  const [dayData, setDayData] = useState<DayAvailability | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedWindow, setSelectedWindow] = useState<AvailabilityWindow | undefined>();
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Load data based on view mode
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      if (viewMode === 'week') {
        const monday = getMonday(currentDate);
        const mondayISO = formatDateISO(monday);
        const data = await fetchWeekAvailability(personnelId, mondayISO);
        setWeekData(data);
      } else {
        const dateISO = formatDateISO(currentDate);
        const data = await fetchDayAvailability(personnelId, dateISO);
        setDayData(data);
      }
    } catch (err) {
      console.error('Error loading availability:', err);
      setError('Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (personnelId) {
      loadData();
    }
  }, [personnelId, viewMode, currentDate]);

  // Navigation
  const handlePrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate((prev) => addWeeks(prev, -1));
    } else {
      setCurrentDate((prev) => addDays(prev, -1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setCurrentDate((prev) => addWeeks(prev, 1));
    } else {
      setCurrentDate((prev) => addDays(prev, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Day card click handler
  const handleDayClick = (date: string, window?: AvailabilityWindow) => {
    setSelectedDate(date);
    setSelectedWindow(window);
    setShowModal(true);
  };

  // Modal handlers
  const handleCreateOrUpdate = async (data: CreateAvailabilityWindowDto | UpdateAvailabilityWindowDto) => {
    if (selectedWindow?.id) {
      // Update
      await updateAvailabilityWindow(selectedWindow.id, data as UpdateAvailabilityWindowDto);
    } else {
      // Create
      await createAvailabilityWindow(data as CreateAvailabilityWindowDto);
    }
    await loadData();
  };

  const handleDelete = async () => {
    if (selectedWindow?.id) {
      await deleteAvailabilityWindow(selectedWindow.id);
      await loadData();
    }
  };

  const handleEditFromDailyView = (window: AvailabilityWindow) => {
    setSelectedWindow(window);
    setSelectedDate(window.date);
    setShowModal(true);
  };

  const handleDeleteFromDailyView = async (windowId: number) => {
    if (!window.confirm('Are you sure you want to delete this availability window?')) {
      return;
    }

    try {
      await deleteAvailabilityWindow(windowId);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete availability window');
    }
  };

  // Get header text
  const getHeaderText = (): string => {
    if (viewMode === 'week') {
      const monday = getMonday(currentDate);
      const sunday = getSunday(currentDate);
      return formatWeekRange(monday, sunday);
    } else {
      return formatDateLong(currentDate);
    }
  };

  if (loading && !weekData && !dayData) {
    return (
      <Container fluid>
        <p>Loading availability...</p>
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
          Manage your weekly and daily availability schedule.
        </p>
      </div>

      {/* View Mode Toggle and Navigation */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-3 align-items-center">
          {/* View Mode Toggle */}
          <ButtonGroup>
            <Button
              variant={viewMode === 'day' ? 'primary' : 'outline-primary'}
              onClick={() => {
                setViewMode('day');
                setCurrentDate(new Date());
              }}
            >
              Day
            </Button>
            <Button
              variant={viewMode === 'week' ? 'primary' : 'outline-primary'}
              onClick={() => {
                setViewMode('week');
                setCurrentDate(new Date());
              }}
            >
              Week
            </Button>
          </ButtonGroup>

          {/* Today Button */}
          <Button variant="outline-secondary" onClick={handleToday}>
            Today
          </Button>
        </div>

        {/* Date Display and Navigation */}
        <div className="d-flex gap-2 align-items-center">
          <Button variant="outline-secondary" size="sm" onClick={handlePrevious}>
            <i className="bi bi-chevron-left"></i>
          </Button>
          <h5 className="mb-0 px-3">{getHeaderText()}</h5>
          <Button variant="outline-secondary" size="sm" onClick={handleNext}>
            <i className="bi bi-chevron-right"></i>
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'week' && weekData && (
        <WeeklyView weekData={weekData} onDayClick={handleDayClick} />
      )}

      {viewMode === 'day' && dayData && (
        <DailyView
          dayData={dayData}
          onEdit={handleEditFromDailyView}
          onDelete={handleDeleteFromDailyView}
        />
      )}

      {/* Modal */}
      <AvailabilityWindowModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedWindow(undefined);
        }}
        initialData={selectedWindow}
        selectedDate={selectedDate}
        onSubmit={handleCreateOrUpdate}
        onDelete={selectedWindow ? handleDelete : undefined}
      />
    </Container>
  );
};

export default AvailabilityCalendarPage;
