import { Request, Response } from "express";
import jwt from "jsonwebtoken";
const SecretKey = "lim4yAey6K78dA8N1yKof4Stp9H4A";

import cabModel, { Cab, CabDetails } from "../models/cab";
import userModel from "../models/user";

// Create the Cab Controller
export const createCab = async (req: Request, res: Response) => {
  try {
    // access the header
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (
      tokenVerify.id === "64ad2bbdd73ea6b35065340e" &&
      tokenVerify.username === "Admin"
    ) {
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
          return res.status(400).json({
            message: "Cab Details already exists, Update the details",
          });
        } else {
          // find for the same type of vehicle exists in database or not.
          const findType = await cabModel.find({ type: type });
          let newCabDetails;
          if (findType.length !== 0) {
            // Type of car exist need to save the new Cab in database
            newCabDetails = {
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
              data: newCabDetails,
            });
          }
        }
      }
    } else {
      //Error: cab provided not found in database.
      return res.status(400).json({ message: "Cannot find cab" });
    }
  } catch (e) {
    //Error: Server Error
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getAllFilteredCabsController = async (
  req: Request,
  res: Response
) => {
  // try {
  // Access the header
  const bearerHeader = req.headers.authorization;
  if (bearerHeader !== undefined) {
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
    if (tokenVerify) {
      let {
        type,
        location,
        colour,
        fuel_type,
        hrs_rate,
        kms_rate,
      }: {
        type: string;
        location: string;
        colour: string;
        fuel_type: string;
        hrs_rate: boolean;
        kms_rate: boolean;
      } = req.body;

      let data: Cab | null = null;

      if (type && location) {
        // Find data based on the type and location
        data = await cabModel.findOne({
          type: type,
          "cabs.location": location,
        });
      } else {
        // Error: Data Incomplete (Type and Location)
        return res
          .status(400)
          .json({ message: "Data Incomplete (Type and Location)" });
      }

      if (!colour && !fuel_type) {
        // Find data based on the type and location
        let filteredCabs =
          data?.cabs.filter(
            (cabDetail) =>
              cabDetail.location.trim().replace(" ", "") ===
              location.trim().replace(" ", "")
          ) ?? [];

        data = {
          ...data?.toObject(),
          cabs: filteredCabs,
        } as Cab;
      }

      if (colour && !fuel_type) {
        // Find data based on the type,location and location
        let filteredCabs = data?.cabs;

        if (colour) {
          filteredCabs = filteredCabs?.filter(
            (cabDetail) =>
              cabDetail.location.trim().replace(" ", "") ===
                location.trim().replace(" ", "") &&
              cabDetail.colour.trim().replace(" ", "") ===
                colour.trim().replace(" ", "")
          );
        }

        data = {
          ...data,
          cabs: filteredCabs ?? [],
        } as Cab;
      }

      if (fuel_type && !colour) {
        let filteredCabs = data?.cabs;

        if (fuel_type) {
          filteredCabs = filteredCabs?.filter(
            (cabDetail) =>
              cabDetail.location.trim().replace(" ", "") ===
                location.trim().replace(" ", "") &&
              cabDetail.fuel_type.trim().replace(" ", "") ===
                fuel_type.trim().replace(" ", "")
          );
        }

        data = {
          ...data,
          cabs: filteredCabs ?? [],
        } as Cab;
      }

      if (fuel_type && colour) {
        let filteredCabs = data?.cabs;

        filteredCabs = filteredCabs?.filter(
          (cabDetail) =>
            cabDetail.location.trim().replace(" ", "") ===
              location.trim().replace(" ", "") &&
            cabDetail.fuel_type.trim().replace(" ", "") ===
              fuel_type.trim().replace(" ", "") &&
            cabDetail.colour.trim().replace(" ", "") ===
              colour.trim().replace(" ", "")
        );

        data = {
          ...data,
          cabs: filteredCabs ?? [],
        } as Cab;
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
        const chunkSize = 8; // Number of items in each chunk

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
          message: "Get All Filtered Cabs is successful",
          totalChunks: totalChunks,
          chunkData: chunkData,
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
  // } catch (e) {
  //   // Error: Something breaks in the code.
  //   return res.status(500).json({ message: "Server Error" });
  // }
};

export const getAllSearchedCabsController = async (
  req: Request,
  res: Response
) => {
  try {
    // Access the header
    const bearerHeader = req.headers.authorization;
    if (bearerHeader !== undefined) {
      const bearer: string = bearerHeader as string;
      const tokenVerify = jwt.verify(
        bearer.split(" ")[1],
        SecretKey
      ) as jwt.JwtPayload;
      if (tokenVerify) {
        const {
          search,
          location,
          type,
        }: { search: string; location: string; type: string } = req.body;

        const searchLength = search.length;
        if (searchLength < 3) {
          return res.status(400).json({
            message: "Search string should be atleast 3 characters long",
          });
        }

        let data: Cab[] | null = null;
        let acceptedRequests: CabDetails[] | null | undefined = null;

        const dataInUser = await userModel.findById({ _id: tokenVerify.id });

        if (!dataInUser) {
          return res.status(404).json({ message: "User not found" });
        }

        if (type && !search && location) {
          data = await cabModel.find({
            type: type,
            "cabs.location": location,
          });
        } else if (type && search && location) {
          // Create a regular expression object with the search term and the 'i' option for case-insensitive matching
          const regex = new RegExp(search, "i");

          const regexNumber = Number(search);

          if (isNaN(regexNumber)) {
            // Perform the search query using the regular expression
            data = await cabModel.find({
              type: type,
              "cabs.location": location,
              $or: [
                { "cabs.model_name": regex },
                { "cabs.model_no": regex },
                { "cabs.fuel_type": regex },
                { "cabs.colour": regex },
              ],
            });
          } else {
            // Perform the search query using the regular expression
            data = await cabModel.find({
              type: type,
              "cabs.location": location,
              $or: [
                { "cabs.model_name": regex },
                { "cabs.model_no": regex },
                { "cabs.fuel_type": regex },
                { "cabs.colour": regex },
                { "cabs.kms_rate": regexNumber },
                { "cabs.hrs_rate": regexNumber },
              ],
            });
          }
        } else {
          // Error: Data Incomplete (Type and Location)
          return res
            .status(400)
            .json({ message: "Data Incomplete (Type and Location)" });
        }

        if (!data || data.length === 0) {
          return res.status(404).json({ message: "Data not found" });
        } else {
          // Define the chunk size
          // const chunkSize = 7; // Number of items in each chunk

          // let totalChunks: number = 0;
          // let chunkData: CabDetails[] = [];

          let filteredCabs: CabDetails[] | undefined = undefined;

          for (let i = 0; i < data.length; i++) {
            filteredCabs = data[i].cabs.filter((cab) => {
              // Perform the filtering based on the regular expression or model_name
              const regex = new RegExp(search, "i");
              return (
                regex.test(cab.model_name) ||
                regex.test(cab.model_no) ||
                regex.test(cab.fuel_type) ||
                regex.test(cab.colour) ||
                regex.test(cab.kms_rate.toString()) ||
                regex.test(cab.hrs_rate.toString())
              );
            });
          }

          dataInUser?.accepted_request.forEach((request) => {
            acceptedRequests = filteredCabs?.filter((cab) => {
              return cab._id?.toString() === request.cab_id;
            });
          });

          // Calculate the total number of chunks
          // totalChunks += Math.ceil(filteredCabs.length / chunkSize);

          // Get the requested chunk number from the query parameter
          // const requestedChunk = parseInt(req.query.chunk as string) || 1;

          // Slice the filtered data array to get the desired chunk
          // const startIndex = (requestedChunk - 1) * chunkSize;
          // const endIndex = requestedChunk * chunkSize;
          // const chunkDataSlice = filteredCabs.slice(startIndex, endIndex);

          // Merge the filtered chunk data with the overall chunk data
          // chunkData = chunkData.concat(chunkDataSlice);
          // }

          // Send the chunk data as a response
          // return res.status(200).json({
          //   message: "Get All Searched Cabs is successful",
          //   totalChunks: totalChunks,
          //   chunkData: chunkData,
          // });

          // send the whole data as a response
          return res.status(200).json({
            message: "Get All Searched Cabs is successful",
            data: filteredCabs,
            previouslyAccepted: acceptedRequests,
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
      if (
        tokenVerify.id === "64ad2bbdd73ea6b35065340e" &&
        tokenVerify.username === "Admin"
      ) {
        const { password }: { password: string } = req.body;
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
      if (
        tokenVerify.id === "64ad2bbdd73ea6b35065340e" &&
        tokenVerify.username === "Admin"
      ) {
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
      if (
        tokenVerify.id === "64ad2bbdd73ea6b35065340e" &&
        tokenVerify.username === "Admin"
      ) {
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

export const updateCabController = async (req: Request, res: Response) => {
  try {
    // access the header
    const bearerHeader = req.headers.authorization;
    if (bearerHeader !== undefined) {
      const bearer: string = bearerHeader as string;
      const tokenVerify = jwt.verify(
        bearer.split(" ")[1],
        SecretKey
      ) as jwt.JwtPayload;
      if (
        tokenVerify.id === "64ad2bbdd73ea6b35065340e" &&
        tokenVerify.username === "Admin"
      ) {
        const {
          _id,
          registration_number,
          model_name,
          model_no,
          colour,
          imageurl,
          no_of_seats,
          kms_rate,
          fuel_type,
          hrs_rate,
          type,
          no_of_available,
        } = req.body;

        if (
          !_id ||
          !registration_number ||
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
        } else {
          // find the cab type and remove the cab that is mentioned
          const foundCab = await cabModel.find({ type: req.body.type });

          if (foundCab.length !== 0) {
            const foundElement = foundCab[0].cabs.find((cab) => cab._id == _id);
            if (foundElement) {
              foundElement.registration_number = registration_number;
              foundElement.model_name = model_name;
              foundElement.model_no = model_no;
              foundElement.colour = colour;
              foundElement.imageurl = imageurl;
              foundElement.no_of_seats = no_of_seats;
              foundElement.kms_rate = kms_rate;
              foundElement.fuel_type = fuel_type;
              foundElement.hrs_rate = hrs_rate;
              foundElement.no_of_available = no_of_available;
            } else {
              return res.status(404).json({ message: "Cab not found" });
            }

            const savedCab = foundCab[0].save();

            // Success: Data Updated successfully
            return res
              .status(200)
              .json({ message: "Cab details Updated", data: foundElement });
          } else {
            //Error: if Header not found.
            return res.status(404).json({ message: "Cab Type not found" });
          }
        }
      } else {
        //Error: if Header not found.
        return res.status(404).json({
          message: "Token not found",
        });
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
      const tokenVerify = jwt.verify(
        bearer.split(" ")[1],
        SecretKey
      ) as jwt.JwtPayload;
      if (
        tokenVerify.id === "64ad2bbdd73ea6b35065340e" &&
        tokenVerify.username === "Admin"
      ) {
        const { _id, type }: { _id: string; type: string } = req.body;
        if (!_id || !type) {
          return res.status(400).json({ message: "Data Incomplete" });
        } else {
          // finding the user by id got from the frontend.
          let data = await cabModel.findOne({ type: type });

          // checking if the user exists or not.
          if (!data) {
            return res.status(404).json({ message: "Type data not found" });
          } else {
            const cab = data.cabs.find((cab) => cab._id?.toString() === _id);
            if (!cab) {
              return res.status(404).json({ message: "Cab not found" });
            } else {
              //Success: Return the all user details.
              return res.status(200).json({
                message: "finding one user is successful",
                data: cab,
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
