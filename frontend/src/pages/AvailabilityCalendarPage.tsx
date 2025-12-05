import React, { useState, useEffect } from 'react';
import { getUserInfo } from '../auth/AuthService';
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

  const handleCreateFromDailyView = () => {
    setSelectedDate(formatDateISO(currentDate));
    setSelectedWindow(undefined);
    setShowModal(true);
  };

  // Date header text
  const getHeaderText = (): string => {
    if (viewMode === 'week') {
      const monday = getMonday(currentDate);
      const sunday = getSunday(currentDate);
      return formatWeekRange(monday, sunday);
    } else {
      return formatDateLong(currentDate);
    }
  };

  // renders loading state while fetching availability data
  if (loading && !weekData && !dayData) {
    return (
      <div className="availability-calendar-page">
        <p>Loading availability...</p>
      </div>
    );
  }

  return (
    <div className="availability-calendar-page">
      {/* displays error message if data fetch fails */}
      {error && (
        <div className="error-alert">
          <span>{error}</span>
          <button className="error-close" onClick={() => setError('')}>
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {/* renders page title */}
      <h1 className="page-title">My Calendar</h1>

      {/* displays page subtitle */}
      <div className="page-subtitle">
        <p>Manage your weekly and daily availability schedule.</p>
      </div>

      {/* provides view mode toggle and navigation controls */}
      <div className="calendar-controls">
        <div className="controls-left">
          {/* allows switching between day and week views */}
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('day');
                setCurrentDate(new Date());
              }}
            >
              Day
            </button>
            <button
              className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('week');
                setCurrentDate(new Date());
              }}
            >
              Week
            </button>
          </div>

          {/* navigates to current date */}
          <button className="today-btn" onClick={handleToday}>
            Today
          </button>
        </div>

        {/* displays current date range and navigation arrows */}
        <div className="controls-right">
          <button className="nav-btn" onClick={handlePrevious}>
            <i className="bi bi-chevron-left"></i>
          </button>
          <h2 className="date-header">{getHeaderText()}</h2>
          <button className="nav-btn" onClick={handleNext}>
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* renders weekly calendar view with day cards */}
      {viewMode === 'week' && weekData && (
        <WeeklyView weekData={weekData} onDayClick={handleDayClick} />
      )}

      {/* renders daily schedule view with time slots */}
      {viewMode === 'day' && dayData && (
        <DailyView
          dayData={dayData}
          onEdit={handleEditFromDailyView}
          onDelete={handleDeleteFromDailyView}
          onCreate={handleCreateFromDailyView}
        />
      )}

      {/* shows modal for creating or editing availability windows */}
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
    </div>
  );
};

export default AvailabilityCalendarPage;
