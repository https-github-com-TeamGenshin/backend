import {
  DocumentDefinition,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from "mongoose";
import userModel, { user } from "../models/user";

// Create user Service
export const createCompany = (input: DocumentDefinition<user>) => {
  return userModel.create(input);
};

// Find user Service
export const findCompany = (
  query: FilterQuery<user>,
  options: QueryOptions = { lean: true }
) => {
  return userModel.find(query, {}, options);
};

// Find and Update user Service
export function findAndUpdate(
  query: FilterQuery<user>,
  update: UpdateQuery<user>,
  options: QueryOptions
) {
  return userModel.findOneAndUpdate(query, update, options);
}

// Delete user Service
export const deleteCompany = (query: FilterQuery<user>) => {
  return userModel.deleteOne(query);
};
