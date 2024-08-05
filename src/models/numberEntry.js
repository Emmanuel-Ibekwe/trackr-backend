const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const numberEntrySchema = new Schema(
  {
    taskId: {
      type: ObjectId,
      ref: "Task",
      required: true
    },
    value: { type: Number, required: true },
    isBreakDay: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    comment: { type: String, default: "" },
    date: {
      type: Date,
      required: true,
      validate: {
        validator: async function(date) {
          const NumberEntry = mongoose.model("NumberEntry", numberEntrySchema);

          if (!this.isNew) return true;
          // Check if there's already an entry with the same date and taskId
          const existingNumberEntry = await NumberEntry.findOne({
            date: { $eq: date },
            taskId: { $eq: this.taskId }
          });
          return !existingNumberEntry; // Return false if there's an existing entry with the same date and taskId
        },
        message: props => `No two entries can have the same taskId and date. `
      }
    }
  },
  {
    collection: "numberEntries",
    timestamps: true
  }
);

numberEntrySchema.pre("save", async function(next) {
  const NumberEntry = mongoose.model("NumberEntry", numberEntrySchema);
  const newNumberEntryDate = this.date;

  const Task = mongoose.model("Task");

  // Check if this is the first entry for this task
  const existingEntries = await NumberEntry.find({ taskId: this.taskId }).sort({
    date: 1
  });
  const task = await Task.findById(this.taskId);

  if (existingEntries.length === 0) {
    // Fetch the task to compare dates

    if (task && newNumberEntryDate.getTime() !== task.startingDate.getTime()) {
      return next(
        new Error(
          `The first boolean entry date (${
            newNumberEntryDate.toISOString().split("T")[0]
          }) must match the task's starting date (${
            task.startingDate.toISOString().split("T")[0]
          }).`
        )
      );
    }
  }

  // Ensures that the entry is not earlier than the starting date.
  if (newNumberEntryDate.getTime() < task.startingDate.getTime()) {
    return next(
      new Error(
        `The boolean entry date (${
          newNumberEntryDate.toISOString().split("T")[0]
        }) is earlier than the task starting date.`
      )
    );
  }

  // Ensures that the entry is not later than the ending date.
  if (newNumberEntryDate.getTime() > task.endingDate.getTime()) {
    return next(
      new Error(
        `The boolean entry date (${
          newNumberEntryDate.toISOString().split("T")[0]
        }) is later than the task ending date.`
      )
    );
  }

  // Find the most recent numberEntry before the new numberEntry date
  const lastNumberEntry = await NumberEntry.findOne().sort({ date: -1 });

  if (lastNumberEntry) {
    const lastNumberEntryDate = lastNumberEntry.date;
    const dayDiff = Math.ceil(
      (newNumberEntryDate.getTime() - lastNumberEntryDate.getTime()) /
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

numberEntrySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const NumberEntry = mongoose.model("NumberEntry", numberEntrySchema);
module.exports = NumberEntry;
