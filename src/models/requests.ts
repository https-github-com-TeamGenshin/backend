import { model, Schema, Document } from "mongoose";
import { locationSchema, Location } from "./driver";

import cabModel from "./cab";

// ------------------------------------------------------------------------
export interface Requests extends Document {
  user_id: string;
  driver_id: string;
  cab_id: string;
  type: string;
  model_name: string;
  model_registration_no: string;
  location: Location;
  kms: number | null;
  time_required: number | null;
  start_date: Date;
  request_status: string;
  createdAt?: Date;
}
// -----------------------------------------------------  Request Interface

// ------------------------------------------------------------------------
const requestsSchema = new Schema<Requests>({
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
  request_status: {
    type: String,
    default: "Pending",
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

const RequestModel = model<Requests>("Requests", requestsSchema);

export default RequestModel;
