import * as template from "./template";

import { BASE_URL, BASE_WITH_IDS_URL } from "../../../config/constants";

export const START_URL = `${BASE_URL}/start`;
export const WHICH_TYPE_URL = `${BASE_URL}/${template.WHICH_TYPE_TEMPLATE}`;
export const NAME_URL = `${BASE_URL}/${template.NAME_TEMPLATE}`;
export const NAME_WITH_IDS_URL = `${BASE_WITH_IDS_URL}/${template.NAME_TEMPLATE}`;
export const EMAIL_URL = `${BASE_WITH_IDS_URL}/${template.EMAIL_TEMPLATE}`;
export const WHERE_IS_THE_JURISDICTION_URL = `${BASE_WITH_IDS_URL}/${template.WHERE_IS_THE_JURISDICTION_TEMPLATE}`;
export const TERM_URL = `${BASE_WITH_IDS_URL}/${template.TERM_TEMPLATE}`;
export const GENERAL_PARTNERS_URL = `${BASE_WITH_IDS_URL}/${template.GENERAL_PARTNERS_TEMPLATE}`;
export const GENERAL_PARTNER_CHOICE_URL = `${BASE_WITH_IDS_URL}/${template.GENERAL_PARTNER_CHOICE_TEMPLATE}`;
export const ADD_GENERAL_PARTNER_URL = `${BASE_WITH_IDS_URL}/${template.ADD_GENERAL_PARTNER_TEMPLATE}`;
export const LIMITED_PARTNERS_URL = `${BASE_WITH_IDS_URL}/${template.LIMITED_PARTNERS_TEMPLATE}`;
export const LIMITED_PARTNER_CHOICE_URL = `${BASE_WITH_IDS_URL}/${template.LIMITED_PARTNER_CHOICE_TEMPLATE}`;
export const CHECK_YOUR_ANSWERS_URL = `${BASE_WITH_IDS_URL}/${template.CHECK_YOUR_ANSWERS_TEMPLATE}`;
export const NEXT_URL = `${BASE_WITH_IDS_URL}/${template.NEXT_TEMPLATE}`;
