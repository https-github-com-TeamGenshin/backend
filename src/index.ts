import express, { Request, Response } from "express";
import cors from "cors";
require("dotenv").config();
import Pusher from "pusher";

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({ extended: false, limit: 10000, parameterLimit: 6 })
);

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: "ap2",
  useTLS: true,
});

// validation and reset password
import OTPservices from "./otpServices/index";
app.use("/otp", OTPservices);

// Cab Route connection
import cabRouter from "./routes/cab";
app.use("/api/cab", cabRouter);

// driver Route connection
import driverRouter from "./routes/driver";
app.use("/api/driver", driverRouter);

// requests Route connection
import requestsRouter from "./routes/requests";
app.use("/api/request", requestsRouter);

// user Route connection
import userRouter from "./routes/user";
app.use("/api/user", userRouter);

// Connecting to the Mongo DB from config folder
import connects from "./config/db";
connects();

// Listening to the port
app.listen(PORT, () => {
  console.log(`Running on PORT ${PORT}`);
});
