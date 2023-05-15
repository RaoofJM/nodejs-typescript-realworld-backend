import Joi from "joi";
import { JoiObjectId, JoiUrlEndpoint } from "../../utils/validator";

export default {
  id: Joi.object().keys({
    id: JoiObjectId().required(),
  }),
  create: Joi.object().keys({
    key: Joi.string().required().min(3).max(150),
    status: Joi.boolean().optional(),
  }),
  update: Joi.object().keys({
    key: Joi.string().optional().min(3).max(150),
    status: Joi.boolean().optional(),
  }),
  findByKey: Joi.object().keys({
    key: Joi.string().required(),
  }),
};
