const rideModel = require("../models/ride.model");
const { subscribeToQueue, publishToQueue } = require("../services/rabbit");

module.exports.createRide = async (req, res) => {
  try {
    const { pickup, destination } = req.body;

    const newRide = new rideModel({
      user: req.user._id,
      pickup,
      destination,
    });

    await newRide.save();
    publishToQueue("new-ride", JSON.stringify(newRide));
    res
      .status(201)
      .json({ message: "Ride created successfully", ride: newRide });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error in Controller");
  }
};

module.exports.acceptRide = async (req, res) => {
  const { rideId } = req.query;
  const ride = await rideModel.findById(rideId);

  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  ride.status = "accepted";
  await ride.save();

  publishToQueue("ride-accepted", JSON.stringify(ride));

  res.status(200).json({ message: "Ride accepted", ride });
};
