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
import CacheService from "../../../application/service/CacheService";
import TransactionService from "../../../application/service/TransactionService";
import { IncorporationKind, PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import PostTransitionPageType from "../postTransition/pageType";
import postTransitionRouting from "../postTransition/routing";

class GeneralPartnerPostTransitionController extends GeneralPartnerController {
  constructor(
    limitedPartnershipService: LimitedPartnershipService,
    generalPartnerService: GeneralPartnerService,
    limitedPartnerService: LimitedPartnerService,
    cacheService: CacheService,
    companyService: CompanyService,
    private readonly transactionService: TransactionService
  ) {
    super(limitedPartnershipService, generalPartnerService, limitedPartnerService, cacheService, companyService);
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

        const cache = this.cacheService?.getDataFromCache(request.signedCookies);

        const companyResult = await this.companyService?.getCompanyProfile(tokens, ids.companyId);

        const isLegalEntity = pageType === PostTransitionPageType.addGeneralPartnerLegalEntity;

        const resultTransaction = await this.transactionService.createTransaction(
          tokens,
          IncorporationKind.POST_TRANSITION,
          {
            companyName: companyResult?.companyProfile?.companyName || "",
            companyNumber: companyResult?.companyProfile?.companyNumber || ""
          },
          isLegalEntity ? "Add a general partner (legal entity)" : "Add a general partner (person)"
        );

        const result = await this.generalPartnerService.createGeneralPartner(tokens, resultTransaction.transactionId, {
          ...request.body,
          kind: isLegalEntity ? PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY : PartnerKind.ADD_GENERAL_PARTNER_PERSON
        });

        if (result.errors && cache && companyResult) {
          const companyProfile = companyResult.companyProfile;

          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { companyProfile, generalPartner: { data: request.body } }, result.errors)
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
        console.log("Error creating general partner:", error);
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
}

export default GeneralPartnerPostTransitionController;
