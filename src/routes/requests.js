"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const requests_1 = require("../controller/requests");
// All the data will be send in JSON format.
// pass headers in every request other than login and register.
// get all requests Route---------------
// pass request_id in body and headers
// get data: [All requests with all details]
router.post("/getRequests", requests_1.getRequestsController);
// Create Request Route -----------------
// pass (body) user_id, driver_id, cab_id, type, model_registration_no, source_location,
// destination_location, kms, time_required, start_date, request_status, total_amount
// get data: For now all the details after saving in database
router.post("/createRequest", requests_1.createRequestController);
// Accept Request Route -----------------
// pass (body) driver_id, request_id
// get data: Request and the success message
router.put("/acceptRequest", requests_1.requestAcceptedByDriverController);
// Reject Request Route -----------------
// pass (body) driver_id, request_id
// get data: Request and the success message
router.put("/rejectRequest", requests_1.requestRejectedByDriverController);
exports.default = router;
