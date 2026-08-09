const express = require("express");
const {
  refreshAll,
  getStatus,
  searchAll,
} = require("../rag/ragSystem");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/refresh", protect, async (req, res, next) => {
  try {
    const refreshed = await refreshAll();
    res.json({ success: true, refreshed, status: getStatus() });
  } catch (e) {
    next(e);
  }
});

router.get("/status", protect, (req, res) => {
  res.json({ success: true, status: getStatus() });
});

router.get("/search", protect, async (req, res, next) => {
  try {
    const query = String(req.query.q || "").trim();
    if (!query) {
      return res.status(400).json({ success: false, message: "Query parameter q is required" });
    }

    const limit = Math.min(Number(req.query.limit) || 8, 25);
    const results = await searchAll(query, limit);
    res.json({ success: true, query, results });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
