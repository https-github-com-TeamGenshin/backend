import { Router } from "express";
const router: Router = Router();

import {
  getRequestsController,
  createRequestController,
  requestAcceptedByDriverController,
  requestRejectedByDriverController,
} from "../controller/requests";

// All the data will be send in JSON format.
// pass headers in every request other than login and register.

// get all requests Route---------------
// pass request_id in body and headers
// get data: [All requests with all details]
router.get("/getRequests", getRequestsController);

// Create Request Route -----------------
// pass (body) user_id, driver_id, cab_id, type, model_registration_no, source_location,
// destination_location, kms, time_required, start_date, request_status, total_amount
// get data: For now all the details after saving in database
router.post("/createRequest", createRequestController);

// Accept Request Route -----------------
// pass (body) driver_id, request_id
// get data: Request and the success message
router.put("/acceptRequest", requestAcceptedByDriverController);

// Reject Request Route -----------------
// pass (body) driver_id, request_id
// get data: Request and the success message
router.put("/rejectRequest", requestRejectedByDriverController);

export default router;
