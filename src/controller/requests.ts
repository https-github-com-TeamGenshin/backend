import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const SecretKey = "lim4yAey6K78dA8N1yKof4Stp9H4A";
import corn from "node-cron";

import driverModel, { Driver, Location } from "../models/driver";
import userModel, { User } from "../models/user";
import RequestModel from "../models/requests";
import cabModel, { CabDetails } from "../models/cab";

export const getRequestsController = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    if (bearerHeader !== undefined) {
      const bearer: string = bearerHeader as string;
      const tokenVerify = jwt.verify(
        bearer.split(" ")[1],
        SecretKey
      ) as jwt.JwtPayload;
      if (tokenVerify) {
        const driver = await driverModel.exists({ _id: tokenVerify.id });
        const user = await userModel.exists({ _id: tokenVerify.id });

        if (driver || user) {
          // Take out data
          const { request_id } = req.body;
          if (!request_id) {
            // Check if all the fields are filled
            return res
              .status(400)
              .json({ error: "Please fill all the fields" });
          } else {
            const Request = await RequestModel.findById({ _id: request_id });
            if (!Request) {
              // Check if the request exists
              return res.status(400).json({ error: "No such request exists" });
            } else {
              return res.status(201).json({
                message: "Successfully fetched the request",
                data: Request,
              });
            }
          }
        } else {
          return res
            .status(400)
            .json({ error: "No such user or driver exists" });
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

export const createRequestController = async (req: Request, res: Response) => {
  // try {
  const bearerHeader = req.headers.authorization;
  if (bearerHeader !== undefined) {
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      const driver = await driverModel.exists({ _id: tokenVerify.id });
      const user = await userModel.exists({ _id: tokenVerify.id });

      if (driver || user) {
        const {
          location,
          user_id,
          driver_id,
          type,
          cab_id,
          model_no,
          kms,
          time_required,
          total_amount,
          start_date,
        }: {
          request_type: string;
          location: Location;
          user_id: string;
          driver_id: string;
          type: string;
          cab_id: string;
          model_no: string;
          total_amount: string;
          kms: number;
          time_required: Date;
          start_date: Date;
        } = req.body;

        type RequestData = {
          error: string;
          registrationNumber: string;
          user: (User & { _id: any }) | null;
          driver: (Driver & { _id: any }) | null;
        };

        const somenecessaryfields = async (): Promise<RequestData> => {
          const cab = await cabModel.findById({ _id: cab_id });

          const cabDetails = cab?.cabs.filter((cab) => {
            return cab.model_no === model_no;
          });

          if (!cabDetails || cabDetails.length === 0) {
            // Check if the cab exists
            return {
              error: "Error in cab details",
              registrationNumber: "",
              user: null,
              driver: null,
            };
          } else {
            // find the driver and check if he is available
            const driver = await driverModel.findById({ _id: driver_id });
            if (!driver) {
              return {
                error: "No such driver exists",
                registrationNumber: "",
                user: null,
                driver: null,
              };
            } else if (driver.availability === false) {
              return {
                error: "Driver is not available",
                registrationNumber: "",
                user: null,
                driver: null,
              };
            }

            // find the user and check if he has a pending request
            const user = await userModel.findById({ _id: user_id });
            if (!user) {
              return {
                error: "No such user exists",
                registrationNumber: "",
                user: null,
                driver: null,
              };
            } else if (user.pending_request.length !== 0) {
              return {
                error: "User already has a pending request",
                registrationNumber: "",
                user: null,
                driver: null,
              };
            }

            // create the request
            const registrationNumber =
              cabDetails[0].registration_number[
                Math.floor(
                  Math.random() * cabDetails[0].registration_number.length
                )
              ];

            const newRegistrationNumbers =
              cabDetails[0].registration_number.filter((regNo) => {
                return regNo !== registrationNumber;
              });

            cabDetails[0].registration_number = newRegistrationNumbers;
            cabDetails[0].no_of_seats = cabDetails[0].no_of_seats - 1;

            return {
              error: "No Errors",
              registrationNumber: registrationNumber,
              user: user,
              driver: driver,
            };
          }
        };

        if (kms) {
          if (
            !user_id ||
            !driver_id ||
            !type ||
            !cab_id ||
            !model_no ||
            !total_amount ||
            !location ||
            !start_date
          ) {
            // Check if all the fields are filled
            return res
              .status(400)
              .json({ error: "Please fill all the fields" });
          } else {
            const { registrationNumber, user, driver, error } =
              await somenecessaryfields();

            if (error !== "No Errors" || !driver || !user) {
              return res.status(400).json({ message: error });
            }
            // Create the request with the retrieved registration number
            const request = await RequestModel.create({
              user_id: user_id,
              driver_id: driver_id,
              cab_id: cab_id,
              type: type,
              model_registration_no: registrationNumber,
              location: location,
              kms: kms,
              total_amount: total_amount,
              time_required: null,
              start_date: start_date,
            });

            console.log(driver);
            driver.pendingRequests.push(request._id.toString());
            console.log(driver.pendingRequests);
            await driver.save();

            user.pending_request = request._id;
            await user.save();

            // Return the request
            return res.status(201).json({
              message: "Successfully accepted the request",
              data: request,
            });
          }
        } else if (time_required) {
          if (
            !user_id ||
            !driver_id ||
            !type ||
            !cab_id ||
            !model_no ||
            !location ||
            !total_amount ||
            !start_date
          ) {
            // Check if all the fields are filled
            return res
              .status(400)
              .json({ error: "Please fill all the fields" });
          } else {
            const { registrationNumber, user, driver, error } =
              await somenecessaryfields();

            if (error !== "No Errors" || !driver || !user) {
              return res.status(400).json({ message: error });
            }

            const request = await RequestModel.create({
              user_id: user_id,
              driver_id: driver_id,
              cab_id: cab_id,
              type: type,
              model_registration_no: registrationNumber,
              location: location,
              total_amount: total_amount,
              kms: null,
              time_required: time_required,
              start_date: start_date,
            });

            driver.pendingRequests.push(request._id.toString());

            // const requests = driver.pendingRequests;
            // if (!requests) {
            //   console.log("here");
            //   driver.pendingRequests = [request._id.toString()];
            //   console.log(driver.pendingRequests);
            // } else {
            //   driver.pendingRequests = [...requests, request._id.toString()];
            // }

            await driver.save();

            user.pending_request = request._id;
            await user.save();

            // Success: Return the request
            return res.status(201).json({
              message: "Successfully accepted the request",
              data: request,
            });
          }
        }
      } else {
        return res.status(400).json({ error: "No such user or driver exists" });
      }
    } else {
      //Error: Token not valid.
      return res.status(404).json({ message: "Token not valid" });
    }
  } else {
    //Error: if Header not found.
    return res.status(404).json({ message: "Token not found" });
  }
  // } catch (err) {
  //   // Error: if something breaks in code.
  //   res.status(500).json({ error: "Internal Server Error" });
  // }
};

// Accept the request by the User
export const requestAcceptedByDriverController = async (
  req: Request,
  res: Response
) => {
  try {
    const bearerHeader = req.headers.authorization;
    if (bearerHeader !== undefined) {
      const bearer: string = bearerHeader as string;
      const tokenVerify = jwt.verify(
        bearer.split(" ")[1],
        SecretKey
      ) as jwt.JwtPayload;
      if (tokenVerify) {
        // Take out data
        const { request_id } = req.body;
        if (!request_id) {
          // Check if all the fields are filled
          return res.status(400).json({ error: "Please fill all the fields" });
        } else {
          // Find the request and change the status to Accepted
          let request = await RequestModel.findById({ _id: request_id });

          if (!request) {
            // Check if the request exists
            return res.status(400).json({ error: "No such request exists" });
          } else if (
            request._id === request_id &&
            request.request_status !== "Accepted"
          ) {
            // removing the createdAt field to make
            request.createdAt = undefined;
            // check the user and driver
            const driver = await driverModel.findById({
              _id: request.driver_id,
            });
            const user = await userModel.findById({ _id: request.user_id });
            if (!driver || !user) {
              return res
                .status(400)
                .json({ error: "No such user or driver exists" });
            } else {
              // Add rhe request to the accepted requests of the user
              // Check if the request is already accepted
              request.request_status = "Accepted";
              request = await request.save();
              user.accepted_request.push(request._id.toString());
              await user.save();
              // Success: Return the request
              return res.status(201).json({
                message: "Successfully accepted the request",
                data: request,
              });
            }
          }
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

// Reject the request by the User
export const requestRejectedByDriverController = async (
  req: Request,
  res: Response
) => {
  try {
    const bearerHeader = req.headers.authorization;
    if (bearerHeader !== undefined) {
      const bearer: string = bearerHeader as string;
      const tokenVerify = jwt.verify(
        bearer.split(" ")[1],
        SecretKey
      ) as jwt.JwtPayload;
      if (tokenVerify) {
        // Take out data
        const { request_id } = req.body;
        if (!request_id) {
          // Check if all the fields are filled
          return res.status(400).json({ error: "Please fill all the fields" });
        } else {
          // Find the request and change the status to Accepted
          const requests = await RequestModel.findById({ _id: request_id });
          if (!requests) {
            // Check if the request exists
            return res.status(400).json({ error: "No such request exists" });
          } else if (
            requests._id === request_id &&
            requests.request_status === "Pending"
          ) {
            // check the user and driver
            const driver = await driverModel.findById({
              _id: requests.driver_id,
            });
            const user = await userModel.findById({ _id: requests.user_id });
            if (!driver || !user) {
              return res
                .status(400)
                .json({ error: "No such user or driver exists" });
            } else {
              requests.request_status = "Rejected";
              await requests.save();
              return res.status(201).json({
                message: "Successfully rejected the request",
                data: requests,
              });
            }
          }
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

// Change to unavailable of the driver with respect to the request

// Change the new time_required of the request

// Change the new kms of the request

// Change to available of the driver with respect to the request

// Schedule a task to delete the documents
const deleteExpiredRequests = corn.schedule("00 00 00 * * *", async () => {
  try {
    // Calculate the deletion date based on the start_date, time_required, and kms
    const allRequests = await RequestModel.find();
    for (const request of allRequests) {
      if (
        (request.time_required !== null &&
          request.request_status === "Completed") ||
        request.request_status === "Rejected"
      ) {
        const currentDate = new Date();
        const deletionDate = new Date();
        deletionDate.setTime(
          request.start_date.getTime() +
            (request.time_required || 0) +
            1000 * 60 * 60 * 24
        );
        if (currentDate > deletionDate) {
          await RequestModel.deleteOne({ _id: request._id });
        }
      }
      if (
        (request.kms !== null && request.request_status === "Completed") ||
        request.request_status === "Rejected"
      ) {
        const currentDate = new Date();
        const deletionDate = new Date();
        deletionDate.setTime(
          request.start_date.getTime() +
            (request.kms || 0) * 20 * 60000 +
            1000 * 60 * 60 * 24
        );
        if (currentDate > deletionDate) {
          await RequestModel.deleteOne({ _id: request._id });
        }
      }
    }
  } catch (error) {
    console.error("Error deleting expired requests:", error);
  }
});

// Start the scheduled task
deleteExpiredRequests.start();
