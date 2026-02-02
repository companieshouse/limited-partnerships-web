import { NextFunction, Request, Response } from "express";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import CompanyService from "../../../application/service/CompanyService";
import PostTransitionPartnerController from "./PostTransitionPartnerController";
import PartnerController, { PartnerType } from "../common/PartnerController";

import { ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL, ADD_GENERAL_PARTNER_PERSON_URL } from "./url";
import {
  CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../addressLookUp/url/postTransition";

import postTransitionRouting from "../postTransition/routing";
import { CONFIRMATION_POST_TRANSITION_URL } from "../global/url";
import {
  CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX,
  JOURNEY_QUERY_PARAM,
  JOURNEY_TYPE_PARAM,
  PARTNER_CHANGE_CHECK_YOUR_ANSWERS_TEMPLATE
} from "../../../config/constants";
import { getJourneyTypes } from "../../../utils/journey";
import { formatDate } from "../../../utils/date-format";

class GeneralPartnerPostTransitionController extends PartnerController {
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

  getUpdatePageRouting() {
    return this.postTransitionPartnerController.getUpdatePartner(PartnerType.generalPartner);
  }

  generalPartnerChoice() {
    return super.partnerType({
      addPersonUrl: ADD_GENERAL_PARTNER_PERSON_URL,
      addLegalEntityUrl: ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL
    });
  }

  createGeneralPartner(data?: {
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
    return this.postTransitionPartnerController.createPartner(PartnerType.generalPartner, data);
  }

  sendPageData() {
    return super.sendPageData(PartnerType.generalPartner, {
      confirmPartnerUsualResidentialAddressUrl: CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
      confirmPartnerPrincipalOfficeAddressUrl: CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
    });
  }

  sendUpdatePageData() {
    return super.sendPageData(PartnerType.generalPartner);
  }

  getCeaseDate() {
    return this.postTransitionPartnerController.getCeaseDate();
  }

  getCheckYourAnswersPageRouting() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        let limitedPartnership = {};
        if (pageRouting.currentUrl.includes(CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX)){
          limitedPartnership = (await this.postTransitionPartnerController.getPartnerData(request)).limitedPartnership;
        }

        const partner = await this.generalPartnerService.getGeneralPartner(
          tokens,
          ids.transactionId,
          ids.generalPartnerId
        );

        if (partner?.data?.cease_date) {
          partner.data.cease_date = formatDate(partner.data.cease_date, response.locals.i18n);
        }

        let partnerUpdatedFieldsMap: Record<string, boolean> = {};
        if (partner.data?.kind === PartnerKind.UPDATE_GENERAL_PARTNER_PERSON) {
          partnerUpdatedFieldsMap = await super.comparePartnerDetails(partner, request);
        }

        response.render(PARTNER_CHANGE_CHECK_YOUR_ANSWERS_TEMPLATE, super.makeProps(pageRouting, { limitedPartnership, partner, partnerUpdatedFieldsMap }, null));
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

        let url = super
          .insertIdsInUrl(CONFIRMATION_POST_TRANSITION_URL, ids, request.url)
          .replace(JOURNEY_TYPE_PARAM, getJourneyTypes(request.url).journey);

        if (response.locals?.serviceName) {
          const serviceName = response.locals?.serviceName.toLowerCase().replace(/\s+/g, '-');
          url = this.addOrAppendQueryParam(url, JOURNEY_QUERY_PARAM, serviceName);
        }

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }
}

export default GeneralPartnerPostTransitionController;
