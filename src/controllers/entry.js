const createHttpError = require("http-errors");
const BooleanEntry = require("./../models/booleanEntry.js");
const TimeEntry = require("./../models/timeEntry.js");
const MinutesEntry = require("../models/minutesEntry.js");
const NumberEntry = require("./../models/numberEntry.js");
const Task = require("./../models/task.js");
const { AreSameDates } = require("./../utils/task.js");
const { getDayOfWeek } = require("../utils/entry.js");

const addDailyEntry = async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const { userId } = req.user;
    let { value, type, isBreakDay, comment, date } = req.body;

    if (value === undefined || isBreakDay === undefined || !type || !date) {
      throw createHttpError.BadRequest("Fill all fields");
    }

    // Set time of date to midnight.
    date = new Date(date);
    date.setHours(0, 0, 0, 0);
    date = date.toISOString();
    comment = comment ? comment : "";

    const task = await Task.findById(taskId);
    if (!task) {
      throw createHttpError.NotFound("Task do not exists.");
    }

    if (userId !== task.userId.toString()) {
      throw createHttpError.Unauthorized(
        "User is not authorized to add entries to this task."
      );
    }

    const typeLowerCase = type.toLowerCase();
    if (task.type !== typeLowerCase) {
      throw createHttpError.BadRequest(
        "The task type do not match the type sent."
      );
    }

    const day = getDayOfWeek(date);
    const taskBreakDays = task.breakDays;

    if (typeLowerCase === "boolean") {
      const expiresAt = task.expiresAt;

      let booleanEntry;
      if (isBreakDay && taskBreakDays.includes(day)) {
        booleanEntry = new BooleanEntry({
          taskId,
          value,
          isBreakDay: true,
          date,
          expiresAt,
          comment
        });
      } else if (isBreakDay && !taskBreakDays.includes(day)) {
        booleanEntry = new BooleanEntry({
          taskId,
          value,
          isBreakDay: true,
          date,
          expiresAt,
          comment
        });
      } else {
        booleanEntry = new BooleanEntry({
          taskId,
          value,
          isBreakDay,
          date,
          expiresAt,
          comment
        });
      }

      await booleanEntry.save();

      task.dateOfLastTaskEntry = new Date(booleanEntry.date);
      const updatedTask = await task.save();
      return res.status(200).json({ entry: booleanEntry, task: updatedTask });
    } else if (typeLowerCase === "time") {
      const expiresAt = task.expiresAt;

      let timeEntry;
      if (isBreakDay && taskBreakDays.includes(day)) {
        timeEntry = await TimeEntry.create({
          taskId,
          value,
          isBreakDay: true,
          expiresAt,
          date,
          comment
        });
      } else if (isBreakDay && !taskBreakDays.includes(day)) {
        timeEntry = await TimeEntry.create({
          taskId,
          value,
          isBreakDay: true,
          expiresAt,
          date,
          comment
        });
      } else {
        timeEntry = new TimeEntry({
          taskId,
          value,
          isBreakDay,
          date,
          expiresAt,
          comment
        });
      }

      await timeEntry.save();
      task.dateOfLastTaskEntry = new Date(date);
      const updatedTask = await task.save();
      return res.status(200).json({ entry: timeEntry, task: updatedTask });
    } else if (typeLowerCase === "minutes") {
      const expiresAt = task.expiresAt;

      let minutesEntry;
      if (isBreakDay && taskBreakDays.includes(day)) {
        minutesEntry = await MinutesEntry.create({
          taskId,
          value,
          isBreakDay: true,
          expiresAt,
          date,
          comment
        });
      } else if (isBreakDay && !taskBreakDays.includes(day)) {
        minutesEntry = await MinutesEntry.create({
          taskId,
          value,
          isBreakDay: true,
          expiresAt,
          date,
          comment
        });
      } else {
        minutesEntry = await MinutesEntry.create({
          taskId,
          value,
          isBreakDay,
          expiresAt,
          date,
          comment
        });
      }

      await minutesEntry.save();
      task.dateOfLastTaskEntry = new Date(date);
      const updatedTask = await task.save();

      return res.status(200).json({ entry: minutesEntry, task: updatedTask });
    } else if (typeLowerCase === "number") {
      const expiresAt = task.expiresAt;

      let numberEntry;
      if (isBreakDay && taskBreakDays.includes(day)) {
        numberEntry = await NumberEntry.create({
          taskId,
          value,
          isBreakDay: true,
          expiresAt,
          date,
          comment
        });
      } else if (isBreakDay && !taskBreakDays.includes(day)) {
        numberEntry = await NumberEntry.create({
          taskId,
          value,
          isBreakDay: true,
          expiresAt,
          date,
          comment
        });
      } else {
        numberEntry = await NumberEntry.create({
          taskId,
          value,
          isBreakDay,
          expiresAt,
          date,
          comment
        });
      }

      await numberEntry.save();

      task.dateOfLastTaskEntry = new Date(date);
      const updatedTask = await task.save();
      return res.status(200).json({ entry: numberEntry, task: updatedTask });
    }
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

