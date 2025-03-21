import express from "express";

import * as config from "./config/constants";
import { logger } from "./utils";
import { errorHandler } from "./middlewares";
import { appConfig } from "./config/app-config";
import { appDependencies } from "./config/dependencies";
import appRouter from "./routes";

const app = express();

appConfig(app);

// apply our default router to /
app.use(appRouter(appDependencies));

app.use(errorHandler);

logger.info(`${config.APPLICATION_NAME} has started.`);

export default app;
