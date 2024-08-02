const createHttpError = require("http-errors");
const User = require("../models/user.js");
const Task = require("../models/task.js");
const SpecialUser = require("../models/specialUser.js");
const { deleteEntries } = require("../services/admin");
const dotenv = require("dotenv");

dotenv.config();
const { ADMIN_EMAIL } = process.env;

const addSpecialUsers = async (req, res, next) => {
  try {
    const userEmail = req.user.email;
    const { email } = req.body;
    if (userEmail !== ADMIN_EMAIL) {
      throw createHttpError.Unauthorized(
        "Access not authorized. User not an admin."
      );
    }

    if (!email) {
      throw createHttpError.BadRequest("email not provided.");
    }

    const userToAdded = await User.findOne({ email: email });

    if (!userToAdded) {
      throw createHttpError.BadRequest("User not registered.");
    }

    const prevSpecialUser = await SpecialUser.findOne({ email: email });

    if (prevSpecialUser) {
      throw createHttpError.BadRequest("User already added.");
    }

    const user = new SpecialUser({
      userId: userToAdded._id.toString(),
      email: userToAdded.email
    });

    const specialUser = await user.save();

    res.status(201).json(specialUser);
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const userEmail = req.user.email;
    const { email } = req.body;
    let result, taskId;
    if (userEmail !== ADMIN_EMAIL) {
      throw createHttpError.Unauthorized(
        "Access not authorized. User not an admin."
      );
    }
    if (!email) {
      throw createHttpError.BadRequest("email not provided.");
    }

    const user = await User.findOne({ email: email });

    if (user) {
      const specialUser = await SpecialUser.findOne({ email: email });
      if (specialUser) {
        result = await SpecialUser.findByIdAndDelete(specialUser._id);
      }

      const tasks = await Task.find({ userId: user._id });

      if (tasks.length !== 0) {
        tasks.forEach(deleteEntries);
      }
      tasks.forEach(async task => {
        await Task.findByIdAndDelete(task._id);
      });

      result = await User.findByIdAndDelete(user._id);
      res.status(204).json({});
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

module.exports = {
  addSpecialUsers,
  deleteUser
};