const editDailyEntry = async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const entryId = req.params.entryId;
    const { userId } = req.user;
    let { value, type, isBreakDay, comment, date } = req.body;
    if (!taskId) {
      throw createHttpError.BadRequest("taskId missing");
    }

    if (value === undefined || isBreakDay === undefined || !type || !date) {
      throw createHttpError.BadRequest("Fill all fields");
    }

    date = new Date(date);
    date.setHours(0, 0, 0, 0);
    comment = comment ? comment : "";

    const task = await Task.findById(taskId);
    if (!task) {
      throw createHttpError.NotFound("Task do not exists.");
    }

    if (userId !== task.userId.toString()) {
      throw createHttpError.Unauthorized(
        "User is not authorized to edit entries of this task."
      );
    }

    const typeLowerCase = type.toLowerCase();
    if (task.type !== typeLowerCase) {
      throw createHttpError.Conflict(
        "The task type do not match the type sent."
      );
    }

    if (typeLowerCase === "boolean") {
      const booleanEntry = await BooleanEntry.findById(entryId);
      if (!booleanEntry) {
        throw createHttpError.NotFound("Entry does not exists.");
      }

      if (!AreSameDates(booleanEntry.date, date)) {
        throw createHttpError.BadRequest("Date cannot be changed once set.");
      }
      booleanEntry.value = value;
      booleanEntry.isBreakDay = isBreakDay;
      booleanEntry.comment = comment ? comment : "";
      const entry = await booleanEntry.save();

      return res.status(200).json({ entry });
    } else if (typeLowerCase === "time") {
      const timeEntry = await TimeEntry.findById(entryId);

      if (!timeEntry) {
        throw createHttpError.BadRequest("Entry does not exists.");
      }

      if (!AreSameDates(timeEntry.date, date)) {
        throw createHttpError.BadRequest("Date cannot be changed once set.");
      }

      timeEntry.value = value;
      timeEntry.isBreakDay = isBreakDay;
      timeEntry.comment = comment ? comment : "";
      const entry = await timeEntry.save();

      return res.status(200).json({ entry });
    } else if (typeLowerCase === "minutes") {
      const minutesEntry = await MinutesEntry.findById(entryId);
      if (!minutesEntry) {
        throw createHttpError.BadRequest("Entry does not exists.");
      }

      if (!AreSameDates(minutesEntry.date, date)) {
        throw createHttpError.BadRequest("Date cannot be changed once set.");
      }
      minutesEntry.value = value;
      minutesEntry.isBreakDay = isBreakDay;
      minutesEntry.comment = comment ? comment : "";
      const entry = await minutesEntry.save();

      res.status(200).json({ entry });
    } else if (typeLowerCase === "number") {
      const numberEntry = await NumberEntry.findById(entryId);

      if (!numberEntry) {
        throw createHttpError.BadRequest("Entry does not exists.");
      }

      if (!AreSameDates(numberEntry.date, date)) {
        throw createHttpError.BadRequest("Date cannot be changed once set.");
      }

      numberEntry.value = value;
      numberEntry.isBreakDay = isBreakDay;
      numberEntry.comment = comment ? comment : "";
      const entry = await numberEntry.save();
      res.status(200).json({ entry });
    }
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

