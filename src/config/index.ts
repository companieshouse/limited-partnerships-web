import { getEnvironmentValue, getEnvironmentValueAsBoolean } from "../utils/environment.value";

// APP CONFIG
export const ACCOUNT_URL = getEnvironmentValue("ACCOUNT_URL");
export const API_URL = getEnvironmentValue("API_URL");
export const APPLICATION_NAME = "limited-partnerships-web";
export const CDN_HOST = getEnvironmentValue("CDN_HOST");
export const CHS_URL = getEnvironmentValue("CHS_URL");
export const CACHE_SERVER = getEnvironmentValue("CACHE_SERVER");
export const COOKIE_DOMAIN = getEnvironmentValue("COOKIE_DOMAIN");
export const COOKIE_NAME = getEnvironmentValue("COOKIE_NAME");
export const COOKIE_SECRET = getEnvironmentValue("COOKIE_SECRET");
export const DEFAULT_SESSION_EXPIRATION = getEnvironmentValue("DEFAULT_SESSION_EXPIRATION", "3600");
export const INTERNAL_API_URL = getEnvironmentValue("INTERNAL_API_URL");
export const LOCALES_PATH = getEnvironmentValue("LOCALES_PATH");
export const LOG_LEVEL = getEnvironmentValue("LOG_LEVEL");
export const NODE_ENV = process.env["NODE_ENV"];
export const OAUTH2_CLIENT_ID = getEnvironmentValue("OAUTH2_CLIENT_ID");
export const OAUTH2_CLIENT_SECRET = getEnvironmentValue("OAUTH2_CLIENT_SECRET");
export const PIWIK_SITE_ID = getEnvironmentValue("PIWIK_SITE_ID");
export const PIWIK_URL = getEnvironmentValue("PIWIK_URL");
export const PORT = getEnvironmentValue("PORT");
export const isLocalesEnabled = () => getEnvironmentValueAsBoolean("LOCALES_ENABLED");

export const SERVICE_NAME = "Limited Partnerships";

// Templates
export const START_TEMPLATE = "start";
export const ERROR_TEMPLATE = "error-page";
export const NOT_FOUND_TEMPLATE = "page-not-found";

// Routing Paths
export const BASE_URL = "/limited-partnerships/";
export const START_URL = BASE_URL + START_TEMPLATE;
export const HEALTHCHECK_URL = BASE_URL + "healthcheck";
