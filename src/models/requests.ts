import { model, Schema, Document } from "mongoose";
import { locationSchema, Location } from "./driver";

import cabModel from "./cab";

// ------------------------------------------------------------------------
export interface Requests extends Document {
  user_id: string;
  driver_id: string;
  cab_id: string;
  type: string;
  model_registration_no: string;
  location_user: Location;
  kms: number | null;
  time_required: Date | null;
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
  location_user: {
    type: locationSchema,
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
    type: Date,
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

// save the document using methods like save() or create() to change the data of createdAt
// save the document after changing the request_status string to "Accepted"
requestsSchema.pre<Requests>("save", function (next) {
  if (this.request_status === "Accepted") {
    this.createdAt = undefined;
  }
  next();
});

const RequestModel = model<Requests>("Requests", requestsSchema);

export default RequestModel;
