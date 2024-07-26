const express = require("express");
const checkAuth = require("./../middleware/checkAuth.js");
const {
  getWeeklyReview,
  getMonthlyReview,
  getCustomReview,
  getOverallReview
} = require("../controllers/review.js");

const router = express.Router();

router.get("/task/:taskId/weekly-review", checkAuth, getWeeklyReview);
router.get("/task/:taskId/monthly-review", checkAuth, getMonthlyReview);
router.get("/task/:taskId/custom-review", checkAuth, getCustomReview);
router.get("/task/:taskId/overall-review", checkAuth, getOverallReview);

module.exports = router;
