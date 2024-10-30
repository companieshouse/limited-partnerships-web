import { getEnvironmentValue } from "../utils/environment.value";

export const APPLICATION_NAME = "limited-partnerships-web";
export const NODE_ENV = process.env["NODE_ENV"];
export const PORT = getEnvironmentValue("PORT", "3000");
export const HEALTHCHECK = "healthcheck";

// Templates
export const START_TEMPLATE = "start";
export const ERROR_TEMPLATE = "error-page";
export const NOT_FOUND_TEMPLATE = "page-not-found";

// Routing Paths
export const BASE_URL = "/limited-partnerships/";
export const START_URL = BASE_URL + START_TEMPLATE;
export const HEALTHCHECK_URL = BASE_URL + HEALTHCHECK;
// Sessions
export const COOKIE_NAME = getEnvironmentValue("COOKIE_NAME");
export const CACHE_SERVER = getEnvironmentValue("CACHE_SERVER");
