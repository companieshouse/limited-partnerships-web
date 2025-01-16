import * as template from "./template";

import { BASE_URL, BASE_WITH_IDS_URL } from "../../../config/constants";

export const START_URL = `${BASE_URL}/start`;
export const WHICH_TYPE_URL = `${BASE_URL}/${template.WHICH_TYPE_TEMPLATE}`;
export const NAME_URL = `${BASE_URL}/${template.NAME_TEMPLATE}`;
export const NAME_WITH_IDS_URL = `${BASE_WITH_IDS_URL}/${template.NAME_TEMPLATE}`;
export const EMAIL_URL = `${BASE_WITH_IDS_URL}/${template.EMAIL_TEMPLATE}`;
export const GENERAL_PARTNERS_URL = `${BASE_WITH_IDS_URL}/${template.GENERAL_PARTNERS_TEMPLATE}`;
export const GENERAL_PARTNER_CHOICE_URL = `${BASE_WITH_IDS_URL}/${template.GENERAL_PARTNER_CHOICE_TEMPLATE}`;

export const LIMITED_PARTNERS_URL = `${BASE_WITH_IDS_URL}/${template.LIMITED_PARTNERS_TEMPLATE}`;
export const LIMITED_PARTNER_CHOICE_URL = `${BASE_WITH_IDS_URL}/${template.LIMITED_PARTNER_CHOICE_TEMPLATE}`;
export const NEXT_URL = `${BASE_WITH_IDS_URL}/${template.NEXT_TEMPLATE}`;
