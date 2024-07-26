const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");

dotenv.config();

module.exports = function checkAuth(req, res, next) {
  try {
    // const authHeader = req.headers["authorization"];
    const authHeader = req.get("Authorization");
    // console.log(authHeader);
    if (!authHeader)
      return next(createHttpError.Unauthorized("Not authorized."));

    const splitArray = authHeader.split(" ");
    const lastItem = splitArray.length - 1;
    const token = authHeader.split(" ")[lastItem];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        return next(createHttpError.Unauthorized("Not authorized."));
      }

      req.user = payload;
    });
    next();
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    next(err);
  }
};
