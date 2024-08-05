const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const minutesEntrySchema = new Schema(
  {
    taskId: {
      type: ObjectId,
      ref: "Task",
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    isBreakDay: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    comment: { type: String, default: "" },
    date: {
      type: Date,
      required: true,
      validate: {
        validator: async function(date) {
          const MinutesEntry = mongoose.model(
            "MinutesEntry",
            minutesEntrySchema
          );

          if (!this.isNew) return true;
          // Check if there's already an entry with the same date and taskId
          const existingMinutesEntry = await MinutesEntry.findOne({
            date: { $eq: new Date(date) },
            taskId: { $eq: this.taskId }
          });
          console.log("taskId", this.taskId);
          console.log("date", date);
          console.log("existingMinutesEntry", existingMinutesEntry);
          return !existingMinutesEntry; // Return false if there's an existing entry with the same date and taskId
        },
        message: props => `No two entries can have the same taskId and date. `
      }
    }
  },
  {
    collection: "minutesEntries",
    timestamps: true
  }
);

minutesEntrySchema.pre("save", async function(next) {
  const MinutesEntry = mongoose.model("MinutesEntry", minutesEntrySchema);

  const newMinutesEntryDate = this.date;

  const Task = mongoose.model("Task");

  // Check if this is the first entry for this task
  const existingEntries = await MinutesEntry.find({ taskId: this.taskId }).sort(
    { date: 1 }
  );
  const task = await Task.findById(this.taskId);

  if (existingEntries.length === 0) {
    // Fetch the task to compare dates

    if (task && newMinutesEntryDate.getTime() !== task.startingDate.getTime()) {
      return next(
        new Error(
          `The first boolean entry date (${
            newMinutesEntryDate.toISOString().split("T")[0]
          }) must match the task's starting date (${
            task.startingDate.toISOString().split("T")[0]
          }).`
        )
      );
    }
  }

  // Ensures that the entry is not earlier than the starting date.
  if (newMinutesEntryDate.getTime() < task.startingDate.getTime()) {
    return next(
      new Error(
        `The boolean entry date (${
          newMinutesEntryDate.toISOString().split("T")[0]
        }) is earlier than the task starting date.`
      )
    );
  }

  // Ensures that the entry is not later than the ending date.
  if (newMinutesEntryDate.getTime() > task.endingDate.getTime()) {
    return next(
      new Error(
        `The boolean entry date (${
          newMinutesEntryDate.toISOString().split("T")[0]
        }) is later than the task ending date.`
      )
    );
  }

  // Find the most recent minutesEntry before the new minutesEntry date
  const lastMinutesEntry = await MinutesEntry.findOne().sort({ date: -1 });

  if (lastMinutesEntry) {
    const lastMinutesEntryDate = lastMinutesEntry.date;
    const dayDiff = Math.ceil(
      (newMinutesEntryDate.getTime() - lastMinutesEntryDate.getTime()) /
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

minutesEntrySchema.index({ date: 1, taskId: 1 }, { unique: true });
minutesEntrySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const MinutesEntry = mongoose.model("MinutesEntry", minutesEntrySchema);

module.exports = MinutesEntry;
