import {
  DocumentDefinition,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from "mongoose";
import CabModel, { cab } from "../models/cab";

// Create cab Service
export const createCompany = (input: DocumentDefinition<cab>) => {
  return CabModel.create(input);
};

// Find cab Service
export const findCompany = (
  query: FilterQuery<cab>,
  options: QueryOptions = { lean: true }
) => {
  return CabModel.find(query, {}, options);
};

// Find and Update cab Service
export function findAndUpdate(
  query: FilterQuery<cab>,
  update: UpdateQuery<cab>,
  options: QueryOptions
) {
  return CabModel.findOneAndUpdate(query, update, options);
}

// Delete cab Service
export const deleteCompany = (query: FilterQuery<cab>) => {
  return CabModel.deleteOne(query);
};
