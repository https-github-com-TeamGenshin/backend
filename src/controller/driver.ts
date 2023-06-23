import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const SecretKey = "lim4yAey6K78dA8N1yKof4Stp9H4A";

import driverModel, { Driver } from "../models/driver";
import userModel from "../models/user";

// login driver by username (email or mobile_no) and password.
export const loginDriverController = async (req: Request, res: Response) => {
  try {
    if (!req.body.username) {
      return res.status(400).json({ message: "Email or Mobile no. not found" });
    } else if (!req.body.password) {
      return res.status(400).json({ message: "Password not found" });
    } else {
      let { username, password } = req.body;
      password = password.trim();

      // find the driver in the database according to mobile_no or email_id.
      const email_id = username.trim();
      const mobile_no = username.trim();

      const driver = await driverModel.findOne({
        $or: [{ email_id }, { mobile_no }],
      });

      // if driver not found.
      if (driver === null) {
        //Error: if driver not found in database.
        return res.status(404).json({ message: "Driver does not exist" });
      } else {
        // Check for the valid password by comparing the hashed password in database.
        const hashedPassword = driver.password;
        bcrypt.compare(password, hashedPassword).then((results) => {
          if (results) {
            // creating the token
            const token = jwt.sign(
              {
                id: driver._id,
                username: driver.username,
                email_id: driver.email_id,
                mobile_no: driver.mobile_no,
                rating: driver.rating,
                experience_years: driver.experience_years,
                location: driver.location,
                rate_per_km: driver.rate_per_km,
                rate_per_hrs: driver.rate_per_hrs,
              },
              SecretKey
            );
            if (token) {
              //Success: if data is found and all operations are done.
              return res.status(200).send({
                message: "Login Successful",
                data: {
                  id: driver._id,
                  username: username,
                },
                token: token,
              });
            } else {
              //Error: if token is not created.
              return res.status(500).json({ message: "Cannot create token" });
            }
          } else {
            //Error: if wrong password is entered.
            return res.status(404).json({ message: "Wrong Password Error" });
          }
        });
      }
    }
  } catch (e) {
    //Error: if something breaks in code.
    return res.status(500).json({ message: "Server Error" });
  }
};

// Verify Driver by token got from frontend.
export const verifyDriverByToken = async (req: Request, res: Response) => {
  try {
    // access the header
    const bearerHeader = req.headers.authorization;
    if (bearerHeader !== undefined) {
      const bearer: string = bearerHeader as string;
      const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
      if (tokenVerify) {
        // Success : Token id
        return res.status(200).send({
          message: "Login by token Successful",
          data: tokenVerify,
        });
      } else {
        // Error : Invalid Token
        res.status(400).json({ message: "Cannot verify token" });
      }
    } else {
      // Error : Token not found
      res.status(400).json({ message: "Token not found" });
    }
  } catch (e) {
    // Error : verifying the token
    return res.status(500).json({ message: "Problem in verifying the token" });
  }
};

// Create Driver in Database Controller
export const createDriverController = async (req: Request, res: Response) => {
  try {
    let {
      username,
      email_id,
      mobile_no,
      gender,
      age,
      password,
      experience_years,
      location,
      vehicle_preferred,
      rate_per_km,
    } = req.body;

    if (
      !username ||
      !email_id ||
      !mobile_no ||
      !gender ||
      !age ||
      !password ||
      !experience_years ||
      !location ||
      !vehicle_preferred ||
      !rate_per_km
    ) {
      //Error anyone details not available.
      return res.status(400).json({ message: "Data Incomplete Error" });
    }

    if (password.length < 8) {
      //Error: password less than 8 characters.
      return res
        .status(400)
        .json({ message: "password less than 8 characters" });
    }

    // checking if the Driver already exists in database.
    email_id = email_id.trim();
    mobile_no = mobile_no.trim();
    password = password.trim();

    const user = await userModel.findOne({
      $or: [{ email_id }, { mobile_no }],
    });

    const driver = await driverModel.findOne({
      $or: [{ email_id }, { mobile_no }],
    });

    if (user !== null || driver !== null) {
      //Error: user or driver exists with that credentials
      return res.status(400).json({ message: "user or driver already Exists" });
    } else {
      // Password Hashing using bcrypt.
      const saltRounds = 10;
      bcrypt
        .hash(password, saltRounds)
        .then((hashedPassword) => {
          // finally creating and saving the user.
          driverModel
            .create({
              username: username,
              email_id: email_id,
              mobile_no: mobile_no,
              gender: gender,
              age: age,
              password: hashedPassword,
              experience_years: experience_years,
              location: location,
              vehicle_preferred: vehicle_preferred,
              rate_per_km: rate_per_km,
              acceptedRequests: [],
              pendingRequests: [],
            })
            .then((driver) => {
              //Success: Returning the Driver Id of the driver.
              return res.status(200).json({
                message: "Driver created successfully",
                data: driver,
              });
            });
        })
        .catch((e) => {
          //Error: in making the hasing password.
          return res
            .status(500)
            .json({ message: "error while hashing the password" });
        });
    }
  } catch (e) {
    //Error: if something breaks in code.
    return res.status(500).json({ message: "Server Error" });
  }
};

