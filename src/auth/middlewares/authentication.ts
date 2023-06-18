import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  BadRequestError,
  ForbiddenError,
  InternalError,
  NotFoundError,
} from "../../core/apiError";
import { SuccessMsgResponse, SuccessResponse } from "../../core/apiResponse";
import RefreshToken from "../../database/model/refreshToken";
import RefreshTokenRepo from "../../database/repository/refreshToken";
import { tokenInfo } from "../../config/envConfigs";
import { JwtToken } from "../../helpers/utils";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deviceIdentifier = req.headers.deviceidentifier as string;
    const authHeader = req.get("Authorization");

    if (!authHeader) {
      throw new BadRequestError("No authorization token provided");
    }

    const token = authHeader.substring(7); // remove Bearer prefix from token
    const decodedToken = jwt.decode(token) as JwtToken;

    if (!decodedToken) throw new BadRequestError("Invalid Token");

    req.userId = decodedToken.user.userId;

    const isUserLoggedIn = await RefreshTokenRepo.findByDeviceIdentifier(
      deviceIdentifier
    );

    if (!isUserLoggedIn) {
      throw new InternalError("login Again");
    }

    if (decodedToken.usage === "auth-access") {
      const finalDecodedToken = jwt.verify(
        token,
        tokenInfo.jwtSecret
      ) as JwtPayload;

      if (!finalDecodedToken) {
        throw new BadRequestError("send refresh token");
      }

      return next();
    } else {
      throw new BadRequestError("token is not valid");
    }
  } catch (err: any) {
    if (err.message === "jwt expired") {
      return next(new BadRequestError("send refresh token"));
    }
    return next(err);
  }
};
