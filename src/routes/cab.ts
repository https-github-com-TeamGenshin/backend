import { Router } from "express";
const router: Router = Router();

import {
  createCab,
  getAllFilteredCabsController,
  deleteCabDetailsController,
  deleteOneCabDetailsController,
  deleteTypeOfCabsController,
  getOneCabsController,
  getAllSearchedCabsController,
} from "../controller/cab";

// All the data will be send in JSON format.
// pass headers in every request other than login and register.

// Create Cab
// registration_number & model_name & model_no & colour & no_of_seats
// kms_run & initial_rate & fuel_type & no_of_available & type
router.post("/createCab", createCab);

// find Cab Route ------------------
// pass (params) replace :id with the id
// get data: All details of driver

router.put("/getAllCab", getOneCabsController);

// get all Cabs by filter Route---------------
// pass just (headers)
// get data: [All Cabs with all details] in the form of array (chunk of 7)

router.put("/getAllFilteredCabs", getAllFilteredCabsController);

// get all Cabs by Search Route---------------
// pass just (headers)
// get data: two arrays of cabs previouslyAccepted and total number of cabs that matches the search

router.put("/getAllSearchedCabs", getAllSearchedCabsController);

// delete Cab on the basis of type, colour, model_no and fuel_type-----------------------
// pass (body) type, colour, model_no and fuel_type
// get data: Success Message

router.put("/deleteCabDetails", deleteCabDetailsController);

// delete Cab on the basis of type, colour, model_no, registration_number(string of car details), model_name and fuel_type-----------------------
// pass (body) type, colour, model_no, registration_number(string of car details), model_name and fuel_type
// get data: Success Message

router.put("/deleteOneCabDetails", deleteOneCabDetailsController);

// delete Cab on the Basis of Type -----------------------
// pass just headers
// get data: deletedCount should be equals 1

router.delete("/deleteCabTypeDetails", deleteTypeOfCabsController);

export default router;
