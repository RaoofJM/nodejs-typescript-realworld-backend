export const environment = process.env.NODE_ENV;
export const port = process.env.PORT;
export const timezone = process.env.TZ;

export const mongoConnetion = process.env.MONGO_DB_CONNECTION;

export const dbMinPoolSize = process.env.DB_MIN_POOL_SIZE;
export const dbMaxPoolSize = process.env.DB_MAX_POOL_SIZE;

export const corsUrl = process.env.CORS_URL;

export const tokenInfo = {
  accessTokenValidity: parseInt(process.env.ACCESS_TOKEN_VALIDITY_SEC || "0"),
  refreshTokenValidity: parseInt(process.env.REFRESH_TOKEN_VALIDITY_SEC || "0"),
  issuer: process.env.TOKEN_ISSUER || "",
  audience: process.env.TOKEN_AUDIENCE || "",
};

export const logDirectory = process.env.LOG_DIR;

export const redisConnetion = process.env.REDIS_CONNECTION;

export const superAdminApiKey = process.env.SUPER_ADMIN_API_KEY;

export const caching = {
  contentCacheDuration: parseInt(
    process.env.CONTENT_CACHE_DURATION_MILLIS || "600000"
  ),
};
