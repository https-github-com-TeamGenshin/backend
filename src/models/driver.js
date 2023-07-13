"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptSchema = exports.locationSchema = void 0;
const mongoose_1 = require("mongoose");
// ------------------------------------------------------- Driver Interface
// ------------------------------------------------------------------------
exports.locationSchema = new mongoose_1.Schema({
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
});
// -------------------------------------------------------- Location Schema
// ------------------------------------------------------------------------
exports.acceptSchema = new mongoose_1.Schema({
    user_id: {
        type: String,
    },
    imageurl: {
        type: String,
    },
    cab_id: {
        type: String,
    },
    location: {
        type: exports.locationSchema,
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
    start_date: {
        type: Date,
    },
});
// ---------------------------------------------------------- Accept Schema
// ---------------------------------------------------------- Pending Schema
const pendingSchema = new mongoose_1.Schema({
    request_id: {
        type: String,
    },
    user_id: {
        type: String,
    },
    cab_id: {
        type: String,
    },
    location: {
        type: exports.locationSchema,
    },
    imageurl: {
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
    start_date: {
        type: Date,
    },
});
// ---------------------------------------------------------- Pending Schema
// ------------------------------------------------------------------------
const driverSchema = new mongoose_1.Schema({
    username: {
        type: String,
    },
    password: {
        type: String,
    },
    imageurl: {
        type: String,
    },
    email_id: {
        type: String,
    },
    mobile_no: {
        type: String,
    },
    gender: {
        type: String,
    },
    age: {
        type: Number,
    },
    rating: {
        type: Number,
    },
    experience_years: {
        type: Number,
    },
    location: {
        type: String,
    },
    availability: {
        type: Boolean,
        default: false,
    },
    vehicle_preferred: {
        type: [String],
    },
    rate_per_km: {
        type: Number,
    },
    rate_per_hrs: {
        type: Number,
    },
    acceptedRequests: {
        type: [exports.acceptSchema],
    },
    pendingRequests: {
        type: [pendingSchema],
    },
});
// --------------------------------------------------------- Driver Schema
const driverModel = (0, mongoose_1.model)("Driver", driverSchema);
exports.default = driverModel;
