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

import { CONFIRMATION_POST_TRANSITION_URL } from "../global/url";
import {
  JOURNEY_QUERY_PARAM,
  JOURNEY_TYPE_PARAM
} from "../../../config/constants";
import { getJourneyTypes } from "../../../utils/journey";

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

  getUpdatePageRouting() {
    return this.postTransitionPartnerController.getUpdatePartner(PartnerType.limitedPartner);
  }

  sendUpdatePageData() {
    return super.sendPageData(PartnerType.limitedPartner);
  }

  getCeaseDate() {
    return this.postTransitionPartnerController.getCeaseDate();
  }

  getDateOfUpdate() {
    return this.postTransitionPartnerController.getDateOfUpdate(PartnerType.limitedPartner);
  }

  getCheckYourAnswersPageRouting() {
    return this.postTransitionPartnerController.getCheckYourAnswersPageRouting(PartnerType.limitedPartner);
  }

  postCheckYourAnswers() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);

        await this.limitedPartnershipService.closeTransaction(tokens, ids.transactionId);

        let url = super
          .insertIdsInUrl(CONFIRMATION_POST_TRANSITION_URL, ids, request.url)
          .replace(JOURNEY_TYPE_PARAM, getJourneyTypes(request.url).journey);

        const serviceName = response.locals?.serviceName;
        if (serviceName) {
          const serviceNameQuery = serviceName.toLowerCase().replace(/\s+/g, '-');
          url = this.addOrAppendQueryParam(url, JOURNEY_QUERY_PARAM, serviceNameQuery);
        }

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }
}

export default LimitedPartnerPostTransitionController;
