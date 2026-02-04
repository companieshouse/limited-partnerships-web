import { PartnerKind, PartnershipKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

export const serviceNameKindMap: Record<string, string> = {
  [PartnershipKind.UPDATE_PARTNERSHIP_NAME]: "updateLimitedPartnershipName",
  [PartnershipKind.UPDATE_PARTNERSHIP_TERM]: "updateLimitedPartnershipTerm",
  [PartnershipKind.UPDATE_PARTNERSHIP_REGISTERED_OFFICE_ADDRESS]: "updateLimitedPartnershipRegisteredOfficeAddress",
  [PartnershipKind.UPDATE_PARTNERSHIP_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS]: "updateLimitedPartnershipPrincipalPlaceOfBusinessAddress",
  [PartnershipKind.UPDATE_PARTNERSHIP_REDESIGNATE_TO_PFLP]: "updateLimitedPartnershipRedesignateToPFLP",
  [PartnerKind.ADD_GENERAL_PARTNER_PERSON]: "addGeneralPartner",
  [PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY]: "addGeneralPartner",
  [PartnerKind.ADD_LIMITED_PARTNER_PERSON]: "addLimitedPartner",
  [PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY]: "addLimitedPartner",
  [PartnerKind.REMOVE_GENERAL_PARTNER_LEGAL_ENTITY]: "removeGeneralPartnerEntity",
  [PartnerKind.REMOVE_GENERAL_PARTNER_PERSON]: "removeGeneralPartnerPerson",
  [PartnerKind.REMOVE_LIMITED_PARTNER_LEGAL_ENTITY]: "removeLimitedPartnerEntity",
  [PartnerKind.REMOVE_LIMITED_PARTNER_PERSON]: "removeLimitedPartnerPerson",
  [PartnerKind.UPDATE_GENERAL_PARTNER_PERSON]: "updateGeneralPartnerPerson",
  [PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY]: "updateGeneralPartnerLegalEntity",
};
