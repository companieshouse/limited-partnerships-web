import { NextFunction, Request, Response } from "express";
import {
  LimitedPartner,
  LimitedPartnership,
  PartnerKind,
  PartnershipType
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import CompanyService, { DataIncludingPartners } from "../../../application/service/CompanyService";
import PostTransitionPartnerController from "./PostTransitionPartnerController";
import PartnerController from "../common/PartnerController";

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
import { Ids, PartnerType, Tokens } from "../../../domain/types";
import UIErrors from "../../../domain/entities/UIErrors";

import postTransitionRouting from "./routing";
import PostTransitionPageType from "./pageType";

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
    return this.postTransitionPartnerController.sendPageData(PartnerType.limitedPartner, {
      confirmPartnerUsualResidentialAddressUrl: CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
      confirmPartnerPrincipalOfficeAddressUrl: CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
    });
  }

  getCapitalContributionPagesRouting() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids, pageType } = super.extract(request);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const { limitedPartnership, limitedPartner } = await this.getPartnershipAndPartnerEntity(tokens, ids);

        if (
          limitedPartnership.data?.partnership_type === PartnershipType.PFLP ||
          limitedPartnership.data?.partnership_type === PartnershipType.SPFLP
        ) {
          response.redirect(super.insertIdsInUrl(pageRouting.data?.nextNoUrl, ids, request.url));
          return;
        }

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, limitedPartner }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  sendCapitalContributionPagesData() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.limitedPartnerService.setI18n(response.locals.i18n);

        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, PostTransitionPageType);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        if (
          pageRouting.pageType === PostTransitionPageType.updateLimitedPartnerCapitalContributionYesNo &&
          !request.body.update_capital_contribution_required
        ) {
          const errors = new UIErrors().setWebError(
            pageRouting.data?.fieldName,
            response.locals.i18n.errorMessages.partners.updateCapitalContributionRequired
          );

          return await this.renderErrors(request, response, errors);
        }

        const data = {
          ...request.body,
          partnerType: pageRouting?.data?.partnerType,
          partnerEntityType: pageRouting?.data?.partnerEntityType,
          journeyTypes: response.locals.journeyTypes,
          pageKey: pageRouting?.data?.titleKey
        };

        const capitalContributionErrors = this.limitedPartnerService.validateCapitalContribution(data, response.locals?.i18n);

        if (capitalContributionErrors?.hasErrors()) {
          return await this.renderErrors(request, response, capitalContributionErrors);
        }

        const result = await super.sendData(PartnerType.limitedPartner, tokens, ids, data);

        if (result?.errors?.hasErrors()) {
          return await this.renderErrors(request, response, result.errors);
        }

        if (request.body.update_capital_contribution_required === "true") {
          response.redirect(this.insertIdsInUrl(pageRouting.data?.nextYesUrl, ids));
          return;
        } else if (request.body.update_capital_contribution_required === "false") {
          response.redirect(this.insertIdsInUrl(pageRouting.data?.nextNoUrl, ids));
          return;
        }

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private async renderErrors(request: Request, response: Response, errors: UIErrors) {
    const { tokens, ids } = super.extract(request);
    const pageType = super.extractPageTypeOrThrowError(request, PostTransitionPageType);
    const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

    const { limitedPartnership, limitedPartner } = await this.getPartnershipAndPartnerEntity(tokens, ids);

    const { data: renderData, url } = this.buildPartnerErrorRenderData(
      pageType,
      pageRouting,
      limitedPartnership,
      limitedPartner,
      request.body,
      PartnerType.limitedPartner
    );

    response.render(super.templateName(url), super.makeProps(pageRouting, renderData, errors));
  }

  private async getPartnershipAndPartnerEntity(
    tokens: Tokens,
    ids: Ids
  ): Promise<{
    limitedPartnership: Partial<LimitedPartnership & DataIncludingPartners>;
    limitedPartner: LimitedPartner;
  }> {
    let limitedPartnership: Partial<LimitedPartnership & DataIncludingPartners> = {};

    if (this.companyService) {
      const result = await this.companyService.buildLimitedPartnershipFromCompanyProfile(tokens, ids.companyId);

      limitedPartnership = {
        ...result.limitedPartnership,
        data: {
          ...result.limitedPartnership.data
        }
      };
    }

    const limitedPartner = await this.limitedPartnerService.getLimitedPartner(tokens, ids.transactionId, ids.limitedPartnerId);

    return {
      limitedPartnership,
      limitedPartner
    };
  }

  getUpdatePageRouting() {
    return this.postTransitionPartnerController.getUpdatePartner(PartnerType.limitedPartner);
  }

  sendUpdatePageData() {
    return this.postTransitionPartnerController.sendPageData(PartnerType.limitedPartner);
  }

  getCeaseDate() {
    return this.postTransitionPartnerController.getCeaseDate();
  }

  getDateOfUpdate() {
    return this.postTransitionPartnerController.getDateOfUpdate(PartnerType.limitedPartner);
  }

  sendDateOfUpdatePageData() {
    return this.postTransitionPartnerController.sendDateOfUpdatePageData(PartnerType.limitedPartner);
  }

  getStopScreen() {
    return this.postTransitionPartnerController.getStopScreen();
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
          const serviceNameQuery = serviceName.toLowerCase().replace(/\s+/g, "-");
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
