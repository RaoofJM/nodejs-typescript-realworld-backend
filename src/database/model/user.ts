import { Schema, model, Types } from "mongoose";
import bcrypt from "bcrypt";

export const DOCUMENT_NAME = "User";
export const COLLECTION_NAME = "users";

export interface IRole {
  MEMBER: string,
  ADMIN: string,
  MODERATOR: string
}

export enum Role {
  MEMBER = "member",
  ADMIN = "admin",
  MODERATOR = "superadmin",
}

export default interface User {
  _id?: Types.ObjectId;
  fullname: string;
  email: string;
  password: string;
  isEmailVerified?: boolean;
  roles?: Role[];
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<User>({
  fullname: {
    type: Schema.Types.String,
    required: true,
    trim: true,
  },
  email: {
    type: Schema.Types.String,
    required: true,
    unique: true,
  },
  password: {
    type: Schema.Types.String,
    required: true,
    minlength: 4,
  },
  isEmailVerified: {
    type: Schema.Types.Boolean,
    default: false,
  },
  roles: {
    type: [
      {
        type: Schema.Types.String,
        enum: Object.values(Role),
      },
    ],
    default: [Role.MEMBER],
  },
  createdAt: {
    type: Schema.Types.Date,
    default: Date.now,
  },
  updatedAt: {
    type: Schema.Types.Date,
    default: null,
  },
});

// Hashing Password Before Saving the User
schema.pre("save", function (next) {
  let user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

export const UserModel = model<User>(DOCUMENT_NAME, schema, COLLECTION_NAME);
