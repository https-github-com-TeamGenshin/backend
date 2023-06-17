import {
  DocumentDefinition,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from "mongoose";
import requestModel, { Requests } from "../models/requests";

// Create requests Service
export const createRequestService = (input: DocumentDefinition<Requests>) => {
  return requestModel.create(input);
};

// Find requests Service
export const findRequestService = (
  query: FilterQuery<Requests>,
  options: QueryOptions = { lean: true }
) => {
  return requestModel.find(query, {}, options);
};

// Find and Update requests Service
export function findAndUpdateRequestService(
  query: FilterQuery<Requests>,
  update: UpdateQuery<Requests>,
  options: QueryOptions
) {
  return requestModel.findOneAndUpdate(query, update, options);
}

// Delete requests Service
export const deleteRequestService = (query: FilterQuery<Requests>) => {
  return requestModel.deleteOne(query);
};
