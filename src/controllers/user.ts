import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserRepo from "../database/repository/user";
import RefreshTokenRepo from "../database/repository/refreshToken";
import {
  BadRequestError,
  ForbiddenError,
  InternalError,
  NotFoundError,
} from "../core/apiError";
import { SuccessMsgResponse, SuccessResponse } from "../core/apiResponse";
import User from "../database/model/user";
import RefreshToken from "../database/model/refreshToken";
import { Types } from "mongoose";
import { isArrayOfStrings } from "../helpers/utils";
import { tokenInfo } from "../config/envConfigs";
import { sendEmail } from "../helpers/mailer";
import bcrypt from "bcrypt";
import { Err, string } from "joi";
import { JwtToken } from "../helpers/utils";

// POST - /auth/login - Login Handler
async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, deviceIdentifier } = req.body;

    const user = await UserRepo.findByEmail(email);

    if (!user) {
      throw new NotFoundError();
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new BadRequestError("wrong password");
    }

    const accessToken = jwt.sign(
      {
        user: {
          userId: user._id.toString(),
          email: user.email,
          fullname: user.fullname,
        },
        usage: "auth-access",
      },
      tokenInfo.jwtSecret,
      { expiresIn: tokenInfo.accessTokenValidity + "s" }
    );

    const isRefreshTokenAlreadyCreated =
      await RefreshTokenRepo.findByDeviceIdentifier(deviceIdentifier);
    if (isRefreshTokenAlreadyCreated)
      await RefreshTokenRepo.remove(isRefreshTokenAlreadyCreated.id);

    const refreshTokenExpirationTime =
      Date.now() + tokenInfo.refreshTokenValidity; // Add expiresInMs to current timestamp

    const refreshToken = jwt.sign(
      {
        user: {
          userId: user._id.toString(),
          email: user.email,
          fullname: user.fullname,
        },

        usage: "auth-refresh",
      },
      tokenInfo.jwtSecret,
      { expiresIn: `${tokenInfo.refreshTokenValidity}s` }
    );

    const refreshTokenDBObj: RefreshToken = {
      token: refreshToken,
      user: user.id,
      expiresAt: new Date(refreshTokenExpirationTime),
      deviceIdentifier,
    };

    const result = await RefreshTokenRepo.create(refreshTokenDBObj);

    return new SuccessResponse("success", {
      accessToken,
      refreshToken,
      userId: user._id.toString(),
    }).send(res);
  } catch (err) {
    next(err);
  }
}

// POST - /auth/register - Register Handler
async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user: User = req.body;

    const isEmailInUse = await UserRepo.findByEmail(req.body.email);
    if (isEmailInUse) {
      throw new BadRequestError("Email is Already Taken");
    }

    await UserRepo.create(user);

    //Send Welcome Email
    //sendEmail(email, fullname, "Welcome!", "Thank you for chosing us");

    return new SuccessMsgResponse("success").send(res);
  } catch (err) {
    next(err);
  }
}

// POST - /auth/access-token - Create new access token
async function newAcessToken(req: Request, res: Response, next: NextFunction) {
  const deviceIdentifier = req.body.deviceIdentifier;
  const authHeader = (await req.get("Authorization")) || "";
  const token = authHeader.substring(7); // remove Bearer prefix from token
  try {
    const decodedToken = jwt.decode(token) as JwtToken;

    if (!decodedToken) throw new BadRequestError("Token is Not Defined");

    if (decodedToken.usage === "auth-refresh") {
      try {
        const isUserLoggedIn = await RefreshTokenRepo.findByDeviceIdentifier(
          deviceIdentifier
        );

        if (!isUserLoggedIn) {
          throw new ForbiddenError("Login Again");
        }

        const finalDecodedToken = jwt.verify(token, tokenInfo.jwtSecret);

        if (!finalDecodedToken) {
          const id = (
            await RefreshTokenRepo.findByDeviceIdentifier(deviceIdentifier)
          )?.id;
          await RefreshTokenRepo.remove(id);
          throw new ForbiddenError("Login Again");
        }

        const user = (await UserRepo.findById(
          decodedToken.user.userId
        )) as User;

        const accessToken = jwt.sign(
          {
            user: {
              userId: user._id?.toString(),
              email: user.email,
              fullname: user.fullname,
            },
            usage: "auth-access",
          },
          tokenInfo.jwtSecret,
          { expiresIn: "15m" }
        );

        return new SuccessResponse("success", { accessToken }).send(res);
      } catch (err: any) {
        if (err.message === "jwt expired") {
          const id = (
            await RefreshTokenRepo.findByDeviceIdentifier(deviceIdentifier)
          )?.id;
          await RefreshTokenRepo.remove(id);
        }
        throw new ForbiddenError("Login Again");
      }
    } else {
      throw new BadRequestError("Token is Not Valid");
    }
  } catch (err: any) {
    next(err);
  }
}

