import { model, Schema, Document, Types } from "mongoose";

// ------------------------------------------------------------------------
export interface User extends Document {
  name: string;
  email_id: string;
  mobile_no: string;
  password: string;
  gender: string;
  age: string;
  location: string;
  pending_request: string;
}
// -------------------------------------------------------- user Interface

// ------------------------------------------------------------------------
const userSchema = new Schema<User>({
  name: {
    type: String,
    required: true,
  },
  email_id: {
    type: String,
  },
  mobile_no: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  pending_request: {
    type: String,
  },
});
// ------------------------------------------------------------ User Schema

const userModel = model<User>("Company", userSchema);

export default userModel;
