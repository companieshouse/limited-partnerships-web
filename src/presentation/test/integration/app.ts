import express from "express";
import appRouter from "../../../routes";
import { appConfig } from "../../../config/app-config";
import { appDevDependencies } from "../../../config/dev-dependencies";
import { errorHandler } from "../../../middlewares";

const app = express();

appConfig(app);

app.use(appRouter(appDevDependencies));

app.use(errorHandler);

export default app;
