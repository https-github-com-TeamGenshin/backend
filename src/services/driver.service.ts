import {
  DocumentDefinition,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from "mongoose";
import DriverModel, { driver } from "../models/driver";
DriverModel;

// Create driver Service
export const createCompany = (input: DocumentDefinition<driver>) => {
  return DriverModel.create(input);
};

// Find driver Service
export const findCompany = (
  query: FilterQuery<driver>,
  options: QueryOptions = { lean: true }
) => {
  return DriverModel.find(query, {}, options);
};

// Find and Update driver Service
export function findAndUpdate(
  query: FilterQuery<driver>,
  update: UpdateQuery<driver>,
  options: QueryOptions
) {
  return DriverModel.findOneAndUpdate(query, update, options);
}

// Delete driver Service
export const deleteCompany = (query: FilterQuery<driver>) => {
  return DriverModel.deleteOne(query);
};
