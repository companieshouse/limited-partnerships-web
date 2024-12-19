export default () => {
  process.env.ACCOUNT_URL = "https://account.chs.local";
  process.env.API_URL = "https://api.chs.local:4001";
  process.env.CACHE_SERVER = "redis";
  process.env.CDN_HOST = "cdn.chs.local";
  process.env.CHS_URL = "https://chs.local";
  process.env.COOKIE_DOMAIN = "chs.local";
  process.env.COOKIE_NAME = "__SID";
  process.env.COOKIE_SECRET = "123456789012345678901234";
  process.env.DEFAULT_SESSION_EXPIRATION = "3600";
  process.env.INTERNAL_API_URL = "https://api.chs.local:4001";
  process.env.LOCALES_ENABLED = "false";
  process.env.LOG_LEVEL = "ERROR";
  process.env.NODE_ENV = "development";
  process.env.OAUTH2_CLIENT_ID = "OAUTH2_CLIENT_ID";
  process.env.OAUTH2_CLIENT_SECRET = "OAUTH2_CLIENT_SECRET";
  process.env.PIWIK_REGISTRATION_START_GOAL_ID = "45";
  process.env.PIWIK_SITE_ID = "24";
  process.env.PIWIK_URL = "piwik.url";
  process.env.PORT = "3000";
  process.env.SHOW_SERVICE_OFFLINE_PAGE = "false";
};
