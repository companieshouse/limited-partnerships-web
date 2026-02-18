import { PartnerKind, GeneralPartner, LimitedPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

export function isUpdateKind(partner: GeneralPartner | LimitedPartner) {
  return partner?.data?.kind === PartnerKind.UPDATE_GENERAL_PARTNER_PERSON ||
    partner?.data?.kind === PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY ||
    partner?.data?.kind === PartnerKind.UPDATE_LIMITED_PARTNER_PERSON ||
    partner?.data?.kind === PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY;
}
