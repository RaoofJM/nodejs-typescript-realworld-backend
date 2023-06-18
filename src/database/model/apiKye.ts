import { Schema, model, Types } from "mongoose";
import { superAdminApiKey } from "../../config/envConfigs";

export const DOCUMENT_NAME = "ApiKey";
export const COLLECTION_NAME = "api_keys";

export enum Permission {
  GENERAL = "GENERAL",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export default interface ApiKey {
  _id?: Types.ObjectId;
  key: string;
  permissions?: Permission[];
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<ApiKey>({
  key: {
    type: Schema.Types.String,
    required: true,
    unique: true,
    maxlength: 1024,
    trim: true,
  },
  permissions: {
    type: [
      {
        type: Schema.Types.String,
        required: true,
        enum: Object.values(Permission),
      },
    ],
    required: true,
  },
  status: {
    type: Schema.Types.Boolean,
    default: true,
  },
  createdAt: {
    type: Schema.Types.Date,
    required: true,
    select: false,
  },
  updatedAt: {
    type: Schema.Types.Date,
    required: true,
    select: false,
  },
});

schema.index({ key: 1, status: 1 });

export const ApiKeyModel = model<ApiKey>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

export async function createSuperAdminApiKey() {
  // Check if there are any documents in the collection
  const count = await ApiKeyModel.countDocuments();

  // If no documents exist, add a default document
  if (count === 0) {
    const defaultDocument = {
      key: `${superAdminApiKey}`,
      permissions: [Permission.GENERAL, Permission.SUPER_ADMIN],
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save the default document
    const result = await ApiKeyModel.create(defaultDocument);
  }
}