const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

// Regular expression for validating time in HH:MM format (HH: 00-23, MM: 00-59)
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const timeEntrySchema = new Schema(
  {
    taskId: {
      type: ObjectId,
      ref: "Task",
      required: true
    },
    value: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return timeRegex.test(v);
        },
        message: props =>
          `${props.value} is not a valid time! It should be in HH:MM format where HH is 00-23 and MM is 00-59.`
      }
    },
    isBreakDay: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    comment: { type: String, default: "" },
    date: {
      type: Date,
      required: true,
      validate: {
        validator: async function(date) {
          const TimeEntry = mongoose.model("TimeEntry", timeEntrySchema);

          if (!this.isNew) return true;
          // Check if there's already an entry with the same date and taskId
          const existingTimeEntry = await TimeEntry.findOne({
            date: { $eq: date },
            taskId: { $eq: this.taskId }
          });
          return !existingTimeEntry; // Return false if there's an existing entry with the same date and taskId
        },
        message: props => `No two entries can have the same taskId and date. `
      }
    }
  },
  {
    collection: "timeEntries",
    timestamps: true
  }
);

timeEntrySchema.pre("save", async function(next) {
  const TimeEntry = mongoose.model("TimeEntry", timeEntrySchema);
  const newTimeEntryDate = this.date;

  const Task = mongoose.model("Task");

  // Check if this is the first entry for this task
  const existingEntries = await TimeEntry.find({ taskId: this.taskId }).sort({
    date: 1
  });
  const task = await Task.findById(this.taskId);

  if (existingEntries.length === 0) {
    // Fetch the task to compare dates

    if (task && newTimeEntryDate.getTime() !== task.startingDate.getTime()) {
      return next(
        new Error(
          `The first boolean entry date (${
            newTimeEntryDate.toISOString().split("T")[0]
          }) must match the task's starting date (${
            task.startingDate.toISOString().split("T")[0]
          }).`
        )
      );
    }
  }

  // Ensures that the entry is not earlier than the starting date.
  if (newTimeEntryDate.getTime() < task.startingDate.getTime()) {
    return next(
      new Error(
        `The boolean entry date (${
          newTimeEntryDate.toISOString().split("T")[0]
        }) is earlier than the task starting date.`
      )
    );
  }

  // Ensures that the entry is not later than the ending date.
  if (newTimeEntryDate.getTime() > task.endingDate.getTime()) {
    return next(
      new Error(
        `The boolean entry date (${
          newTimeEntryDate.toISOString().split("T")[0]
        }) is later than the task ending date.`
      )
    );
  }

  // Find the most recent minutesEntry before the new minutesEntry date
  const lastTimeEntry = await TimeEntry.findOne().sort({ date: -1 });

  if (lastTimeEntry) {
    const lastTimeEntryDate = lastTimeEntry.date;
    const dayDiff = Math.ceil(
      (newTimeEntryDate.getTime() - lastTimeEntryDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Check if there is a gap
    if (dayDiff > 1) {
      return next(
        new Error(
          `There is a gap of ${dayDiff -
            1} days between the last entry and the new entry.`
        )
      );
    }
  }

  next();
});

timeEntrySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const TimeEntry = mongoose.model("TimeEntry", timeEntrySchema);

module.exports = TimeEntry;
