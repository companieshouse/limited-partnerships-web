import { NextFunction, Request, Response } from "express";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import GeneralPartnerController from "../common/GeneralPartnerController";

import { ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL, ADD_GENERAL_PARTNER_PERSON_URL } from "./url";
import {
  CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../addressLookUp/url/postTransition";
import CompanyService from "../../../application/service/CompanyService";
import TransactionService from "../../../application/service/TransactionService";
import { IncorporationKind, PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import PostTransitionPageType from "../postTransition/pageType";
import postTransitionRouting from "../postTransition/routing";
import { CONFIRMATION_POST_TRANSITION_URL } from "../global/url";
import {
  CEASE_DATE_TEMPLATE,
  JOURNEY_TYPE_PARAM,
  TRANSACTION_DESCRIPTION_ADD_GENERAL_PARTNER_LEGAL_ENTITY,
  TRANSACTION_DESCRIPTION_ADD_GENERAL_PARTNER_PERSON
} from "../../../config/constants";
import { getJourneyTypes } from "../../../utils/journey";

class GeneralPartnerPostTransitionController extends GeneralPartnerController {
  constructor(
    limitedPartnershipService: LimitedPartnershipService,
    generalPartnerService: GeneralPartnerService,
    limitedPartnerService: LimitedPartnerService,
    companyService: CompanyService,
    private readonly transactionService: TransactionService
  ) {
    super(limitedPartnershipService, generalPartnerService, limitedPartnerService, companyService);
  }

  getPageRouting() {
    return super.getPageRouting();
  }

  generalPartnerChoice() {
    return super.generalPartnerChoice({
      addPersonUrl: ADD_GENERAL_PARTNER_PERSON_URL,
      addLegalEntityUrl: ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL
    });
  }

  createGeneralPartner() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, PostTransitionPageType);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const limitedPartnershipResult = await this.companyService?.buildLimitedPartnershipFromCompanyProfile(
          tokens,
          ids.companyId
        );

        const isLegalEntity = pageType === PostTransitionPageType.addGeneralPartnerLegalEntity;

        const limitedPartnershipData = limitedPartnershipResult?.limitedPartnership?.data;

        const resultTransaction = await this.transactionService.createTransaction(
          tokens,
          IncorporationKind.POST_TRANSITION,
          {
            companyName: limitedPartnershipData?.partnership_name ?? "",
            companyNumber: limitedPartnershipData?.partnership_number ?? ""
          },
          isLegalEntity
            ? TRANSACTION_DESCRIPTION_ADD_GENERAL_PARTNER_LEGAL_ENTITY
            : TRANSACTION_DESCRIPTION_ADD_GENERAL_PARTNER_PERSON
        );

        const result = await this.generalPartnerService.createGeneralPartner(tokens, resultTransaction.transactionId, {
          ...request.body,
          kind: isLegalEntity ? PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY : PartnerKind.ADD_GENERAL_PARTNER_PERSON
        });

        if (result.errors) {
          super.resetFormerNamesIfPreviousNameIsFalse(request.body);

          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              {
                limitedPartnership: limitedPartnershipResult?.limitedPartnership,
                generalPartner: { data: request.body }
              },
              result.errors
            )
          );

          return;
        }

        const newIds = {
          ...ids,
          transactionId: resultTransaction.transactionId,
          generalPartnerId: result.generalPartnerId
        };

        const url = super.insertIdsInUrl(pageRouting.nextUrl, newIds);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  sendPageData() {
    return super.sendPageData({
      confirmGeneralPartnerUsualResidentialAddressUrl: CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
      confirmGeneralPartnerPrincipalOfficeAddressUrl: CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
    });
  }

  getCeaseDate() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids, pageType, tokens } = super.extract(request);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        let limitedPartnership = {};

        if (this.companyService) {
          const { limitedPartnership: lp } = await this.companyService.buildLimitedPartnershipFromCompanyProfile(
            tokens,
            ids.companyId
          );

          limitedPartnership = lp;
        }

        response.render(
          CEASE_DATE_TEMPLATE,
          super.makeProps(pageRouting, { limitedPartnership, appointment_id: ids.generalPartnerId }, null)
        );
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

export default GeneralPartnerPostTransitionController;
