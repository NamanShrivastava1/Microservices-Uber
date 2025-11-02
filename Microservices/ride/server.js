const app = require("./app");
const connectDB = require("./db/db");

connectDB();

app.listen(3003, () => {
  console.log("Ride Service is running on port 3003");
});
