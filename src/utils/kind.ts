import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

export function isUpdateKind(partnerKind: string | undefined) {
  return partnerKind === PartnerKind.UPDATE_GENERAL_PARTNER_PERSON ||
    partnerKind === PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY ||
    partnerKind === PartnerKind.UPDATE_LIMITED_PARTNER_PERSON ||
    partnerKind === PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY;
}
