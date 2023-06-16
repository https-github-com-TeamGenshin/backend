import { model, Schema, Document, Types } from "mongoose";

export interface Cab extends Document {
  registration_number: string;
  model_name: string;
  model_no: string;
  colour: string;
  no_of_seats: number;
  kms_run: number;
  initial_rate: number;
  fuel_type: string;
  available_status: number;
}

const cabSchema = new Schema<Cab>({
  registration_number: {
    type: String,
  },
  model_name: {
    type: String,
  },
  model_no: {
    type: String,
  },
  colour: {
    type: String,
  },
  no_of_seats: {
    type: Number,
  },
  kms_run: {
    type: Number,
  },
  initial_rate: {
    type: Number,
  },
  fuel_type: {
    type: String,
  },
  available_status: {
    type: Number,
  },
});

const cabModel = model<Cab>("Cab", cabSchema);

export default cabModel;
