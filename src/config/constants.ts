import { Journey } from "../domain/entities/journey";
import { getEnvironmentValue, getEnvironmentValueAsBoolean } from "../utils/environment.value";

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
export const DEFAULT_SESSION_EXPIRATION = getEnvironmentValue("DEFAULT_SESSION_EXPIRATION", "3600");
export const INTERNAL_API_URL = getEnvironmentValue("INTERNAL_API_URL");
export const LOG_LEVEL = getEnvironmentValue("LOG_LEVEL");
export const NODE_ENV = process.env["NODE_ENV"];
export const OAUTH2_CLIENT_ID = getEnvironmentValue("OAUTH2_CLIENT_ID");
export const OAUTH2_CLIENT_SECRET = getEnvironmentValue("OAUTH2_CLIENT_SECRET");
export const PIWIK_REGISTRATION_START_GOAL_ID = getEnvironmentValue("PIWIK_REGISTRATION_START_GOAL_ID");
export const PIWIK_REGISTRATION_LP_GOAL_ID = getEnvironmentValue("PIWIK_REGISTRATION_LP_GOAL_ID");
export const PIWIK_REGISTRATION_PRIVATE_FUND_LP_GOAL_ID = getEnvironmentValue(
  "PIWIK_REGISTRATION_PRIVATE_FUND_LP_GOAL_ID"
);
export const PIWIK_REGISTRATION_SCOTTISH_LP_GOAL_ID = getEnvironmentValue("PIWIK_REGISTRATION_SCOTTISH_LP_GOAL_ID");
export const PIWIK_REGISTRATION_SCOTTISH_PRIVATE_FUND_LP_GOAL_ID = getEnvironmentValue(
  "PIWIK_REGISTRATION_SCOTTISH_PRIVATE_FUND_LP_GOAL_ID"
);
export const PIWIK_SITE_ID = getEnvironmentValue("PIWIK_SITE_ID");
export const PIWIK_URL = getEnvironmentValue("PIWIK_URL");
export const PORT = getEnvironmentValue("PORT");
export const POSTCODE_ADDRESSES_LOOKUP_URL = getEnvironmentValue("POSTCODE_ADDRESSES_LOOKUP_URL");
export const isLocalesEnabled = () => getEnvironmentValueAsBoolean("LOCALES_ENABLED");
export const REFRESH_TOKEN_GRANT_TYPE = "refresh_token";

export const SERVICE_NAME_REGISTRATION = "Register a limited partnership";
export const SERVICE_NAME_TRANSITION = "Provide information about a limited partnership";
export const SERVICE_NAME_POST_TRANSITION = "File for a limited partnership";
export const SHOW_SERVICE_UNAVAILABLE_PAGE = getEnvironmentValueAsBoolean("SHOW_SERVICE_UNAVAILABLE_PAGE");
export const APPLICATION_CACHE_KEY = "limited_partnership";
export const APPLICATION_CACHE_KEY_PREFIX_REGISTRATION = "registration_";
export const APPLICATION_CACHE_KEY_PREFIX_TRANSITION = "transition_";
export const APPLICATION_CACHE_KEY_PREFIX_POST_TRANSITION = "post-transition_";

// Transaction descriptions
export const TRANSACTION_DESCRIPTION_ADD_LIMITED_PARTNER_PERSON = "Add a limited partner (person)";
export const TRANSACTION_DESCRIPTION_ADD_LIMITED_PARTNER_LEGAL_ENTITY = "Add a limited partner (legal entity)";
export const TRANSACTION_DESCRIPTION_ADD_GENERAL_PARTNER_PERSON = "Add a general partner (person)";
export const TRANSACTION_DESCRIPTION_ADD_GENERAL_PARTNER_LEGAL_ENTITY = "Add a general partner (legal entity)";
export const TRANSACTION_DESCRIPTION_UPDATE_LIMITED_PARTNERSHIP = "Update limited partnership details";

// Templates
export const ERROR_TEMPLATE = "error-page";
export const NOT_FOUND_TEMPLATE = "page-not-found";
export const SERVICE_UNAVAILABLE_TEMPLATE = "service-unavailable";

