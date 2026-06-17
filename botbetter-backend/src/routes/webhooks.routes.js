const express = require("express");
const crypto = require("crypto");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// In-memory log store (replace with MongoDB collection for persistence)
const webhookLogs = new Map(); // userId -> array of log entries

// POST /api/webhooks/receive/:userId  — public endpoint called by external tools
router.post("/receive/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const secret = req.headers["x-botbetter-secret"];
    const payload = req.body;

    const entry = {
      id: crypto.randomUUID(),
      receivedAt: new Date().toISOString(),
      event: payload.event || "unknown",
      source: req.headers["user-agent"] || "external",
      status: 200,
      payload,
    };

    if (!webhookLogs.has(userId)) webhookLogs.set(userId, []);
    const logs = webhookLogs.get(userId);
    logs.unshift(entry);
    if (logs.length > 100) logs.splice(100);

    console.log(`[Webhook] userId=${userId} event=${entry.event}`);
    res.status(200).json({ success: true, id: entry.id, message: "Webhook received" });
  } catch (err) {
    console.error("[Webhook] receive error:", err);
    res.status(500).json({ success: false, message: "Internal error" });
  }
});

// GET /api/webhooks/logs — authenticated, returns logs for the current user
router.get("/logs", protect, async (req, res) => {
  try {
    const logs = webhookLogs.get(req.user.id) || [];
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal error" });
  }
});

// POST /api/webhooks/test — authenticated, fires a test ping back to caller
router.post("/test", protect, async (req, res) => {
  try {
    const { webhookUrl, secret } = req.body;
    if (!webhookUrl) return res.status(400).json({ success: false, message: "webhookUrl required" });

    const testPayload = {
      event: "test.ping",
      timestamp: new Date().toISOString(),
      message: "BotBetter webhook test — everything is working!",
      userId: req.user.id,
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "X-BotBetter-Secret": secret } : {}),
      },
      body: JSON.stringify(testPayload),
      signal: AbortSignal.timeout(5000),
    }).catch(() => null);

    const ok = response?.ok ?? false;
    res.json({ success: ok, status: response?.status ?? 0, message: ok ? "Test ping sent successfully" : "Failed to reach webhook URL" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal error" });
  }
});

module.exports = router;
