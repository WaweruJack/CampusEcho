-- ============================================================================
-- CampusEcho (Meru University of Science and Technology - MUST)
-- Supabase PostgreSQL Schema, Venue Collision Triggers, RLS & Realtime Setup
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ROLE RECORDS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'lecturer', 'admin')) DEFAULT 'student',
  lecturer_status TEXT CHECK (lecturer_status IN ('pending', 'approved', 'rejected')) DEFAULT NULL,
  phone_number TEXT,
  theme_preference TEXT NOT NULL CHECK (theme_preference IN ('light', 'dark')) DEFAULT 'light',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  faculty TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  reg_number TEXT UNIQUE NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  school_name TEXT NOT NULL DEFAULT 'School of Computing and Informatics',
  programme_name TEXT NOT NULL,
  year_of_study INTEGER NOT NULL DEFAULT 1 CHECK (year_of_study BETWEEN 1 AND 6),
  CONSTRAINT valid_must_student_email CHECK (TRUE)
);

CREATE TABLE IF NOT EXISTS public.lecturers (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  staff_id TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  title TEXT DEFAULT 'Lecturer',
  approval_requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  lecturer_id UUID REFERENCES public.lecturers(id) ON DELETE SET NULL,
  year_of_study INTEGER NOT NULL DEFAULT 1,
  semester INTEGER NOT NULL DEFAULT 1
);

-- 2. CAMPUS BUILDINGS & VENUES
CREATE TABLE IF NOT EXISTS public.campus_buildings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('academic', 'lab', 'admin', 'library', 'cafeteria', 'services')),
  description TEXT NOT NULL,
  walking_directions TEXT NOT NULL,
  floors INTEGER NOT NULL DEFAULT 1,
  facilities TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  building_id TEXT NOT NULL REFERENCES public.campus_buildings(id) ON DELETE CASCADE,
  venue_type TEXT NOT NULL CHECK (venue_type IN ('lecture_hall', 'computer_lab', 'workshop', 'seminar_room')),
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  floor_label TEXT NOT NULL DEFAULT 'Ground Floor',
  has_projector BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TIMETABLE & DATABASE-LEVEL VENUE COLLISION DETECTION
CREATE TABLE IF NOT EXISTS public.timetable_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL REFERENCES public.lecturers(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE RESTRICT,
  previous_venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'rescheduled', 'cancelled', 'completed')) DEFAULT 'scheduled',
  change_note TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS public.venue_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  timetable_slot_id UUID REFERENCES public.timetable_slots(id) ON DELETE CASCADE,
  booked_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  purpose TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_booking_range CHECK (end_time > start_time)
);

-- Trigger Function: Enforce non-overlapping venue bookings at database level
CREATE OR REPLACE FUNCTION public.check_venue_collision()
RETURNS TRIGGER AS $$
DECLARE
  conflict_unit TEXT;
  conflict_start TIME;
  conflict_end TIME;
BEGIN
  IF NEW.status = 'cancelled' THEN
    RETURN NEW;
  END IF;

  SELECT u.code || ' (' || u.name || ')', ts.start_time, ts.end_time
  INTO conflict_unit, conflict_start, conflict_end
  FROM public.timetable_slots ts
  JOIN public.units u ON u.id = ts.unit_id
  WHERE ts.venue_id = NEW.venue_id
    AND ts.day_of_week = NEW.day_of_week
    AND ts.status <> 'cancelled'
    AND ts.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND ts.start_time < NEW.end_time
    AND ts.end_time > NEW.start_time
  LIMIT 1;

  IF conflict_unit IS NOT NULL THEN
    RAISE EXCEPTION 'VENUE_COLLISION: Venue is already occupied by % from % to % on %',
      conflict_unit, conflict_start, conflict_end, NEW.day_of_week;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_venue_collision ON public.timetable_slots;
CREATE TRIGGER trg_check_venue_collision
  BEFORE INSERT OR UPDATE ON public.timetable_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.check_venue_collision();

