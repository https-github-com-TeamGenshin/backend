"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const cab_1 = require("../controller/cab");
// All the data will be send in JSON format.
// pass headers in every request other than login and register.
// Create Cab
// registration_number & model_name & model_no & colour & no_of_seats
// kms_run & initial_rate & fuel_type & no_of_available & type
router.post("/createCab", cab_1.createCab);
// find Cab Route ------------------
// pass (body) replace :id with the id
// get data: details of One Cab
router.put("/getOneCab", cab_1.getOneCabsController);
// Update Cab Route ------------------
// pass all the details of cabs in body
// get data: Success Message
router.put("/updateCab", cab_1.updateCabController);
// get all Cabs by filter Route---------------
// pass just (headers)
// get data: [All Cabs with all details] in the form of array (chunk of 7)
router.put("/getAllFilteredCabs", cab_1.getAllFilteredCabsController);
// get all Cabs by Search Route---------------
// pass just (headers)
// get data: two arrays of cabs previouslyAccepted and total number of cabs that matches the search
router.put("/getAllSearchedCabs", cab_1.getAllSearchedCabsController);
// delete Cab on the basis of type, colour, model_no and fuel_type-----------------------
// pass (body) type, colour, model_no and fuel_type
// get data: Success Message
router.put("/deleteCabDetails", cab_1.deleteCabDetailsController);
// delete Cab on the basis of type, colour, model_no, registration_number(string of car details), model_name and fuel_type-----------------------
// pass (body) type, colour, model_no, registration_number(string of car details), model_name and fuel_type
// get data: Success Message
router.put("/deleteOneCabDetails", cab_1.deleteOneCabDetailsController);
// delete Cab on the Basis of Type -----------------------
// pass just headers
// get data: deletedCount should be equals 1
router.delete("/deleteCabTypeDetails", cab_1.deleteTypeOfCabsController);
exports.default = router;
