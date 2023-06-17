import { NextFunction, Request, Response } from "express";
import cabModel, { Cab } from "../models/cab";
import { createCabService } from "../services/cab.service";
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
      kms_run,
      initial_rate,
      fuel_type,
      type,
      no_of_available,
    } = req.body;
    if (
      !registration_number ||
      !model_name ||
      !model_no ||
      !colour ||
      !imageurl ||
      !no_of_seats ||
      !kms_run ||
      !initial_rate ||
      !fuel_type ||
      !no_of_available ||
      !type
    ) {
      // anyone details not available
      return res.status(400).json({ message: "Data Incomplete Error" });
    }

    // Searching if the cab already exists in database
    const modelNo = model_no.trim();
    const findCab = await cabModel.find({ model_no: modelNo });
    if (findCab.length != 0) {
      return res
        .status(400)
        .json({ message: "Cab Details already exists, Update the details" });
    }

    // Saving the cab in database
    const savedCab = await createCabService({
      type: type,
      cabs: [
        {
          registration_number: [registration_number],
          imageurl: imageurl,
          model_name: model_name,
          model_no: modelNo,
          colour: colour,
          no_of_seats: no_of_seats,
          kms_run: kms_run,
          initial_rate: initial_rate,
          fuel_type: fuel_type,
          no_of_available: no_of_available,
        },
      ],
    });

    // return the success status
    return res.status(200).json({
      message: "This is Cab Create Page",
      data: savedCab,
    });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};
