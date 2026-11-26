import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  CAMPUS_BUILDINGS,
  CAMPUS_VENUES,
  DAYS_OF_WEEK,
} from '../data/mustCatalog';
import { checkVenueCollision, findAlternativeVenues, timeToMinutes } from '../lib/validation';
import { useAuth } from './AuthContext';

const CampusDataContext = createContext(null);

export function CampusDataProvider({ children }) {
  const { user } = useAuth();

  const [buildings, setBuildings] = useState(CAMPUS_BUILDINGS);
  const [venues, setVenues] = useState(CAMPUS_VENUES);
  const [units, setUnits] = useState([]);
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [news, setNews] = useState([]);
  const [services, setServices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationPrefs, setNotificationPrefs] = useState({
    inAppEnabled: true,
    emailEnabled: true,
    emailDigestMode: 'instant',
    remindMinutesBefore: 30,
    venueChanges: true,
    academicUpdates: true,
    campusEvents: true,
  });
  const [echoBotMessages, setEchoBotMessages] = useState([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        'Hello! I am EchoBot, your CampusEcho assistant for Meru University of Science and Technology. Ask me about your timetable, venue updates, campus buildings, services, or official notices.',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [siteConfig, setSiteConfig] = useState({
    portalName: 'CampusEcho',
    academicTerm: '2026/2027 Semester 1',
    supportEmail: 'support@campusecho.must.ac.ke',
    bannerEnabled: false,
    bannerText: '',
    bannerTone: 'info',
    maintenanceMode: false,
    maintenanceMessage: 'CampusEcho is undergoing scheduled maintenance. Please check back shortly.',
  });
  const [dataLoading, setDataLoading] = useState(false);

  async function refreshSiteState() {
    try {
      const res = await fetch('/api/site-state');
      if (!res.ok) return null;
      const state = await res.json();
      if (state.siteConfig) setSiteConfig(state.siteConfig);
      if (Array.isArray(state.buildings)) setBuildings(state.buildings);
      if (Array.isArray(state.venues)) setVenues(state.venues);
      if (Array.isArray(state.timetableSlots)) setTimetableSlots(state.timetableSlots);
      if (Array.isArray(state.announcements)) setAnnouncements(state.announcements);
      if (Array.isArray(state.news)) setNews(state.news);
      if (Array.isArray(state.services)) setServices(state.services);
      if (Array.isArray(state.broadcasts) && state.broadcasts.length > 0) {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const fresh = state.broadcasts
            .filter((b) => !existingIds.has(b.id))
            .map((b) => ({
              id: b.id,
              title: b.title,
              message: b.message,
              category: b.category || 'announcement',
              oldVenue: null,
              newVenue: null,
              isRead: false,
              createdAt: b.createdAt,
            }));
          return fresh.length > 0 ? [...fresh, ...prev] : prev;
        });
      }
      return state;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    refreshSiteState();
  }, []);

  // Sync live data from Supabase when authenticated
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user) return;

    let mounted = true;
    async function fetchSupabaseCampusData() {
      setDataLoading(true);
      try {
        const [
          buildingsRes,
          venuesRes,
          unitsRes,
          slotsRes,
          annRes,
          newsRes,
          servicesRes,
          notifRes,
          prefsRes,
          chatRes,
        ] = await Promise.all([
          supabase.from('campus_buildings').select('*'),
          supabase.from('venues').select('*'),
          supabase.from('units').select('*, profiles:lecturer_id(first_name, last_name)'),
          supabase.from('timetable_slots').select('*'),
          supabase
            .from('announcements')
            .select('*, profiles:author_id(first_name, last_name), units(code)')
            .order('created_at', { ascending: false }),
          supabase.from('campus_news').select('*').order('published_at', { ascending: false }),
          supabase.from('campus_services').select('*'),
          supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('notification_preferences')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('echobot_messages')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true }),
        ]);

        if (!mounted) return;
        if (buildingsRes.data?.length) setBuildings(buildingsRes.data);
        if (venuesRes.data?.length) {
          setVenues(
            venuesRes.data.map((v) => ({
              id: v.id,
              code: v.code,
              name: v.name,
              buildingId: v.building_id,
              venueType: v.venue_type,
              capacity: v.capacity,
              floorLabel: v.floor_label,
              hasProjector: v.has_projector,
            }))
          );
        }
        if (unitsRes.data?.length) {
          setUnits(
            unitsRes.data.map((u) => ({
              id: u.id,
              code: u.code,
              name: u.name,
              lecturerId: u.lecturer_id,
              lecturerName: u.profiles
                ? `${u.profiles.first_name} ${u.profiles.last_name}`
                : 'Assigned Lecturer',
            }))
          );
        }
        if (slotsRes.data?.length) {
          setTimetableSlots(
            slotsRes.data.map((s) => ({
              id: s.id,
              unitId: s.unit_id,
              lecturerId: s.lecturer_id,
              venueId: s.venue_id,
              previousVenueId: s.previous_venue_id,
              dayOfWeek: s.day_of_week,
              startTime: String(s.start_time).slice(0, 5),
              endTime: String(s.end_time).slice(0, 5),
              status: s.status,
              changeNote: s.change_note || '',
            }))
          );
        }
        if (annRes.data?.length) {
          setAnnouncements(
            annRes.data.map((a) => ({
              id: a.id,
              title: a.title,
              body: a.body,
              category: a.category,
              unitCode: a.units?.code || 'University Notice',
              authorName: a.profiles
                ? `${a.profiles.first_name} ${a.profiles.last_name}`
                : 'Lecturer',
              isUrgent: a.is_urgent,
              createdAt: a.created_at,
            }))
          );
        }
        if (newsRes.data?.length) {
          setNews(
            newsRes.data.map((n) => ({
              id: n.id,
              title: n.title,
              summary: n.summary,
              content: n.content,
              category: n.category,
              publishedAt: String(n.published_at).slice(0, 10),
              authorName: n.author_name,
            }))
          );
        }
        if (servicesRes.data?.length) {
          setServices(
            servicesRes.data.map((s) => ({
              id: s.id,
              name: s.name,
              serviceType: s.service_type,
              buildingId: s.building_id,
              locationDetail: s.location_detail,
              operatingHours: s.operating_hours,
              description: s.description,
              offerings: s.menu_or_offerings || [],
            }))
          );
        }
        if (notifRes.data) {
          setNotifications(
            notifRes.data.map((n) => ({
              id: n.id,
              title: n.title,
              message: n.message,
              category: n.category,
              oldVenue: n.old_venue,
              newVenue: n.new_venue,
              isRead: n.is_read,
              createdAt: n.created_at,
            }))
          );
        }
        if (prefsRes.data) {
          setNotificationPrefs((prev) => ({
            ...prev,
            inAppEnabled: prefsRes.data.in_app_enabled,
            emailEnabled: prefsRes.data.email_enabled,
            emailDigestMode: prefsRes.data.email_digest_mode || 'instant',
            remindMinutesBefore: prefsRes.data.remind_minutes_before,
          }));
        }
        if (chatRes.data?.length) {
          setEchoBotMessages(
            chatRes.data.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              createdAt: m.created_at,
            }))
          );
        }
      } finally {
        if (mounted) setDataLoading(false);
      }
    }

    fetchSupabaseCampusData();

    const channel = supabase
      .channel('campusecho-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable_slots' }, () =>
        fetchSupabaseCampusData()
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () =>
        fetchSupabaseCampusData()
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Enrich timetable slots with unit, venue, and building metadata
  const enrichedTimetable = useMemo(() => {
    const venueMap = new Map(venues.map((v) => [v.id, v]));
    const buildingMap = new Map(buildings.map((b) => [b.id, b]));
    const unitMap = new Map(units.map((u) => [u.id, u]));

    return timetableSlots.map((slot) => {
      const unit = unitMap.get(slot.unitId);
      const venue = venueMap.get(slot.venueId);
      const prevVenue = slot.previousVenueId ? venueMap.get(slot.previousVenueId) : null;
      const building = venue ? buildingMap.get(venue.buildingId) : null;

      return {
        ...slot,
        unitCode: slot.unitCode || unit?.code || 'UNIT',
        unitName: slot.unitName || unit?.name || 'University Course Unit',
        lecturerName: slot.lecturerName || unit?.lecturerName || 'Assigned Lecturer',
        venueName: venue?.name || 'TBA',
        venueCode: venue?.code || '',
        buildingId: venue?.buildingId || null,
        buildingName: building?.name || '',
        floorLabel: venue?.floorLabel || '',
        previousVenueName: prevVenue?.name || null,
      };
    });
  }, [timetableSlots, venues, buildings, units]);

  const todayDayName = useMemo(() => {
    const jsDay = new Date().getDay();
    if (jsDay === 0) return 'Monday';
    return DAYS_OF_WEEK[jsDay - 1] || 'Monday';
  }, []);

  const todaysClasses = useMemo(() => {
    return enrichedTimetable
      .filter((s) => s.dayOfWeek === todayDayName)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [enrichedTimetable, todayDayName]);

  const nextClass = useMemo(() => {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const activeToday = todaysClasses.filter(
      (c) => c.status !== 'cancelled' && c.status !== 'completed'
    );
    const upcomingToday = activeToday.find((c) => timeToMinutes(c.endTime) > currentMins);
    if (upcomingToday) return upcomingToday;

    for (const day of DAYS_OF_WEEK) {
      const found = enrichedTimetable
        .filter((s) => s.dayOfWeek === day && s.status !== 'cancelled' && s.status !== 'completed')
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))[0];
      if (found) return found;
    }
    return null;
  }, [todaysClasses, enrichedTimetable]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  async function saveTimetableSlot(payload) {
    if (!user || user.role !== 'lecturer' || user.lecturerStatus !== 'approved') {
      return { error: 'Only approved lecturers can create or modify class schedules.' };
    }

    const { id, unitId, venueId, dayOfWeek, startTime, endTime, status = 'scheduled', changeNote = '' } = payload;

    if (status !== 'cancelled') {
      const collision = checkVenueCollision({
        slots: enrichedTimetable,
        venueId,
        dayOfWeek,
        startTime,
        endTime,
        excludeSlotId: id || null,
      });

      if (collision) {
        if (collision.error) return { error: collision.error };
        const alternatives = findAlternativeVenues({
          venues,
          slots: enrichedTimetable,
          dayOfWeek,
          startTime,
          endTime,
          excludeVenueId: venueId,
        });
        return {
          error: `Venue collision detected: ${collision.unitCode} (${collision.unitName}) is already booked in this venue on ${dayOfWeek} from ${collision.startTime} to ${collision.endTime}.`,
          collision,
          alternatives,
        };
      }
    }

    const unitObj = units.find((u) => u.id === unitId);
    const newVenueObj = venues.find((v) => v.id === venueId);
    const existingSlot = id ? timetableSlots.find((s) => s.id === id) : null;
    const isVenueChanged = existingSlot && existingSlot.venueId !== venueId;
    const oldVenueObj = isVenueChanged ? venues.find((v) => v.id === existingSlot.venueId) : null;

    const finalStatus = isVenueChanged && status === 'scheduled' ? 'rescheduled' : status;
    const previousVenueId = isVenueChanged ? existingSlot.venueId : existingSlot?.previousVenueId || null;

    if (isSupabaseConfigured && supabase) {
      if (id) {
        const { error } = await supabase
          .from('timetable_slots')
          .update({
            unit_id: unitId,
            venue_id: venueId,
            previous_venue_id: previousVenueId,
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
            status: finalStatus,
            change_note: changeNote,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('lecturer_id', user.id);
        if (error) return { error: error.message };
      } else {
        const { error } = await supabase.from('timetable_slots').insert({
          unit_id: unitId,
          lecturer_id: user.id,
          venue_id: venueId,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          status: finalStatus,
          change_note: changeNote,
        });
        if (error) return { error: error.message };
      }
    }

    const slotRecord = {
      id: id || `slot-${Date.now()}`,
      unitId,
      unitCode: unitObj?.code || 'UNIT',
      unitName: unitObj?.name || 'Course Unit',
      lecturerId: user.id,
      lecturerName: `${user.firstName} ${user.lastName}`,
      venueId,
      previousVenueId,
      dayOfWeek,
      startTime,
      endTime,
      status: finalStatus,
      changeNote:
        changeNote ||
        (isVenueChanged && oldVenueObj && newVenueObj
          ? `Moved from ${oldVenueObj.name} to ${newVenueObj.name}.`
          : ''),
    };

    setTimetableSlots((prev) =>
      id ? prev.map((s) => (s.id === id ? slotRecord : s)) : [...prev, slotRecord]
    );

    if (isVenueChanged && oldVenueObj && newVenueObj) {
      const msg = `IMPORTANT: Your ${slotRecord.unitName} class has been moved from ${oldVenueObj.name} to ${newVenueObj.name}.`;
      addNotification({
        title: `Venue Change: ${slotRecord.unitCode}`,
        message: msg,
        category: 'venue_change',
        oldVenue: oldVenueObj.name,
        newVenue: newVenueObj.name,
      });
      await publishAnnouncement({
        title: `Venue Change: ${slotRecord.unitCode} ${slotRecord.unitName}`,
        body: `${msg} Schedule: ${dayOfWeek} ${startTime} – ${endTime}. ${changeNote || ''}`.trim(),
        category: 'venue_change',
        unitCode: slotRecord.unitCode,
        isUrgent: true,
        skipNotification: true,
      });
    } else if (finalStatus === 'cancelled') {
      addNotification({
        title: `Class Cancelled: ${slotRecord.unitCode}`,
        message: `${slotRecord.unitName} on ${dayOfWeek} (${startTime} – ${endTime}) has been cancelled. ${changeNote || ''}`.trim(),
        category: 'cancelled_class',
      });
    } else if (!id) {
      addNotification({
        title: `New Class Scheduled: ${slotRecord.unitCode}`,
        message: `${slotRecord.unitName} scheduled on ${dayOfWeek} (${startTime} – ${endTime}) in ${newVenueObj?.name || 'TBA'}.`,
        category: 'timetable_change',
        newVenue: newVenueObj?.name || null,
      });
    }

    return { ok: true, slot: slotRecord, venueChanged: isVenueChanged };
  }

  async function publishAnnouncement({
    title,
    body,
    category = 'academic',
    unitCode = 'Academic Notice',
    isUrgent = false,
    skipNotification = false,
  }) {
    if (!user || user.role !== 'lecturer' || user.lecturerStatus !== 'approved') {
      return { error: 'Only approved lecturers are authorized to publish official notices.' };
    }
    if (!title?.trim() || !body?.trim()) {
      return { error: 'Notice title and description are required.' };
    }

    const newNotice = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      category,
      unitCode,
      authorName: `${user.firstName} ${user.lastName}`,
      isUrgent,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const matchedUnit = units.find((u) => u.code === unitCode);
      const { error } = await supabase.from('announcements').insert({
        author_id: user.id,
        unit_id: matchedUnit?.id || null,
        title: newNotice.title,
        body: newNotice.body,
        category,
        is_urgent: isUrgent,
      });
      if (error) return { error: error.message };
    }

    setAnnouncements((prev) => [newNotice, ...prev]);

    if (!skipNotification) {
      const catMap = {
        cat: 'cat',
        assignment: 'assignment',
        makeup: 'makeup',
        venue_change: 'venue_change',
      };
      addNotification({
        title: newNotice.title,
        message: newNotice.body,
        category: catMap[category] || 'announcement',
      });
    }

    return { ok: true, announcement: newNotice };
  }

  async function addNotification({ title, message, category = 'announcement', oldVenue = null, newVenue = null }) {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      message,
      category,
      oldVenue,
      newVenue,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    if (isSupabaseConfigured && supabase && user?.id) {
      await supabase.from('notifications').insert({
        user_id: user.id,
        title,
        message,
        category,
        old_venue: oldVenue,
        new_venue: newVenue,
        is_read: false,
      });
    }

    if (notificationPrefs?.emailEnabled && user?.email && notificationPrefs?.emailDigestMode !== 'daily_summary') {
      fetch('/api/notifications/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: user.email,
          subject: title,
          message,
          category,
        }),
      }).catch(() => {
        // Non-blocking background email attempt
      });
    }

    return newNotif;
  }

  function handleRealtimeNotification(payload) {
    const { eventType, new: newRow, old: oldRow } = payload || {};
    if (eventType === 'INSERT' && newRow) {
      const mapped = {
        id: newRow.id,
        title: newRow.title,
        message: newRow.message,
        category: newRow.category,
        oldVenue: newRow.old_venue,
        newVenue: newRow.new_venue,
        isRead: Boolean(newRow.is_read),
        createdAt: newRow.created_at,
      };
      setNotifications((prev) => {
        if (prev.some((n) => n.id === mapped.id)) return prev;
        return [mapped, ...prev];
      });
    } else if (eventType === 'UPDATE' && newRow) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === newRow.id
            ? {
                ...n,
                title: newRow.title ?? n.title,
                message: newRow.message ?? n.message,
                category: newRow.category ?? n.category,
                oldVenue: newRow.old_venue ?? n.oldVenue,
                newVenue: newRow.new_venue ?? n.newVenue,
                isRead: typeof newRow.is_read === 'boolean' ? newRow.is_read : n.isRead,
              }
            : n
        )
      );
    } else if (eventType === 'DELETE' && oldRow?.id) {
      setNotifications((prev) => prev.filter((n) => n.id !== oldRow.id));
    }
  }

  async function markNotificationRead(id, isRead = true) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead } : n)));
    if (isSupabaseConfigured && supabase && user) {
      await supabase.from('notifications').update({ is_read: isRead }).eq('id', id).eq('user_id', user.id);
    }
  }

  async function markAllNotificationsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (isSupabaseConfigured && supabase && user) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    }
  }

  async function updateNotificationPrefs(nextPrefs) {
    setNotificationPrefs(nextPrefs);
    if (isSupabaseConfigured && supabase && user) {
      await supabase.from('notification_preferences').upsert({
        user_id: user.id,
        in_app_enabled: nextPrefs.inAppEnabled,
        email_enabled: nextPrefs.emailEnabled,
        email_digest_mode: nextPrefs.emailDigestMode || 'instant',
        remind_minutes_before: Number(nextPrefs.remindMinutesBefore) || 30,
        updated_at: new Date().toISOString(),
      });
    }
  }

  async function sendEchoBotMessage(question) {
    const userMsg = {
      id: `msg-u-${Date.now()}`,
      role: 'user',
      content: question,
      createdAt: new Date().toISOString(),
    };
    const nextHistory = [...echoBotMessages, userMsg];
    setEchoBotMessages(nextHistory);

    const campusContext = {
      institution: 'Meru University of Science and Technology (MUST), Nchiru, Meru County, Kenya',
      currentUser: user
        ? {
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            school: user.school,
            programme: user.programme,
            regNumber: user.regNumber || user.staffId,
          }
        : null,
      todayDayName,
      nextClass: nextClass
        ? {
            unit: `${nextClass.unitCode} - ${nextClass.unitName}`,
            day: nextClass.dayOfWeek,
            time: `${nextClass.startTime} - ${nextClass.endTime}`,
            venue: nextClass.venueName,
            building: nextClass.buildingName,
            status: nextClass.status,
            previousVenue: nextClass.previousVenueName,
            changeNote: nextClass.changeNote,
          }
        : null,
      weeklyTimetable: enrichedTimetable.map((s) => ({
        day: s.dayOfWeek,
        time: `${s.startTime} - ${s.endTime}`,
        unit: `${s.unitCode} ${s.unitName}`,
        lecturer: s.lecturerName,
        venue: s.venueName,
        building: s.buildingName,
        status: s.status,
        previousVenue: s.previousVenueName,
        changeNote: s.changeNote,
      })),
      recentAnnouncements: announcements.slice(0, 6).map((a) => ({
        title: a.title,
        category: a.category,
        unit: a.unitCode,
        body: a.body,
        author: a.authorName,
      })),
      campusBuildings: buildings.map((b) => ({
        name: b.name,
        category: b.category,
        description: b.description,
        walkingDirections: b.walkingDirections,
        facilities: b.facilities,
      })),
      campusServices: services.map((s) => ({
        name: s.name,
        type: s.serviceType,
        location: s.locationDetail,
        hours: s.operatingHours,
        offerings: s.offerings,
      })),
      campusNews: news.map((n) => ({
        title: n.title,
        category: n.category,
        publishedAt: n.publishedAt,
        summary: n.summary,
      })),
    };

    try {
      const res = await fetch('/api/echobot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          history: nextHistory.slice(-8),
          campusContext,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errReply = {
          id: `msg-a-${Date.now()}`,
          role: 'assistant',
          content: data.error || 'EchoBot could not complete this request right now.',
          isError: true,
          createdAt: new Date().toISOString(),
        };
        setEchoBotMessages((prev) => [...prev, errReply]);
        return { error: errReply.content };
      }

      const aiMsg = {
        id: `msg-a-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        createdAt: new Date().toISOString(),
      };
      setEchoBotMessages((prev) => [...prev, aiMsg]);

      if (isSupabaseConfigured && supabase && user) {
        await supabase.from('echobot_messages').insert([
          { user_id: user.id, role: 'user', content: question },
          { user_id: user.id, role: 'assistant', content: data.reply },
        ]);
      }

      return { ok: true, reply: data.reply };
    } catch {
      const errMsg = {
        id: `msg-a-${Date.now()}`,
        role: 'assistant',
        content: 'Network error contacting EchoBot service. Please try again.',
        isError: true,
        createdAt: new Date().toISOString(),
      };
      setEchoBotMessages((prev) => [...prev, errMsg]);
      return { error: errMsg.content };
    }
  }

  function clearEchoBotHistory() {
    setEchoBotMessages([
      {
        id: 'welcome-msg-' + Date.now(),
        role: 'assistant',
        content:
          'Conversation cleared. Ask me anything about your MUST timetable, venue updates, campus buildings, or notices.',
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  return (
    <CampusDataContext.Provider
      value={{
        buildings,
        venues,
        units,
        timetableSlots: enrichedTimetable,
        todaysClasses,
        nextClass,
        todayDayName,
        announcements,
        news,
        services,
        notifications,
        unreadCount,
        notificationPrefs,
        echoBotMessages,
        siteConfig,
        dataLoading,
        refreshSiteState,
        saveTimetableSlot,
        publishAnnouncement,
        markNotificationRead,
        markAllNotificationsRead,
        handleRealtimeNotification,
        updateNotificationPrefs,
        sendEchoBotMessage,
        clearEchoBotHistory,
      }}
    >
      {children}
    </CampusDataContext.Provider>
  );
}

export function useCampusData() {
  const ctx = useContext(CampusDataContext);
  if (!ctx) throw new Error('useCampusData must be used within CampusDataProvider');
  return ctx;
}
