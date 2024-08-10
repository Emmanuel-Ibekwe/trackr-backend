const createHttpError = require("http-errors");
const puppeteer = require("puppeteer");
const Task = require("./../models/task.js");
const User = require("./../models/user.js");
const {
  getWeekBoundaries,
  isISODateString,
  getMonthBoundaries
} = require("./../utils/review.js");

const {
  getBooleanEntriesWeeklyReviewData,
  getNumberEntriesWeeklyReviewData,
  getMinutesEntriesWeeklyReviewData,
  getTimeEntriesWeeklyReviewData,
  getBooleanEntriesCustomReviewData,
  getMinutesEntriesCustomReviewData,
  getNumberEntriesCustomReviewData,
  getTimeEntriesCustomReviewData
} = require("./../services/review.js");

const getWeeklyReview = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { date } = req.query;
    const { userId } = req.user;

    if (!taskId) {
      throw createHttpError.BadRequest("taskId missing");
    }

    if (!date) {
      throw createHttpError.BadRequest("date query missing");
    }

    // checks if date is ISO string format
    if (!isISODateString(date)) {
      throw createHttpError.BadRequest("date not in ISO string format.");
    }

    const weekBoundaries = getWeekBoundaries(date);
    const task = await Task.findById(taskId);

    if (!task) {
      throw createHttpError.NotFound("Task does not exist.");
    }

    if (userId !== task.userId.toString()) {
      throw createHttpError.Unauthorized(
        "User is not authorized to add entries in this task."
      );
    }

    const type = task.type;
    if (type === "boolean") {
      const reviewData = await getBooleanEntriesWeeklyReviewData(
        task,
        taskId,
        weekBoundaries
      );

      res.status(200).json(reviewData);
    } else if (type === "minutes") {
      const reviewData = await getMinutesEntriesWeeklyReviewData(
        task,
        taskId,
        weekBoundaries
      );

      res.status(200).json(reviewData);
    } else if (type === "number") {
      const reviewData = await getNumberEntriesWeeklyReviewData(
        task,
        taskId,
        weekBoundaries
      );

      res.status(200).json(reviewData);
    } else if (type === "time") {
      const reviewData = await getTimeEntriesWeeklyReviewData(
        task,
        taskId,
        weekBoundaries
      );
      res.status(200).json(reviewData);
    }
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

const getMonthlyReview = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { date } = req.query;
    const { userId } = req.user;

    if (!taskId) {
      throw createHttpError.BadRequest("taskId missing");
    }
    if (!date) {
      throw createHttpError.BadRequest("date query missing");
    }

    // checks if date is ISO string format
    if (!isISODateString(date)) {
      throw createHttpError.BadRequest("date not in ISO string format.");
    }

    const monthBoundaries = getMonthBoundaries(date);

    const task = await Task.findById(taskId);

    if (!task) {
      throw createHttpError.NotFound("Task does not exist.");
    }

    if (userId !== task.userId.toString()) {
      throw createHttpError.Unauthorized(
        "User is not authorized to add entries in this task."
      );
    }
    const type = task.type;

    if (type === "boolean") {
      const reviewData = await getBooleanEntriesCustomReviewData(
        task,
        taskId,
        monthBoundaries
      );

      res.status(200).json(reviewData);
    } else if (type === "minutes") {
      const reviewData = await getMinutesEntriesCustomReviewData(
        task,
        taskId,
        monthBoundaries
      );

      res.status(200).json(reviewData);
    } else if (type === "number") {
      const reviewData = await getNumberEntriesCustomReviewData(
        task,
        taskId,
        monthBoundaries
      );

      res.status(200).json(reviewData);
    } else if (type === "time") {
      const reviewData = await getTimeEntriesCustomReviewData(
        task,
        taskId,
        monthBoundaries
      );
      res.status(200).json(reviewData);
    }
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

