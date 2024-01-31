const dotenv = require("dotenv");
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({path: "./config.env"});
const app = require("./app");

const DB = process.env.DATABASE.replace("<password>", process.env.DB_PASSWORD);

mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false
  })
  .then((con) => {
    console.log("DB connection successful");
  });

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log("Running on Port: ", PORT);
});

// Global Promise rejection handler
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDELED REJECTION! Shutting down...");

  // server.close  =>  to giving time to server to finish all pending requests, then close the server
  server.close(() => {
    process.exit(1);
  });
});
