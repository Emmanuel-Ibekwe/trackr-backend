const express = require("express");
const checkAuth = require("./../middleware/checkAuth.js");
const {
  getWeeklyReview,
  getMonthlyReview,
  getCustomReview,
  getOverallReview
} = require("../controllers/review.js");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     WeeklyReviewData:
 *       type: object
 *       properties:
 *         firstDayOfWeek:
 *           type: string
 *           description: starting date of review data to be fetched
 *           example: 2024-06-30T23:00:00.000Z
 *         entries:
 *           type: array
 *           items:
 *             allOf:
 *               - $ref: '#/components/schemas/Entry'
 *               - $ref: '#/components/schemas/OtherEntryDetails'
 *         breakDaysEntriesLength:
 *           type: number
 *           description: number of days the user was on break
 *           example: 4
 *         breakDays:
 *           type: array
 *           items:
 *             type: string
 *             enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
 *             description: Days of the week that are break days
 *             example: Sunday
 *         weeklyAverage:
 *           type: number
 *           description: the weekly average of the quantitative work done in the week
 *           example: 8
 *           nullable: true
 *         lowestValue:
 *           oneOf:
 *             - type: number
 *             - type: string
 *             - type: boolean
 *           description: lowest quantitative value of entries entered in a week
 *           example: 3
 *           nullable: true
 *         highestValue:
 *           oneOf:
 *             - type: number
 *             - type: string
 *             - type: boolean
 *           description: lowest quantitative value of entries entered in a week
 *           example: 10
 *           nullable: true
 *         workDayEntries:
 *           description: an array of entries made within the week
 *           type: array
 *           items:
 *             allOf:
 *               - $ref: '#/components/schemas/Entry'
 *               - $ref: '#/components/schemas/OtherEntryDetails'
 *         weeklyCummulative:
 *           type: number
 *           description: Cummulative of the quantitative amount of work done within a week
 *           example: 57
 *         idealCummulative:
 *           oneOf:
 *             - type: number
 *             - type: string
 *             - type: boolean
 *           description: The ideal cummulative of the quantitative amount of work done within a week
 *           example: 70
 *         idealValue:
 *           oneOf:
 *             - type: number
 *             - type: string
 *             - type: boolean
 *           description: Ideal quantitative amount of work of a task to be done per day
 *           example: 10
 *         unit:
 *           type: string
 *           description: unit of measurement of the work of a task done
 *           nullable: true
 *           example: pages
 *         score:
 *           type: number
 *           description: Score of a user in a task within a week
 *           example: 78.6
 *     CustomReviewData:
 *       type: object
 *       properties:
 *         firstDayOfMonth:
 *           type: string
 *           description: starting date of review data to be fetched
 *           example: 2024-06-30T23:00:00.000Z
 *         entries:
 *           type: array
 *           items:
 *             allOf:
 *               - $ref: '#/components/schemas/Entry'
 *               - $ref: '#/components/schemas/OtherEntryDetails'
 *         breakDaysEntriesLength:
 *           type: number
 *           description: Number of day the user was on break
 *           example: 5
 *         breakDays:
 *           type: array
 *           items:
 *             type: string
 *             enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
 *             description: Days of the week that are break days
 *             example: Sunday
 *         averageValue:
 *           type: number
 *           description: Average quantitative amount of work done per day in within a time period of a task
 *           example: 30
 *           nullable: true
 *         lowestValue:
 *           type: number
 *           description: Lowest quantitative amount of work done within a time period of a task
 *           example: 20
 *         highestValue:
 *           type: number
 *           description: Biggest quantitative amount of work done within a time period of a task
 *           example: 35
 *         workDayEntries:
 *           type: array
 *           description: Entries on days meant for work
 *           items:
 *             allOf:
 *               - $ref: '#/components/schemas/Entry'
 *               - $ref: '#/components/schemas/OtherEntryDetails'
 *         cummulative:
 *           type: number
 *           description: Cummulative quantitative amount of work of a task to be done within a time period
 *           example: 378
 *         idealCummulative:
 *           type: number
 *           description: Ideal cummulative quantitative amount of work of a task to be done within a time period
 *           example: 400
 *         idealValue:
 *           oneOf:
 *             - type: number
 *             - type: string
 *             - type: boolean
 *           description: Ideal quantitative amount of work of a task to be done per day
 *           example: 30
 *         unit:
 *           type: string
 *           description: Unit of the quantitative amount of work of a task done
 *           example: pages
 *         score:
 *           type: number
 *           description: Score of the user in a task within a timeframe
 *           example: 89.4
 */

