import RefreshToken, { RefreshTokenModel } from "../model/refreshToken";
import { Types } from "mongoose";

export async function findAll() {
  return RefreshTokenModel.find();
}

async function create(refreshToken: RefreshToken) {
  const now = new Date();
  refreshToken.createdAt = now;
  const createdRefreshToken = RefreshTokenModel.create(refreshToken);
  return createdRefreshToken;
}

async function update(refreshToken: RefreshToken) {
  return RefreshTokenModel.findByIdAndUpdate(refreshToken._id, refreshToken, {
    new: true,
  });
}

async function remove(id: Types.ObjectId) {
  return RefreshTokenModel.findByIdAndRemove(id);
}

async function findById(id: Types.ObjectId) {
  return RefreshTokenModel.findById(id);
}

async function findByDeviceIdentifier(deviceIdentifier: string) {
  return RefreshTokenModel.findOne({ deviceIdentifier });
}

export default {
  create,
  findAll,
  update,
  findById,
  findByDeviceIdentifier,
  remove,
};
