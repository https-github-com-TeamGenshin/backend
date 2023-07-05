import { Schema, model, Document } from "mongoose";

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
  vehicle_preferred: [string];
  rate_per_km: number;
  rate_per_hrs: number;
  acceptedRequests: [string];
  pendingRequests: [string];
}
// ------------------------------------------------------- Driver Interface

// ------------------------------------------------------------------------
const driverSchema = new Schema<Driver>({
  username: {
    type: String,
  },
  password: {
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
  imageurl: {
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
  rate_per_hrs: {
    type: Number,
  },
});
// --------------------------------------------------------- Driver Schema
const driverModel = model<Driver>("Driver", driverSchema);

export default driverModel;
