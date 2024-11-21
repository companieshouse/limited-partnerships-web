import express from "express";
import appRouter from "../../../routes";
import { appConfig, appDevDependencies } from "../../../config";
import { errorHandler } from "../../../middlewares";

const app = express();

appConfig(app);

app.use(appRouter(appDevDependencies));

app.use(errorHandler);

export default app;
