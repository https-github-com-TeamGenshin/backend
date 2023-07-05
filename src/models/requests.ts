import { model, Schema, Document } from "mongoose";
import cabModel from "./cab";

// ------------------------------------------------------------------------
export interface Requests extends Document {
  user_id: string;
  driver_id: string;
  cab_id: string;
  type: string;
  model_registration_no: string;
  source_location: string;
  destination_location: string;
  kms: number | null;
  time_required: Date | null;
  start_date: Date;
  request_status: string;
  total_amount: string;
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
  source_location: {
    type: String,
  },
  destination_location: {
    type: String,
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
  total_amount: {
    type: String,
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
