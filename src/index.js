const mongoose = require("mongoose");
const app = require("./app.js");
const dotenv = require("dotenv");

dotenv.config();
const { DATABASE_URL2 } = process.env;
const PORT = process.env.PORT || 8000;

mongoose
  .connect(DATABASE_URL2)
  .then(() => {
    console.log("Connected to Mongodb");
  })
  .catch(err => {
    console.log(`Mongodb connection error: ${err}`);
    process.exit(1);
  });

let server;
server = app.listen(PORT, () => {
  console.log(`Server is listening at ${PORT}`);
});
