import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
const SecretKey = "lim4yAey6K78dA8N1yKof4Stp9H4A";

import cabModel, { Cab, CabDetails } from "../models/cab";

// Create the Cab Controller
export const createCab = async (req: Request, res: Response) => {
  try {
    const {
      registration_number,
      model_name,
      model_no,
      colour,
      imageurl,
      no_of_seats,
      kms_rate,
      location,
      fuel_type,
      hrs_rate,
      type,
      no_of_available,
    } = req.body;
    if (
      !registration_number ||
      !location ||
      !model_name ||
      !model_no ||
      !colour ||
      !imageurl ||
      !no_of_seats ||
      !kms_rate ||
      !hrs_rate ||
      !fuel_type ||
      !no_of_available ||
      !type
    ) {
      // anyone details not available
      return res.status(400).json({ message: "Data Incomplete Error" });
    } else if (registration_number.length !== no_of_available) {
      // registation number and no of available does not match
      return res.status(400).json({
        message:
          "registration number array and the no of available vehicles does not match",
      });
    } else {
      // Searching if the cab already exists in database
      const modelNo = model_no.trim();
      const query = {
        "cabs.model_no": modelNo, // Replace with the desired model_no
        "cabs.colour": colour, // Replace with the desired colour
        "cabs.fuel_type": fuel_type, // Replace with the desired fuel_type
      };

      const findCab = await cabModel.find(query);
      if (findCab.length !== 0) {
        // Error: Details already exist need to update the details.
        return res
          .status(400)
          .json({ message: "Cab Details already exists, Update the details" });
      } else {
        // find for the same type of vehicle exists in database or not.
        const findType = await cabModel.find({ type: type });

        if (findType.length !== 0) {
          // Type of car exist need to save the new Cab in database
          const newCabDetails = {
            registration_number: registration_number,
            imageurl: imageurl,
            model_name: model_name,
            model_no: modelNo,
            location: location,
            colour: colour,
            no_of_seats: no_of_seats,
            hrs_rate: hrs_rate,
            kms_rate: kms_rate,
            fuel_type: fuel_type,
            no_of_available: no_of_available,
          };
          findType[0].cabs.push(newCabDetails);
          // save
          const savedCab = await findType[0].save();
          // Success: save the cab.
          return res.status(200).json({
            message: "Cab is Saved Successfully",
            data: savedCab,
          });
        } else {
          // Creating the new type and data of cab in database
          const savedCab = await cabModel.create({
            type: type,
            cabs: [
              {
                registration_number: registration_number,
                imageurl: imageurl,
                model_name: model_name,
                model_no: modelNo,
                colour: colour,
                location: location,
                no_of_seats: no_of_seats,
                hrs_rate: hrs_rate,
                kms_rate: kms_rate,
                fuel_type: fuel_type,
                no_of_available: no_of_available,
              },
            ],
          });

          //Success: return the success status
          return res.status(200).json({
            message: "Cab is Saved Successfully",
            data: savedCab,
          });
        }
      }
    }
  } catch (e) {
    //Error: Server Error
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getAllCabsController = async (req: Request, res: Response) => {
  try {
    // Access the header
    const bearerHeader = req.headers.authorization;
    if (bearerHeader !== undefined) {
      const bearer: string = bearerHeader as string;
      const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
      if (tokenVerify) {
        let {
          type,
          location,
          model_name,
          colour,
          fuel_type,
          hrs_rate,
          kms_rate,
        }: {
          type: string;
          location: string;
          model_name: string;
          colour: string;
          fuel_type: string;
          hrs_rate: boolean;
          kms_rate: boolean;
        } = req.body;

        let data: Cab | null = null;

        if (type.length !== 0) {
          // Find data based on the type
          data = await cabModel.findOne({ type: type });
        }

        if (
          type.length !== 0 &&
          location.length !== 0 &&
          colour.length === 0 &&
          fuel_type.length === 0
        ) {
          // Find data based on the type and location
          console.log("I am Here");
          let filteredCabs =
            data?.cabs.filter((cabDetail) => cabDetail.location === location) ??
            [];

          data = {
            ...data?.toObject(),
            cabs: filteredCabs,
          } as Cab;
        }

        if (
          type.length !== 0 &&
          location.length !== 0 &&
          colour.length !== 0 &&
          fuel_type.length === 0
        ) {
          // Find data based on the type,location and location
          let filteredCabs = data?.cabs;

          if (type && location && colour) {
            filteredCabs = filteredCabs?.filter(
              (cabDetail) =>
                cabDetail.location === location && cabDetail.colour === colour
            );
          }

          data = {
            ...data,
            cabs: filteredCabs ?? [],
          } as Cab;
        }

        if (
          type.length !== 0 &&
          location.length !== 0 &&
          fuel_type.length !== 0 &&
          colour.length === 0
        ) {
          let filteredCabs = data?.cabs;

          if (type && location && fuel_type) {
            filteredCabs = filteredCabs?.filter(
              (cabDetail) =>
                cabDetail.location === location &&
                cabDetail.fuel_type === fuel_type
            );
          }

          data = {
            ...data,
            cabs: filteredCabs ?? [],
          } as Cab;
        }

        if (
          type.length !== 0 &&
          location.length !== 0 &&
          fuel_type.length !== 0 &&
          colour.length !== 0
        ) {
          let filteredCabs = data?.cabs;

          if (type && location && fuel_type) {
            filteredCabs = filteredCabs?.filter(
              (cabDetail) =>
                cabDetail.location === location &&
                cabDetail.fuel_type === fuel_type &&
                cabDetail.colour === colour
            );
          }

          data = {
            ...data,
            cabs: filteredCabs ?? [],
          } as Cab;
        }

        // model name
        if (model_name.length !== 0 && data) {
          const regex = new RegExp(`^${model_name.trim()}`, "i");
          data.cabs = data.cabs.filter((cabDetail) => {
            return regex.test(cabDetail.model_name.trim());
          });
        }

        if (data && hrs_rate && !kms_rate) {
          // Sort the cabs by hrs_rate and kms_rate
          data.cabs = data.cabs.sort((a: CabDetails, b: CabDetails) => {
            return a.hrs_rate - b.hrs_rate;
          });
        } else if (data && kms_rate && !hrs_rate) {
          data.cabs = data.cabs.sort((a: CabDetails, b: CabDetails) => {
            return a.kms_rate - b.kms_rate;
          });
        } else if (data && kms_rate && hrs_rate) {
          data.cabs = data.cabs.sort((a: CabDetails, b: CabDetails) => {
            return a.hrs_rate + a.kms_rate - (b.hrs_rate + b.kms_rate);
          });
        }

        // Checking if the user exists or not.
        if (!data || data.cabs.length === 0) {
          return res.status(404).json({ message: "Data not found" });
        } else {
          // Define the chunk size
          const chunkSize = 2; // Number of items in each chunk

          // Calculate the total number of chunks
          const totalChunks = Math.ceil(data.cabs.length / chunkSize);

          // Get the requested chunk number from the query parameter
          const requestedChunk = parseInt(req.query.chunk as string) || 1;

          // Calculate the start and end indices of the chunk
          const startIndex = (requestedChunk - 1) * chunkSize;
          const endIndex = requestedChunk * chunkSize;

          // Slice the data array to get the desired chunk
          const chunkData = data.cabs.slice(startIndex, endIndex);

          // Send the chunk data as a response
          return res.status(200).json({
            message: "Finding cabs is successful",
            totalChunks: totalChunks,
            chunkData: chunkData,
            data: data,
          });
        }
      } else {
        // Error: Invalid User or Driver
        return res.status(400).json({ message: "Invalid User or Driver" });
      }
    } else {
      // Error: Error in finding the token
      return res.status(400).json({ message: "Error in token" });
    }
  } catch (e) {
    // Error: Something breaks in the code.
    return res.status(500).json({ message: "Server Error" });
  }
};

// Delete One Type of Cab Details.
export const deleteTypeOfCabsController = async (
  req: Request,
  res: Response
) => {
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
        // deleting the cab Type by filter.
        let data = await cabModel.findOne({ type: req.body.type });

        // handling if cab Type not deleted.
        if (data !== null) {
          //Success: cab Type details is deleted successfully.
          return res.status(200).json({
            message: "Deleted Type of cab successfully",
            data: data,
          });
        } else {
          //Error: Token not valid.
          return res.status(404).json({ message: "Token not valid" });
        }
      } else {
        //Error: if Header not found.
        return res.status(404).json({ message: "Token not found" });
      }
    } else {
      //Error: cab provided not found in database.
      return res.status(400).json({ message: "Cannot find cab" });
    }
  } catch (e) {
    //Error: if something breaks in code.
    return res.status(500).json({ message: "Server Error" });
  }
};

