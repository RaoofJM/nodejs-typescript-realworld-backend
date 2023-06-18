import User, { UserModel } from "../model/user";
import { Types } from "mongoose";

export async function findAll() {
  return UserModel.find();
}

async function create(user: User) {
  const now = new Date();
  user.createdAt = now;

  const createdUser = await UserModel.create(user);
  return createdUser;
}

async function update(user: User) {
  user.updatedAt = new Date();
  return UserModel.findByIdAndUpdate(user._id, user, { new: true });
}

async function remove(id: Types.ObjectId) {
  return UserModel.findByIdAndRemove(id);
}

async function findById(id: Types.ObjectId | string) {
  return UserModel.findById(id);
}

async function findByEmail(email: string) {
  return UserModel.findOne({ email });
}

export default {
  create,
  findAll,
  update,
  findByEmail,
  findById,
  remove,
};
