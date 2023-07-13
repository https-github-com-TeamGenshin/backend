"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// --------------------------------------------------------- Cab Interface
// ------------------------------------------------------------------------
const CabDetailsSchema = new mongoose_1.Schema({
    registration_number: {
        type: [String],
    },
    model_name: {
        type: String,
    },
    model_no: {
        type: String,
    },
    imageurl: {
        type: String,
    },
    colour: {
        type: String,
    },
    location: {
        type: String,
    },
    no_of_seats: {
        type: Number,
    },
    hrs_rate: {
        type: Number,
    },
    kms_rate: {
        type: Number,
    },
    fuel_type: {
        type: String,
    },
    no_of_available: {
        type: Number,
    },
});
// ------------------------------------------------------ CabDetails Schema
// ------------------------------------------------------------------------
const cabSchema = new mongoose_1.Schema({
    type: {
        type: String,
    },
    cabs: {
        type: [CabDetailsSchema],
    },
});
// ------------------------------------------------------------ Cab Schema
const cabModel = (0, mongoose_1.model)("Cab", cabSchema);
exports.default = cabModel;
