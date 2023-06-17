import {
  DocumentDefinition,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from "mongoose";
import driverModel, { Driver } from "../models/driver";

// Create driver Service
export const createDriverService = (input: DocumentDefinition<Driver>) => {
  return driverModel.create(input);
};

// Find driver Service
export const findDriverService = (
  query: FilterQuery<Driver>,
  options: QueryOptions = { lean: true }
) => {
  return driverModel.find(query, {}, options);
};

// Find and Update driver Service
export function findAndUpdateDriverService(
  query: FilterQuery<Driver>,
  update: UpdateQuery<Driver>,
  options: QueryOptions
) {
  return driverModel.findOneAndUpdate(query, update, options);
}

// Delete driver Service
export const deleteDriverService = (query: FilterQuery<Driver>) => {
  return driverModel.deleteOne(query);
};