// Find driver by id in params...
export const findOneDriverController = async (req: Request, res: Response) => {
  try {
    // access the header
    const bearerHeader = req.headers.authorization;
    if (bearerHeader !== undefined) {
      const bearer: string = bearerHeader as string;
      const tokenVerify = jwt.verify(
        bearer.split(" ")[1],
        SecretKey
      ) as jwt.JwtPayload;
      if (tokenVerify) {
        // finding the driver by id got from the frontend.
        let data = await driverModel.findById({ _id: tokenVerify.id });

        // checking if the driver exists or not.
        if (!data) {
          return res.status(404).json({ message: "driver not found" });
        } else {
          const driver = data;
          //Success: Return the all driver details.
          return res.status(200).json({
            message: "finding one driver is successful",
            data: driver,
          });
        }
      } else {
        //Error: Token not valid.
        return res.status(404).json({ message: "Token not valid" });
      }
    } else {
      //Error: if Header not found.
      return res.status(404).json({ message: "Token not found" });
    }
  } catch (e) {
    //Error: if something breaks in code.
    return res.status(500).json({ message: "Server Error" });
  }
};

// Get all drivers in the database.
export const getAllDriversController = async (req: Request, res: Response) => {
  try {
    // access the header
    const bearerHeader = req.headers.authorization;
    if (bearerHeader !== undefined) {
      const bearer: string = bearerHeader as string;
      const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
      if (tokenVerify) {
        // find all the drivers
        let drivers = await driverModel.find();
        // Success : send all drivers
        return res.json({
          message: "Finding all drivers are successful!",
          data: drivers,
        });
      } else {
        //Error: Token not valid.
        return res.status(404).json({ message: "Token not valid" });
      }
    } else {
      //Error: if Header not found.
      return res.status(404).json({ message: "Token not found" });
    }
  } catch (e) {
    //Error: if something breaks in code.
    return res.status(500).json({ message: "Server Error" });
  }
};

// Get all drivers with respect to type in the database.
export const getDriversbyTypeController = async (
  req: Request,
  res: Response
) => {
  try {
    // access the header
    const bearerHeader = req.headers.authorization;
    if (bearerHeader !== undefined) {
      const bearer: string = bearerHeader as string;
      const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
      if (tokenVerify) {
        const { type } = req.body;
        if (!type) {
          // Error: type not found.
          return res.status(404).json({ message: "Imcompelete Data" });
        } else {
          // find all the drivers
          const drivers = await driverModel.find({
            vehicle_preferred: { $in: [type] },
          });
          // Success : send all drivers
          return res.json({
            message: "Finding all drivers are successful!",
            data: drivers,
          });
        }
      } else {
        //Error: Token not valid.
        return res.status(404).json({ message: "Token not valid" });
      }
    } else {
      //Error: if Header not found.
      return res.status(404).json({ message: "Token not found" });
    }
  } catch (e) {
    //Error: if something breaks in code.
    return res.status(500).json({ message: "Server Error" });
  }
};

// delete Driver in the database by id.
export const deleteDriverController = async (req: Request, res: Response) => {
  try {
    // access the header
    const bearerHeader = req.headers.authorization;
    if (bearerHeader !== undefined) {
      const bearer: string = bearerHeader as string;
      const tokenVerify = jwt.verify(
        bearer.split(" ")[1],
        SecretKey
      ) as jwt.JwtPayload;
      if (tokenVerify) {
        // deleting the Driver by filter.
        let data = await driverModel.findByIdAndDelete({
          _id: tokenVerify.driver,
        });

        // handling if Driver not deleted.
        if (data !== null) {
          //Success: Driver is deleted successfully.
          return res.status(200).json({
            message: "Driver Deleted Successfully",
            data: data,
          });
        } else {
          //Error: Token not valid.
          return res.status(404).json({ message: "Data not found" });
        }
      } else {
        //Error: if Header not found.
        return res.status(404).json({ message: "Token not verified" });
      }
    } else {
      //Error: Driver provided not found in database.
      return res.status(400).json({ message: "Cannot find Driver" });
    }
  } catch (e) {
    //Error: if something breaks in code.
    return res.status(500).json({ message: "Server Error" });
  }
};
