import mongoose from "mongoose";
import Logger from "../core/logger";
import { db } from "../config/envConfigs";

// Build the connection string
const dbURI = `mongodb://${db.host}:${db.port}/${db.name}`;

const options = {
  autoIndex: true,
  minPoolSize: db.minPoolSize, // Maintain up to x socket connections
  maxPoolSize: db.maxPoolSize, // Maintain up to x socket connections
  connectTimeoutMS: 60000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

Logger.debug(dbURI);

mongoose.set("strictQuery", true);

// Create the database connection
mongoose

  .connect(dbURI, options)
  .then(() => {
    Logger.info("Mongoose connection done");
  })
  .catch((e) => {
    Logger.info("Mongoose connection error");
    Logger.error(e);
  });

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on("connected", () => {
  Logger.debug("Mongoose default connection open to " + dbURI);
});

// If the connection throws an error
mongoose.connection.on("error", (err) => {
  Logger.error("Mongoose default connection error: " + err);
});

// When the connection is disconnected
mongoose.connection.on("disconnected", () => {
  Logger.info("Mongoose default connection disconnected");
});

// If the Node process ends, close the Mongoose connection
process.on("SIGINT", () => {
  mongoose.connection.close().then(() => {
    Logger.info(
      "Mongoose default connection disconnected through app termination"
    );
    process.exit(0);
  });
});

export const connection = mongoose.connection;
