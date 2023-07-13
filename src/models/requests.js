"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const driver_1 = require("./driver");
// -----------------------------------------------------  Request Interface
// ------------------------------------------------------------------------
const requestsSchema = new mongoose_1.Schema({
    user_id: {
        type: String,
    },
    driver_id: {
        type: String,
    },
    driver_name: {
        type: String,
    },
    imageurl: {
        type: String,
    },
    cab_id: {
        type: String,
    },
    location: {
        type: driver_1.locationSchema,
    },
    type: {
        type: String,
    },
    model_name: {
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
    request_status: {
        type: String,
        default: "Pending",
    },
    total_amount: {
        type: Number,
        default: 0,
    },
    start_date: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
// --------------------------------------------------------- Request Schema
const RequestModel = (0, mongoose_1.model)("Requests", requestsSchema);
exports.default = RequestModel;
