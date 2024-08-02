const express = require("express");
const {
  addTask,
  editTask,
  getTasks,
  deleteTask
} = require("./../controllers/task.js");
const checkAuth = require("./../middleware/checkAuth.js");

const router = express.Router();

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Endpoint for getting the list of a user's tasks
 *     description: Endpoint for getting the list of a user's tasks
 *     responses:
 *       200:
 *         description: Tasks successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID of the task
 *                   title:
 *                     type: string
 *                     description: Title of the task
 *                     example: Number of pages read
 *                   type:
 *                     type: string
 *                     description: type of the task to be tracked
 *                     example: number
 *                     enum: ["number", "time", "boolean", "minutes"]
 *                   userId:
 *                     type: string
 *                     description: ID of the user
 *                     example: 1234ert67890p098
 *                   idealValue:
 *                     oneOf:
 *                       - type: boolean
 *                       - type: string
 *                       - type: number
 *                     description: optimal value of the measurement of the task being tracked
 *                     example: 30
 *                   breakDays:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
 *                       example: Sunday
 *                   unit:
 *                     type: string
 *                     description: Unit of measurement of the task
 *                     example: pages
 *                   startingDate:
 *                     type: string
 *                     description: Starting date of the task in ISOString format
 *                     example: 2024-09-10T23:00:00.000+00:00
 *                   endingDate:
 *                     type: string
 *                     description: Ending date of the task in ISOString
 *                     example: 2024-09-10T23:00:00.000+00:00
 *                   dateOfLastTaskEntry:
 *                     type: string
 *                     description: Date of the last entry of the task was entered in ISOString
 *                     example: 2024-09-10T23:00:00.000+00:00
 *                   description:
 *                     type: string
 *                     description: Description of the task
 *                     example: Number of pages to be read in a day
 *                   maxTime:
 *                     type: string
 *                     nullable: true
 *                     description: Max time for a time task. This is only applicable to time task
 *                     example: null
 *                   expiresAt:
 *                     type: string
 *                     description: Date in which a task is automatically removed from the database
 *                     example: 2024-07-20T12:15:10.155+00:00
 *                   createdAt:
 *                     type: string
 *                     description: Date when the task was added to the database
 *                     example: 2024-07-20T12:15:10.155+00:00
 *                   updatedAt:
 *                     type: string
 *                     description: Date the task is last updated
 *                     example: 2024-08-20T12:15:10.155+00:00
 */

router.get("/tasks", checkAuth, getTasks);

// endpoint for creating task of type number
/**
 * @swagger
 * /api/v1/task:
 *   post:
 *     summary: Endpoint for creating a new task
 *     description: Endpoint for creating a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the task
 *                 example: Work Arrival Time
 *               type:
 *                 type: string
 *                 description: The type of the task.
 *                 enum: ["number", "boolean", "time", "minutes"]
 *                 example: time
 *               unit:
 *                 type: string
 *                 description: Unit of the measurement of the number task
 *                 example: none
 *               breakDays:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: It is the days of the week
 *                   enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
 *                   example: Sunday
 *               startingDate:
 *                 type: string
 *                 description: The starting date of the task in the format MM/DD/YYYY
 *                 example: 7/23/2024
 *               endingDate:
 *                 type: string
 *                 description: The ending date of the task in the format MM/DD/YYYY. For non-privilege users any ending date set beyond 3 months of the starting date is exactly set to 3 months after the starting date
 *                 example: 7/23/2024
 *               idealValue:
 *                 oneOf:
 *                   - type: number
 *                   - type: string
 *                   - type: boolean
 *                 description: The ideal value or optimal value of the unit used in measuring the task. For task type of time, the time must be in string in the format, HH:MM, where HH represents 0 to 23 and MM represents 0 to 59
 *                 example: "09:00"
 *               description:
 *                 type: string
 *                 description: The description of the task to be measured
 *                 example: Time I arrive at the office
 *               maxTime:
 *                 type: string
 *                 nullable: true
 *                 description: The max time that is permitted in task type. This property is only applicable to task type of "time"
 *                 example: "09:40"
 *     responses:
 *       200:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Auto generated database ID
 *                   example: 678ui9209876yji712
 *                 title:
 *                   type: string
 *                   description: Title of the task
 *                   example: Work Arrival Time
 *                 type:
 *                   type: string
 *                   description: Type of task
 *                   enum: ["number", "boolean", "time", "minutes"]
 *                   example: time
 *                 userId:
 *                   type: string
 *                   description: ID of the user
 *                   example: 2345ty678990i
 *                 unit:
 *                   type: string
 *                   description: Unit of the measurement
 *                   example: none
 *                 breakDays:
 *                    type: array
 *                    items:
 *                      type: string
 *                      description: Days of the week
 *                      enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
 *                      example: Sunday
 *                 startingDate:
 *                   type: string
 *                   description: Starting date of the task in ISOString format
 *                   example: 2024-07-06T15:49:05.191+00:00
 *                 endingDate:
 *                   type: string
 *                   description: Ending date of the task in ISOString format
 *                   example: 2024-07-06T15:49:05.191+00:00
 *                 idealValue:
 *                   type: number
 *                   description: The ideal value of the Task to be carried out each day
 *                   example: "09:00"
 *                 description:
 *                   type: string
 *                   description: The description of the task to be measured.
 *                   example: Time I arrive at the office
 *                 dateOfLastTaskEntry:
 *                   type: string
 *                   nullable: true
 *                   description: The date of the last daily entry in this case of null type
 *                   example: null
 *                 createdAt:
 *                   type: string
 *                   description: Date the task was created in ISOString format. It is auto generated by the database
 *                   example: 2024-07-20T12:15:10.155+00:00
 *                 expiresAt:
 *                   type: string
 *                   description: Date the task will be automatically removed from the database. It is auto generated by the database
 *                   example: 2024-07-20T12:15:10.155+00:00
 *                 updatedAt:
 *                   type: string
 *                   description: Date the task was created in ISOString format. It is auto generated by the database
 *                   example: 2024-07-20T12:15:10.155+00:00
 *                 maxTime:
 *                   type: string
 *                   nullable: true
 *                   description: The max time that is permitted in task type. This property is only applicable to task type of "time"
 *                   example: "09:40"
 *
 *
 *       401:
 *         description: Not authorized.
 *       404:
 *         description: User does not exist.
 *       400:
 *         description: fill all fields
 *       500:
 *         description: idealValue must be a [number, minutes, boolean or time] || Invalid type || **** is not a day of the week!
 */

