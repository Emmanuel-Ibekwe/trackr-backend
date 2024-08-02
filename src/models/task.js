const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const validDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

// Regular expression for validating time in HH:MM format (HH: 00-23, MM: 00-59)
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const idealValueValidator = function(v) {
  if (typeof v === "string") {
    // checks if the string is the HH:MM format (HH: 00-23, MM: 00-59)
    return timeRegex.test(v);
  }

  return typeof v === "number" || typeof v === "boolean";
};

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ["number", "minutes", "time", "boolean"]
    },
    userId: {
      type: ObjectId,
      ref: "User",
      required: true
    },
    idealValue: {
      type: Schema.Types.Mixed,
      required: true
    },
    breakDays: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          // Check that the array is not empty
          if (!v || v.length === 0) {
            return true;
          }

          // Check that every item in the array is a valid day
          for (let day of v) {
            if (!validDays.includes(day)) {
              return false;
            }
          }

          return true;
        },
        message: props => `${props.value} is not a day of the week!`
      }
    },
    unit: { type: String, required: true },
    startingDate: { type: Date, required: true },
    endingDate: { type: Date, required: true },
    dateOfLastTaskEntry: { type: Date },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    maxTime: {
      type: String,
      validate: {
        validator: function(v) {
          if (this.type === "time") {
            return v !== null && timeRegex.test(v);
          }
          return true; // If type is not 'time', maxTime can be null or any value
        },
        message: props =>
          `${props.value} is not a valid time! It should be in HH:MM format where HH is 00-23 and MM is 00-59.`
      },
      required: false
    },
    expiresAt: { type: Date, required: true }
  },
  {
    collection: "tasks",
    timestamps: true
  }
);

// Adding a pre-save hook to ensure idealValue type consistency
taskSchema.pre("save", function(next) {
  const task = this;
  switch (task.type) {
    case "number":
    case "minutes":
      if (typeof task.idealValue !== "number") {
        return next(
          new Error(`idealValue must be a number for type ${task.type}`)
        );
      }
      break;
    case "time":
      if (
        typeof task.idealValue !== "string" ||
        !timeRegex.test(task.idealValue)
      ) {
        return next(
          new Error("idealValue must be a string in HH:MM format for type time")
        );
      }
      break;
    case "boolean":
      if (typeof task.idealValue !== "boolean") {
        return next(new Error("idealValue must be a boolean for type boolean"));
      }
      break;
    default:
      return next(new Error("Invalid type"));
  }
  next();
});

taskSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
