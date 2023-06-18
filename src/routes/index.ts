import express from "express";
import apiKey from "./apiKey/router";
import apiKeyCheck from "../auth/apiKey/apiKey";
import user from "./user/router";

const router = express.Router();

/*---------------------------------------------------------*/
router.use(apiKeyCheck);
/*---------------------------------------------------------*/

router.use("/apikey", apiKey);
router.use("/auth", user);

export default router;
