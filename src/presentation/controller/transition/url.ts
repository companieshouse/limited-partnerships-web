import * as template from "./template";
import {
  GENERAL_PARTNER_WITH_ID_URL,
  LIMITED_PARTNER_WITH_ID_URL,
  TRANSITION_BASE_URL,
  TRANSITION_WITH_IDS_URL
} from "../../../config/constants";

export const COMPANY_NUMBER_URL = `${TRANSITION_BASE_URL}/${template.COMPANY_NUMBER_TEMPLATE}`;
export const CONFIRM_LIMITED_PARTNERSHIP_URL = `${TRANSITION_BASE_URL}/${template.CONFIRM_LIMITED_PARTNERSHIP_TEMPLATE}`;
export const EMAIL_URL = `${TRANSITION_WITH_IDS_URL}/${template.EMAIL_TEMPLATE}`;

// general partner
export const GENERAL_PARTNERS_URL = `${TRANSITION_WITH_IDS_URL}/${template.GENERAL_PARTNERS_TEMPLATE}`;
export const GENERAL_PARTNER_CHOICE_URL = `${TRANSITION_WITH_IDS_URL}/${template.GENERAL_PARTNER_CHOICE_TEMPLATE}`;
export const ADD_GENERAL_PARTNER_PERSON_URL = `${TRANSITION_WITH_IDS_URL}/${template.ADD_GENERAL_PARTNER_PERSON_TEMPLATE}`;
export const ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL = `${TRANSITION_WITH_IDS_URL}${GENERAL_PARTNER_WITH_ID_URL}/${template.ADD_GENERAL_PARTNER_PERSON_TEMPLATE}`;
export const ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL = `${TRANSITION_WITH_IDS_URL}/${template.ADD_GENERAL_PARTNER_LEGAL_ENTITY_TEMPLATE}`;
export const ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL = `${TRANSITION_WITH_IDS_URL}${GENERAL_PARTNER_WITH_ID_URL}/${template.ADD_GENERAL_PARTNER_LEGAL_ENTITY_TEMPLATE}`;
export const REVIEW_GENERAL_PARTNERS_URL = `${TRANSITION_WITH_IDS_URL}/${template.REVIEW_GENERAL_PARTNERS_TEMPLATE}`;
export const REMOVE_GENERAL_PARTNER_URL = `${TRANSITION_WITH_IDS_URL}${GENERAL_PARTNER_WITH_ID_URL}/${template.REMOVE_GENERAL_PARTNER_TEMPLATE}`;

// limited partner
export const LIMITED_PARTNERS_URL = `${TRANSITION_WITH_IDS_URL}/${template.LIMITED_PARTNERS_TEMPLATE}`;
export const LIMITED_PARTNER_CHOICE_URL = `${TRANSITION_WITH_IDS_URL}/${template.LIMITED_PARTNER_CHOICE_TEMPLATE}`;
export const ADD_LIMITED_PARTNER_PERSON_URL = `${TRANSITION_WITH_IDS_URL}/${template.ADD_LIMITED_PARTNER_PERSON_TEMPLATE}`;
export const ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL = `${TRANSITION_WITH_IDS_URL}${LIMITED_PARTNER_WITH_ID_URL}/${template.ADD_LIMITED_PARTNER_PERSON_TEMPLATE}`;
export const ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL = `${TRANSITION_WITH_IDS_URL}/${template.ADD_LIMITED_PARTNER_LEGAL_ENTITY_TEMPLATE}`;
export const ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL = `${TRANSITION_WITH_IDS_URL}${LIMITED_PARTNER_WITH_ID_URL}/${template.ADD_LIMITED_PARTNER_LEGAL_ENTITY_TEMPLATE}`;
export const REVIEW_LIMITED_PARTNERS_URL = `${TRANSITION_WITH_IDS_URL}/${template.REVIEW_LIMITED_PARTNERS_TEMPLATE}`;
export const REMOVE_LIMITED_PARTNER_URL = `${TRANSITION_WITH_IDS_URL}${LIMITED_PARTNER_WITH_ID_URL}/${template.REMOVE_LIMITED_PARTNER_TEMPLATE}`;

export const CHECK_YOUR_ANSWERS_URL = `${TRANSITION_WITH_IDS_URL}/${template.CHECK_YOUR_ANSWERS_TEMPLATE}`;
