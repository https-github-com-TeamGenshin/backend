import express, { Request, Response } from "express";
import cors from "cors";
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

// Cab Route connection
import cabRouter from "./routes/cab";
app.use("/api/cab", cabRouter);

// driver Route connection

// requests Route connection

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
