const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const booleanEntrySchema = new Schema(
  {
    taskId: {
      type: ObjectId,
      ref: "Task",
      required: true
    },
    value: { type: Boolean, default: false },
    isBreakDay: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    comment: { type: String, default: "" },
    date: {
      type: Date,
      required: true,
      validate: {
        validator: async function(date) {
          const BooleanEntry = mongoose.model(
            "BooleanEntry",
            booleanEntrySchema
          );

          if (!this.isNew) return true;
          // Check if there's already an entry with the same date and taskId
          const existingBooleanEntry = await BooleanEntry.findOne({
            date: { $eq: date },
            taskId: { $eq: this.taskId }
          });

          return !existingBooleanEntry; // Return false if there's an existing entry with the same date and taskId
        },
        message: props => `No two entries can have the same taskId and date. `
      }
    }
  },
  {
    collection: "booleanEntries",
    timestamps: true
  }
);

booleanEntrySchema.pre("save", async function(next) {
  const BooleanEntry = mongoose.model("BooleanEntry", booleanEntrySchema);
  const newBooleanEntryDate = this.date;

  const Task = mongoose.model("Task");

  // Check if this is the first entry for this task
  const existingEntries = await BooleanEntry.find({ taskId: this.taskId }).sort(
    { date: 1 }
  );
  const task = await Task.findById(this.taskId);

  if (existingEntries.length === 0) {
    // Fetch the task to compare dates

    if (task && newBooleanEntryDate.getTime() !== task.startingDate.getTime()) {
      return next(
        new Error(
          `The first boolean entry date (${
            newBooleanEntryDate.toISOString().split("T")[0]
          }) must match the task's starting date (${
            task.startingDate.toISOString().split("T")[0]
          }).`
        )
      );
    }
  }

  // Ensures that the entry is not earlier than the starting date.
  if (newBooleanEntryDate.getTime() < task.startingDate.getTime()) {
    return next(
      new Error(
        `The boolean entry date (${
          newBooleanEntryDate.toISOString().split("T")[0]
        }) is earlier than the task starting date.`
      )
    );
  }

  // Ensures that the entry is not later than the ending date.
  if (newBooleanEntryDate.getTime() > task.endingDate.getTime()) {
    return next(
      new Error(
        `The boolean entry date (${
          newBooleanEntryDate.toISOString().split("T")[0]
        }) is later than the task ending date.`
      )
    );
  }

  // Find the most recent booleanEntry before the new booleanEntry date
  const lastBooleanEntry = await BooleanEntry.findOne().sort({ date: -1 });

  if (lastBooleanEntry) {
    const lastBooleanEntryDate = lastBooleanEntry.date;
    const dayDiff = Math.ceil(
      (newBooleanEntryDate - lastBooleanEntryDate) / (1000 * 60 * 60 * 24)
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

booleanEntrySchema.index({ date: 1, taskId: 1 }, { unique: true });

booleanEntrySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BooleanEntry = mongoose.model("BooleanEntry", booleanEntrySchema);

module.exports = BooleanEntry;
