const mongoose = require("mongoose");
const validator = require("validator");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const specialUserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      validate: [validator.isEmail, "Provide a valid email address"]
    },
    userId: {
      type: ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    collection: "specialUsers",
    timestamps: true
  }
);

const SpecialUser = mongoose.model("specialUser", specialUserSchema);

module.exports = SpecialUser;
