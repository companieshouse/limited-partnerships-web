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
import { JOURNEY_TYPE_PARAM, REMOVE_CHECK_YOUR_ANSWERS_TEMPLATE } from "../../../config/constants";
import { getJourneyTypes } from "../../../utils/journey";
import { formatDate } from "../../../utils/date-format";

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
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, PostTransitionPageType);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const limitedPartnershipResult = await this.companyService?.buildLimitedPartnershipFromCompanyProfile(
          tokens,
          ids.companyId
        );

        const isLegalEntity =
          pageType === PostTransitionPageType.addGeneralPartnerLegalEntity ||
          pageType === PostTransitionPageType.whenDidTheGeneralPartnerLegalEntityCease;

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

          result = await this.generalPartnerService.createGeneralPartner(tokens, resultTransaction.transactionId, {
            ...request.body,

            forename: resultAppointment?.partner.data?.forename,
            surname: resultAppointment?.partner.data?.surname,
            legal_entity_name: resultAppointment?.partner.data?.legal_entity_name,
            date_of_birth: resultAppointment?.partner.data?.date_of_birth,
            appointment_id: ids.appointmentId,

            kind: isLegalEntity
              ? PartnerKind.REMOVE_GENERAL_PARTNER_LEGAL_ENTITY
              : PartnerKind.REMOVE_GENERAL_PARTNER_PERSON
          });
        } else {
          result = await this.generalPartnerService.createGeneralPartner(tokens, resultTransaction.transactionId, {
            ...request.body,
            kind: isLegalEntity ? data?.legalEntity.kind : data?.person.kind
          });
        }

        if (result.errors) {
          super.resetFormerNamesIfPreviousNameIsFalse(request.body);

          const { data: renderData, url } = this.buildPartnerErrorRenderData(
            pageType,
            pageRouting,
            limitedPartnershipResult?.limitedPartnership,
            resultAppointment?.partner,
            request.body,
            "generalPartner"
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
    return super.getCeaseDate(
      this.companyService,
      this.generalPartnerService
    );
  }

  getCheckYourAnswersPageRouting() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const partner = await this.generalPartnerService.getGeneralPartner(
          tokens,
          ids.transactionId,
          ids.generalPartnerId
        );

        if (partner?.data?.cease_date) {
          partner.data.cease_date = formatDate(partner.data.cease_date, response.locals.i18n);
        }

        response.render(REMOVE_CHECK_YOUR_ANSWERS_TEMPLATE, super.makeProps(pageRouting, { partner }, null));
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
