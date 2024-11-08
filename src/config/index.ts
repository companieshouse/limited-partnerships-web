import { getEnvironmentValue, getEnvironmentValueAsBoolean } from "../utils/environment.value";

// APP CONFIG
export const ACCOUNT_URL = getEnvironmentValue("ACCOUNT_URL", "http://account.chs.local");
export const API_URL = getEnvironmentValue("API_URL", "http://api.chs.local:4001");
export const APPLICATION_NAME = "limited-partnerships-web";
export const CDN_HOST = getEnvironmentValue("CDN_HOST", "cdn.chs.local");
export const CHS_URL = getEnvironmentValue("CHS_URL", "http://chs.local");
export const CACHE_SERVER = getEnvironmentValue("CACHE_SERVER");
export const COOKIE_DOMAIN = getEnvironmentValue("COOKIE_DOMAIN", "chs.local");
export const COOKIE_NAME = getEnvironmentValue("COOKIE_NAME");
export const COOKIE_SECRET = getEnvironmentValue("COOKIE_SECRET", "ChGovUk-XQrbf3sLj2abFxIY2TlapsJ");
export const DEFAULT_SESSION_EXPIRATION = getEnvironmentValue("DEFAULT_SESSION_EXPIRATION", "3600");
export const INTERNAL_API_URL = getEnvironmentValue("INTERNAL_API_URL", "http://api.chs.local:4001");
export const LOCALES_PATH = getEnvironmentValue("LOCALES_PATH", "locales");
export const LOG_LEVEL = getEnvironmentValue("LOG_LEVEL", "DEBUG");
export const NODE_ENV = process.env["NODE_ENV"];
export const OAUTH2_CLIENT_ID = getEnvironmentValue("OAUTH2_CLIENT_ID", "1234567890.apps.ch.gov.uk");
export const OAUTH2_CLIENT_SECRET = getEnvironmentValue("OAUTH2_CLIENT_SECRET", "M2UwYzRkNzIwOGQ1OGQ0OWIzMzViYjJjOTEyYTc1");
export const PIWIK_SITE_ID = getEnvironmentValue("PIWIK_SITE_ID", "24");
export const PIWIK_URL = getEnvironmentValue("PIWIK_URL", "https://matomo.platform.aws.chdev.org");
export const PORT = getEnvironmentValue("PORT", "3000");
export const isLocalesEnabled = () => getEnvironmentValueAsBoolean("LOCALES_ENABLED", "false");

export const SERVICE_NAME = "Limited Partnerships";

// Templates
export const START_TEMPLATE = "start";
export const ERROR_TEMPLATE = "error-page";
export const NOT_FOUND_TEMPLATE = "page-not-found";

// Routing Paths
export const BASE_URL = "/limited-partnerships/";
export const START_URL = BASE_URL + START_TEMPLATE;
export const HEALTHCHECK_URL = BASE_URL + "healthcheck";
