import express from "express";
import * as nunjucks from "nunjucks";
import * as path from "path";

import * as config from "./config";
import logger from "./utils/logger";
import router from "./routes";
import errorHandler from "./middlewares/error.middleware";
import localisationMiddleware from "./middlewares/localisation.middleware";

const app = express();

// set some app variables from the environment
app.set("port", config.PORT);
app.set("dev", config.NODE_ENV === "development");

// set up the template engine
nunjucks.configure([
  path.join(__dirname, "views"),
  "node_modules/@companieshouse/ch-node-utils/templates"
], {
  autoescape: true,
  express: app,
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "njk");

// middlewares
app.use(localisationMiddleware);

// apply our default router to /
app.use("/", router);

app.use(errorHandler);

logger.info(`${config.APPLICATION_NAME} has started.`);
export default app;
