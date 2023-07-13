"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const driver_1 = require("./driver");
// -------------------------------------------------------- user Interface
//-------------------------------------------------------------------------
const acceptedSchema = new mongoose_1.Schema({
    user_id: {
        type: String,
    },
    driver_id: {
        type: String,
    },
    cab_id: {
        type: String,
    },
    location: {
        type: driver_1.locationSchema,
    },
    driver_name: {
        type: String,
    },
    imageurl: {
        type: String,
    },
    type: {
        type: String,
    },
    model_registration_no: {
        type: String,
    },
    kms: {
        type: Number,
        default: null,
    },
    time_required: {
        type: Number,
        default: null,
    },
    model_name: {
        type: String,
    },
    request_status: {
        type: String,
        default: "Accepted",
    },
    start_date: {
        type: Date,
    },
});
//-------------------------------------------------------- Accepted Officer
// ------------------------------------------------------------------------
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email_id: {
        type: String,
    },
    mobile_no: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    age: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    pending_request: {
        type: String,
    },
    accepted_request: {
        type: [acceptedSchema],
    },
});
// ------------------------------------------------------------ User Schema
const userModel = (0, mongoose_1.model)("Company", userSchema);
exports.default = userModel;
