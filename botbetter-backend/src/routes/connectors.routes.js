const express = require("express");
const nodemailer = require("nodemailer");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// ── WhatsApp ──────────────────────────────────────────────────────────────────
// Uses Twilio's WhatsApp API. Set env vars:
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM (e.g. whatsapp:+14155238886)
router.post("/whatsapp/send", protect, async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) return res.status(400).json({ success: false, message: "to and message required" });

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;

    if (!sid || !token || !from) {
      // Demo mode — pretend it was sent
      console.log(`[WhatsApp DEMO] To: ${to} | Message: ${message}`);
      return res.json({ success: true, sid: "DEMO_" + Date.now(), message: "Message sent (demo mode)" });
    }

    const client = require("twilio")(sid, token);
    const msg = await client.messages.create({
      body: message,
      from,
      to: `whatsapp:${to.startsWith("+") ? to : "+" + to}`,
    });

    res.json({ success: true, sid: msg.sid, status: msg.status });
  } catch (err) {
    console.error("[WhatsApp] send error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to send WhatsApp message" });
  }
});

// ── Gmail ─────────────────────────────────────────────────────────────────────
// Uses Gmail SMTP with App Password. Set env vars:
//   GMAIL_USER (your gmail), GMAIL_APP_PASSWORD (Google App Password)
const getGmailTransport = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
};

router.post("/gmail/send", protect, async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body)
      return res.status(400).json({ success: false, message: "to, subject, and body required" });

    const transport = getGmailTransport();
    if (!transport) {
      console.log(`[Gmail DEMO] To: ${to} | Subject: ${subject}`);
      return res.json({ success: true, messageId: "DEMO_" + Date.now(), message: "Email sent (demo mode)" });
    }

    const info = await transport.sendMail({
      from: `BotBetter Nexus <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text: body,
      html: `<div style="font-family:sans-serif;line-height:1.6">${body.replace(/\n/g, "<br>")}</div>`,
    });

    res.json({ success: true, messageId: info.messageId, message: "Email sent successfully" });
  } catch (err) {
    console.error("[Gmail] send error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to send email" });
  }
});

router.get("/gmail/read", protect, async (req, res) => {
  try {
    const { google } = require("googleapis");
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      // Return sample emails in demo mode
      return res.json({
        success: true,
        demo: true,
        emails: [
          { id: "1", from: "team@company.com", subject: "Weekly sync notes", snippet: "Hi, please find the meeting notes attached...", date: new Date().toISOString() },
          { id: "2", from: "noreply@github.com", subject: "New PR opened in your repo", snippet: "User opened a pull request...", date: new Date(Date.now() - 3600000).toISOString() },
          { id: "3", from: "billing@vercel.com", subject: "Your invoice for June 2026", snippet: "Your monthly invoice is ready...", date: new Date(Date.now() - 86400000).toISOString() },
        ],
      });
    }

    const auth = new google.auth.OAuth2(clientId, clientSecret);
    auth.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: "v1", auth });
    const list = await gmail.users.messages.list({ userId: "me", maxResults: 5, q: "is:inbox is:unread" });
    const ids = list.data.messages || [];

    const emails = await Promise.all(ids.map(async ({ id }) => {
      const msg = await gmail.users.messages.get({ userId: "me", id, format: "metadata", metadataHeaders: ["From", "Subject", "Date"] });
      const headers = msg.data.payload?.headers ?? [];
      const get = (name) => headers.find((h) => h.name === name)?.value ?? "";
      return { id, from: get("From"), subject: get("Subject"), snippet: msg.data.snippet, date: get("Date") };
    }));

    res.json({ success: true, emails });
  } catch (err) {
    console.error("[Gmail] read error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to read emails" });
  }
});

// ── Google Calendar ───────────────────────────────────────────────────────────
// Uses Google Calendar API. Set env vars:
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_CALENDAR_ID (optional)
router.post("/calendar/create", protect, async (req, res) => {
  try {
    const { title, description, startDateTime, endDateTime, attendees } = req.body;
    if (!title || !startDateTime)
      return res.status(400).json({ success: false, message: "title and startDateTime required" });

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      const mockEvent = {
        id: "EVT_" + Date.now(),
        title,
        startDateTime,
        endDateTime: endDateTime || new Date(new Date(startDateTime).getTime() + 3600000).toISOString(),
        link: "https://calendar.google.com/",
        demo: true,
      };
      console.log("[Calendar DEMO] Created event:", mockEvent);
      return res.json({ success: true, event: mockEvent, message: "Event created (demo mode)" });
    }

    const { google } = require("googleapis");
    const auth = new google.auth.OAuth2(clientId, clientSecret);
    auth.setCredentials({ refresh_token: refreshToken });

    const calendar = google.calendar({ version: "v3", auth });
    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: title,
        description: description || "",
        start: { dateTime: startDateTime, timeZone: "Asia/Kolkata" },
        end: { dateTime: endDateTime || new Date(new Date(startDateTime).getTime() + 3600000).toISOString(), timeZone: "Asia/Kolkata" },
        attendees: attendees ? attendees.split(",").map((e) => ({ email: e.trim() })) : [],
      },
    });

    res.json({ success: true, event: { id: event.data.id, link: event.data.htmlLink }, message: "Event created successfully" });
  } catch (err) {
    console.error("[Calendar] create error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to create calendar event" });
  }
});

// ── Request a connector ───────────────────────────────────────────────────────
router.post("/request", protect, async (req, res) => {
  try {
    const { connectorName, reason } = req.body;
    if (!connectorName) return res.status(400).json({ success: false, message: "connectorName required" });

    // Log the request (in production, store in DB and email the team)
    console.log(`[Connector Request] User ${req.user.id} wants: ${connectorName} | Reason: ${reason}`);

    // Notify via email if Gmail is configured
    const transport = getGmailTransport();
    if (transport && process.env.GMAIL_USER) {
      await transport.sendMail({
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        subject: `[BotBetter] New Connector Request: ${connectorName}`,
        text: `User ${req.user.email} (${req.user.id}) requested connector: ${connectorName}\n\nReason: ${reason}`,
      }).catch(() => {});
    }

    res.json({ success: true, message: "Request submitted! We'll build this connector soon." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal error" });
  }
});

module.exports = router;
