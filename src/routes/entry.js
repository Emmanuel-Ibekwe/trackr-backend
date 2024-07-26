const express = require("express");
const checkAuth = require("./../middleware/checkAuth.js");
const {
  addDailyEntry,
  editDailyEntry,
  getEntries,
  clearEntries,
  deleteEntry
} = require("./../controllers/entry.js");

const router = express.Router();

router.post("/task/:taskId/daily-entry", checkAuth, addDailyEntry);
router.patch("/task/:taskId/daily-entry/:entryId", checkAuth, editDailyEntry);
router.delete("/task/:taskId/daily-entry/:entryId", checkAuth, deleteEntry);
router.get("/task/:taskId/daily-entries", checkAuth, getEntries);
router.delete("/task/:taskId/daily-entries", checkAuth, clearEntries);

module.exports = router;
