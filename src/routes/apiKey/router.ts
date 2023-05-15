import express from "express";
import controller from "../../controllers/apiKey";
import validator, { ValidationSource } from "../../utils/validator";
import shcema from "./schema";
import { superAdminApiKeyChech } from "../../auth/apiKey";

const router = express.Router();

/*-------------------------------------------------------------------------*/
router.use(superAdminApiKeyChech);
/*-------------------------------------------------------------------------*/

// GET - /apikey/find-all
router.get("/find-all", controller.findAll);

// POST - /apikey/create
router.post(
  "/create",
  validator(shcema.create, ValidationSource.BODY),
  controller.create
);

// PUT - /apikey/update
router.put(
  "/update/:id",
  validator(shcema.id, ValidationSource.PARAM),
  validator(shcema.update, ValidationSource.BODY),
  controller.update
);

// DELETE - /apikey/remove
router.delete(
  "/remove/:id",
  validator(shcema.id, ValidationSource.PARAM),
  controller.remove
);

// GET - /apikey/find-by-id
router.get(
  "/find-by-id/:id",
  validator(shcema.id, ValidationSource.PARAM),
  controller.findById
);

// GET - /apikey/find-by-key
router.get(
  "/find-by-key/:key",
  validator(shcema.findByKey, ValidationSource.PARAM),
  controller.findByKey
);

export default router;