const ITEMS_PER_PAGE = 8;

const getEntries = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const page = +req.query.page || 1;
    const { userId } = req.user;
    let totalItems;

    if (!taskId) {
      throw createHttpError.BadRequest("taskId not provided");
    }

    const task = await Task.findById(taskId);

    if (!task) {
      throw createHttpError.NotFound("Task not found.");
    }

    if (userId !== task.userId.toString()) {
      throw createHttpError.Unauthorized(
        "User is not authorized to get entries of this task."
      );
    }

    const type = task.type;

    if (type === "boolean") {
      const entries = await BooleanEntry.find({ taskId: taskId })
        .countDocuments()
        .then(numOfDocuments => {
          totalItems = numOfDocuments;
          return BooleanEntry.find({ taskId: taskId })
            .sort({ date: 1 })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
        });
      return res.status(200).json({ entries, totalItems });
    } else if (type === "minutes") {
      const entries = await MinutesEntry.find({ taskId: taskId })
        .countDocuments()
        .then(numOfDocuments => {
          totalItems = numOfDocuments;
          return MinutesEntry.find({ taskId: taskId })
            .sort({ date: 1 })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
        });
      return res.status(200).json({ entries, totalItems });
    } else if (type === "number") {
      const entries = await NumberEntry.find({ taskId: taskId })
        .countDocuments()
        .then(numOfDocuments => {
          totalItems = numOfDocuments;
          return NumberEntry.find({ taskId: taskId })
            .sort({ date: 1 })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
        });
      return res.status(200).json({ entries, totalItems });
    } else if (type === "time") {
      const entries = await TimeEntry.find({ taskId: taskId })
        .countDocuments()
        .then(numOfDocuments => {
          totalItems = numOfDocuments;
          return TimeEntry.find({ taskId: taskId })
            .sort({ date: 1 })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
        });
      return res.status(200).json({ entries, totalItems });
    }
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

const clearEntries = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.user;
    const task = await Task.findById(taskId);

    if (!task) {
      throw createHttpError.NotFound("Task does not exist.");
    }

    if (userId !== task.userId.toString()) {
      throw createHttpError.Unauthorized(
        "User is not authorized to delete entries of this task."
      );
    }
    const type = task.type;
    if (type === "boolean") {
      const result = await BooleanEntry.deleteMany({ taskId: taskId });
      task.dateOfLastTaskEntry = null;
      const updatedTask = await task.save();
      res.status(204).json({});
    } else if (type === "minutes") {
      const result = await MinutesEntry.deleteMany({ taskId: taskId });
      task.dateOfLastTaskEntry = null;
      const updatedTask = await task.save();
      res.status(204).json({});
    } else if (type === "number") {
      const result = await NumberEntry.deleteMany({ taskId: taskId });
      task.dateOfLastTaskEntry = null;
      const updatedTask = await task.save();
      res.status(204).json({});
    } else if (type === "time") {
      const result = await TimeEntry.deleteMany({ taskId: taskId });
      task.dateOfLastTaskEntry = null;
      const updatedTask = await task.save();
      res.status(204).json({});
    }
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