// Delete Cab Details Controller
export const deleteCabDetailsController = async (
  req: Request,
  res: Response
) => {
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
        const { type, colour, model_no, fuel_type } = req.body;
        if (!type || !colour || !model_no || !fuel_type) {
          //Error: cab provided not found in database.
          return res.status(400).json({ message: "Data Incomplete" });
        } else {
          // find the cab type and remove the cab that is mentioned
          const foundCab = await cabModel.find({ type: req.body.type });

          if (foundCab.length !== 0) {
            foundCab[0].cabs = foundCab[0].cabs.filter((cabDetail) => {
              return (
                cabDetail.colour !== colour ||
                cabDetail.model_no !== model_no ||
                cabDetail.fuel_type !== fuel_type
              );
            });
            const savedCab = foundCab[0].save();

            // Success: Data deleted successfully
            return res
              .status(200)
              .json({ message: "Cab details deleted", savedCab: savedCab });
          } else {
            //Error: if Header not found.
            return res.status(404).json({ message: "Cab Type not found" });
          }
        }
      } else {
        //Error: if Header not found.
        return res.status(404).json({ message: "Token not found" });
      }
    } else {
      //Error: cab provided not found in database.
      return res.status(400).json({ message: "Cannot find cab" });
    }
  } catch (e) {
    //Error: if something breaks in code.
    return res.status(500).json({ message: "Server Error" });
  }
};

