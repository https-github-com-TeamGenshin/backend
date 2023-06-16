import { model, Schema, Document, Types } from "mongoose";
import { Location, locationSchema } from "./driver";

export interface user extends Document {
  username: string;
  email_id: string;
  mobile_no: string;
  gender: string;
  age: string;
  location: Location;
  pending_request: string;
}

const userSchema = new Schema<user>({
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
    type: String,
  },
  location: {
    type: locationSchema,
  },
  pending_request: {
    type: String,
  },
});

const userModel = model<user>("Company", userSchema);

export default userModel;
