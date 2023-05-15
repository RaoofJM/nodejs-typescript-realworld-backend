import { Request, Response, NextFunction } from "express";
import ApiKeyRepo from "../database/repository/apiKey";
import { ForbiddenError, InternalError, NotFoundError } from "../core/apiError";
import { SuccessMsgResponse, SuccessResponse } from "../core/apiResponse";
import ApiKey from "../database/model/apiKye";
import { Types } from "mongoose";
import isArrayOfStrings from "../utils/isArrayOfStrings";

// GET - /apikey/find-all
async function findAll(req: Request, res: Response, next: NextFunction) {
  const apiKeys = await ApiKeyRepo.findAll();

  return new SuccessResponse("success", apiKeys);
}

// POST - /apikey/create
async function create(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.body.apiKey;

  const permissions = apiKey.permissions;
  if (!isArrayOfStrings(permissions)) apiKey.permissions = [];

  const result = await ApiKeyRepo.create(apiKey);
  if (result) return new SuccessResponse("success", result);
  else return new InternalError("database problem");
}

// PUT - /apikey/update
async function update(req: Request, res: Response, next: NextFunction) {
  const id = new Types.ObjectId(req.params.id);
  const apiKey = await ApiKeyRepo.findById(id);
  if (!apiKey) return new NotFoundError("Apikey not found");

  const permissions = apiKey.permissions;
  if (!isArrayOfStrings(permissions)) apiKey.permissions = [];

  if (req.body.permissions) apiKey.permissions = req.body.permissions;
  if (req.body.status) apiKey.status = req.body.status;
  if (req.body.key) apiKey.key = req.body.key;

  const result = await ApiKeyRepo.update(apiKey);
  if (result) return new SuccessResponse("success", result);
  else return new InternalError("database problem");
}

// DELETE - /apikey/remove
async function remove(req: Request, res: Response, next: NextFunction) {
  const id = new Types.ObjectId(req.params.id);

  const result = await ApiKeyRepo.remove(id);
  if (result) return new SuccessMsgResponse("success");
  else return new InternalError("database problem");
}

// GET - /apikey/find-by-id
async function findById(req: Request, res: Response, next: NextFunction) {
  const id = new Types.ObjectId(req.params.id);

  const result = await ApiKeyRepo.findById(id);
  if (result) return new SuccessResponse("success", result);
  else return new InternalError("database problem");
}

// GET - /apikey/find-by-key
async function findByKey(req: Request, res: Response, next: NextFunction) {
  const key = req.params.key.toString()

  const result = await ApiKeyRepo.findByKey(key);
  if (result) return new SuccessResponse("success", result);
  else return new InternalError("database problem");
}

export default {
  findAll,
  create,
  update,
  findById,
  findByKey,
  remove,
};
