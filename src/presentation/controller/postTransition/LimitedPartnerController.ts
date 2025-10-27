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
import { CONFIRMATION_POST_TRANSITION_URL } from "../global/url";
import { CEASE_DATE_TEMPLATE, JOURNEY_TYPE_PARAM } from "../../../config/constants";
import { getJourneyTypes } from "../../../utils/journey";

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
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, PostTransitionPageType);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const limitedPartnershipResult = await this.companyService?.buildLimitedPartnershipFromCompanyProfile(tokens, ids.companyId);

        const isLegalEntity =
          pageType === PostTransitionPageType.addLimitedPartnerLegalEntity ||
          pageType === PostTransitionPageType.whenDidTheLimitedPartnerLegalEntityCease;

        const limitedPartnershipData = limitedPartnershipResult?.limitedPartnership?.data;

        const resultTransaction = await this.transactionService.createTransaction(
          tokens,
          IncorporationKind.POST_TRANSITION,
          {
            companyName: limitedPartnershipData?.partnership_name ?? "",
            companyNumber: limitedPartnershipData?.partnership_number ?? ""
          },
          isLegalEntity ? data?.legalEntity.description : data?.person.description
        );

        let result: any = {};

        let resultAppointment;
        if (data?.needAppointment) {
          resultAppointment = await this.companyService?.buildPartnerFromCompanyAppointment(
            tokens,
            ids.companyId,
            ids.appointmentId
          );

          result = await this.limitedPartnerService.createLimitedPartner(tokens, resultTransaction.transactionId, {
            ...request.body,

            forename: resultAppointment?.partner.data?.forename,
            surname: resultAppointment?.partner.data?.surname,
            legal_entity_name: resultAppointment?.partner.data?.legal_entity_name,
            date_of_birth: resultAppointment?.partner.data?.date_of_birth,
            appointment_id: ids.appointmentId,
            kind: isLegalEntity
              ? PartnerKind.REMOVE_LIMITED_PARTNER_LEGAL_ENTITY
              : PartnerKind.REMOVE_LIMITED_PARTNER_PERSON
          });
        } else {
          result = await this.limitedPartnerService.createLimitedPartner(tokens, resultTransaction.transactionId, {
            ...request.body,
            kind: isLegalEntity ? data?.legalEntity.kind : data?.person.kind
          });
        }

        if (result.errors) {
          super.resetFormerNamesIfPreviousNameIsFalse(request.body);

          const { data: renderData, url } = this.buildLimitedPartnerErrorRenderData(
            pageType,
            pageRouting,
            limitedPartnershipResult,
            resultAppointment,
            request.body
          );

          response.render(
            super.templateName(url),
            super.makeProps(pageRouting, renderData, result.errors)
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
        next(error);
      }
    };
  }

  private buildLimitedPartnerErrorRenderData(
    pageType: string,
    pageRouting: any,
    limitedPartnershipResult: any,
    resultAppointment: any,
    requestBody: any
  ) {
    const isCeaseDatePage =
      pageType === PostTransitionPageType.whenDidTheLimitedPartnerLegalEntityCease;

    if (isCeaseDatePage) {
      return {
        data: {
          limitedPartnership: limitedPartnershipResult?.limitedPartnership,
          partner: resultAppointment?.partner,
          ...requestBody
        },
        url: CEASE_DATE_TEMPLATE
      };
    } else {
      return {
        data: {
          limitedPartnership: limitedPartnershipResult?.limitedPartnership,
          limitedPartner: { data: requestBody }
        },
        url: pageRouting.currentUrl
      };
    }
  }

  sendPageData() {
    return super.sendPageData({
      confirmLimitedPartnerUsualResidentialAddressUrl: CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
      confirmLimitedPartnerPrincipalOfficeAddressUrl: CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
    });
  }

  getCeaseDate() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids, pageType, tokens } = super.extract(request);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        let limitedPartnership = {};
        let partner = {};

        if (this.companyService) {
          const { limitedPartnership: lp } = await this.companyService.buildLimitedPartnershipFromCompanyProfile(
            tokens,
            ids.companyId
          );

          limitedPartnership = lp;

          if (ids.appointmentId) {
            const { partner: pt } = await this.companyService.buildPartnerFromCompanyAppointment(
              tokens,
              ids.companyId,
              ids.appointmentId
            );

            partner = pt;
          }
        }

        if (ids.limitedPartnerId) {
          partner = await this.limitedPartnerService.getLimitedPartner(tokens, ids.transactionId, ids.limitedPartnerId);
        }

        response.render(CEASE_DATE_TEMPLATE, super.makeProps(pageRouting, { limitedPartnership, partner }, null));
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
