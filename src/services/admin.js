const BooleanEntry = require("../models/booleanEntry");
const MinutesEntry = require("../models/minutesEntry");
const TimeEntry = require("../models/timeEntry");
const NumberEntry = require("../models/numberEntry");

const deleteEntries = async task => {
  if (task.type === "boolean") {
    await BooleanEntry.deleteMany({ taskId: task._id });
  } else if (task.type === "minutes") {
    await MinutesEntry.deleteMany({ taskId: task._id });
  } else if (task.type === "time") {
    await TimeEntry.deleteMany({ taskId: task._id });
  } else if (task.type === "number") {
    await NumberEntry.deleteMany({ taskId: task._id });
  }
};

module.exports = {
  deleteEntries
};
