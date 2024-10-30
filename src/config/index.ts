import { getEnvironmentValue, getEnvironmentValueAsBoolean } from "../utils/environment.value";

export const APPLICATION_NAME = "limited-partnerships-web";
export const NODE_ENV = process.env["NODE_ENV"];
export const PORT = getEnvironmentValue("PORT", "3000");
export const IS_LOCALES_ENABLED: boolean = getEnvironmentValueAsBoolean("LOCALES_ENABLED", "true");
export const LOCALES_PATH = getEnvironmentValue("LOCALES_PATH", "locales");

// Templates
export const START_TEMPLATE = "start";
export const ERROR_TEMPLATE = "error-page";
export const NOT_FOUND_TEMPLATE = "page-not-found";

// Routing Paths
export const BASE_URL = "/limited-partnerships/";
export const START_URL = BASE_URL + START_TEMPLATE;
