import express from "express";
import apiKey from "./apiKey/router";
import apiKeyCheck from "../auth/apiKey";

const router = express.Router();

/*---------------------------------------------------------*/
router.use(apiKeyCheck);
/*---------------------------------------------------------*/

router.use("/apikey", apiKey);

export default router;