const deleteEntry = async (req, res, next) => {
  try {
    const { entryId, taskId } = req.params;
    const { userId } = req.user;
    // const { taskType } = req.body;
    // const type = taskType;

    if (!entryId || !taskId) {
      throw createHttpError.BadRequest("taskId or entryId missing.");
    }

    const task = await Task.findById(taskId);

    if (!task) {
      throw createHttpError.NotFound("Task does not exist.");
    }

    if (userId !== task.userId.toString()) {
      throw createHttpError.Unauthorized(
        "User is not authorized to delete entries of this task."
      );
    }
    const type = task.type;

    if (type === "boolean") {
      const booleanEntry = await BooleanEntry.findOne().sort({ date: -1 });

      if (!booleanEntry) {
        throw createHttpError.NotFound("entry to be deleted not found");
      }

      if (booleanEntry._id.toString() !== entryId) {
        throw createHttpError.BadRequest(
          "You can only start deleting entries from the last entry."
        );
      }

      if (booleanEntry.taskId.toString() !== task._id.toString()) {
        throw createHttpError.BadRequest(
          "entry to be deleted does not belong to the task which taskId was specified."
        );
      }
      const result = await BooleanEntry.findByIdAndDelete(entryId);
      const currentLastEntry = await BooleanEntry.findOne().sort({ date: -1 });

      task.dateOfLastTaskEntry = currentLastEntry
        ? new Date(currentLastEntry.date)
        : null;
      const updatedTask = await task.save();
      res.status(204).json({});
    } else if (type === "minutes") {
      const minutesEntry = await MinutesEntry.findOne().sort({ date: -1 });

      if (!minutesEntry) {
        throw createHttpError.BadRequest("entry to be deleted not found");
      }

      if (minutesEntry._id.toString() !== entryId) {
        throw createHttpError.BadRequest(
          "You can only start deleting entries from the last entry."
        );
      }

      if (minutesEntry.taskId.toString() !== task._id.toString()) {
        throw createHttpError.BadRequest(
          "entry to be deleted does not belong to the task which taskId was specified."
        );
      }

      const result = await MinutesEntry.findByIdAndDelete(entryId);
      const currentLastEntry = await MinutesEntry.findOne().sort({ date: -1 });

      task.dateOfLastTaskEntry = currentLastEntry
        ? new Date(currentLastEntry.date)
        : null;
      const updatedTask = await task.save();
      res.status(204).json({});
    } else if (type === "number") {
      const numberEntry = await NumberEntry.findOne().sort({ date: -1 });

      if (!numberEntry) {
        throw createHttpError.BadRequest("entry to be deleted not found");
      }

      if (numberEntry._id.toString() !== entryId) {
        throw createHttpError.BadRequest(
          "You can only start deleting entries from the last entry."
        );
      }

      if (numberEntry.taskId.toString() !== task._id.toString()) {
        throw createHttpError.BadRequest(
          "entry to be deleted does not belong to the task which taskId was specified."
        );
      }

      const result = await NumberEntry.findByIdAndDelete(entryId);
      const currentLastEntry = await NumberEntry.findOne().sort({ date: -1 });

      task.dateOfLastTaskEntry = currentLastEntry
        ? new Date(currentLastEntry.date)
        : null;
      const updatedTask = await task.save();
      res.status(204).json({});
    } else if (type === "time") {
      const timeEntry = await TimeEntry.findOne().sort({ date: -1 });

      if (!timeEntry) {
        throw createHttpError.BadRequest("entry to be deleted not found");
      }

      if (timeEntry._id.toString() !== entryId) {
        throw createHttpError.BadRequest(
          "You can only start deleting entries from the last entry."
        );
      }

      if (timeEntry.taskId.toString() !== task._id.toString()) {
        throw createHttpError.BadRequest(
          "entry to be deleted does not belong to the task which taskId was specified."
        );
      }

      const result = await TimeEntry.findByIdAndDelete(entryId);
      const currentLastEntry = await NumberEntry.findOne().sort({ date: -1 });

      task.dateOfLastTaskEntry = currentLastEntry
        ? new Date(currentLastEntry.date)
        : null;
      const updatedTask = await task.save();
      res.status(204).json({});
    }
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

module.exports = {
  addDailyEntry,
  editDailyEntry,
  getEntries,
  clearEntries,
  deleteEntry
};
