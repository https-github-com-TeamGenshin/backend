import { model, Schema, Document } from "mongoose";

//-------------------------------------------------------------------------
export interface Accepted {
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
}

//------------------------------------------------------- accepted Interface

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
  accepted_request: Accepted[];
}
// -------------------------------------------------------- user Interface

//-------------------------------------------------------------------------
const acceptedSchema = new Schema<Accepted>({
  user_id: {
    type: String,
  },
  driver_id: {
    type: String,
  },
  cab_id: {
    type: String,
  },
  type: {
    type: String,
  },
  model_registration_no: {
    type: String,
  },
  source_location: {
    type: String,
  },
  destination_location: {
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
    default: "Accepted",
  },
  start_date: {
    type: Date,
  },
});
//-------------------------------------------------------- Accepted Officer

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
  accepted_request: {
    type: [acceptedSchema],
  },
});
// ------------------------------------------------------------ User Schema

const userModel = model<User>("Company", userSchema);

export default userModel;
