import { Router } from "express";
import * as config from "../config";
import * as controllers from "../controllers";

const router = Router();

// Routes
router.get(config.START_URL, controllers.startController.get);
router.get(config.HEALTHCHECK_URL, controllers.healthCheckController.get);

export default router;
