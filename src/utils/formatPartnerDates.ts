import { GeneralPartner, LimitedPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { formatDate } from "./date-format";

export const formatPartnerDates = ( partner: GeneralPartner | LimitedPartner, translation: Record<string, any>): GeneralPartner | LimitedPartner => {
  if (partner.data?.date_effective_from) {
    return {
      ...partner,
      data: {
        ...partner.data,
        date_of_birth: partner.data?.date_of_birth
          ? formatDate(partner.data?.date_of_birth, translation)
          : undefined,
        date_effective_from: partner.data?.date_effective_from
          ? formatDate(partner.data?.date_effective_from, translation)
          : undefined
      }
    };
  } else {
    return {
      ...partner,
      data: {
        ...partner.data,
        date_of_birth: partner.data?.date_of_birth
          ? formatDate(partner.data?.date_of_birth, translation)
          : undefined
      }
    };
  }
};