router.post("/task", checkAuth, addTask);

/**
 * @swagger
 * /api/v1/task/{taskId}:
 *   patch:
 *     summary: Endpoint for editing a task
 *     description: Endpoint for editing a task
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         description: ID to retrieve the task
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the task that was edited
 *                 example: Work Arrival Time
 *               type:
 *                 type: string
 *                 description: The type of the task.
 *                 enum: ["number", "boolean", "time", "minutes"]
 *                 example: time
 *               unit:
 *                 type: string
 *                 description: Unit of the measurement of the number task that was edited
 *                 example: none
 *               breakDays:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: It is the days of the week
 *                   enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
 *                   example: Sunday
 *               startingDate:
 *                 type: string
 *                 description: The starting date of the task in the format MM/DD/YYYY
 *                 example: 7/23/2024
 *               endingDate:
 *                 type: string
 *                 description: The ending date of the task in the format MM/DD/YYYY. For non-privilege users any ending date set beyond 3 months of the starting date is exactly set to 3 months after the starting date
 *                 example: 7/23/2024
 *               idealValue:
 *                 oneOf:
 *                   - type: number
 *                   - type: string
 *                   - type: boolean
 *                 description: The ideal value or optimal value of the unit used in measuring the task. For task type of time, the time must be in string in the format, HH:MM, where HH represents 0 to 23 and MM represents 0 to 59
 *                 example: "09:00"
 *               description:
 *                 type: string
 *                 description: The description of the task to be measured
 *                 example: Time I arrive at the office
 *               maxTime:
 *                 type: string
 *                 nullable: true
 *                 description: The max time that is permitted in task type. This property is only applicable to task type of "time"
 *                 example: "09:40"
 *     responses:
 *       200:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Auto generated database ID
 *                   example: 678ui9209876yji712
 *                 title:
 *                   type: string
 *                   description: Title of the task
 *                   example: Work Arrival Time
 *                 type:
 *                   type: string
 *                   description: Type of task
 *                   enum: ["number", "boolean", "time", "minutes"]
 *                   example: time
 *                 unit:
 *                   type: string
 *                   description: Unit of the measurement
 *                   example: none
 *                 userId:
 *                   type: string
 *                   description: ID of the user
 *                   example: 2345ty678990i
 *                 breakDays:
 *                    type: array
 *                    items:
 *                      type: string
 *                      description: Days of the week
 *                      enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
 *                      example: Sunday
 *                 startingDate:
 *                   type: string
 *                   description: Starting date of the task in ISOString format
 *                   example: 2024-07-06T15:49:05.191+00:00
 *                 endingDate:
 *                   type: string
 *                   description: Ending date of the task in ISOString format
 *                   example: 2024-07-06T15:49:05.191+00:00
 *                 idealValue:
 *                   oneOf:
 *                     - type: number
 *                     - type: boolean
 *                     - type: string
 *                   description: The ideal value of the Task to be carried out each day
 *                   example: "09:00"
 *                 description:
 *                   type: string
 *                   description: The description of the task to be measured.
 *                   example: Time I arrive at the office
 *                 dateOfLastTaskEntry:
 *                   type: string
 *                   nullable: true
 *                   description: The date of the last daily entry in this case of null type
 *                   example: 2024-07-06T15:49:05.191+00:00
 *                 createdAt:
 *                   type: string
 *                   description: Date the task was created in ISOString format. It is auto generated by the database
 *                   example: 2024-07-20T12:15:10.155+00:00
 *                 expiresAt:
 *                   type: string
 *                   description: Date the task will be automatically removed from the database. It is auto generated by the database
 *                   example: 2024-07-20T12:15:10.155+00:00
 *                 updatedAt:
 *                   type: string
 *                   description: Date the task was created in ISOString format. It is auto generated by the database
 *                   example: 2024-07-20T12:15:10.155+00:00
 *                 maxTime:
 *                   type: string
 *                   nullable: true
 *                   description: The max time that is permitted in task type. This property is only applicable to task type of "time"
 *                   example: "09:40"
 *
 *
 *       401:
 *         description: User is not authorized to add entries in this task.
 *       404:
 *         description: Task not found
 *       400:
 *         description: Some fields are missing || ending date cannot be set to a date earlier than the last task entry entered || startingDate, type, and idealValue cannot be changed since at least a daily entry has been made.
 *       500:
 *         description: idealValue must be a [number, minutes, boolean or time] || Invalid type || **** is not a day of the week!
 */

router.patch("/task/:taskId", checkAuth, editTask);

/**
 * @swagger
 * /api/v1/task/{taskId}:
 *   delete:
 *     summary: Endpoint for deleting a task
 *     description: Endpoint for deleting a task
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         description: ID to retrieve the task
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Task deleted successfully
 *       400:
 *         description: taskId not provided
 *       401:
 *         description: User is not authorized to add entries in this task.
 *       404:
 *         description: Task does not exists.
 *
 *
 */
router.delete("/task/:taskId", checkAuth, deleteTask);

module.exports = router;
