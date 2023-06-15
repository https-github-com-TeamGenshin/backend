import { model, Schema, Document, Types } from "mongoose";
import { location, Location } from "./driver";

export interface user extends Document {
  username: string;
  email_id: string;
  mobile_no: string;
  gender: string;
  age: string;
  location: location;
}

const UserSchema = new Schema<user>({
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
    type: Location,
  },
});

const userModel = model<user>("Company", UserSchema);

export default userModel;
