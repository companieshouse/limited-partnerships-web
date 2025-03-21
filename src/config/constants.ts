import {
  getEnvironmentValue,
  getEnvironmentValueAsBoolean
} from "../utils/environment.value";

// APP CONFIG
export const ACCOUNT_URL = getEnvironmentValue("ACCOUNT_URL");
export const API_URL = getEnvironmentValue("API_URL");
export const APPLICATION_NAME = "limited-partnerships-web";
export const CACHE_SERVER = getEnvironmentValue("CACHE_SERVER");
export const CDN_HOST = getEnvironmentValue("CDN_HOST");
export const CHS_URL = getEnvironmentValue("CHS_URL");
export const COOKIE_DOMAIN = getEnvironmentValue("COOKIE_DOMAIN");
export const COOKIE_NAME = getEnvironmentValue("COOKIE_NAME");
export const COOKIE_SECRET = getEnvironmentValue("COOKIE_SECRET");
export const DEFAULT_SESSION_EXPIRATION = getEnvironmentValue(
  "DEFAULT_SESSION_EXPIRATION",
  "3600"
);
export const INTERNAL_API_URL = getEnvironmentValue("INTERNAL_API_URL");
export const LOG_LEVEL = getEnvironmentValue("LOG_LEVEL");
export const NODE_ENV = process.env["NODE_ENV"];
export const OAUTH2_CLIENT_ID = getEnvironmentValue("OAUTH2_CLIENT_ID");
export const OAUTH2_CLIENT_SECRET = getEnvironmentValue("OAUTH2_CLIENT_SECRET");
export const PIWIK_REGISTRATION_START_GOAL_ID = getEnvironmentValue(
  "PIWIK_REGISTRATION_START_GOAL_ID"
);
export const PIWIK_REGISTRATION_LP_GOAL_ID = getEnvironmentValue(
  "PIWIK_REGISTRATION_LP_GOAL_ID"
);
export const PIWIK_REGISTRATION_PRIVATE_FUND_LP_GOAL_ID = getEnvironmentValue(
  "PIWIK_REGISTRATION_PRIVATE_FUND_LP_GOAL_ID"
);
export const PIWIK_REGISTRATION_SCOTTISH_LP_GOAL_ID = getEnvironmentValue(
  "PIWIK_REGISTRATION_SCOTTISH_LP_GOAL_ID"
);
export const PIWIK_REGISTRATION_SCOTTISH_PRIVATE_FUND_LP_GOAL_ID = getEnvironmentValue(
  "PIWIK_REGISTRATION_SCOTTISH_PRIVATE_FUND_LP_GOAL_ID"
);
export const PIWIK_SITE_ID = getEnvironmentValue("PIWIK_SITE_ID");
export const PIWIK_URL = getEnvironmentValue("PIWIK_URL");
export const PORT = getEnvironmentValue("PORT");
export const POSTCODE_ADDRESSES_LOOKUP_URL = getEnvironmentValue(
  "POSTCODE_ADDRESSES_LOOKUP_URL"
);
export const isLocalesEnabled = () => getEnvironmentValueAsBoolean("LOCALES_ENABLED");
export const REFRESH_TOKEN_GRANT_TYPE = "refresh_token";

export const SERVICE_NAME = "File for a limited partnership";
export const SHOW_SERVICE_UNAVAILABLE_PAGE = getEnvironmentValueAsBoolean(
  "SHOW_SERVICE_UNAVAILABLE_PAGE"
);
export const APPLICATION_CACHE_KEY = "limited_partnership";
export const APPLICATION_CACHE_KEY_PREFIX_REGISTRATION = "registration_";
export const APPLICATION_CACHE_KEY_PREFIX_TRANSITION = "transition_";

// Templates
export const ERROR_TEMPLATE = "error-page";
export const NOT_FOUND_TEMPLATE = "page-not-found";
export const SERVICE_UNAVAILABLE_TEMPLATE = "service-unavailable";

// Routing Paths
export const SUBMISSION_ID = "submissionId";
export const GENERAL_PARTNER_ID = "generalPartnerId";
export const TRANSACTION_ID = "transactionId";
export const BASE_URL = "/limited-partnerships";
export const TRANSITION_BASE_URL = "/limited-partnerships/transition";
export const BASE_WITH_IDS_URL = `${BASE_URL}/transaction/:${TRANSACTION_ID}/submission/:${SUBMISSION_ID}`;
export const GENERAL_PARTNER_URL = BASE_WITH_IDS_URL + `/general-partner`;
export const ACCOUNTS_SIGN_OUT_URL = `${ACCOUNT_URL}/signout`;
export const GENERAL_PARTNER_WITH_ID_URL =
  GENERAL_PARTNER_URL + `/:${GENERAL_PARTNER_ID}`;

// services
export const SDK_LIMITED_PARTNERSHIP_SERVICE = "limitedPartnershipsService";
export const SDK_POSTCODE_LOOKUP_SERVICE = "postCodeLookup";
export const SDK_TRANSACTION_SERVICE = "transaction";

// cookies
export const cookieOptions = {
  httpOnly: true,
  domain: COOKIE_DOMAIN,
  maxAge: parseInt(DEFAULT_SESSION_EXPIRATION, 10) * 1000, // 1 hour
  signed: true
};
