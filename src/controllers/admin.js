const createHttpError = require("http-errors");
const User = require("../models/user.js");
const SpecialUser = require("../models/specialUser.js");
const dotenv = require("dotenv");

dotenv.config();
const { ADMIN_EMAIL } = process.env;

const addSpecialUsers = async (req, res, next) => {
  try {
    const userEmail = req.user.email;
    const { email } = req.body;
    if (userEmail !== ADMIN_EMAIL) {
      throw createHttpError.Unauthorized("Access not authorized.");
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

    res.status(201).json({ specialUser });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(error);
  }
};

module.exports = {
  addSpecialUsers
};
