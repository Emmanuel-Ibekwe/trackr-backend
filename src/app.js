const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const createHttpError = require("http-errors");
const expressMongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const cors = require("cors");
const authRoutes = require("./routes/auth.js");
const taskRoutes = require("./routes/task.js");
const reviewRoutes = require("./routes/review.js");
const entryRoutes = require("./routes/entry.js");
const adminRoutes = require("./routes/admin.js");

const app = express();

// Morgan: for http request logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Helmet: for secure express apps by setting various http headers
app.use(helmet());

// app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(expressMongoSanitize());
// app.use(bodyParser.json());

app.use(compression());

app.use(
  cors({
    origin: "http://localhost:3000"
  })
);

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Express API for Trackr webapp backend.",
    version: "1.0.0",
    description:
      "This is a REST API application made with Express. It retrieves data from Trackr webapp backend.",
    license: {
      name: "Licensed Under MIT",
      url: "https://spdx.org/licenses/MIT.html"
    },
    contact: {
      name: "Emmanuel Ibekwe",
      email: "ibekweemmanuel007@gmail.com"
    }
  },
  servers: [
    {
      url: "http://localhost:8000/api/v1",
      description: "Development server"
    }
  ]
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ["./src/routes/**.js"]
};

const swaggerSpec = swaggerJSDoc(options);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/", taskRoutes);
app.use("/api/v1/", reviewRoutes);
app.use("/api/v1/", entryRoutes);
app.use("/api/v1/admin/", adminRoutes);
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(async (req, res, next) => {
  next(createHttpError.NotFound("This route does not exist."));
});

app.use(async (error, req, res, next) => {
  console.log(error);
  const status = error.status || 500;
  const message = error.message;

  res.status(status).json({ message: message });
});

module.exports = app;