/**
 * @swagger
 * /api/v1/task/{taskId}/weekly-review?date=2024-07-31T19:23:36.134Z:
 *   get:
 *     summary: Endpoint for fetching the weekly review of a user in a task
 *     description: Endpoint for fetching the weekly review of a user in a task
 *     parameters:
 *       - in: path
 *         required: true
 *         name: taskId
 *         description: ID of the task whose review is to be fetched
 *         schema:
 *           type: string
 *       - in: query
 *         required: true
 *         name: date
 *         description: date of a day in the week whose review is to be fetched. date must be in ISOString
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: weekly review retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WeeklyReviewData'
 *       400:
 *         description: date query missing || date not in ISO string format.
 *       404:
 *         description: Task does not exist.
 *       401:
 *         description: User is not authorized to add entries in this task.
 */

router.get("/task/:taskId/weekly-review", checkAuth, getWeeklyReview);

/**
 * @swagger
 * /api/v1/task/{taskId}/monthly-review?date=2024-07-31T19:23:36.134Z:
 *   get:
 *     summary: Endpoint for getting the monthly review of a user in a particular task
 *     description: Endpoint for getting the monthly review of a user in a particular task
 *     parameters:
 *       - in: path
 *         required: true
 *         name: taskId
 *         description: ID of the task whose review is to be fetched
 *         schema:
 *           type: string
 *       - in: query
 *         required: true
 *         name: date
 *         description: date of a day in the month whose review is to be fetched. date must be in ISOString
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Monthly review fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomReviewData'
 *       400:
 *         description: taskId missing || date query missing || date not in ISO string format.
 *       404:
 *         description: Task does not exist.
 *       401:
 *         description: User is not authorized to add entries in this task.
 *
 */

router.get("/task/:taskId/monthly-review", checkAuth, getMonthlyReview);

/**
 * @swagger
 * /api/v1/task/{taskId}/custom-review?startingDate=2024-07-31T19:23:36.134Z&stopDate=2024-07-26T23:00:00.000Z:
 *   get:
 *     summary: Endpoint for fetching the review of a user's task within a custom time frame
 *     description: Endpoint for fetching the review of a user's task within a custom time frame
 *     parameters:
 *       - in: path
 *         required: true
 *         name: taskId
 *         description: ID of the task whose review is to be fetched
 *         schema:
 *           type: string
 *       - in: query
 *         required: true
 *         name: startingDate
 *         description: Starting date of the review to be fetched
 *         schema:
 *           type: string
 *       - in: query
 *         required: true
 *         name: stopDate
 *         description: Ending date of the review to be fetched
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomReviewData'
 *       400:
 *         description: taskId missing || starting or stop date query missing || date not in ISO string format.
 *       404:
 *         description: Task does not exist.
 *       401:
 *         description: User is not authorized to add entries in this task.
 *
 */

router.get("/task/:taskId/custom-review", checkAuth, getCustomReview);

/**
 * @swagger
 * /api/v1/task/{taskId}/overall-review:
 *   get:
 *     summary: Endpoint for the fetching the overall review of a user's task
 *     description: Endpoint for the fetching the overall review of a user's task
 *     parameters:
 *       - in: path
 *         required: true
 *         name: taskId
 *         description: ID of task whose review is to be fetched
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomReviewData'
 *       400:
 *         description: taskId missing
 *       404:
 *         description: Task does not exist.
 *       401:
 *         description: User is not authorized to add entries in this task.
 *
 *
 */

router.get("/task/:taskId/overall-review", checkAuth, getOverallReview);

module.exports = router;
