import { Schema, model, Document } from "mongoose";

// ------------------------------------------------------------------------
export interface Location {
  latitude: number;
  longitude: number;
}
// ----------------------------------------------------- Location Interface

// ------------------------------------------------------------------------
export interface Accept {
  user_id: string;
  cab_id: string;
  type: string;
  model_name: string;
  model_registration_no: string;
  location: Location;
  kms: number | null;
  time_required: number | null;
  start_date: Date;
}

// ---------------------------------------------------------- Accept Schema

// ------------------------------------------------------------------------
export interface Driver extends Document {
  username: string;
  password: string;
  email_id: string;
  mobile_no: string;
  gender: string;
  age: number;
  imageurl: string;
  rating: number;
  experience_years: number;
  location: string;
  availability: boolean;
  vehicle_preferred: string[];
  rate_per_km: number;
  rate_per_hrs: number;
  acceptedRequests: Accept[];
  pendingRequests: string[];
}
// ------------------------------------------------------- Driver Interface

// ------------------------------------------------------------------------
export const locationSchema = new Schema<Location>({
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
});
// -------------------------------------------------------- Location Schema

// ------------------------------------------------------------------------

export const acceptSchema = new Schema<Accept>({
  user_id: {
    type: String,
  },

  cab_id: {
    type: String,
  },
  location: {
    type: locationSchema,
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

// ------------------------------------------------------------------------
const driverSchema = new Schema<Driver>({
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
    type: [acceptSchema],
  },
  pendingRequests: {
    type: [String],
  },
});
// --------------------------------------------------------- Driver Schema
const driverModel = model<Driver>("Driver", driverSchema);

export default driverModel;
