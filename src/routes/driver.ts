import { Router } from "express";
const router: Router = Router();

import {
  loginDriverController,
  createDriverController,
  verifyDriverByToken,
  getAllDriversController,
  deleteDriverController,
  findOneDriverController,
  getDriversbyTypeController,
} from "../controller/driver";

// All the data will be send in JSON format.
// pass headers in every request other than login and register.

// Login driver Route ----------------
// pass (body) mobile no. or email in (username) and password in (password)
// get data: {id: (_id from database), username: (username passed before),}, token: (token string only)

router.post("/loginDriver", loginDriverController);

// verify the token from frontend route -------------------
// pass (header) authentication: bearer <token>
// get data: {id: (_id from database), username: (username passed during login),},

router.post("/verifyDriverToken", verifyDriverByToken);

// Create Driver Route -----------------
// pass (body) name, email_id, mobile_no, password, gender, age, location
// get data: For now all the details after saving in database

router.post("/createDriver", createDriverController);

// find driver Route ------------------
// pass (params) replace :id with the id
// get data: All details of driver

router.get("/getOneDriver", findOneDriverController);

// get all Drivers Route---------------
// pass nothing
// get data: [All Drivers with all details]

router.get("/getAllDrivers", getAllDriversController);

// get all Drivers Route---------------
// pass nothing
// get data: [All Drivers with all details]

router.put("/getDriversbyType", getDriversbyTypeController);

// delete Driver-----------------------
// pass (params) replace :id with the id
// get data: deletedCount should be equals 1

router.delete("/deleteDriver", deleteDriverController);

export default router;
