import express from "express";
import appRouter from "../../../routes";
import { appConfig, appDevDependencies } from "../../../config";

const app = express();

appConfig(app);

app.use(appRouter(appDevDependencies));

export default app;
