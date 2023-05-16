import { Request, Response, NextFunction } from "express";
import ApiKeyRepo from "../database/repository/apiKey";
import {
  BadRequestError,
  ForbiddenError,
  InternalError,
  NotFoundError,
} from "../core/apiError";
import { SuccessMsgResponse, SuccessResponse } from "../core/apiResponse";
import ApiKey from "../database/model/apiKye";
import { Types } from "mongoose";
import isArrayOfStrings from "../utils/isArrayOfStrings";

// GET - /apikey/find-all
async function findAll(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKeys = await ApiKeyRepo.findAll();

    return new SuccessResponse("success", apiKeys).send(res);
  } catch (err) {
    next(err);
  }
}

// POST - /apikey/create
async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKey: ApiKey = req.body;

    const exist = await ApiKeyRepo.findByKey(apiKey.key);
    if (exist) throw new BadRequestError("Key is Already Taken");

    const permissions = apiKey.permissions;
    if (!isArrayOfStrings(permissions)) apiKey.permissions = [];

    const result = await ApiKeyRepo.create(apiKey);
    if (result) return new SuccessResponse("success", result).send(res);
    else throw new InternalError("database problem");
  } catch (err) {
    next(err);
  }
}

// PUT - /apikey/update
async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = new Types.ObjectId(req.params.id);
    const apiKey = await ApiKeyRepo.findById(id);
    if (!apiKey) throw new NotFoundError("Apikey not found");

    const exist = await ApiKeyRepo.findByKeyButId(apiKey.id, req.body.key);
    if (exist) throw new BadRequestError("Key is Already Taken");

    if (req.body.permissions && isArrayOfStrings(req.body.permissions))
      apiKey.permissions = req.body.permissions;
    if (req.body.status) apiKey.status = req.body.status;
    if (req.body.key) apiKey.key = req.body.key;

    const result = await ApiKeyRepo.update(apiKey);
    if (result) return new SuccessResponse("success", result).send(res);
    else throw new InternalError("database problem");
  } catch (err) {
    next(err);
  }
}

// DELETE - /apikey/remove
async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = new Types.ObjectId(req.params.id);

    const exist = await ApiKeyRepo.findById(id);
    if (!exist) throw new BadRequestError("No Apikey Found");

    const result = await ApiKeyRepo.remove(id);
    if (result) return new SuccessMsgResponse("success").send(res);
    else throw new InternalError("database problem");
  } catch (err) {
    next(err);
  }
}

// GET - /apikey/find-by-id
async function findById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = new Types.ObjectId(req.params.id);

    const exist = await ApiKeyRepo.findById(id);
    if (!exist) throw new BadRequestError("No Apikey Found");

    const result = await ApiKeyRepo.findById(id);
    if (result) return new SuccessResponse("success", result).send(res);
    else throw new InternalError("database problem");
  } catch (err) {
    next(err);
  }
}

// GET - /apikey/find-by-key
async function findByKey(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.params.key.toString();

    const exist = await ApiKeyRepo.findByKey(key);
    if (!exist) throw new BadRequestError("No Apikey Found");

    const result = await ApiKeyRepo.findByKey(key);
    if (result) return new SuccessResponse("success", result).send(res);
    else throw new InternalError("database problem");
  } catch (err) {
    next(err);
  }
}

export default {
  findAll,
  create,
  update,
  findById,
  findByKey,
  remove,
};
