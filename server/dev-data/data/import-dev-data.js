const dotenv = require("dotenv");
const fs = require("fs");
const mongoose = require("mongoose");
const Tour = require("../../models/TourModel");

dotenv.config({path: "../../config.env"});
console.log("DATABASE======>", process.env.DATABASE);
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

// Read JSON file

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));

// Import Data into DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log("Data successfully loaded!");
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// Delete all documents from DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("Data deleted successfully!");
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
