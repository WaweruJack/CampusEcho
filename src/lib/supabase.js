import { createClient } from '@supabase/supabase-js';

function cleanEnvValue(value) {
  return String(value || '')
    .trim()
    .replace(/^["']|["']$/g, '')
    .trim();
}

export function normalizeSupabaseUrl(rawUrl) {
  const cleaned = cleanEnvValue(rawUrl);
  if (!cleaned || cleaned === 'MY_SUPABASE_URL') return '';

  const withProtocol = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
  try {
    const parsed = new URL(withProtocol);
    if (!parsed.hostname || !parsed.hostname.includes('.')) return '';

    // Convert Supabase Dashboard URLs (e.g. https://supabase.com/dashboard/project/<ref>) to API origin
    if (parsed.hostname === 'supabase.com' || parsed.hostname === 'app.supabase.com') {
      const match = parsed.pathname.match(/\/project\/([a-z0-9_-]+)/i);
      if (match?.[1]) {
        return `https://${match[1]}.supabase.co`;
      }
      return '';
    }

    // Strip any accidental subpath (e.g. /rest/v1, /auth/v1, /storage/v1) so Kong receives root origin
    return parsed.origin;
  } catch {
    return '';
  }
}

const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = cleanEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'MY_SUPABASE_ANON_KEY' &&
    supabaseUrl.startsWith('http')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
