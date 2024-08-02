const createHttpError = require("http-errors");
const Task = require("../models/task.js");
const { capitalizeFirstLetter } = require("./../utils/formatting.js");
const { AreSameDates, isDateLessThanOrEqual } = require("./../utils/task.js");
const BooleanEntry = require("../models/booleanEntry.js");
const MinutesEntry = require("../models/minutesEntry.js");
const NumberEntry = require("./../models/numberEntry.js");
const TimeEntry = require("./../models/timeEntry.js");
const User = require("./../models/user.js");
const dotenv = require("dotenv");
const SpecialUser = require("./../models/specialUser.js");

dotenv.config();

const addTask = async (req, res, next) => {
  try {
    const {
      title,
      type,
      unit,
      breakDays,
      startingDate,
      endingDate,
      idealValue,
      maxTime,
      description
    } = req.body;

    const { userId } = req.user;

    if (!userId) {
      throw createHttpError.BadRequest("user id not provided");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw createHttpError.NotFound("User does not exist.");
    }

    if (
      !title ||
      !type ||
      !startingDate ||
      !idealValue ||
      !unit ||
      !breakDays
    ) {
      throw createHttpError.BadRequest("fill all fields");
    }

    // Suppose currentDate is your Date object
    let maxDate = new Date();

    // Get the current month
    let currentMonth = maxDate.getMonth();

    // Add 3 months
    maxDate.setMonth(currentMonth + 3);
    maxDate.setHours(0, 0, 0, 0);

    let updatedStartingDate = new Date(startingDate);
    updatedStartingDate.setHours(0, 0, 0, 0);
    updatedStartingDate = updatedStartingDate.toISOString();

    let updatedEndingDate;
    if (endingDate) {
      updatedEndingDate = new Date(endingDate);
      updatedEndingDate.setHours(0, 0, 0, 0);
      updatedEndingDate = updatedEndingDate.toISOString();
    }

    const specialUsers = await SpecialUser.find({}).lean();
    const specialEmails = specialUsers.map(el => el.email);

    const task = new Task({
      title: title.toLowerCase(),
      unit: unit.toLowerCase(),
      type: type.toLowerCase(),
      userId,
      breakDays: breakDays.map(day => capitalizeFirstLetter(day.toLowerCase())),
      startingDate: updatedStartingDate,
      endingDate: endingDate ? updatedEndingDate : maxDate,
      description: description || "",
      dateOfLastTaskEntry: null,
      expiresAt: specialEmails.includes(user.email)
        ? updatedEndingDate
        : maxDate,
      idealValue,
      maxTime: maxTime || null
    });

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

const editTask = async (req, res, next) => {
  try {
    const {
      title,
      type,
      unit,
      breakDays,
      description,
      startingDate,
      endingDate,
      idealValue,
      maxTime
    } = req.body;
    const { userId } = req.user;

    const taskId = req.params.taskId;
    if (
      !startingDate ||
      !title ||
      !idealValue ||
      !unit ||
      !type ||
      !breakDays
    ) {
      throw createHttpError.BadRequest("Some fields are missing");
    }

    const capitalizedBreakDays = breakDays.map(day =>
      capitalizeFirstLetter(day.toLowerCase())
    );

    const updatedStartingDate = new Date(startingDate);
    updatedStartingDate.setHours(0, 0, 0, 0);

    let updatedEndingDate;
    if (endingDate) {
      updatedEndingDate = new Date(endingDate);
      updatedEndingDate.setHours(0, 0, 0, 0);
    }

    const typeLowerCase = type.toLowerCase();
    const task = await Task.findById(taskId);

    if (!task) {
      throw createHttpError.NotFound("Task not found");
    }

    if (userId !== task.userId.toString()) {
      throw createHttpError.Unauthorized(
        "User is not authorized to add entries in this task."
      );
    }

    // if (task.dateOfLastTaskEntry !== null && type !== task.type) {
    //   throw createHttpError.BadRequest(
    //     "Type cannot be changed since an item has been created."
    //   );
    // }

    if (isDateLessThanOrEqual(endingDate, task.dateOfLastTaskEntry)) {
      throw createHttpError.BadRequest(
        "ending date cannot be set to a date earlier than the last task entry entered"
      );
    }

    if (task.dateOfLastTaskEntry !== null) {
      if (
        updatedStartingDate.getTime() !== task.startingDate.getTime() ||
        typeLowerCase !== task.type ||
        idealValue !== task.idealValue
      ) {
        throw createHttpError.BadRequest(
          "startingDate, type, and idealValue cannot be changed since at least a daily entry has been made."
        );
      }
    }

    task.title = title.toLowerCase();
    task.unit = unit.toLowerCase();
    task.type = typeLowerCase;
    task.breakDays = capitalizedBreakDays;
    task.description = description ? description : task.description;
    task.startingDate = updatedStartingDate;
    task.idealValue = idealValue;
    task.maxTime = maxTime || null;
    task.endingDate = endingDate ? updatedEndingDate : task.endingDate;

    await task.save();

    res.status(200).json(task);
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

const getTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const tasks = await Task.find({ userId: userId });
    res.status(200).json(tasks);
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.user;

    if (!taskId) {
      throw createHttpError.BadRequest("taskId not provided");
    }

    const task = await Task.findById(taskId);

    if (!task) {
      throw createHttpError.BadRequest("Task does not exists.");
    }

    if (userId !== task.userId.toString()) {
      throw createHttpError.Unauthorized(
        "User is not authorized to add entries in this task."
      );
    }

    const type = task.type;

    if (type === "boolean") {
      const result = await BooleanEntry.deleteMany({ taskId: taskId });
      const deletedTask = await Task.findByIdAndDelete(taskId);

      res.status(204).json({ message: "Task deleted successfully" });
    } else if (type === "minutes") {
      const result = await MinutesEntry.deleteMany({ taskId: taskId });
      const deletedTask = await Task.findByIdAndDelete(taskId);

      res.status(204).json({ message: "Task deleted successfully" });
    } else if (type === "number") {
      const result = await NumberEntry.deleteMany({ taskId: taskId });
      const deletedTask = await Task.findByIdAndDelete(taskId);

      res.status(204).json({ message: "Task deleted successfully" });
    } else if (type === "time") {
      const result = await TimeEntry.deleteMany({ taskId: taskId });
      const deletedTask = await Task.findByIdAndDelete(taskId);

      res.status(204).json({ message: "Task deleted successfully" });
    }
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

module.exports = {
  addTask,
  editTask,
  getTasks,
  deleteTask
};