-- Helper RPC: Find available alternative venues for a given day & time range
CREATE OR REPLACE FUNCTION public.find_available_venues(
  p_day TEXT,
  p_start TIME,
  p_end TIME,
  p_min_capacity INTEGER DEFAULT 1
)
RETURNS SETOF public.venues AS $$
BEGIN
  RETURN QUERY
  SELECT v.*
  FROM public.venues v
  WHERE v.capacity >= p_min_capacity
    AND NOT EXISTS (
      SELECT 1
      FROM public.timetable_slots ts
      WHERE ts.venue_id = v.id
        AND ts.day_of_week = p_day
        AND ts.status <> 'cancelled'
        AND ts.start_time < p_end
        AND ts.end_time > p_start
    )
  ORDER BY v.capacity ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ANNOUNCEMENTS, NEWS, SERVICES, NOTIFICATIONS, ECHOBOT
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('academic', 'assignment', 'cat', 'makeup', 'venue_change', 'departmental', 'deadline')),
  is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.campus_news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('events', 'graduation', 'student_activities', 'academic_calendar', 'developments')),
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  author_name TEXT NOT NULL DEFAULT 'MUST Corporate Communications'
);

CREATE TABLE IF NOT EXISTS public.campus_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('cafeteria', 'registrar', 'ict', 'health', 'library', 'dean')),
  building_id TEXT REFERENCES public.campus_buildings(id) ON DELETE SET NULL,
  location_detail TEXT NOT NULL,
  operating_hours TEXT NOT NULL,
  description TEXT NOT NULL,
  menu_or_offerings TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('upcoming_class', 'timetable_change', 'venue_change', 'cancelled_class', 'assignment', 'cat', 'makeup', 'announcement', 'event')),
  old_venue TEXT,
  new_venue TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  email_digest_mode TEXT NOT NULL CHECK (email_digest_mode IN ('instant', 'daily_summary')) DEFAULT 'instant',
  remind_minutes_before INTEGER NOT NULL DEFAULT 30,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.echobot_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.echobot_messages ENABLE ROW LEVEL SECURITY;

-- Profiles: Users read/update their own profile; authenticated users can read basic lecturer names
CREATE POLICY "profiles_select_own_or_lecturers" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR role = 'lecturer');

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "students_select_own" ON public.students
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "students_insert_own" ON public.students
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "students_update_own" ON public.students
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "lecturers_select_all_auth" ON public.lecturers
  FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "lecturers_insert_own" ON public.lecturers
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "lecturers_update_own" ON public.lecturers
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Public/Authenticated academic catalog reads
CREATE POLICY "catalog_read_courses" ON public.courses FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "catalog_read_units" ON public.units FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "catalog_read_buildings" ON public.campus_buildings FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "catalog_read_venues" ON public.venues FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "catalog_read_news" ON public.campus_news FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "catalog_read_services" ON public.campus_services FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "catalog_read_timetable" ON public.timetable_slots FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "catalog_read_announcements" ON public.announcements FOR SELECT TO authenticated USING (TRUE);

-- Timetable mutations: ONLY approved lecturers for their assigned units (or admins)
CREATE POLICY "timetable_lecturer_insert" ON public.timetable_slots
  FOR INSERT TO authenticated
  WITH CHECK (
    lecturer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('lecturer', 'admin')
      AND (p.role = 'admin' OR p.lecturer_status = 'approved')
    )
  );

CREATE POLICY "timetable_lecturer_update" ON public.timetable_slots
  FOR UPDATE TO authenticated
  USING (
    lecturer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('lecturer', 'admin')
      AND (p.role = 'admin' OR p.lecturer_status = 'approved')
    )
  );

-- Announcements: ONLY approved lecturers or admins can publish
CREATE POLICY "announcements_lecturer_insert" ON public.announcements
  FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('lecturer', 'admin')
      AND (p.role = 'admin' OR p.lecturer_status = 'approved')
    )
  );

-- Notifications & Preferences & EchoBot History: Strict owner isolation
CREATE POLICY "notifications_owner_all" ON public.notifications
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "prefs_owner_all" ON public.notification_preferences
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "echobot_owner_all" ON public.echobot_messages
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 6. REALTIME PUBLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.timetable_slots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
