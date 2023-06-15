import {
  DocumentDefinition,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from "mongoose";
import RequestModel, { requests } from "../models/requests";

// Create requests Service
export const createCompany = (input: DocumentDefinition<requests>) => {
  return RequestModel.create(input);
};

// Find requests Service
export const findCompany = (
  query: FilterQuery<requests>,
  options: QueryOptions = { lean: true }
) => {
  return RequestModel.find(query, {}, options);
};

// Find and Update requests Service
export function findAndUpdate(
  query: FilterQuery<requests>,
  update: UpdateQuery<requests>,
  options: QueryOptions
) {
  return RequestModel.findOneAndUpdate(query, update, options);
}

// Delete requests Service
export const deleteCompany = (query: FilterQuery<requests>) => {
  return RequestModel.deleteOne(query);
};
