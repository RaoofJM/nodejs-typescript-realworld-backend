import express, { Request, Response, NextFunction } from "express";
import ApiKeyRepo from "../../database/repository/apiKey";
import { ForbiddenError } from "../../core/apiError";
import Logger from "../../core/logger";
import schema from "./schema";
import validator, { ValidationSource } from "../../helpers/validator";
import ApiKey, { Permission } from "../../database/model/apiKye";
import { Types } from "mongoose";

const router = express.Router();

declare module "express-serve-static-core" {
  interface Request {
    apiKey: ApiKey;
    userId: Types.ObjectId;
  }
}

const superAdminApiKeyChech = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.apiKey;
    if (apiKey?.permissions?.includes(Permission.SUPER_ADMIN)) {
      Logger.info("superadmin apikey was used");
      return next();
    }
    throw new ForbiddenError("Permission Denied");
  } catch (err) {
    next(err);
  }
};

export default router.use(
  validator(schema.apiKey, ValidationSource.HEADER),
  async (req: Request, res, next) => {
    try {
      const key = req.headers["x-api-key"]?.toString();
      if (!key) throw new ForbiddenError("Api Key Was Not Found");

      const apiKey = await ApiKeyRepo.findByKey(key);
      if (!apiKey) throw new ForbiddenError("No Api Key Found");

      if (!apiKey?.permissions)
        return next(new ForbiddenError("Permission Denied"));

      const exists = apiKey?.permissions.find(
        (entry) => entry === Permission.GENERAL
      );
      if (!exists) return next(new ForbiddenError("Permission Denied"));

      Logger.info(apiKey);

      req.apiKey = apiKey;
      return next();
    } catch (err) {
      next(err);
    }
  }
);

export { superAdminApiKeyChech };
