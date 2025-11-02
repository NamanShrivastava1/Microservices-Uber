const mongoose = require("mongoose");

function connectDB() {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Ride Service connected to Database");
    })
    .catch((error) => {
      console.log("Error connecting to database:", error);
    });
}

module.exports = connectDB;