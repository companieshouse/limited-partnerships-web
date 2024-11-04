import express from "express";
import * as nunjucks from "nunjucks";
import * as path from "path";
import Redis from "ioredis";
import { CsrfProtectionMiddleware } from "@companieshouse/web-security-node";
import { SessionStore } from "@companieshouse/node-session-handler";

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
const nunjucksEnv = nunjucks.configure([
  path.join(__dirname, "views"),
  "node_modules/@companieshouse",
  "node_modules/govuk-frontend",
  "node_modules/govuk-frontend/components"
], {
  autoescape: true,
  express: app,
});

nunjucksEnv.addGlobal("CDN_HOST", config.CDN_HOST);
nunjucksEnv.addGlobal("MATOMO_ASSET_PATH", `//${config.CDN_HOST}`);
nunjucksEnv.addGlobal("PIWIK_SITE_ID", config.PIWIK_SITE_ID);
nunjucksEnv.addGlobal("PIWIK_URL", config.PIWIK_URL);
nunjucksEnv.addGlobal("SERVICE_NAME", config.SERVICE_NAME);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "njk");

// middlewares
app.use(localisationMiddleware);

// csrf middleware
const sessionStore = new SessionStore(new Redis(`redis://${config.CACHE_SERVER}`));

const csrfProtectionMiddleware = CsrfProtectionMiddleware({
  sessionStore,
  enabled: false,
  sessionCookieName: config.COOKIE_NAME
});
app.use(csrfProtectionMiddleware);

// apply our default router to /
app.use("/", router);

app.use(errorHandler);

logger.info(`${config.APPLICATION_NAME} has started.`);
export default app;
