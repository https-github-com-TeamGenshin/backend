import { model, Schema, Document, Types } from "mongoose";
import { locationSchema, Location } from "./driver";

interface Requests extends Document {
  user_id: string;
  driver_id: string;
  location_user: Location;
  kms: number;
  time_required: Date;
  start_date: Date;
  createdAt?: Date;
}

const requestsSchema = new Schema<Requests>({
  user_id: {
    type: String,
  },
  driver_id: {
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
  start_date: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const RequestModel = model<Requests>("Requests", requestsSchema);

export default RequestModel;
