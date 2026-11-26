export const MUST_STUDENT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@students\.must\.ac\.ke$/i;
export const MUST_STAFF_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@must\.ac\.ke$/i;

export function validateStudentEmail(email) {
  if (!email || !email.trim()) {
    return 'University email is required.';
  }
  const normalized = email.trim().toLowerCase();
  if (!MUST_STUDENT_EMAIL_REGEX.test(normalized)) {
    return 'Must be a valid MUST student email ending in @students.must.ac.ke (e.g. b@students.must.ac.ke).';
  }
  return '';
}

export function validateStaffEmail(email) {
  if (!email || !email.trim()) {
    return 'Institutional email is required.';
  }
  const normalized = email.trim().toLowerCase();
  if (!MUST_STAFF_EMAIL_REGEX.test(normalized)) {
    return 'Lecturers must register with an official @must.ac.ke email address.';
  }
  return '';
}

export function getPasswordChecks(password = '') {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

export function validateStrongPassword(password) {
  const checks = getPasswordChecks(password);
  if (!checks.minLength) return 'Password must be at least 8 characters long.';
  if (!checks.hasUpper) return 'Password must include at least one uppercase letter.';
  if (!checks.hasLower) return 'Password must include at least one lowercase letter.';
  if (!checks.hasNumber) return 'Password must include at least one number.';
  if (!checks.hasSpecial) return 'Password must include at least one special character.';
  return '';
}

export function validatePhone(phone) {
  if (!phone || !phone.trim()) return 'Phone number is required for class and venue alerts.';
  const cleaned = phone.replace(/[\s-]/g, '');
  if (!/^(\+254|0)[17]\d{8}$/.test(cleaned) && !/^\+\d{9,15}$/.test(cleaned)) {
    return 'Enter a valid phone number (e.g. +254712345678 or 0712345678).';
  }
  return '';
}

export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

export function minutesToDurationLabel(mins) {
  if (mins <= 0) return '0 mins';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} mins`;
  if (m === 0) return `${h} hr${h > 1 ? 's' : ''}`;
  return `${h} hr${h > 1 ? 's' : ''} ${m} mins`;
}

export function timesOverlap(startA, endA, startB, endB) {
  const a1 = timeToMinutes(startA);
  const a2 = timeToMinutes(endA);
  const b1 = timeToMinutes(startB);
  const b2 = timeToMinutes(endB);
  return a1 < b2 && a2 > b1;
}

/**
 * Checks if booking a venue on a given day & time collides with any active timetable slot.
 */
export function checkVenueCollision({ slots, venueId, dayOfWeek, startTime, endTime, excludeSlotId = null }) {
  if (!venueId || !dayOfWeek || !startTime || !endTime) return null;
  if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
    return { error: 'End time must be later than start time.' };
  }

  const conflict = slots.find((slot) => {
    if (slot.id === excludeSlotId) return false;
    if (slot.status === 'cancelled') return false;
    if (slot.venueId !== venueId) return false;
    if (slot.dayOfWeek !== dayOfWeek) return false;
    return timesOverlap(startTime, endTime, slot.startTime, slot.endTime);
  });

  return conflict || null;
}

/**
 * Finds all venues that are free during the specified day and time window.
 */
export function findAlternativeVenues({ venues, slots, dayOfWeek, startTime, endTime, minCapacity = 1, excludeVenueId = null }) {
  return venues
    .filter((venue) => {
      if (venue.id === excludeVenueId) return false;
      if (venue.capacity < minCapacity) return false;
      const conflict = checkVenueCollision({
        slots,
        venueId: venue.id,
        dayOfWeek,
        startTime,
        endTime,
      });
      return !conflict;
    })
    .sort((a, b) => a.capacity - b.capacity);
}

/**
 * Detects overlapping classes in a student's own daily timetable.
 */
export function detectStudentOverlaps(daySlots) {
  const active = daySlots
    .filter((s) => s.status !== 'cancelled')
    .slice()
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const overlappingIds = new Set();
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      if (timesOverlap(active[i].startTime, active[i].endTime, active[j].startTime, active[j].endTime)) {
        overlappingIds.add(active[i].id);
        overlappingIds.add(active[j].id);
      }
    }
  }
  return overlappingIds;
}

/**
 * Computes free periods between classes on a single day (between 08:00 and 18:00).
 */
export function computeFreePeriods(daySlots) {
  const active = daySlots
    .filter((s) => s.status !== 'cancelled')
    .slice()
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  if (active.length === 0) {
    return [{ startTime: '08:00', endTime: '17:00', durationMins: 540 }];
  }

  const free = [];
  let cursor = timeToMinutes('08:00');
  const dayEnd = timeToMinutes('17:00');

  for (const slot of active) {
    const start = timeToMinutes(slot.startTime);
    const end = timeToMinutes(slot.endTime);
    if (start > cursor && start - cursor >= 30) {
      free.push({
        startTime: formatMinutes(cursor),
        endTime: formatMinutes(start),
        durationMins: start - cursor,
      });
    }
    if (end > cursor) cursor = end;
  }

  if (dayEnd - cursor >= 30) {
    free.push({
      startTime: formatMinutes(cursor),
      endTime: formatMinutes(dayEnd),
      durationMins: dayEnd - cursor,
    });
  }

  return free;
}

function formatMinutes(totalMins) {
  const h = String(Math.floor(totalMins / 60)).padStart(2, '0');
  const m = String(totalMins % 60).padStart(2, '0');
  return `${h}:${m}`;
}
