import { getEnvironmentValue } from "../utils/environment.value";

// APP CONFIG
export const APPLICATION_NAME = "limited-partnerships-web";
export const CDN_HOST = getEnvironmentValue("CDN_HOST", "cdn.chs.local");
export const CHS_URL = getEnvironmentValue("CHS_URL", "http://chs.local");
export const NODE_ENV = process.env["NODE_ENV"];
export const PIWIK_SITE_ID = getEnvironmentValue("PIWIK_SITE_ID", "24");
export const PIWIK_URL = getEnvironmentValue("PIWIK_URL", "https://matomo.platform.aws.chdev.org");
export const PORT = getEnvironmentValue("PORT", "3000");

export const SERVICE_NAME = "Limited Partnerships";

// Templates
export const START_TEMPLATE = "start";

// Routing Paths
export const BASE_URL = "/limited-partnerships/";
export const START_URL = BASE_URL + START_TEMPLATE;

