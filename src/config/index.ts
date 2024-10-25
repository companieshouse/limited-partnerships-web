import { getEnvironmentValue } from "../utils/environment.value";

export const APPLICATION_NAME = "limited-partnerships-web";
export const NODE_ENV = process.env["NODE_ENV"];
export const PORT = getEnvironmentValue("PORT", "3000");
export const LOCALES_ENABLED = getEnvironmentValue("LOCALES_ENABLED", "true");
export const LOCALES_PATH = getEnvironmentValue("LOCALES_PATH", "locales");

// Templates
export const START_TEMPLATE = "start";

// Routing Paths
export const BASE_URL = "/limited-partnerships/";
export const START_URL = BASE_URL + START_TEMPLATE;

