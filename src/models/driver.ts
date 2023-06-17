import { Schema, model, Document } from "mongoose";

// ------------------------------------------------------------------------
export interface Location {
  latitude: number;
  longitude: number;
}
// ----------------------------------------------------- Location Interface

// ------------------------------------------------------------------------
export interface Driver extends Document {
  username: string;
  email_id: string;
  mobile_no: string;
  gender: string;
  age: number;
  rating: number;
  experience_years: number;
  location: string;
  availability: boolean;
  vehicle_preferred: [string];
  rate_per_km: number;
  acceptedRequests: [string];
  pendingRequests: [string];
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
const driverSchema = new Schema<Driver>({
  username: {
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
  },
  vehicle_preferred: {
    type: [String],
  },
  rate_per_km: {
    type: Number,
  },
});
// --------------------------------------------------------- Driver Schema
const driverModel = model<Driver>("Driver", driverSchema);

export default driverModel;
