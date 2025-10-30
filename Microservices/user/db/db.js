const mongoose = require("mongoose");

function connect() {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("User Service connected to Database");
    })
    .catch((err) => {
      console.error("Error connecting to User Database", err);
    });
}
module.exports = connect;
