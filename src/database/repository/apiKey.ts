import ApiKey, { ApiKeyModel, createSuperAdminApiKey } from "../model/apiKye";
import { Types } from "mongoose";

export async function findAll() {
  await createSuperAdminApiKey();

  return ApiKeyModel.find();
}

async function create(apiKey: ApiKey) {
  await createSuperAdminApiKey();

  const now = new Date();
  apiKey.createdAt = now;
  apiKey.updatedAt = now;
  const createdApiKey = ApiKeyModel.create(apiKey);
  return createdApiKey;
}

async function update(apiKey: ApiKey) {
  await createSuperAdminApiKey();

  apiKey.updatedAt = new Date();
  return ApiKeyModel.findByIdAndUpdate(apiKey._id, apiKey, { new: true });
}

async function remove(id: Types.ObjectId) {
  await createSuperAdminApiKey();

  return ApiKeyModel.findByIdAndRemove(id);
}

async function findById(id: Types.ObjectId) {
  await createSuperAdminApiKey();

  return ApiKeyModel.findById(id);
}

async function findByKey(key: string) {
  await createSuperAdminApiKey();

  return ApiKeyModel.findOne({ key: key, status: true });
}

async function findByKeyButId(id: Types.ObjectId | string, key: string) {
  await createSuperAdminApiKey();

  id = id.toString();

  return ApiKeyModel.findOne({
    key: key,
    _id: { $ne: id },
  });
}

export default {
  create,
  findAll,
  update,
  findByKey,
  findById,
  findByKeyButId,
  remove,
};
