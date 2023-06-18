import { Schema, model, Document, Types } from "mongoose";
import cryptoJs from "crypto-js";
import { tokenInfo } from "../../config/envConfigs";

export const DOCUMENT_NAME = "RefreshToken";
export const COLLECTION_NAME = "refresh_tokens";

export default interface IRefreshToken {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  token: string;
  deviceIdentifier: string;
  createdAt?: Date;
  expiresAt?: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  token: { type: String, required: true },
  deviceIdentifier: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

refreshTokenSchema.pre("save", function () {});

refreshTokenSchema.pre("save", function (next) {
  if (!this.isModified("token")) {
    return next();
  } else {
    try {
      const encrypted = cryptoJs.AES.encrypt(
        this.token,
        tokenInfo.jwtSecret
      ).toString();
      this.token = encrypted;
    } catch (err) {
      return next();
    }
    return next();
  }
});

refreshTokenSchema.methods.decrypt = function () {
  try {
    const bytes = cryptoJs.AES.decrypt(
      this.token,
      process.env.ENCRYPTION_KEY || ""
    );
    const decrypted = bytes.toString(cryptoJs.enc.Utf8);
    return decrypted;
  } catch (err) {
    return null;
  }
};

export const RefreshTokenModel = model<IRefreshToken>(
  DOCUMENT_NAME,
  refreshTokenSchema,
  COLLECTION_NAME
);
