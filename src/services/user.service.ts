import {
  DocumentDefinition,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from "mongoose";
import userModel, { User } from "../models/user";

// Create user Service
export const createUserService = (input: DocumentDefinition<User>) => {
  return userModel.create(input);
};

// Find user Service
export const findUserService = (
  query: FilterQuery<User>,
  options: QueryOptions = { lean: true }
) => {
  return userModel.find(query, {}, options);
};

// Find and Update user Service
export function findAndUpdateUserService(
  query: FilterQuery<User>,
  update: UpdateQuery<User>,
  options: QueryOptions
) {
  return userModel.findOneAndUpdate(query, update, options);
}

// Delete user Service
export const deleteUserService = (query: FilterQuery<User>) => {
  return userModel.deleteOne(query);
};
