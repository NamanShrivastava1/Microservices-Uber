const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const rideRoutes = require('./routes/ride.routes');
const rabbitMq = require('./services/rabbit');
rabbitMq.connect();

app.use('/', rideRoutes);

module.exports = app;