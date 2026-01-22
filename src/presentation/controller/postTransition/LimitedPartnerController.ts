import { NextFunction, Request, Response } from "express";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import CompanyService from "../../../application/service/CompanyService";
import PostTransitionPartnerController from "./PostTransitionPartnerController";
import PartnerController, { PartnerType } from "../common/PartnerController";

import { ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL, ADD_LIMITED_PARTNER_PERSON_URL } from "./url";
import {
  CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../addressLookUp/url/postTransition";

import postTransitionRouting from "../postTransition/routing";
import { CONFIRMATION_POST_TRANSITION_URL } from "../global/url";
import { JOURNEY_TYPE_PARAM, PARTNER_CHANGE_CHECK_YOUR_ANSWERS_TEMPLATE } from "../../../config/constants";
import { getJourneyTypes } from "../../../utils/journey";
import { formatDate } from "../../../utils/date-format";

class LimitedPartnerPostTransitionController extends PartnerController {
  constructor(
    limitedPartnershipService: LimitedPartnershipService,
    generalPartnerService: GeneralPartnerService,
    limitedPartnerService: LimitedPartnerService,
    companyService: CompanyService,
    private readonly postTransitionPartnerController: PostTransitionPartnerController
  ) {
    super(limitedPartnershipService, generalPartnerService, limitedPartnerService, companyService);
  }

  getPageRouting() {
    return super.getPageRouting();
  }

  limitedPartnerChoice() {
    return super.partnerType({
      addPersonUrl: ADD_LIMITED_PARTNER_PERSON_URL,
      addLegalEntityUrl: ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL
    });
  }

  createLimitedPartner(data?: {
    person: {
      description: string;
      kind: PartnerKind;
    };
    legalEntity: {
      description: string;
      kind: PartnerKind;
    };
    needAppointment?: boolean;
  }) {
    return this.postTransitionPartnerController.createPartner(PartnerType.limitedPartner, data);
  }

  sendPageData() {
    return super.sendPageData(PartnerType.limitedPartner, {
      confirmPartnerUsualResidentialAddressUrl: CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
      confirmPartnerPrincipalOfficeAddressUrl: CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
    });
  }

  getCeaseDate() {
    return this.postTransitionPartnerController.getCeaseDate();
  }

  getCheckYourAnswersPageRouting() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const partner = await this.limitedPartnerService.getLimitedPartner(
          tokens,
          ids.transactionId,
          ids.limitedPartnerId
        );

        if (partner?.data?.cease_date) {
          partner.data.cease_date = formatDate(partner.data.cease_date, response.locals.i18n);
        }

        response.render(PARTNER_CHANGE_CHECK_YOUR_ANSWERS_TEMPLATE, super.makeProps(pageRouting, { partner }, null));
      } catch (error) {
        next(error);
      }
    };
  }

  postCheckYourAnswers() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);

        await this.limitedPartnershipService.closeTransaction(tokens, ids.transactionId);

        const url = super
          .insertIdsInUrl(CONFIRMATION_POST_TRANSITION_URL, ids, request.url)
          .replace(JOURNEY_TYPE_PARAM, getJourneyTypes(request.url).journey);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }
}

export default LimitedPartnerPostTransitionController;
