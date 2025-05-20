import { BASE_URL, BASE_WITH_JOURNEY_TYPE_AND_IDS_URL, REGISTRATION_BASE_URL } from "../../../config/constants";
import GlobalPageType from "./PageType";
import { NEXT_TEMPLATE, SIGN_OUT_TEMPLATE, START_TEMPLATE } from "./template";

export const HEALTHCHECK_URL = `${BASE_URL}/healthcheck`;
export const START_URL = `${REGISTRATION_BASE_URL}/${START_TEMPLATE}`;
export const SIGN_OUT_URL = `${BASE_URL}/${SIGN_OUT_TEMPLATE}`;
export const CONFIRMATION_URL = `${BASE_WITH_JOURNEY_TYPE_AND_IDS_URL}/${GlobalPageType.confirmation}`;
export const NEXT_URL = `${BASE_URL}/${NEXT_TEMPLATE}`;
