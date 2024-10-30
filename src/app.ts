import express from "express";
import * as nunjucks from "nunjucks";
import * as path from "path";

import * as config from "./config";
import logger from "./utils/logger";
import router from "./routes";
import { CsrfProtectionMiddleware } from "@companieshouse/web-security-node";
import { SessionStore } from "@companieshouse/node-session-handler";
import Redis from 'ioredis';
import errorHandler from "./middlewares/error.middleware";

const app = express();

// set some app variables from the environment
app.set("port", config.PORT);
app.set("dev", config.NODE_ENV === "development");

// set up the template engine
nunjucks.configure([
  path.join(__dirname, "views"),
  "node_modules/@companieshouse"
], {
  autoescape: true,
  express: app,
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "njk");

// csrf middleware
const sessionStore = new SessionStore(new Redis(`redis://${config.CACHE_SERVER}`));

const csrfProtectionMiddleware = CsrfProtectionMiddleware({
  sessionStore,
  enabled: true,
  sessionCookieName: config.COOKIE_NAME
});
app.use(csrfProtectionMiddleware);

// apply our default router to /
app.use("/", router);

app.use(errorHandler);

logger.info(`${config.APPLICATION_NAME} has started.`);
export default app;
