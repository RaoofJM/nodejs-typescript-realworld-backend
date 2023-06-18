import express from "express";
import controller from "../../controllers/user";
import validator, { ValidationSource } from "../../helpers/validator";
import shcema from "./shcema";
import authentication from "../../auth/middlewares/authentication";
import authorization from "../../auth/middlewares/authorization";
import { Role } from "../../database/model/user";

const router = express.Router();

// POST - /auth/login - Login Handler
router.post(
  "/login",
  validator(shcema.login, ValidationSource.BODY),
  controller.login
);

// POST - /auth/register - Register Handler
router.post(
  "/register",
  validator(shcema.register, ValidationSource.BODY),
  controller.register
);

// POST - /auth/access-token - Create new access token
router.post(
  "/access-token",
  validator(shcema.newAccessToken, ValidationSource.BODY),
  controller.newAcessToken
);

// POST - /auth/verify-email-request - Emails a link that verifies the email
router.post(
  "/verify-email-request",
  authentication,
  authorization([Role.ADMIN]),
  validator(shcema.verifyEmailRequest, ValidationSource.BODY),
  controller.verifyEmailRequest
);

// GET - /auth/verify-email/:token - Verifies user's email
router.get(
  "/verify-email/:token",
  validator(shcema.verifyEmail, ValidationSource.PARAM),
  controller.verifyEmail
);

// POST - /auth/forget-password - Forget Password Handler

router.post(
  "/forget-password",
  validator(shcema.forgetPassword, ValidationSource.BODY),
  controller.forgetPassword
);

// POST - /reset-password/:token - Reset Password Handler
router.post(
  "/reset-password/:token",
  validator(shcema.resetForgettedPassword, ValidationSource.BODY),
  controller.resetForgettedPassword
);

// PUT - /change-password/:id - Change Password Handler
router.put(
  "/change-password/:id",
  validator(shcema.chagePassword, ValidationSource.BODY),
  controller.changePassword
);

export default router;
