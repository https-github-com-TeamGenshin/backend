"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const driver_1 = require("../controller/driver");
// All the data will be send in JSON format.
// pass headers in every request other than login and register.
// Login driver Route ----------------
// pass (body) mobile no. or email in (username) and password in (password)
// get data: {id: (_id from database), username: (username passed before),}, token: (token string only)
router.post("/loginDriver", driver_1.loginDriverController);
// verify the token from frontend route -------------------
// pass (header) authentication: bearer <token>
// get data: {id: (_id from database), username: (username passed during login),},
router.post("/verifyDriverToken", driver_1.verifyDriverByToken);
// Create Driver Route -----------------
// pass (body) name, email_id, mobile_no, password, gender, age, location
// get data: For now all the details after saving in database
router.post("/createDriver", driver_1.createDriverController);
// find driver Route ------------------
// pass (params) replace :id with the id
// get data: All details of driver
router.get("/getOneDriver", driver_1.findOneDriverController);
// get all Drivers Route---------------
// pass nothing
// get data: [All Drivers with all details]
router.get("/getAllDrivers", driver_1.getAllDriversController);
// get all Drivers Route---------------
// pass nothing
// get data: [All Drivers with all details]
router.put("/getDriversbyType", driver_1.getDriversbyTypeController);
// get all Drivers Route---------------
// just pass headers
// get data: [All Drivers with all details] in the form of array (chunk of 7)
router.put("/getAllFilteredDrivers", driver_1.getDriversbyFilterController);
// get all Cabs by Search Route---------------
// pass just (headers)
// get data: two arrays of cabs previouslyAccepted and total number of cabs that matches the search
router.put("/getAllSearchedDrivers", driver_1.getAllSearchedDriversController);
// delete Driver-----------------------
// pass (params) replace :id with the id
// get data: deletedCount should be equals 1
router.put("/deleteDriver", driver_1.deleteDriverController);
// Update status of driver
// pass (headers) and status(boolean)
// get success meassage
router.post("/updateStatus", driver_1.updateDriverStatusController);
// get All Pending Requests
// pass (headers) only
// get success message and data
router.get("/pending", driver_1.getPendingRequestsController);
// get All Accepted Requests
// pass (headers) only
// get success message and data
router.get("/accepted", driver_1.getAcceptedRequestsController);
// update driver Details
// pass (headers) and all the details of driver
// get success message and data
router.put("/updateDriver", driver_1.updateDriverController);
exports.default = router;
