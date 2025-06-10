import { BASE_URL, BASE_WITH_JOURNEY_TYPE_AND_IDS_URL } from "../../../config/constants";
import GlobalPageType from "./PageType";
import { SIGN_OUT_TEMPLATE } from "./template";

export const HEALTHCHECK_URL = `${BASE_URL}/healthcheck`;
export const SIGN_OUT_URL = `${BASE_URL}/${SIGN_OUT_TEMPLATE}`;
export const CONFIRMATION_URL = `${BASE_WITH_JOURNEY_TYPE_AND_IDS_URL}/${GlobalPageType.confirmation}`;
