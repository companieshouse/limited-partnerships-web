import { createApiClient } from "@companieshouse/api-sdk-node";

import {
  API_URL,
  OAUTH2_CLIENT_ID,
  OAUTH2_CLIENT_SECRET,
  REFRESH_TOKEN_GRANT_TYPE,
} from "../../config/constants";
import { logger } from "../../utils";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";

export const makeApiCallWithRetry = async <T>(
  tokens: { access_token: string; refresh_token: string },
  info: { service: string; method: string; args: any[] }
): Promise<T> => {
  logger.info(
    `Making a ${info.method} call on ${info.service} service with token ${tokens.access_token}`
  );

  const client = createApi(tokens.access_token);

  let response = await client[info.service][info.method](...info.args);

  if (response && response.httpStatusCode === 401) {
    logger.info(
      `Retrying ${info.method} call on ${info.service} service after unauthorised response`
    );

    const accessToken = await refreshToken(client, tokens.refresh_token);
    logger.info(`New access token: ${accessToken}`);

    const refreshClient = createApi(tokens.access_token);
    response = await refreshClient[info.service][info.method](info.args);
  }

  logger.debug("Call successful.");

  return response;
};

const createApi = (access_token: string) => {
  return createApiClient(undefined, access_token, API_URL);
};

const refreshToken = async (
  client: ApiClient,
  refresh_token: string
): Promise<string> => {
  const refreshTokenData = (await client.refreshToken.refresh(
    refresh_token,
    REFRESH_TOKEN_GRANT_TYPE,
    OAUTH2_CLIENT_ID,
    OAUTH2_CLIENT_SECRET
  )) as any;

  const accessToken = refreshTokenData?.resource?.access_token;

  if (!accessToken) {
    throw new Error(
      `Error on refresh token ${JSON.stringify(refreshTokenData)}`
    );
  }

  return accessToken;
};
