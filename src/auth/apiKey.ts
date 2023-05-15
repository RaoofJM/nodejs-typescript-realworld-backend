import express, { Request } from "express";
import ApiKeyRepo from "../database/repository/apiKey";
import { ForbiddenError } from "../core/apiError";
import Logger from "../config/logger";
import schema from "./schema";
import validator, { ValidationSource } from "../utils/validator";
import { Permission } from "../database/model/apiKye";

const router = express.Router();

const superAdminApiKeyChech = router.use(
  validator(schema.apiKey, ValidationSource.HEADER),
  async (req: Request, res, next) => {
    const apiKey = req.body.apiKey;
    if (!apiKey.permissions.includes(Permission.SUPER_ADMIN))
      throw new ForbiddenError("Permission Denied");
    Logger.info("superadmin apikey was used");

    return next();
  }
);

export default router.use(
  validator(schema.apiKey, ValidationSource.HEADER),
  async (req: Request, res, next) => {
    const key = req.headers["x-api-key"]?.toString();
    if (!key) throw new ForbiddenError("Api Key Was Not Found");

    const apiKey = await ApiKeyRepo.findByKey(key);
    if (!apiKey) throw new ForbiddenError("No Api Key Found");

    if (!apiKey.permissions)
      return next(new ForbiddenError("Permission Denied"));

    const exists = apiKey.permissions.find(
      (entry) => entry === Permission.GENERAL
    );
    if (!exists) return next(new ForbiddenError("Permission Denied"));

    Logger.info(apiKey);

    req.body.apiKey = apiKey;
    return next();
  }
);

export { superAdminApiKeyChech };
