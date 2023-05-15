import ApiKey, { ApiKeyModel } from "../model/apiKye";
import { Types } from "mongoose";

export async function findAll() {
  return ApiKeyModel.find();
}

async function create(apiKey: ApiKey) {
  const now = new Date();
  apiKey.createdAt = now;
  apiKey.updatedAt = now;
  const createdApiKey = ApiKeyModel.create(apiKey);
  return createdApiKey;
}

async function update(apiKey: ApiKey) {
  apiKey.updatedAt = new Date();
  return ApiKeyModel.findByIdAndUpdate(apiKey._id, apiKey, { new: true });
}

async function remove(id: Types.ObjectId) {
  return ApiKeyModel.findByIdAndRemove(id);
}

async function findById(id: Types.ObjectId) {
  return ApiKeyModel.findById(id);
}

async function findByKey(key: string) {
  return ApiKeyModel.findOne({ key: key, status: true });
}

export default {
  create,
  findAll,
  update,
  findByKey,
  findById,
  remove,
};
