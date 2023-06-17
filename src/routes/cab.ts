import express, { NextFunction, Request, Response, Router } from "express";
const router: Router = Router();

import BodyParser from "body-parser";
import { createCab } from "../controller/cab";

router.use(BodyParser.json());
router.use(BodyParser.urlencoded({ extended: true }));

// Create Cab
// registration_number & model_name & model_no & colour & no_of_seats
// kms_run & initial_rate & fuel_type & no_of_available & type
router.use("/createCab", createCab);

export default router;