// POST - /auth/verify-email-request - Emails a link that verifies the email
async function verifyEmailRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const email = req.body.email;

    const user = await UserRepo.findByEmail(email);

    if (!user) {
      throw new NotFoundError();
    }

    const isEmailAlreadyVerified = user.isEmailVerified;
    if (isEmailAlreadyVerified) {
      throw new BadRequestError("the email is already verified");
    }

    const token = jwt.sign(
      {
        user: { userId: user._id, email: email, fullname: user.fullname },
        usage: "emailVerify",
      },
      tokenInfo.jwtSecret,
      {
        expiresIn: "1h",
      }
    );
    const verifyLink = `/auth/verify-email/${token}`; // Replace your domain
    console.log(verifyLink);

    const isEmailSent = await sendEmail(
      user.email,
      user.fullname,
      "verify email",
      `<a href="${verifyLink}">click here for verifying email/a>`
    );

    if (!isEmailSent) {
      throw new InternalError("email didn't send - server problem");
    }

    return new SuccessMsgResponse("success").send(res);
  } catch (err) {
    next(err);
  }
}

// GET - /auth/verify-email/:token - Verifies user's email
async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  const token = req.params.token;
  try {
    const decodedToken = jwt.verify(token, tokenInfo.jwtSecret) as JwtToken;

    if (!decodedToken) {
      throw new BadRequestError("Permission Denied");
    }

    if (decodedToken.usage !== "emailVerify") {
      throw new BadRequestError("Token is Not Valid");
    }
    const user = await UserRepo.findById(decodedToken.user.userId);

    if (!user) {
      throw new NotFoundError();
    }

    user.isEmailVerified = true;
    await user.save();

    return new SuccessMsgResponse("success").send(res);
  } catch (err: any) {
    if (err.message == "jwt malformed" || "invalid signature")
      return next(new BadRequestError("Invalid Token"));
    next(err);
  }
}

// POST - /auth/forget-password - Forget Password Handler
async function forgetPassword(req: Request, res: Response, next: NextFunction) {
  const { email } = req.body;
  try {
    const user = await UserRepo.findByEmail(email);

    if (!user) {
      throw new NotFoundError();
    }

    const token = jwt.sign(
      {
        user: { userId: user._id, fullname: user.fullname, email: user.email },
        usage: "forgetPassword",
      },
      tokenInfo.jwtSecret,
      {
        expiresIn: "1h",
      }
    );
    const resetLink = `/auth/reset-password/${token}`; // Replace your domain
    console.log(resetLink);

    const isEmailSent = await sendEmail(
      user.email,
      user.fullname,
      "forget password",
      `<a href="${resetLink}">click here for changing password/a>`
    );

    if (!isEmailSent) {
      throw new InternalError("email didn't send - server problem");
    }

    return new SuccessMsgResponse("success").send(res);
  } catch (err) {
    next(err);
  }
}

// POST - /reset-password/:token - Reset Password Handler
async function resetForgettedPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.params.token;
  const { password, confirmPassword } = req.body;
  try {
    const decodedToken = jwt.verify(token, tokenInfo.jwtSecret) as JwtToken;

    if (!decodedToken) {
      throw new ForbiddenError("permission denied");
    }

    if (decodedToken.usage !== "forgetPassword") {
      throw new BadRequestError("Invalid Token");
    }

    const user = await UserRepo.findById(decodedToken.user.userId);

    if (!user) {
      throw new NotFoundError("No User Found");
    }

    user.password = password;
    await user.save();

    return new SuccessMsgResponse("success").send(res);
  } catch (err: any) {
    if (err.message == "jwt malformed" || "invalid signature")
      return next(new BadRequestError("Invalid Token"));
    next(err);
  }
}

// PUT - /change-password/:id - Change Password Handler
async function changePassword(req: Request, res: Response, next: NextFunction) {
  const userId = req.params.id;
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  try {
    const user = await UserRepo.findById(userId);

    if (!user) {
      throw new NotFoundError("No User Found");
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      throw new BadRequestError("Wrong Password");
    }

    user.password = newPassword;
    await user.save();

    return new SuccessMsgResponse("success").send(res);
  } catch (err) {
    next(err);
  }
}

export default {
  login,
  register,
  newAcessToken,
  verifyEmailRequest,
  verifyEmail,
  forgetPassword,
  resetForgettedPassword,
  changePassword,
};
