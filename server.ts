import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

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

// Health & integration readiness endpoint (no secrets exposed)
app.get('/api/health', (_req, res) => {
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  const supabaseConfigured = Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY);
  const emailConfigured = Boolean(process.env.RESEND_API_KEY);
  const smsConfigured = Boolean(process.env.AFRICASTALKING_API_KEY && process.env.AFRICASTALKING_USERNAME);

  res.json({
    ok: true,
    integrations: {
      gemini: geminiConfigured,
      supabase: supabaseConfigured,
      email: emailConfigured,
      sms: smsConfigured,
    },
  });
});

// EchoBot AI Endpoint (Server-side Gemini API)
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

// Email & SMS Notification Dispatch Endpoint
app.post('/api/notifications/dispatch', async (req, res) => {
  try {
    const { channel, recipientEmail, recipientPhone, subject, message } = req.body ?? {};
    if (!channel || !message) {
      return res.status(400).json({ error: 'Channel and message are required.' });
    }

    if (channel === 'email') {
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

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'CampusEcho MUST <onboarding@resend.dev>',
          to: [recipientEmail],
          subject: subject || 'CampusEcho Notification',
          text: message,
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
    }

    if (channel === 'sms') {
      const atKey = process.env.AFRICASTALKING_API_KEY;
      const atUser = process.env.AFRICASTALKING_USERNAME;
      if (!atKey || !atUser) {
        return res.status(200).json({
          delivered: false,
          configured: false,
          provider: "Africa's Talking SMS",
          detail: 'SMS provider not configured. Add AFRICASTALKING_API_KEY and AFRICASTALKING_USERNAME to environment secrets to enable live SMS alerts in Kenya.',
        });
      }

      if (!recipientPhone) {
        return res.status(400).json({ error: 'Recipient phone number is required for SMS.' });
      }

      const params = new URLSearchParams({
        username: atUser,
        to: recipientPhone,
        message,
      });

      const smsRes = await fetch('https://api.africastalking.com/version1/messaging', {
        method: 'POST',
        headers: {
          apiKey: atKey,
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const smsPayload = await smsRes.json().catch(() => ({}));
      if (!smsRes.ok) {
        return res.status(502).json({
          delivered: false,
          configured: true,
          error: smsPayload?.SMSMessageData?.Message || 'Failed to send SMS.',
        });
      }

      return res.json({
        delivered: true,
        configured: true,
        provider: "Africa's Talking SMS",
        response: smsPayload,
      });
    }

    return res.status(400).json({ error: 'Unsupported dispatch channel.' });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Notification dispatch failed.';
    return res.status(500).json({ error: errMsg });
  }
});

// Public Contact Form submission endpoint
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