const getCustomReview = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { startingDate, stopDate } = req.query;
    const { userId } = req.user;

    if (!taskId) {
      throw createHttpError.BadRequest("taskId missing");
    }
    if (!startingDate || !stopDate) {
      throw createHttpError.BadRequest("starting or stop date query missing");
    }

    // checks if date is ISO string format
    if (!isISODateString(startingDate) || !isISODateString(stopDate)) {
      throw createHttpError.BadRequest("dates not in ISO string format.");
    }

    const dateBoundaries = { firstDay: startingDate, lastDay: stopDate };

    const task = await Task.findById(taskId);

    if (!task) {
      throw createHttpError.NotFound("Task does not exist.");
    }

    if (userId !== task.userId.toString()) {
      throw createHttpError.Unauthorized(
        "User is not authorized to add entries in this task."
      );
    }

    const type = task.type;

    if (type === "boolean") {
      const reviewData = await getBooleanEntriesCustomReviewData(
        task,
        taskId,
        dateBoundaries
      );

      res.status(200).json(reviewData);
    } else if (type === "minutes") {
      const reviewData = await getMinutesEntriesCustomReviewData(
        task,
        taskId,
        dateBoundaries
      );

      res.status(200).json(reviewData);
    } else if (type === "number") {
      const reviewData = await getNumberEntriesCustomReviewData(
        task,
        taskId,
        dateBoundaries
      );

      res.status(200).json(reviewData);
    } else if (type === "time") {
      const reviewData = await getTimeEntriesCustomReviewData(
        task,
        taskId,
        dateBoundaries
      );
      res.status(200).json(reviewData);
    }
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

const getOverallReview = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.user;

    if (!taskId) {
      throw createHttpError.BadRequest("taskId missing");
    }

    const task = await Task.findById(taskId);

    if (!task) {
      throw createHttpError.NotFound("Task does not exist.");
    }

    if (userId !== task.userId.toString()) {
      throw createHttpError.Unauthorized(
        "User is not authorized to add entries in this task."
      );
    }

    const dateBoundaries = {
      firstDay: task.startingDate,
      lastDay: task.endingDate
    };

    const type = task.type;

    if (type === "boolean") {
      const reviewData = await getBooleanEntriesCustomReviewData(
        task,
        taskId,
        dateBoundaries
      );

      res.status(200).json(reviewData);
    } else if (type === "minutes") {
      const reviewData = await getMinutesEntriesCustomReviewData(
        task,
        taskId,
        dateBoundaries
      );

      res.status(200).json(reviewData);
    } else if (type === "number") {
      const reviewData = await getNumberEntriesCustomReviewData(
        task,
        taskId,
        dateBoundaries
      );

      res.status(200).json(reviewData);
    } else if (type === "time") {
      const reviewData = await getTimeEntriesCustomReviewData(
        task,
        taskId,
        dateBoundaries
      );
      res.status(200).json(reviewData);
    }
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

const generatePdf = async (req, res, next) => {
  const { url, authToken } = req.body;
  const { taskId } = req.params;
  const userId = req.user.userId;

  if (!url || !authToken) {
    throw createHttpError.BadRequest("Missing required parameters");
  }

  try {
    const user = await User.findById(userId);
    const task = await Task.findById(taskId);

    if (!user) {
      throw createHttpError.NotFound("User not found.");
    }
    if (!task) {
      throw createHttpError.NotFound("Task does not exists.");
    }

    if (userId !== task.userId.toString()) {
      throw createHttpError.Unauthorized(
        "User is not authorized to generate pdf of this review"
      );
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set authentication headers
    await page.setExtraHTTPHeaders({
      Authorization: `Bearer ${authToken}`
    });

    // Navigate to the protected page
    await page.goto(url, { waitUntil: "networkidle2" });

    // Generate the PDF
    const pdfBuffer = await page.pdf({
      format: "A4", // Page size
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "20mm",
        right: "20mm"
      }
    });

    await browser.close();

    // Send the PDF to the client
    res.status(200);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${user.name} Review.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Error generating the PDF";
    }
    next(error);
  }
};

module.exports = {
  getWeeklyReview,
  getMonthlyReview,
  getCustomReview,
  getOverallReview,
  generatePdf
};
