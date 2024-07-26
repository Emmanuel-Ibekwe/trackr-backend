const mongoose = require("mongoose");
const validator = require("validator");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name field is missing"]
    },
    email: {
      type: String,
      required: [true, "email field is missing"],
      unique: [true, "This email address already exists"],
      lowercase: true,
      validate: [validator.isEmail, "Provide a valid email address"]
    },
    picture: {
      type: String,
      default:
        "https://res.cloudinary.com/dkd5jblv5/image/upload/v1675976806/Default_ProfilePicture_gjngnb.png"
    },
    password: {
      type: String,
      required: [true, "Please provide a password"]
      // minLength: [8, "Password must be at least six characters long"],
      // maxLength: [128, "Password must be atmost 128 characters long"]
    }
  },
  {
    collection: "users",
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
