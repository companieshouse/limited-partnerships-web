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

import { CONFIRMATION_POST_TRANSITION_URL } from "../global/url";
import {
  JOURNEY_QUERY_PARAM,
  JOURNEY_TYPE_PARAM
} from "../../../config/constants";
import { getJourneyTypes } from "../../../utils/journey";

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

  getDateOfUpdate() {
    return this.postTransitionPartnerController.getDateOfUpdate(PartnerType.generalPartner);
  }

  getCheckYourAnswersPageRouting() {
    return this.postTransitionPartnerController.getCheckYourAnswersPageRouting(PartnerType.generalPartner);
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
