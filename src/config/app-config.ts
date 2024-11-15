import cookieParser from "cookie-parser";
import express from "express";
import Redis from "ioredis";
import * as nunjucks from "nunjucks";
import * as path from "path";

import {
  SessionMiddleware,
  SessionStore,
} from "@companieshouse/node-session-handler";
import { CsrfProtectionMiddleware } from "@companieshouse/web-security-node";

import * as config from "./constants";
import { localisationMiddleware } from "../middlewares";

export const appConfig = (app: express.Application) => {
  // set some app variables from the environment
  app.set("port", config.PORT);
  app.set("dev", config.NODE_ENV === "development");

  // set up the template engine
  const nunjucksEnv = nunjucks.configure(
    [
      path.join(__dirname, "../views"),
      "node_modules/@companieshouse",
      "node_modules/govuk-frontend",
      "node_modules/govuk-frontend/components",
    ],
    {
      autoescape: true,
      express: app,
    }
  );

  nunjucksEnv.addGlobal("CDN_HOST", config.CDN_HOST);
  nunjucksEnv.addGlobal("MATOMO_ASSET_PATH", `//${config.CDN_HOST}`);
  nunjucksEnv.addGlobal("PIWIK_SITE_ID", config.PIWIK_SITE_ID);
  nunjucksEnv.addGlobal("PIWIK_URL", config.PIWIK_URL);
  nunjucksEnv.addGlobal("SERVICE_NAME", config.SERVICE_NAME);

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.set("view engine", "njk");

  // middlewares
  app.use(localisationMiddleware);

  const cookieConfig = {
    cookieName: "__SID",
    cookieSecret: config.COOKIE_SECRET,
    cookieDomain: config.COOKIE_DOMAIN,
    cookieTimeToLiveInSeconds: parseInt(config.DEFAULT_SESSION_EXPIRATION, 10),
  };
  const sessionStore = new SessionStore(
    new Redis(`redis://${config.CACHE_SERVER}`)
  );
  app.use(SessionMiddleware(cookieConfig, sessionStore));

  // csrf middleware
  const csrfProtectionMiddleware = CsrfProtectionMiddleware({
    sessionStore,
    enabled: false,
    sessionCookieName: config.COOKIE_NAME,
  });
  app.use(csrfProtectionMiddleware);
};