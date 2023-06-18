import Joi from "joi";
import { JoiObjectId, JoiUrlEndpoint } from "../../helpers/validator";

export default {
  login: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    deviceIdentifier: Joi.string().required(),
  }),
  register: Joi.object().keys({
    email: Joi.string().email().required(),
    fullname: Joi.string().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  }),
  newAccessToken: Joi.object().keys({
    deviceIdentifier: Joi.string().required(),
  }),
  verifyEmailRequest: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
  verifyEmail: Joi.object().keys({
    token: Joi.string().required(),
  }),
  forgetPassword: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
  resetForgettedPassword: Joi.object().keys({
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  }),
  chagePassword: Joi.object().keys({
    currentPassword: Joi.string().min(6).required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
  }),
};
