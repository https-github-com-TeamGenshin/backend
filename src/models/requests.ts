import { model, Schema, Document, Types } from "mongoose";
import { locationSchema, Location } from "./driver";

// ------------------------------------------------------------------------
export interface Requests extends Document {
  user_id: string;
  driver_id: string;
  cab_id: string;
  type: string;
  model_no: string;
  location_user: Location;
  kms: number;
  time_required: Date;
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
  kms: {
    type: Number,
  },
  time_required: {
    type: Date,
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