// Delete One Cab Details Controller
export const deleteOneCabDetailsController = async (
  req: Request,
  res: Response
) => {
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
        const {
          type,
          colour,
          model_name,
          model_no,
          no_of_seats,
          fuel_type,
          registration_number,
        } = req.body;
        if (
          !type ||
          !colour ||
          !model_no ||
          !fuel_type ||
          !registration_number ||
          !model_name ||
          !no_of_seats
        ) {
          //Error: cab provided not found in database.
          return res.status(400).json({ message: "Data Incomplete" });
        } else {
          // find the cab type and remove the cab that is mentioned
          const foundCab = await cabModel.find({ type: req.body.type });

          if (foundCab.length !== 0) {
            foundCab[0].cabs = foundCab[0].cabs.filter((cabDetail) => {
              // find that one cab
              if (
                cabDetail.colour == colour &&
                cabDetail.model_no == model_no &&
                cabDetail.fuel_type == fuel_type &&
                cabDetail.no_of_seats == no_of_seats &&
                cabDetail.model_name == model_name
              ) {
                // remove the registration no. and substract by 1 in no_of_available
                cabDetail.registration_number =
                  cabDetail.registration_number.filter((e) => {
                    if (e !== registration_number) {
                      return e;
                    }
                  }) as [string];
                cabDetail.no_of_available = cabDetail.no_of_available - 1;
                return cabDetail;
              } else {
                return cabDetail;
              }
            });
            const savedCab = foundCab[0].save();

            // Success: Data deleted successfully
            return res
              .status(200)
              .json({ message: "Cab details deleted", savedCab: savedCab });
          } else {
            //Error: if Header not found.
            return res.status(404).json({ message: "Cab Type not found" });
          }
        }
      } else {
        //Error: if Header not found.
        return res.status(404).json({ message: "Token not found" });
      }
    } else {
      //Error: cab provided not found in database.
      return res.status(400).json({ message: "Cannot find cab" });
    }
  } catch (e) {
    //Error: if something breaks in code.
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getOneCabsController = async (req: Request, res: Response) => {
  try {
    // access the header
    const bearerHeader = req.headers.authorization;
    if (bearerHeader !== undefined) {
      const bearer: string = bearerHeader as string;
      const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
      if (tokenVerify) {
        // finding the user by id got from the frontend.
        let data = await cabModel.find();

        // checking if the user exists or not.
        if (data.length === 0) {
          return res.status(404).json({ message: "User not found" });
        } else {
          const user = data[0];
          //Success: Return the all user details.
          return res.status(200).json({
            message: "finding one user is successful",
            data: user,
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
