import { GeneralPartner, LimitedPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { formatDate } from "./date-format";
import { Response } from "express";
import GeneralPartnerService from "../application/service/GeneralPartnerService";
import LimitedPartnerService from "../application/service/LimitedPartnerService";

export const getPartners = async (
  tokens: { access_token: string; refresh_token: string },
  transactionId: string,
  response: Response,
  generalPartnerService: GeneralPartnerService,
  limitedPartnerService: LimitedPartnerService
): Promise<{ generalPartners: GeneralPartner[]; limitedPartners: LimitedPartner[] }> => {
  const gpResult = await generalPartnerService.getGeneralPartners(tokens, transactionId);
  const generalPartners = gpResult.generalPartners.map((partner) => formatPartnerDates(partner, response));

  const lpResult = await limitedPartnerService.getLimitedPartners(tokens, transactionId);
  const limitedPartners = lpResult.limitedPartners.map((partner) => formatPartnerDates(partner, response));

  return { generalPartners, limitedPartners };
};

const formatPartnerDates = ( partner: GeneralPartner | LimitedPartner, response: Response): GeneralPartner | LimitedPartner => {
  if (partner.data?.date_effective_from) {
    return {
      ...partner,
      data: {
        ...partner.data,
        date_of_birth: partner.data?.date_of_birth
          ? formatDate(partner.data?.date_of_birth, response.locals.i18n)
          : undefined,
        date_effective_from: partner.data?.date_effective_from
          ? formatDate(partner.data?.date_effective_from, response.locals.i18n)
          : undefined
      }
    };
  } else {
    return {
      ...partner,
      data: {
        ...partner.data,
        date_of_birth: partner.data?.date_of_birth
          ? formatDate(partner.data?.date_of_birth, response.locals.i18n)
          : undefined
      }
    };
  }
};
