import { TransactionKind } from "../../../domain/entities/TransactionTypes";
import { Journey } from "../../../domain/entities/journey";
import { PARTNERSHIP_TYPE_WITH_IDS_URL } from "../registration/url";
import { EMAIL_URL } from "../transition/url";
import { PartnerKind, PartnershipKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
  ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
  ADD_LIMITED_PARTNER_PERSON_WITH_IDS_URL,
  ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_WITH_IDS_URL,
  ENTER_REGISTERED_OFFICE_ADDRESS_WITH_IDS_URL,
  PARTNERSHIP_NAME_WITH_IDS_URL,
  TERM_WITH_IDS_URL
} from "../postTransition/url";

export const RESUME_REGISTRATION_OR_TRANSITION_URL_MAP: Record<string, { journey: string; resumeUrl: string }> = {
  [TransactionKind.registration]: {
    journey: Journey.registration,
    resumeUrl: PARTNERSHIP_TYPE_WITH_IDS_URL
  },
  [TransactionKind.transition]: {
    journey: Journey.transition,
    resumeUrl: EMAIL_URL
  }
};

export const RESUME_GENERAL_PARTNER_URL_MAP: Record<string, { journey: string; resumeUrl: string }> = {
  [PartnerKind.ADD_GENERAL_PARTNER_PERSON]: {
    journey: Journey.postTransition,
    resumeUrl: ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL
  },
  [PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY]: {
    journey: Journey.postTransition,
    resumeUrl: ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL
  }
};

export const RESUME_LIMITED_PARTNER_URL_MAP: Record<string, { journey: string; resumeUrl: string }> = {
  [PartnerKind.ADD_LIMITED_PARTNER_PERSON]: {
    journey: Journey.postTransition,
    resumeUrl: ADD_LIMITED_PARTNER_PERSON_WITH_IDS_URL
  },
  [PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY]: {
    journey: Journey.postTransition,
    resumeUrl: ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL
  }
};

export const RESUME_PARTNERSHIP_URL_MAP: Record<string, { journey: string; resumeUrl: string }> = {
  [PartnershipKind.UPDATE_PARTNERSHIP_NAME]: {
    journey: Journey.postTransition,
    resumeUrl: PARTNERSHIP_NAME_WITH_IDS_URL
  },
  [PartnershipKind.UPDATE_PARTNERSHIP_REGISTERED_OFFICE_ADDRESS]: {
    journey: Journey.postTransition,
    resumeUrl: ENTER_REGISTERED_OFFICE_ADDRESS_WITH_IDS_URL
  },
  [PartnershipKind.UPDATE_PARTNERSHIP_TERM]: {
    journey: Journey.postTransition,
    resumeUrl: TERM_WITH_IDS_URL
  },
  [PartnershipKind.UPDATE_PARTNERSHIP_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS]: {
    journey: Journey.postTransition,
    resumeUrl: ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_WITH_IDS_URL
  }
};
