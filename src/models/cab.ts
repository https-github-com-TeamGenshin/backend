import { model, Schema, Document, Types } from "mongoose";

// ------------------------------------------------------------------------
export interface CabDetails {
  registration_number: [string];
  model_name: string;
  model_no: string;
  imageurl: string;
  colour: string;
  no_of_seats: number;
  kms_run: number;
  initial_rate: number;
  fuel_type: string;
  no_of_available: number;
}
// -------------------------------------------------- CabDetails Interface

// ------------------------------------------------------------------------
export interface Cab extends Document {
  type: string;
  cabs: CabDetails[];
}
// --------------------------------------------------------- Cab Interface

// ------------------------------------------------------------------------

const CabDetailsSchema = new Schema<CabDetails>({
  registration_number: {
    type: [String],
  },
  model_name: {
    type: String,
  },
  model_no: {
    type: String,
  },
  imageurl: {
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
  no_of_available: {
    type: Number,
  },
});

// ------------------------------------------------------ CabDetails Schema

// ------------------------------------------------------------------------
const cabSchema = new Schema<Cab>({
  type: {
    type: String,
  },
  cabs: {
    type: [CabDetailsSchema],
  },
});
// ------------------------------------------------------------ Cab Schema

const cabModel = model<Cab>("Cab", cabSchema);

export default cabModel;
