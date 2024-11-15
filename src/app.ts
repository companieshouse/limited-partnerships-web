import express from "express";

import * as config from "./config/constants";
import { logger } from "./utils";
import { errorHandler } from "./middlewares";
import {
  appConfig,
  // appDependencies,
  appDevDependencies as appDependencies, // only to play with screens without api - to be removed
} from "./config";
import appRouter from "./routes";

const app = express();

appConfig(app);

// apply our default router to /
app.use(appRouter(appDependencies));

app.use(errorHandler);

logger.info(`${config.APPLICATION_NAME} has started.`);

export default app;
