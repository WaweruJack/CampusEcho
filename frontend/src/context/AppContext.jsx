import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_PROFILES,
  ANNOUNCEMENTS,
  EVENTS,
  CAMPUS_LOCATIONS,
  TIMETABLE_DATA
} from '../data/mockData';

const AppContext = createContext(null);

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem('campusecho-theme');
  return saved === 'dark' ? 'dark' : 'light';
};

export function AppProvider({ children }) {
  const [userRole, setUserRole] = useState('student');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(INITIAL_PROFILES.student);
  const [theme, setTheme] = useState(getInitialTheme());
  const [locations] = useState(CAMPUS_LOCATIONS);
  const [timetable] = useState(TIMETABLE_DATA);
  const [announcements, setAnnouncements] = useState(
    ANNOUNCEMENTS.map((item) => ({ ...item, archived: Boolean(item.archived) }))
  );
  const [events] = useState(EVENTS);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('campusecho-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const login = (role) => {
    const normalizedRole = String(role || 'student').toLowerCase();
    const profile = INITIAL_PROFILES[normalizedRole] || INITIAL_PROFILES.student;
    setUserRole(normalizedRole);
    setCurrentProfile(profile);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserRole('student');
    setCurrentProfile(INITIAL_PROFILES.student);
  };

  const updateProfile = (updates) => {
    setCurrentProfile((prev) => ({ ...prev, ...updates }));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addAnnouncement = (title, content, category = 'Academic') => {
    setAnnouncements((prev) => [
      {
        id: Date.now(),
        title,
        content,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        category,
        author: `${currentProfile.firstName} ${currentProfile.lastName}`,
        archived: false
      },
      ...prev
    ]);
  };

  const addAssignment = (title, unit, dueDate) => {
    addAnnouncement(
      `New Assignment: ${title}`,
      `A new assignment for ${unit} is due on ${dueDate}. Please submit your work via the campus portal before the deadline.`,
      'Academic'
    );
  };

  const addCATSchedule = (title, unit, venue, date, time) => {
    addAnnouncement(
      `CAT Scheduled: ${title}`,
      `Continuous assessment for ${unit} will take place at ${venue} on ${date} from ${time}.`,
      'Academic'
    );
  };

  const addMakeupClass = (day, unitCode, unitName, venue, time) => {
    addAnnouncement(
      `Makeup Class for ${unitCode}`,
      `A makeup session for ${unitName} has been scheduled on ${day} at ${venue} from ${time}.`,
      'Academic'
    );
  };

  const addVenueChange = (unitCode, oldVenue, newVenue, time) => {
    addAnnouncement(
      `Venue Change: ${unitCode}`,
      `The venue for ${unitCode} has changed from ${oldVenue} to ${newVenue} at ${time}. Please update your campus plans accordingly.`,
      'Academic'
    );
  };

  const archiveAnnouncement = (id) => {
    setAnnouncements((prev) => prev.map((item) => (
      item.id === id ? { ...item, archived: true } : item
    )));
  };

  const value = useMemo(() => ({
    userRole,
    isLoggedIn,
    currentProfile,
    theme,
    locations,
    timetable,
    announcements,
    events,
    login,
    logout,
    updateProfile,
    toggleTheme,
    addAnnouncement,
    addAssignment,
    addCATSchedule,
    addMakeupClass,
    addVenueChange,
    archiveAnnouncement
  }), [
    userRole,
    isLoggedIn,
    currentProfile,
    theme,
    locations,
    timetable,
    announcements,
    events
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return context;
}
