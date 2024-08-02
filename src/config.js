require("dotenv").config();

const config = {
  development: {
    databaseUrl: process.env.DATABASE_URL_DEV
  },
  production: {
    databaseUrl: process.env.DATABASE_URL_PROD
  }
};

const environment = process.env.NODE_ENV || "development";

module.exports = config[environment];
