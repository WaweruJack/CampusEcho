import express, { type NextFunction, type Request, type Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '2mb' }));

// ============================================================================
// SERVER-SIDE OWNER ADMIN AUTHENTICATION & SITE STATE STORE
// ============================================================================
const ADMIN_AUTH_FILE = path.resolve(__dirname, '.campusecho-admin.json');
const SITE_STATE_FILE = path.resolve(__dirname, '.campusecho-site-config.json');
const IN_MEMORY_SESSION_SECRET = crypto.randomBytes(32).toString('hex');

interface AdminCredentialRecord {
  email: string;
  salt: string;
  hash: string;
  claimedAt: string;
}

interface SiteConfig {
  portalName: string;
  academicTerm: string;
  supportEmail: string;
  bannerEnabled: boolean;
  bannerText: string;
  bannerTone: 'info' | 'warning' | 'urgent';
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

interface BroadcastItem {
  id: string;
  title: string;
  message: string;
  category: string;
  createdAt: string;
}

interface SiteStateStore {
  siteConfig: SiteConfig;
  timetableSlots: unknown[] | null;
  announcements: unknown[] | null;
  news: unknown[] | null;
  services: unknown[] | null;
  buildings: unknown[] | null;
  venues: unknown[] | null;
  broadcasts: BroadcastItem[];
  updatedAt: string;
}

const DEFAULT_SITE_CONFIG: SiteConfig = {
  portalName: 'CampusEcho',
  academicTerm: '2026/2027 Semester 1',
  supportEmail: 'support@campusecho.must.ac.ke',
  bannerEnabled: false,
  bannerText: '',
  bannerTone: 'info',
  maintenanceMode: false,
  maintenanceMessage: 'CampusEcho is undergoing scheduled maintenance. Please check back shortly.',
};

function getDefaultSiteState(): SiteStateStore {
  return {
    siteConfig: { ...DEFAULT_SITE_CONFIG },
    timetableSlots: null,
    announcements: null,
    news: null,
    services: null,
    buildings: null,
    venues: null,
    broadcasts: [],
    updatedAt: new Date().toISOString(),
  };
}

function getOwnerEmail(): string {
  return String(process.env.ADMIN_EMAIL || 'wjwaweru1@gmail.com')
    .trim()
    .toLowerCase();
}

function getSessionSigningSecret(): string {
  const configured = String(process.env.ADMIN_SESSION_SECRET || '').trim();
  return configured || IN_MEMORY_SESSION_SECRET;
}

function readAdminCredentialRecord(): AdminCredentialRecord | null {
  try {
    if (!fs.existsSync(ADMIN_AUTH_FILE)) return null;
    const raw = fs.readFileSync(ADMIN_AUTH_FILE, 'utf8');
    const parsed = JSON.parse(raw) as AdminCredentialRecord;
    if (parsed && parsed.email && parsed.salt && parsed.hash) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function hashSecret(password: string, saltHex: string): string {
  return crypto.scryptSync(password, saltHex, 64).toString('hex');
}

function constantTimeCompareStrings(a: string, b: string): boolean {
  const digestA = crypto.createHash('sha256').update(a).digest();
  const digestB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

function signAdminToken(email: string): string {
  const payload = {
    sub: email,
    role: 'owner_admin',
    iat: Date.now(),
    exp: Date.now() + 12 * 60 * 60 * 1000, // 12 hours
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSessionSigningSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyAdminToken(token: string): { sub: string; role: string; exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encoded, sig] = parts;
    const expectedSig = crypto
      .createHmac('sha256', getSessionSigningSecret())
      .update(encoded)
      .digest('base64url');

    const sigBuf = Buffer.from(sig, 'utf8');
    const expBuf = Buffer.from(expectedSig, 'utf8');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as {
      sub?: string;
      role?: string;
      exp?: number;
    };
    if (!payload || payload.role !== 'owner_admin' || !payload.exp || Date.now() > payload.exp) {
      return null;
    }
    if (String(payload.sub || '').toLowerCase() !== getOwnerEmail()) {
      return null;
    }
    return { sub: payload.sub || '', role: payload.role, exp: payload.exp };
  } catch {
    return null;
  }
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = String(req.headers.authorization || '');
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const token = authHeader.slice(7).trim();
  const verified = verifyAdminToken(token);
  if (!verified) {
    return res.status(401).json({ error: 'Session expired or invalid.' });
  }
  return next();
}

function readSiteState(): SiteStateStore {
  try {
    if (!fs.existsSync(SITE_STATE_FILE)) return getDefaultSiteState();
    const raw = fs.readFileSync(SITE_STATE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<SiteStateStore>;
    return {
      ...getDefaultSiteState(),
      ...parsed,
      siteConfig: {
        ...DEFAULT_SITE_CONFIG,
        ...(parsed.siteConfig || {}),
      },
      broadcasts: Array.isArray(parsed.broadcasts) ? parsed.broadcasts : [],
    };
  } catch {
    return getDefaultSiteState();
  }
}

function writeSiteState(nextState: SiteStateStore): SiteStateStore {
  const stamped: SiteStateStore = {
    ...nextState,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(SITE_STATE_FILE, JSON.stringify(stamped, null, 2), 'utf8');
  return stamped;
}

function getNormalizedServerSupabaseUrl(): string {
  const raw = String(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '')
    .trim()
    .replace(/^["']|["']$/g, '')
    .trim();
  if (!raw || raw === 'MY_SUPABASE_URL') return '';
  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const parsed = new URL(withProto);
    if (parsed.hostname === 'supabase.com' || parsed.hostname === 'app.supabase.com') {
      const m = parsed.pathname.match(/\/project\/([a-z0-9_-]+)/i);
      return m?.[1] ? `https://${m[1]}.supabase.co` : '';
    }
    return parsed.origin;
  } catch {
    return '';
  }
}

async function supabaseServiceFetch(tablePath: string, options: RequestInit = {}) {
  const baseUrl = getNormalizedServerSupabaseUrl();
  const serviceKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '')
    .trim()
    .replace(/^["']|["']$/g, '')
    .trim();
  if (!baseUrl || !serviceKey) return null;

  const res = await fetch(`${baseUrl}/rest/v1/${tablePath}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health & integration readiness endpoint (no secrets or admin state exposed)
app.get('/api/health', (_req, res) => {
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  const supabaseConfigured = Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY);
  const emailConfigured = Boolean(process.env.RESEND_API_KEY);

  res.json({
    ok: true,
    integrations: {
      gemini: geminiConfigured,
      supabase: supabaseConfigured,
      email: emailConfigured,
    },
  });
});

// Public read-only site state consumed by CampusDataContext
app.get('/api/site-state', (_req, res) => {
  const state = readSiteState();
  res.json(state);
});

// ============================================================================
// OWNER ADMIN AUTHENTICATION & MANAGEMENT API
// ============================================================================
app.get('/api/admin/status', (_req, res) => {
  const envKey = String(process.env.ADMIN_ACCESS_KEY || '').trim();
  const existing = readAdminCredentialRecord();
  res.json({
    configuredViaEnv: Boolean(envKey),
    needsSetup: !envKey && !existing,
  });
});

app.post('/api/admin/setup', (req, res) => {
  const envKey = String(process.env.ADMIN_ACCESS_KEY || '').trim();
  if (envKey) {
    return res.status(409).json({ error: 'Access credential is already configured via environment secrets.' });
  }
  if (readAdminCredentialRecord()) {
    return res.status(409).json({ error: 'Owner credential has already been claimed.' });
  }

  const { email, password } = req.body ?? {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const ownerEmail = getOwnerEmail();

  if (normalizedEmail !== ownerEmail) {
    return res.status(403).json({ error: 'Unauthorized owner email.' });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashSecret(password, salt);
  const record: AdminCredentialRecord = {
    email: ownerEmail,
    salt,
    hash,
    claimedAt: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(ADMIN_AUTH_FILE, JSON.stringify(record, null, 2), { flag: 'wx', encoding: 'utf8' });
  } catch {
    return res.status(409).json({ error: 'Owner credential has already been claimed.' });
  }

  const token = signAdminToken(ownerEmail);
  return res.json({ token, email: ownerEmail });
});

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body ?? {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const ownerEmail = getOwnerEmail();

  if (!normalizedEmail || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (normalizedEmail !== ownerEmail) {
    return res.status(403).json({ error: 'Invalid credentials.' });
  }

  const envKey = String(process.env.ADMIN_ACCESS_KEY || '').trim();
  if (envKey) {
    if (!constantTimeCompareStrings(password, envKey)) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = signAdminToken(ownerEmail);
    return res.json({ token, email: ownerEmail });
  }

  const record = readAdminCredentialRecord();
  if (!record) {
    return res.status(412).json({ error: 'Owner access has not been initialized yet.' });
  }

  const candidateHash = hashSecret(password, record.salt);
  if (!constantTimeCompareStrings(candidateHash, record.hash)) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = signAdminToken(ownerEmail);
  return res.json({ token, email: ownerEmail });
});

app.get('/api/admin/overview', requireAdminAuth, async (_req, res) => {
  const state = readSiteState();
  const serviceKeyConfigured = Boolean(
    getNormalizedServerSupabaseUrl() && String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  );

  let supabaseProfiles: unknown[] = [];
  if (serviceKeyConfigured) {
    const profilesRes = await supabaseServiceFetch(
      'profiles?select=id,email,first_name,last_name,role,lecturer_status,phone_number,created_at,students(reg_number,school_name,programme_name,year_of_study),lecturers(staff_id,department)&order=created_at.desc'
    );
    if (profilesRes?.ok && Array.isArray(profilesRes.data)) {
      supabaseProfiles = profilesRes.data;
    }
  }

  return res.json({
    siteState: state,
    supabaseProfiles,
    integrations: {
      gemini: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      supabaseClient: Boolean(getNormalizedServerSupabaseUrl() && process.env.VITE_SUPABASE_ANON_KEY),
      supabaseServiceRole: serviceKeyConfigured,
      email: Boolean(process.env.RESEND_API_KEY),
    },
  });
});

app.put('/api/admin/site-config', requireAdminAuth, (req, res) => {
  const current = readSiteState();
  const incoming = (req.body ?? {}) as Partial<SiteConfig>;
  const allowedTones: Array<SiteConfig['bannerTone']> = ['info', 'warning', 'urgent'];
  const tone = allowedTones.includes(incoming.bannerTone as SiteConfig['bannerTone'])
    ? (incoming.bannerTone as SiteConfig['bannerTone'])
    : current.siteConfig.bannerTone;

  const updated = writeSiteState({
    ...current,
    siteConfig: {
      portalName: String(incoming.portalName ?? current.siteConfig.portalName).trim() || 'CampusEcho',
      academicTerm: String(incoming.academicTerm ?? current.siteConfig.academicTerm).trim() || '2026/2027 Semester 1',
      supportEmail: String(incoming.supportEmail ?? current.siteConfig.supportEmail).trim() || 'support@campusecho.must.ac.ke',
      bannerEnabled: Boolean(incoming.bannerEnabled),
      bannerText: String(incoming.bannerText ?? '').trim(),
      bannerTone: tone,
      maintenanceMode: Boolean(incoming.maintenanceMode),
      maintenanceMessage:
        String(incoming.maintenanceMessage ?? current.siteConfig.maintenanceMessage).trim() ||
        DEFAULT_SITE_CONFIG.maintenanceMessage,
    },
  });

  return res.json({ ok: true, siteState: updated });
});

app.put('/api/admin/timetable', requireAdminAuth, (req, res) => {
  const { slots } = req.body ?? {};
  if (!Array.isArray(slots)) {
    return res.status(400).json({ error: 'slots array is required.' });
  }
  const current = readSiteState();
  const updated = writeSiteState({
    ...current,
    timetableSlots: slots,
  });
  return res.json({ ok: true, siteState: updated });
});

app.put('/api/admin/announcements', requireAdminAuth, (req, res) => {
  const { announcements } = req.body ?? {};
  if (!Array.isArray(announcements)) {
    return res.status(400).json({ error: 'announcements array is required.' });
  }
  const current = readSiteState();
  const updated = writeSiteState({
    ...current,
    announcements,
  });
  return res.json({ ok: true, siteState: updated });
});

app.put('/api/admin/news', requireAdminAuth, (req, res) => {
  const { news } = req.body ?? {};
  if (!Array.isArray(news)) {
    return res.status(400).json({ error: 'news array is required.' });
  }
  const current = readSiteState();
  const updated = writeSiteState({
    ...current,
    news,
  });
  return res.json({ ok: true, siteState: updated });
});

app.put('/api/admin/services', requireAdminAuth, (req, res) => {
  const { services } = req.body ?? {};
  if (!Array.isArray(services)) {
    return res.status(400).json({ error: 'services array is required.' });
  }
  const current = readSiteState();
  const updated = writeSiteState({
    ...current,
    services,
  });
  return res.json({ ok: true, siteState: updated });
});

app.put('/api/admin/buildings', requireAdminAuth, (req, res) => {
  const { buildings } = req.body ?? {};
  if (!Array.isArray(buildings)) {
    return res.status(400).json({ error: 'buildings array is required.' });
  }
  const current = readSiteState();
  const updated = writeSiteState({
    ...current,
    buildings,
  });
  return res.json({ ok: true, siteState: updated });
});

app.post('/api/admin/broadcast', requireAdminAuth, (req, res) => {
  const { title, message, category = 'announcement' } = req.body ?? {};
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required.' });
  }
  const current = readSiteState();
  const item: BroadcastItem = {
    id: `bc-${Date.now()}`,
    title: String(title).trim(),
    message: String(message).trim(),
    category: String(category).trim() || 'announcement',
    createdAt: new Date().toISOString(),
  };
  const updated = writeSiteState({
    ...current,
    broadcasts: [item, ...current.broadcasts].slice(0, 25),
  });
  return res.json({ ok: true, broadcast: item, siteState: updated });
});

app.post('/api/admin/lecturers/status', requireAdminAuth, async (req, res) => {
  const { profileId, status } = req.body ?? {};
  if (!profileId || !['approved', 'rejected', 'pending'].includes(String(status))) {
    return res.status(400).json({ error: 'Valid profileId and status are required.' });
  }

  const updateRes = await supabaseServiceFetch(`profiles?id=eq.${encodeURIComponent(String(profileId))}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      lecturer_status: status,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!updateRes) {
    return res.status(400).json({
      error: 'SUPABASE_SERVICE_ROLE_KEY is required on the server to modify Supabase user roles.',
    });
  }
  if (!updateRes.ok) {
    return res.status(502).json({ error: 'Failed to update lecturer status in Supabase.' });
  }
  return res.json({ ok: true, updated: updateRes.data });
});

app.post('/api/admin/reset-site-state', requireAdminAuth, (_req, res) => {
  const reset = writeSiteState(getDefaultSiteState());
  return res.json({ ok: true, siteState: reset });
});

// ============================================================================
// ECHOBOT AI, EMAIL DISPATCH & CONTACT ENDPOINTS
// ============================================================================
app.post('/api/echobot', async (req, res) => {
  try {
    const { message, history = [], campusContext = {} } = req.body ?? {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Please provide a question for EchoBot.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'EchoBot AI requires GEMINI_API_KEY to be configured in Settings > Secrets.',
      });
    }

    const systemInstruction = `You are EchoBot, the official Smart Campus Companion AI assistant for Meru University of Science and Technology (MUST), Nchiru, Meru County, Kenya inside CampusEcho.

STRICT GROUNDING RULES:
1. You MUST answer ONLY using the verified CampusEcho context JSON provided below and standard, helpful conversational guidance about how to use CampusEcho features.
2. NEVER invent, guess, or fabricate university dates, fee amounts, exam dates, building coordinates, cafeteria menus, lecture venues, or announcements that are not explicitly present in the provided context.
3. If the user asks about something not present in the CampusEcho context (for example, a specific course unit not listed, an unposted exam date, or personal grades), clearly state: "I do not have verified information about that in your current CampusEcho records." and suggest checking the Digital Notice Board, contacting the relevant MUST office, or checking with their lecturer.
4. When answering about next classes, timetable changes, or venues, ALWAYS highlight any recent venue change (mentioning both the old venue and the new venue) and suggest opening Campus Maps if helpful.
5. Keep responses concise, structured, accurate, and friendly. Use plain text or clean markdown bullet lists.

VERIFIED CAMPUSECHO CONTEXT FOR THIS USER:
${JSON.stringify(campusContext, null, 2)}`;

    const recentHistory = Array.isArray(history)
      ? history.slice(-8).map((item) => ({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(item.content || '') }],
        }))
      : [];

    const contents = [
      ...recentHistory,
      { role: 'user', parts: [{ text: message.trim() }] },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text?.trim();
    if (!reply) {
      return res.status(502).json({ error: 'EchoBot received an empty response from Gemini.' });
    }

    return res.json({ reply });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'EchoBot request failed.';
    console.error('EchoBot API error:', errMsg);
    return res.status(500).json({ error: errMsg });
  }
});

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

app.post('/api/notifications/dispatch', async (req, res) => {
  try {
    const { recipientEmail, subject, message, category = 'notification' } = req.body ?? {};
    if (!message) {
      return res.status(400).json({ error: 'Notification message is required.' });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return res.status(200).json({
        delivered: false,
        configured: false,
        provider: 'Resend Email',
        detail: 'Email provider not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL to environment secrets to enable live email delivery.',
      });
    }

    if (!recipientEmail) {
      return res.status(400).json({ error: 'Recipient email address is required.' });
    }

    const safeSubject = String(subject || 'CampusEcho Notification');
    const safeCategory = escapeHtml(String(category).replace('_', ' '));
    const safeMessage = escapeHtml(String(message));
    const safeTitle = escapeHtml(safeSubject);

    const htmlBody = `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background: #0f172a; color: #ffffff; padding: 18px 24px;">
          <p style="margin: 0; font-size: 12px; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em;">CampusEcho · MUST</p>
          <h2 style="margin: 6px 0 0; font-size: 18px;">${safeTitle}</h2>
        </div>
        <div style="padding: 20px 24px; color: #334155; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 10px; font-size: 12px; color: #4338ca; font-weight: 600; text-transform: capitalize;">${safeCategory}</p>
          <p style="margin: 0;">${safeMessage}</p>
        </div>
        <div style="padding: 14px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          Meru University of Science and Technology · CampusEcho Portal
        </div>
      </div>
    `;

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'CampusEcho MUST <onboarding@resend.dev>',
        to: [recipientEmail],
        subject: safeSubject,
        text: message,
        html: htmlBody,
      }),
    });

    const emailPayload = await emailRes.json().catch(() => ({}));
    if (!emailRes.ok) {
      return res.status(502).json({
        delivered: false,
        configured: true,
        error: emailPayload.message || 'Failed to send email via Resend.',
      });
    }

    return res.json({
      delivered: true,
      configured: true,
      provider: 'Resend Email',
      id: emailPayload.id,
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Email notification dispatch failed.';
    return res.status(500).json({ error: errMsg });
  }
});

app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body ?? {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(email))) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  return res.json({
    ok: true,
    ticketRef: `MUST-${Date.now().toString().slice(-6)}`,
    receivedAt: new Date().toISOString(),
    subject: subject || 'CampusEcho Inquiry',
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusEcho server listening on http://localhost:${PORT}`);
  });
}

startServer();
