import { model, Schema, Document, Types } from "mongoose";
import { location, Location } from "./driver";

export interface requests extends Document {
  user_id: string;
  driver_id: string;
  location_driver: location;
  location_user: location;
}

const RequestsSchema = new Schema<requests>({
  user_id: {
    type: String,
  },
  driver_id: {
    type: String,
  },
  location_driver: {
    type: Location,
  },
  location_user: {
    type: Location,
  },
});

const RequestModel = model<requests>("Requests", RequestsSchema);

export default RequestModel;
