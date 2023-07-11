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
  getDriversbyFilterController,
  getAllSearchedDriversController,
  updateDriverStatusController,
  getPendingRequestsController,
  getAcceptedRequestsController,
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

// get all Drivers Route---------------
// just pass headers
// get data: [All Drivers with all details] in the form of array (chunk of 7)

router.put("/getAllFilteredDrivers", getDriversbyFilterController);

// get all Cabs by Search Route---------------
// pass just (headers)
// get data: two arrays of cabs previouslyAccepted and total number of cabs that matches the search
router.put("/getAllSearchedDrivers", getAllSearchedDriversController);

// delete Driver-----------------------
// pass (params) replace :id with the id
// get data: deletedCount should be equals 1

router.delete("/deleteDriver", deleteDriverController);

// Update status of driver
// pass (headers) and status(boolean)
// get success meassage

router.post("/updateStatus", updateDriverStatusController);

// get All Pending Requests
// pass (headers) only
// get success message and data
router.get("/pending", getPendingRequestsController);

// get All Accepted Requests
// pass (headers) only
// get success message and data
router.get("/accepted", getAcceptedRequestsController);

export default router;
