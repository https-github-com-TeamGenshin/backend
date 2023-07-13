"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestRejectedByDriverController = exports.requestAcceptedByDriverController = exports.createRequestController = exports.getRequestsController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SecretKey = "lim4yAey6K78dA8N1yKof4Stp9H4A";
const node_cron_1 = __importDefault(require("node-cron"));
const pusher_1 = __importDefault(require("pusher"));
const driver_1 = __importDefault(require("../models/driver"));
const user_1 = __importDefault(require("../models/user"));
const requests_1 = __importDefault(require("../models/requests"));
const cab_1 = __importDefault(require("../models/cab"));
require("dotenv").config();
// Initialize Pusher
const pusher = new pusher_1.default({
    appId: process.env.PUSHER_APP_ID || "",
    key: process.env.PUSHER_KEY || "",
    secret: process.env.PUSHER_SECRET || "",
    cluster: "ap2",
    useTLS: true,
});
const terminateRequest = (requestId) => __awaiter(void 0, void 0, void 0, function* () {
    const countdownDuration = 120000; // 15 minutes in milliseconds
    // Wait for the countdown to finish
    yield new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, countdownDuration);
    });
    pusher.terminateUserConnections(requestId);
    console.log(`Confirmed Termination of ${requestId}`);
});
const getRequestsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bearerHeader = req.headers.authorization;
        if (bearerHeader !== undefined) {
            const bearer = bearerHeader;
            const tokenVerify = jsonwebtoken_1.default.verify(bearer.split(" ")[1], SecretKey);
            if (tokenVerify) {
                let user;
                const driver = yield driver_1.default.exists({ _id: tokenVerify.id });
                if (!driver) {
                    user = yield user_1.default.exists({ _id: tokenVerify.id });
                }
                if (driver || user) {
                    // Take out data
                    const { request_id } = req.body;
                    if (!request_id) {
                        // Check if all the fields are filled
                        return res
                            .status(400)
                            .json({ error: "Please fill all the fields" });
                    }
                    else {
                        const Request = yield requests_1.default.findById({ _id: request_id });
                        if (!Request) {
                            // Check if the request exists
                            return res.status(400).json({ error: "No such request exists" });
                        }
                        else {
                            // Success: Return the request
                            return res.status(201).json({
                                message: "Successfully fetched the request",
                                data: Request,
                            });
                        }
                    }
                }
                else {
                    //Error: No user or driver exists.
                    return res
                        .status(400)
                        .json({ error: "No such user or driver exists" });
                }
            }
            else {
                //Error: Token not valid.
                return res.status(404).json({ message: "Token not valid" });
            }
        }
        else {
            //Error: if Header not found.
            return res.status(404).json({ message: "Token not found" });
        }
    }
    catch (e) {
        //Error: if something breaks in code.
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getRequestsController = getRequestsController;
// Function to delete a request after the countdown finishes
function deleteRequestAfterCountdown(userId, driverId, requestId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Start the countdown (e.g., 15 minutes)
        // const countdownDuration = 60000; // 15 minutes in milliseconds
        const countdownDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
        console.log(`Countdown started for Delete Request of ${requestId}`);
        // Wait for the countdown to finish
        yield new Promise((resolve) => {
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                console.log(`Countdown finished for Delete Request of ${requestId}`);
                const request = yield requests_1.default.findById({ _id: requestId });
                const user = yield user_1.default.findById({ _id: userId });
                const driver = yield driver_1.default.findById({ _id: driverId });
                if (!request || !user || !driver) {
                    if (request) {
                        yield requests_1.default.findByIdAndDelete({ _id: requestId });
                    }
                    if (user) {
                        user.pending_request = "";
                        yield user.save();
                    }
                    if (driver) {
                        driver.pendingRequests = driver.pendingRequests.filter((data) => {
                            return data.request_id !== requestId;
                        });
                        yield driver.save();
                    }
                    return;
                }
                // If the request is accepted, then change pending settings
                // if (request.request_status === "Accepted") {
                //   user.pending_request = "";
                //   user.accepted_request.push(request);
                //   await user.save();
                //   driver.pendingRequests = driver.pendingRequests.filter((id) => {
                //     return id !== requestId;
                //   });
                //   driver.acceptedRequests.push(requestId);
                //   await driver.save();
                //   return;
                // }
                // If the request is rejected, then change pending settings
                // if (request.request_status === "Rejected") {
                //   user.pending_request = "";
                //   await user.save();
                //   driver.pendingRequests = driver.pendingRequests.filter((id) => {
                //     return id !== requestId;
                //   });
                //   await driver.save();
                //   return;
                // }
                // If the request is pending, then delete the request
                if (request.request_status === "Pending") {
                    user.pending_request = "";
                    yield user.save();
                    driver.pendingRequests = driver.pendingRequests.filter((data) => {
                        return data.request_id !== requestId;
                    });
                    yield driver.save();
                    // Delete the request
                    yield requests_1.default.findByIdAndDelete({ _id: requestId });
                    return;
                }
                resolve();
            }), countdownDuration);
        });
    });
}
const createRequestController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // try {
    const bearerHeader = req.headers.authorization;
    if (bearerHeader !== undefined) {
        const bearer = bearerHeader;
        const tokenVerify = jsonwebtoken_1.default.verify(bearer.split(" ")[1], SecretKey);
        if (tokenVerify) {
            const driver = yield driver_1.default.exists({ _id: tokenVerify.id });
            const user = yield user_1.default.exists({ _id: tokenVerify.id });
            if (driver || user) {
                const { location, user_id, driver_id, type, cab_id, model_no, kms, time_required, total_amount, start_date, model_name, } = req.body;
                const somenecessaryfields = () => __awaiter(void 0, void 0, void 0, function* () {
                    const cab = yield cab_1.default.findOne({ type: type });
                    const cabDetails = cab === null || cab === void 0 ? void 0 : cab.cabs.filter((cab) => {
                        return cab.model_no === model_no;
                    });
                    if (!cabDetails || cabDetails.length === 0) {
                        // Check if the cab exists
                        return {
                            cab: null,
                            error: "Error in cab details",
                            registrationNumber: "",
                            user: null,
                            driver: null,
                        };
                    }
                    else {
                        // find the driver and check if he is available
                        const driver = yield driver_1.default.findById({ _id: driver_id });
                        if (!driver) {
                            return {
                                cab: null,
                                error: "No such driver exists",
                                registrationNumber: "",
                                user: null,
                                driver: null,
                            };
                        }
                        // Drivers availability
                        // else if (driver.availability === false) {
                        //   return {
                        //     error: "Driver is not available",
                        //     registrationNumber: "",
                        //     user: null,
                        //     driver: null,
                        //   };
                        // }
                        // find the user and check if he has a pending request
                        const user = yield user_1.default.findById({ _id: user_id });
                        if (!user) {
                            return {
                                cab: null,
                                error: "No such user exists",
                                registrationNumber: "",
                                user: null,
                                driver: null,
                            };
                        }
                        else if (user.pending_request.length !== 0) {
                            return {
                                cab: null,
                                error: "User already has a pending request",
                                registrationNumber: "",
                                user: null,
                                driver: null,
                            };
                        }
                        // create the request
                        const registrationNumber = cabDetails[0].registration_number[Math.floor(Math.random() * cabDetails[0].registration_number.length)];
                        const newRegistrationNumbers = cabDetails[0].registration_number.filter((regNo) => {
                            return regNo !== registrationNumber;
                        });
                        cabDetails[0].registration_number = newRegistrationNumbers;
                        cabDetails[0].no_of_seats = cabDetails[0].no_of_seats - 1;
                        return {
                            cab: cabDetails[0],
                            error: "No Errors",
                            registrationNumber: registrationNumber,
                            user: user,
                            driver: driver,
                        };
                    }
                });
                if (kms) {
                    if (!user_id ||
                        !driver_id ||
                        !type ||
                        !cab_id ||
                        !model_no ||
                        !total_amount ||
                        !location ||
                        !start_date ||
                        !model_name) {
                        // Check if all the fields are filled
                        return res
                            .status(400)
                            .json({ error: "Please fill all the fields" });
                    }
                    else {
                        const { cab, registrationNumber, user, driver, error } = yield somenecessaryfields();
                        if (!cab || error !== "No Errors" || !driver || !user) {
                            return res.status(400).json({ message: error });
                        }
                        // Create the request with the retrieved registration number
                        const request = yield requests_1.default.create({
                            user_id: user_id,
                            driver_id: driver_id,
                            driver_name: driver.username,
                            imageurl: driver.imageurl,
                            cab_id: cab_id,
                            type: type,
                            model_registration_no: registrationNumber,
                            location: location,
                            kms: kms,
                            total_amount: total_amount,
                            time_required: null,
                            start_date: start_date,
                            model_name: model_name,
                        });
                        driver.pendingRequests.push({
                            request_id: request._id.toString(),
                            user_id: user_id,
                            imageurl: cab.imageurl,
                            cab_id: cab_id,
                            model_registration_no: registrationNumber,
                            location: location,
                            kms: kms,
                            time_required: null,
                            start_date: start_date,
                            model_name: model_name,
                        });
                        yield driver.save();
                        user.pending_request = request._id;
                        yield user.save();
                        deleteRequestAfterCountdown(user_id, driver_id, request._id.toString());
                        // Create a pusher trigger
                        pusher
                            .trigger("Requests", request._id.toString(), request)
                            .then((e) => {
                            // Return the request
                            return res.status(201).json({
                                message: "Successfully created the request",
                                data: request,
                            });
                        });
                    }
                }
                else if (time_required) {
                    if (!user_id ||
                        !driver_id ||
                        !type ||
                        !cab_id ||
                        !model_no ||
                        !location ||
                        !total_amount ||
                        !start_date ||
                        !model_name) {
                        // Check if all the fields are filled
                        return res
                            .status(400)
                            .json({ error: "Please fill all the fields" });
                    }
                    else {
                        const { cab, registrationNumber, user, driver, error } = yield somenecessaryfields();
                        if (!cab || error !== "No Errors" || !driver || !user) {
                            return res.status(400).json({ message: error });
                        }
                        const request = yield requests_1.default.create({
                            user_id: user_id,
                            driver_id: driver_id,
                            cab_id: cab_id,
                            type: type,
                            driver_name: driver.username,
                            imageurl: driver.imageurl,
                            model_registration_no: registrationNumber,
                            location: location,
                            total_amount: total_amount,
                            kms: null,
                            time_required: time_required,
                            start_date: start_date,
                            model_name: model_name,
                        });
                        driver.pendingRequests.push({
                            request_id: request._id.toString(),
                            user_id: user_id,
                            imageurl: cab.imageurl,
                            cab_id: cab_id,
                            model_registration_no: registrationNumber,
                            location: location,
                            kms: null,
                            time_required: time_required,
                            start_date: start_date,
                            model_name: model_name,
                        });
                        yield driver.save();
                        user.pending_request = request._id;
                        yield user.save();
                        deleteRequestAfterCountdown(user_id, driver_id, request._id.toString());
                        // Create a pusher trigger
                        pusher
                            .trigger(request._id.toString(), "Requests", request)
                            .then((e) => {
                            // Success: Return the request
                            return res.status(201).json({
                                message: "Successfully Created the request",
                                data: request,
                            });
                        })
                            .catch((error) => {
                            return res.status(500).json({
                                message: "Cannot create a pusher trigger but created the Request",
                                data: request,
                            });
                        });
                    }
                }
            }
            else {
                return res.status(400).json({ error: "No such user or driver exists" });
            }
        }
        else {
            //Error: Token not valid.
            return res.status(404).json({ message: "Token not valid" });
        }
    }
    else {
        //Error: if Header not found.
        return res.status(404).json({ message: "Token not found" });
    }
    // } catch (err) {
    //   // Error: if something breaks in code.
    //   res.status(500).json({ error: "Internal Server Error" });
    // }
});
exports.createRequestController = createRequestController;
// Accept the request by the User
const requestAcceptedByDriverController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bearerHeader = req.headers.authorization;
        if (bearerHeader !== undefined) {
            const bearer = bearerHeader;
            const tokenVerify = jsonwebtoken_1.default.verify(bearer.split(" ")[1], SecretKey);
            if (tokenVerify) {
                // Take out data
                const { request_id } = req.body;
                if (!request_id) {
                    // Check if all the fields are filled
                    return res.status(400).json({ error: "Please fill all the fields" });
                }
                else {
                    // Find the request and change the status to Accepted
                    let request = yield requests_1.default.findById({ _id: request_id });
                    if (!request) {
                        // Check if the request exists
                        return res.status(400).json({ error: "No such request exists" });
                    }
                    else if (request._id.toString() === request_id &&
                        request.request_status !== "Accepted") {
                        // removing the createdAt field to make
                        request.createdAt = undefined;
                        // check the user and driver
                        const driver = yield driver_1.default.findById({
                            _id: request.driver_id,
                        });
                        const user = yield user_1.default.findById({ _id: request.user_id });
                        if (!driver || !user) {
                            return res
                                .status(400)
                                .json({ error: "No such user or driver exists" });
                        }
                        else {
                            // Add rhe request to the accepted requests of the user
                            // Check if the request is already accepted
                            request.request_status = "Accepted";
                            request = yield request.save();
                            // Change the status of the user
                            user.pending_request = "";
                            user.accepted_request.push(request);
                            yield user.save();
                            // Change the status of the driver
                            driver.pendingRequests = driver.pendingRequests.filter((data) => {
                                if (data.request_id === request_id && request !== null) {
                                    request.imageurl = data.imageurl;
                                }
                                return data.request_id !== request_id;
                            });
                            driver.acceptedRequests.push(request);
                            yield driver.save();
                            request.imageurl = driver.imageurl;
                            // Create a pusher trigger
                            pusher
                                .trigger("Requests", request._id.toString(), request)
                                .then(() => {
                                // Terminate the Pusher Trigger
                                terminateRequest(request === null || request === void 0 ? void 0 : request._id.toString());
                                // Return the request
                                return res.status(201).json({
                                    message: "Successfully accepted the request",
                                    data: request,
                                });
                            })
                                .catch((error) => {
                                return res.status(500).json({
                                    message: "Cannot create a pusher trigger but request accepted",
                                    data: request,
                                });
                            });
                        }
                    }
                    else if (request.request_status === "Accepted" ||
                        request.request_status === "Rejected") {
                        // Error: Request already accepted
                        return res
                            .status(400)
                            .json({ error: "Request already accepted or Rejected" });
                    }
                }
            }
            else {
                //Error: Token not valid.
                return res.status(404).json({ message: "Token not valid" });
            }
        }
        else {
            //Error: if Header not found.
            return res.status(404).json({ message: "Token not found" });
        }
    }
    catch (e) {
        //Error: if something breaks in code.
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.requestAcceptedByDriverController = requestAcceptedByDriverController;
// Reject the request by the User
const requestRejectedByDriverController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bearerHeader = req.headers.authorization;
        if (bearerHeader !== undefined) {
            const bearer = bearerHeader;
            const tokenVerify = jsonwebtoken_1.default.verify(bearer.split(" ")[1], SecretKey);
            if (tokenVerify) {
                // Take out data
                const { request_id } = req.body;
                if (!request_id) {
                    // Check if all the fields are filled
                    return res.status(400).json({ error: "Please fill all the fields" });
                }
                else {
                    // Find the request and change the status to Accepted
                    const requests = yield requests_1.default.findById({ _id: request_id });
                    if (!requests) {
                        // Check if the request exists
                        return res.status(400).json({ error: "No such request exists" });
                    }
                    else if (requests._id.toString() === request_id &&
                        requests.request_status === "Pending") {
                        // check the user and driver
                        const driver = yield driver_1.default.findById({
                            _id: requests.driver_id,
                        });
                        const user = yield user_1.default.findById({ _id: requests.user_id });
                        if (!driver || !user) {
                            return res
                                .status(400)
                                .json({ error: "No such user or driver exists" });
                        }
                        else {
                            requests.request_status = "Rejected";
                            requests.createdAt = undefined;
                            // Change the status of the driver
                            driver.pendingRequests = driver.pendingRequests.filter((data) => {
                                return data.request_id !== request_id;
                            });
                            yield driver.save();
                            // Change the status of the user
                            user.pending_request = "";
                            yield user.save();
                            yield requests.save();
                            // Create a pusher trigger
                            pusher
                                .trigger("Requests", requests._id.toString(), requests)
                                .then(() => {
                                // Terminate the Pusher Trigger
                                terminateRequest(requests === null || requests === void 0 ? void 0 : requests._id.toString());
                                // Return the request
                                return res.status(201).json({
                                    message: "Successfully Cancelled the request",
                                    data: requests,
                                });
                            })
                                .catch((error) => {
                                return res.status(500).json({
                                    message: "Cannot create a pusher trigger but request Rejected",
                                    data: requests,
                                });
                            });
                        }
                    }
                    else if (requests.request_status === "Accepted" ||
                        requests.request_status === "Rejected") {
                        // Error: Request already accepted
                        return res
                            .status(400)
                            .json({ error: "Request already accepted or Rejected" });
                    }
                }
            }
            else {
                //Error: Token not valid.
                return res.status(404).json({ message: "Token not valid" });
            }
        }
        else {
            //Error: if Header not found.
            return res.status(404).json({ message: "Token not found" });
        }
    }
    catch (e) {
        //Error: if something breaks in code.
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.requestRejectedByDriverController = requestRejectedByDriverController;
// Schedule a task to delete the documents
const deleteExpiredRequests = node_cron_1.default.schedule("00 00 00 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Calculate the deletion date based on the start_date, time_required, and kms
        const allRequests = yield requests_1.default.find();
        for (const request of allRequests) {
            if ((request.time_required !== null &&
                request.request_status === "Completed") ||
                request.request_status === "Rejected") {
                const currentDate = new Date();
                const deletionDate = new Date();
                deletionDate.setTime(request.start_date.getTime() +
                    (request.time_required || 0) +
                    1000 * 60 * 60 * 24);
                if (currentDate > deletionDate) {
                    yield requests_1.default.deleteOne({ _id: request._id });
                }
            }
            if ((request.kms !== null && request.request_status === "Completed") ||
                request.request_status === "Rejected") {
                const currentDate = new Date();
                const deletionDate = new Date();
                deletionDate.setTime(request.start_date.getTime() +
                    (request.kms || 0) * 20 * 60000 +
                    1000 * 60 * 60 * 24);
                if (currentDate > deletionDate) {
                    yield requests_1.default.deleteOne({ _id: request._id });
                }
            }
        }
    }
    catch (error) {
        console.error("Error deleting expired requests:", error);
    }
}));
// Start the scheduled task
deleteExpiredRequests.start();
