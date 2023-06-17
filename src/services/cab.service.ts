import {
  DocumentDefinition,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from "mongoose";
import cabModel, { Cab } from "../models/cab";

// Create cab Service
export const createCabService = (input: DocumentDefinition<Cab>) => {
  return cabModel.create(input);
};

// Find cab Service
export const findCabService = (
  query: FilterQuery<Cab>,
  options: QueryOptions = { lean: true }
) => {
  return cabModel.find(query, {}, options);
};

// Find and Update cab Service
export function findAndUpdateCabService(
  query: FilterQuery<Cab>,
  update: UpdateQuery<Cab>,
  options: QueryOptions
) {
  return cabModel.findOneAndUpdate(query, update, options);
}

// Delete cab Service
export const deleteCabService = (query: FilterQuery<Cab>) => {
  return cabModel.deleteOne(query);
};
