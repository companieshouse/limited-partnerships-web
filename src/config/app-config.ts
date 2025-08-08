import cookieParser from "cookie-parser";
import express from "express";
import Redis from "ioredis";
import * as nunjucks from "nunjucks";
import * as path from "path";

import { SessionMiddleware, SessionStore } from "@companieshouse/node-session-handler";
import { CsrfProtectionMiddleware } from "@companieshouse/web-security-node";
import { getGOVUKFrontendVersion } from "@companieshouse/ch-node-utils";

import { createSummaryListLink } from "../utils/change-link";
import * as config from "./constants";
import { authentication, localisationMiddleware } from "../middlewares";
import { serviceAvailabilityMiddleware } from "../middlewares/service-availability.middleware";
import { journeyDetectionMiddleware } from "../middlewares/journey.detection.middleware";
import { TRANSITION_START_URL } from "../presentation/controller/transition/url";
import { REGISTRATION_START_URL } from "../presentation/controller/registration/url";

export const appConfig = (app: express.Application) => {
  // set some app variables from the environment
  app.set("port", config.PORT);
  app.set("dev", config.NODE_ENV === "development");

  // set up the template engine
  const nunjucksEnv = nunjucks.configure(
    [
      path.join(__dirname, "../views"),
      "node_modules/@companieshouse",
      "node_modules/govuk-frontend/dist/",
      "node_modules/govuk-frontend/dist/govuk/components"
    ],
    {
      autoescape: true,
      express: app
    }
  );

  nunjucksEnv.addGlobal("govukFrontendVersion", getGOVUKFrontendVersion());
  nunjucksEnv.addGlobal("govukRebrand", true);
  nunjucksEnv.addGlobal("cdnHost", `//${config.CDN_HOST}`);
  nunjucksEnv.addGlobal("MATOMO_ASSET_PATH", `//${config.CDN_HOST}`);
  nunjucksEnv.addGlobal("PIWIK_REGISTRATION_START_GOAL_ID", config.PIWIK_REGISTRATION_START_GOAL_ID);
  nunjucksEnv.addGlobal("PIWIK_REGISTRATION_LP_GOAL_ID", config.PIWIK_REGISTRATION_LP_GOAL_ID);
  nunjucksEnv.addGlobal(
    "PIWIK_REGISTRATION_PRIVATE_FUND_LP_GOAL_ID",
    config.PIWIK_REGISTRATION_PRIVATE_FUND_LP_GOAL_ID
  );
  nunjucksEnv.addGlobal("PIWIK_REGISTRATION_SCOTTISH_LP_GOAL_ID", config.PIWIK_REGISTRATION_SCOTTISH_LP_GOAL_ID);
  nunjucksEnv.addGlobal(
    "PIWIK_REGISTRATION_SCOTTISH_PRIVATE_FUND_LP_GOAL_ID",
    config.PIWIK_REGISTRATION_SCOTTISH_PRIVATE_FUND_LP_GOAL_ID
  );
  nunjucksEnv.addGlobal("PIWIK_SITE_ID", config.PIWIK_SITE_ID);
  nunjucksEnv.addGlobal("PIWIK_URL", config.PIWIK_URL);
  nunjucksEnv.addGlobal("SERVICE_NAME_REGISTRATION", config.SERVICE_NAME_REGISTRATION);
  nunjucksEnv.addGlobal("SERVICE_NAME_TRANSITION", config.SERVICE_NAME_TRANSITION);
  nunjucksEnv.addGlobal("SERVICE_NAME_POST_TRANSITION", config.SERVICE_NAME_POST_TRANSITION);
  nunjucksEnv.addGlobal("SERVICE_START_URL_REGISTRATION", REGISTRATION_START_URL);
  nunjucksEnv.addGlobal("SERVICE_START_URL_TRANSITION", TRANSITION_START_URL);
  nunjucksEnv.addGlobal("CREATE_CHANGE_LINK", createSummaryListLink);

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser(config.COOKIE_SECRET));

  app.set("view engine", "njk");

  // middlewares
  app.use(serviceAvailabilityMiddleware);
  app.use(config.allPathsExceptHealthcheck, journeyDetectionMiddleware);
  app.use(config.allPathsExceptHealthcheck, localisationMiddleware);

  const cookieConfig = {
    cookieName: "__SID",
    cookieSecret: config.COOKIE_SECRET,
    cookieDomain: config.COOKIE_DOMAIN,
    cookieTimeToLiveInSeconds: parseInt(config.DEFAULT_SESSION_EXPIRATION, 10)
  };
  const sessionStore = new SessionStore(new Redis(`redis://${config.CACHE_SERVER}`));

  app.use(config.allPathsExceptHealthcheck, SessionMiddleware(cookieConfig, sessionStore));

  // csrf middleware
  const csrfProtectionMiddleware = CsrfProtectionMiddleware({
    sessionStore,
    enabled: true,
    sessionCookieName: config.COOKIE_NAME
  });
  app.use(config.allPathsExceptHealthcheck, csrfProtectionMiddleware);

  app.use(config.allPathsExceptHealthcheck, authentication);
};