// Routing Paths
export const COMPANY_ID = "companyId";
export const TRANSACTION_ID = "transactionId";
export const SUBMISSION_ID = "submissionId";
export const GENERAL_PARTNER_ID = "generalPartnerId";
export const LIMITED_PARTNER_ID = "limitedPartnerId";
export const JOURNEY_TYPE_PARAM = ":journeyType";

export const YOUR_FILINGS_URL = "/user/transactions";

export const BASE_URL = "/limited-partnerships";

export const REGISTRATION_BASE_URL = `${BASE_URL}/${Journey.registration}`;
export const TRANSITION_BASE_URL = `${BASE_URL}/${Journey.transition}`;
export const POST_TRANSITION_BASE_URL = `${BASE_URL}/${Journey.postTransition}`;

export const COMPANY_URL = `/company/:${COMPANY_ID}`;
export const TRANSACTION_URL = `/transaction/:${TRANSACTION_ID}`;

export const TRANSACTION_SUBMISSION_URL = `${TRANSACTION_URL}/submission/:${SUBMISSION_ID}`;

export const BASE_WITH_IDS_URL = `${BASE_URL}${TRANSACTION_SUBMISSION_URL}`;
export const BASE_WITH_JOURNEY_TYPE_AND_IDS_URL = `${BASE_URL}/${JOURNEY_TYPE_PARAM}${TRANSACTION_SUBMISSION_URL}`;

export const REGISTRATION_WITH_IDS_URL = `${REGISTRATION_BASE_URL}${TRANSACTION_SUBMISSION_URL}`;

export const TRANSITION_WITH_ID_URL = `${TRANSITION_BASE_URL}${COMPANY_URL}`;
export const TRANSITION_WITH_IDS_URL = `${TRANSITION_BASE_URL}${COMPANY_URL}${TRANSACTION_SUBMISSION_URL}`;

export const POST_TRANSITION_WITH_ID_URL = `${POST_TRANSITION_BASE_URL}${COMPANY_URL}`;
export const POST_TRANSITION_WITH_IDS_URL = `${POST_TRANSITION_BASE_URL}${COMPANY_URL}${TRANSACTION_URL}`;
export const POST_TRANSITION_WITH_IDS_AND_SUBMISSION_URL = `${POST_TRANSITION_BASE_URL}${COMPANY_URL}${TRANSACTION_SUBMISSION_URL}`;

export const GENERAL_PARTNER_URL = `/general-partner`;
export const GENERAL_PARTNER_WITH_ID_URL = GENERAL_PARTNER_URL + `/:${GENERAL_PARTNER_ID}`;

export const LIMITED_PARTNER_URL = `/limited-partner`;
export const LIMITED_PARTNER_WITH_ID_URL = LIMITED_PARTNER_URL + `/:${LIMITED_PARTNER_ID}`;

export const ACCOUNTS_SIGN_OUT_URL = `${ACCOUNT_URL}/signout`;

// Date of update
export const DATE_OF_UPDATE_TYPE_PREFIX = "when-did";
export const DATE_OF_UPDATE_TEMPLATE = "date-of-update";

// Check your answer
export const CHECK_YOUR_ANSWERS_TYPE_SUFFIX = "change-check-your-answers";
export const CHECK_YOUR_ANSWERS_TEMPLATE = "limited-partnership-change-check-your-answers";

// services
export const SDK_LIMITED_PARTNERSHIP_SERVICE = "limitedPartnershipsService";
export const SDK_POSTCODE_LOOKUP_SERVICE = "postCodeLookup";
export const SDK_TRANSACTION_SERVICE = "transaction";
export const SDK_PAYMENT_SERVICE = "payment";

// payment
export const PAYMENTS_API_URL = getEnvironmentValue("PAYMENTS_API_URL");
export const PAYMENT = "payment";
export const REFERENCE = "LimitedPartnershipsReference";

// cookies
export const cookieOptions = {
  httpOnly: true,
  domain: COOKIE_DOMAIN,
  maxAge: parseInt(DEFAULT_SESSION_EXPIRATION, 10) * 1000, // 1 hour
  signed: true
};

// middleware
export const allPathsExceptHealthcheck = /\/limited-partnerships\/((?!healthcheck).)*/;
