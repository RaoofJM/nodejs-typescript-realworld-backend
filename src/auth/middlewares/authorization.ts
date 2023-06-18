import { Request, Response, NextFunction } from "express";
import {
  BadRequestError,
  ForbiddenError,
  InternalError,
  NotFoundError,
} from "../../core/apiError";
import { SuccessMsgResponse, SuccessResponse } from "../../core/apiResponse";
import UserRepo from "../../database/repository/user";

export default (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await UserRepo.findById(req.userId);

      let userRolesNames: string[] = [];
      if (user?.roles) {
        for (const role of user.roles) {
          userRolesNames.push(role);
        }
      }

      const hasRequiredRoles = roles.every((role) =>
        userRolesNames.includes(role)
      ); // Check if the user has all the required roles

      if (hasRequiredRoles) {
        return next();
      } else {
        throw new BadRequestError("permission error - don't have enough roles");
      }
    } catch (err) {
      next(err);
    }
  };
};
