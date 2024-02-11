const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

// 2. GLOBAL MIDDLEWARE

// Set security HTTP headers
app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit request from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // (1 hr)
  message: "Too many request from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser - reading data from body into req.body
app.use(express.json());

// Data sanitization against NoSql query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// preventing parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "maxGroupSize",
      "price",
      "ratingsAverage",
      "ratingsQuantity",
    ],
  })
);

// serving static files
app.use(express.static(`${__dirname}/public`));

// 3.ROUTES
app.use("/api/v1/tours/", tourRouter);
app.use("/api/v1/users/", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
