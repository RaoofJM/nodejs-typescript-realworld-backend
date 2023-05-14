import Logger from "./config/logger";
import { port } from "./config/envConfigs";
import app from "./app";

app
  .listen(port, () => {
    Logger.info(`server running on port : ${port}`);
  })
  .on("error", (e) => Logger.error(e));
