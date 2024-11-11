import { Router } from "express";

import * as config from "../config";
import * as controllers from "../controllers";
import { authentication } from "../middlewares";

const router = Router();

// Routes
router.get(config.HEALTHCHECK_URL, controllers.healthCheckController.get);
router.get(config.START_URL, authentication, controllers.startController.get);

export default router;
