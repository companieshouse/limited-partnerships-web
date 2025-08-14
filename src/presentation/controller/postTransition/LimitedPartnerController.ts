import { NextFunction, Request, Response } from "express";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import LimitedPartnerController from "../common/LimitedPartnerController";

import { ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL, ADD_LIMITED_PARTNER_PERSON_URL } from "./url";
import {
  CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../addressLookUp/url/postTransition";
import CompanyService from "../../../application/service/CompanyService";
import TransactionService from "../../../application/service/TransactionService";
import { IncorporationKind, PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import PostTransitionPageType from "../postTransition/pageType";
import postTransitionRouting from "../postTransition/routing";

class LimitedPartnerPostTransitionController extends LimitedPartnerController {
  constructor(
    limitedPartnershipService: LimitedPartnershipService,
    limitedPartnerService: LimitedPartnerService,
    companyService: CompanyService,
    private readonly transactionService: TransactionService
  ) {
    super(limitedPartnershipService, limitedPartnerService, companyService);
  }

  getPageRouting() {
    return super.getPageRouting();
  }

  limitedPartnerChoice() {
    return super.limitedPartnerChoice({
      addPersonUrl: ADD_LIMITED_PARTNER_PERSON_URL,
      addLegalEntityUrl: ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL
    });
  }

  createLimitedPartner() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, PostTransitionPageType);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const companyResult = await this.companyService?.getCompanyProfile(tokens, ids.companyId);

        const isLegalEntity = pageType === PostTransitionPageType.addGeneralPartnerLegalEntity;

        const resultTransaction = await this.transactionService.createTransaction(
          tokens,
          IncorporationKind.POST_TRANSITION,
          {
            companyName: companyResult?.companyProfile?.companyName ?? "",
            companyNumber: companyResult?.companyProfile?.companyNumber ?? ""
          },
          isLegalEntity ? "Add a limited partner (legal entity)" : "Add a limited partner (person)"
        );

        const result = await this.limitedPartnerService.createLimitedPartner(tokens, resultTransaction.transactionId, {
          ...request.body,
          kind: isLegalEntity ? PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY : PartnerKind.ADD_LIMITED_PARTNER_PERSON
        });

        if (result.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              {
                limitedPartnership: {
                  data: {
                    partnership_name: companyResult?.companyProfile?.companyName,
                    partnership_number: companyResult?.companyProfile?.companyNumber
                  }
                },
                limitedPartner: { data: request.body }
              },
              result.errors
            )
          );

          return;
        }

        const newIds = {
          ...ids,
          transactionId: resultTransaction.transactionId,
          limitedPartnerId: result.limitedPartnerId
        };

        const url = super.insertIdsInUrl(pageRouting.nextUrl, newIds);

        response.redirect(url);
      } catch (error) {
        console.log("Error creating limited partner:", error);
        next(error);
      }
    };
  }

  sendPageData() {
    return super.sendPageData({
      confirmLimitedPartnerUsualResidentialAddressUrl: CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
      confirmLimitedPartnerPrincipalOfficeAddressUrl: CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
    });
  }
}

export default LimitedPartnerPostTransitionController;
