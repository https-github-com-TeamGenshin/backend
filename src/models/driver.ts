import { Schema, model, Document } from "mongoose";

export interface location {
  latitude: number;
  longitude: number;
}

export interface driver extends Document {
  username: string;
  email_id: string;
  mobile_no: string;
  gender: string;
  age: number;
  rating: number;
  experience_years: number;
  location: location;
  availability: boolean;
  vehicle_preferred: [string];
  rate_per_km: number;
}

export const Location = new Schema<location>({
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
});

const driverSchema = new Schema<driver>({
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
    type: Location,
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

const DriverModel = model<driver>("Driver", driverSchema);

export default DriverModel;
