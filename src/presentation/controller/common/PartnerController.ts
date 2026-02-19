import { NextFunction, Request, Response } from "express";
import {
  GeneralPartner,
  LimitedPartner,
  LimitedPartnership
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import AbstractController from "../AbstractController";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import CompanyService, { DataIncludingPartners } from "../../../application/service/CompanyService";

import { Ids, Tokens } from "../../../domain/types";
import { PageRouting } from "../PageRouting";
import UIErrors from "../../../domain/entities/UIErrors";

import { getJourneyTypes } from "../../../utils/journey";
import RegistrationPageType from "../registration/PageType";
import TransitionPageType from "../transition/PageType";
import PostTransitionPageType, { isCeaseDatePage, isWhenDidChangeUpdatePage } from "../postTransition/pageType";

import registrationRouting from "../registration/Routing";
import transitionRouting from "../transition/Routing";
import postTransitionRouting from "../postTransition/routing";

import { formatDate } from "../../../utils/date-format";
import {
  CEASE_DATE_TEMPLATE,
  DATE_OF_UPDATE_TEMPLATE,
} from "../../../config/constants";

export enum PartnerType {
  generalPartner = "generalPartner",
  limitedPartner = "limitedPartner"
}

abstract class PartnerController extends AbstractController {
  constructor(
    protected readonly limitedPartnershipService: LimitedPartnershipService,
    protected readonly generalPartnerService: GeneralPartnerService,
    protected readonly limitedPartnerService: LimitedPartnerService,
    protected readonly companyService?: CompanyService
  ) {
    super();
  }

  // GET *******************************************************
  getPageRouting() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.generalPartnerService.setI18n(response.locals.i18n);
        this.limitedPartnerService.setI18n(response.locals.i18n);

        const { ids, pageRouting, tokens } = this.extractRequestData(request);

        await this.conditionalPreviousUrl(pageRouting, request);

        const { limitedPartnership, generalPartner: gp, limitedPartner: lp } = await this.getEntities(tokens, ids);

        const generalPartner = this.formatPartnerDatesAndSetPreviousUrl(gp, pageRouting, request, response.locals.i18n);

        const limitedPartner = this.formatPartnerDatesAndSetPreviousUrl(lp, pageRouting, request, response.locals.i18n);

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, generalPartner, limitedPartner }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  private formatPartnerDatesAndSetPreviousUrl(
    partner: GeneralPartner | LimitedPartner,
    pageRouting: PageRouting,
    request: Request,
    i18n: any
  ): GeneralPartner {
    const { pageType, ids } = super.extract(request);

    const isPostTransitionCheckYourAnswers =
      getJourneyTypes(pageRouting.currentUrl).isPostTransition &&
      (pageType === PostTransitionPageType.generalPartnerCheckYourAnswers ||
        pageType === PostTransitionPageType.limitedPartnerCheckYourAnswers);

    if (isPostTransitionCheckYourAnswers && partner?.data) {
      const formattedPartner = {
        ...partner,
        data: {
          ...partner.data,
          date_of_birth: partner.data?.date_of_birth ? formatDate(partner.data.date_of_birth, i18n) : undefined,
          date_effective_from: partner.data?.date_effective_from
            ? formatDate(partner.data.date_effective_from, i18n)
            : undefined
        }
      };

      const secondAddress =
        pageType === PostTransitionPageType.generalPartnerCheckYourAnswers
          ? pageRouting.data?.confirmCorrespondenceAddress
          : pageRouting.data?.confirmUsualResidentialAddress;

      pageRouting.previousUrl = partner.data?.legal_entity_name
        ? super.insertIdsInUrl(pageRouting.data?.confirmPrincipalOfficeAddress, ids, request.url)
        : super.insertIdsInUrl(secondAddress, ids, request.url);

      return formattedPartner;
    }

    return partner;
  }

  getPartner(partner: PartnerType, urls: { reviewPartnersUrl: string }) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.generalPartnerService.setI18n(response.locals.i18n);
        this.limitedPartnerService.setI18n(response.locals.i18n);

        const { ids, pageRouting, tokens } = this.extractRequestData(request);

        let result;
        if (partner === PartnerType.generalPartner) {
          result = await this.generalPartnerService.getGeneralPartners(tokens, ids.transactionId);
        } else if (partner === PartnerType.limitedPartner) {
          result = await this.limitedPartnerService.getLimitedPartners(tokens, ids.transactionId);
        }

        if (result?.generalPartners?.length || result?.limitedPartners?.length) {
          response.redirect(super.insertIdsInUrl(urls.reviewPartnersUrl, ids, request.url));
          return;
        }

        const { limitedPartnership } = await this.getEntities(tokens, ids);

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  partnerType(urls: { addPersonUrl: string; addLegalEntityUrl: string }) {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids } = this.extractRequestData(request);

        let url = request.body.parameter === "person" ? urls.addPersonUrl : urls.addLegalEntityUrl;

        url = super.insertIdsInUrl(url, ids, request.url);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  getReviewPage(partner: PartnerType, urls: { partnersUrl: string }) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.generalPartnerService.setI18n(response.locals.i18n);
        this.limitedPartnerService.setI18n(response.locals.i18n);

        const { ids, pageRouting, tokens } = this.extractRequestData(request);

        const { limitedPartnership } = await this.getEntities(tokens, ids);
        let generalPartners: GeneralPartner[] = [];
        let limitedPartners: LimitedPartner[] = [];
        let errors: UIErrors | null = null;

        if (ids.transactionId && ids.submissionId) {
          let result;
          if (partner === PartnerType.generalPartner) {
            result = await this.generalPartnerService.getGeneralPartners(tokens, ids.transactionId);
            generalPartners = result.generalPartners;
          } else if (partner === PartnerType.limitedPartner) {
            result = await this.limitedPartnerService.getLimitedPartners(tokens, ids.transactionId);
            limitedPartners = result.limitedPartners;
          }

          errors = result?.errors ?? null;
        }

        if (generalPartners.length === 0 && limitedPartners.length === 0) {
          const redirect = super.insertIdsInUrl(urls.partnersUrl, ids, request.url);

          response.redirect(redirect);
          return;
        }

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, generalPartners, limitedPartners }, errors)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  // POST *******************************************************
  createPartner(partner: PartnerType) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.generalPartnerService.setI18n(response.locals.i18n);
        this.limitedPartnerService.setI18n(response.locals.i18n);

        const routing = this.getJourneyPageRouting(request.url);
        const journeyPageType = this.getJourneyPageTypes(request.url);

        const { ids, tokens } = this.extractRequestData(request);
        const pageType = super.extractPageTypeOrThrowError(request, journeyPageType);
        const pageRouting = super.getRouting(routing, pageType, request);

        let result;
        if (partner === PartnerType.generalPartner) {
          result = await this.generalPartnerService.createGeneralPartner(tokens, ids.transactionId, request.body);
        } else if (partner === PartnerType.limitedPartner) {
          result = await this.limitedPartnerService.createLimitedPartner(tokens, ids.transactionId, request.body);
        }

        if (result.errors) {
          this.resetFormerNamesIfPreviousNameIsFalse(request.body);

          const { limitedPartnership } = await this.getEntities(tokens, ids);

          const data =
            partner === PartnerType.generalPartner
              ? { limitedPartnership, generalPartner: { data: request.body } }
              : { limitedPartnership, limitedPartner: { data: request.body } };

          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, data, result.errors)
          );

          return;
        }

        const newIds = {
          ...ids,
          generalPartnerId: result?.generalPartnerId,
          limitedPartnerId: result?.limitedPartnerId
        };

        const url = super.insertIdsInUrl(pageRouting.nextUrl, newIds);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  postReviewPage(
    partner: PartnerType,
    urls: {
      addPartnerPersonUrl: string;
      addPartnerLegalEntityUrl: string;
      redirectUrl: string;
      reviewLimitedPartnersUrl?: string;
    }
  ) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.generalPartnerService.setI18n(response.locals.i18n);
        this.limitedPartnerService.setI18n(response.locals.i18n);

        const routing = this.getJourneyPageRouting(request.url);
        const journeyPageType = this.getJourneyPageTypes(request.url);

        const { ids, tokens } = this.extractRequestData(request);
        const pageType = super.extractPageTypeOrThrowError(request, journeyPageType);
        const pageRouting = super.getRouting(routing, pageType, request);

        let result;
        if (partner === PartnerType.generalPartner) {
          result = await this.generalPartnerService.getGeneralPartners(tokens, ids.transactionId);
        } else if (partner === PartnerType.limitedPartner) {
          result = await this.limitedPartnerService.getLimitedPartners(tokens, ids.transactionId);
        }

        const noPartners = !result?.limitedPartners?.length && !result?.generalPartners?.length;

        if (noPartners || result?.errors?.hasErrors()) {
          const { limitedPartnership } = await this.getEntities(tokens, ids);

          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              {
                limitedPartnership,
                generalPartners: result?.generalPartners ?? [],
                limitedPartners: result?.limitedPartners ?? []
              },
              result?.errors ?? null
            )
          );
          return;
        }

        const addAnotherPartner = request.body.addAnotherPartner;

        if (addAnotherPartner === "no") {
          if (partner === PartnerType.generalPartner) {
            await this.conditionalNextUrl(tokens, ids, pageRouting, {
              reviewLimitedPartnersUrl: urls?.reviewLimitedPartnersUrl ?? ""
            });
          }

          const redirectUrl = super.insertIdsInUrl(pageRouting.nextUrl, ids, request.url);

          response.redirect(redirectUrl);
          return;
        }

        let url = urls.redirectUrl;

        if (addAnotherPartner === "addPerson") {
          url = urls.addPartnerPersonUrl;
        } else if (addAnotherPartner === "addLegalEntity") {
          url = urls.addPartnerLegalEntityUrl;
        }

        const redirectUrl = super.insertIdsInUrl(url, ids, request.url);

        response.redirect(redirectUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private async conditionalNextUrl(
    tokens: Tokens,
    ids: Ids,
    pageRouting: PageRouting,
    urls: {
      reviewLimitedPartnersUrl: string;
    }
  ) {
    const result = await this.limitedPartnerService.getLimitedPartners(tokens, ids.transactionId);

    if (result.limitedPartners.length > 0) {
      pageRouting.nextUrl = super.insertIdsInUrl(urls.reviewLimitedPartnersUrl, ids);
    }
  }

  postRemovePage(partner: PartnerType) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const routing = this.getJourneyPageRouting(request.url);
        const journeyPageType = this.getJourneyPageTypes(request.url);

        const { ids, tokens } = this.extractRequestData(request);
        const pageType = super.extractPageTypeOrThrowError(request, journeyPageType);
        const pageRouting = super.getRouting(routing, pageType, request);

        const remove = request.body.remove;

        if (remove === "yes") {
          if (partner === PartnerType.generalPartner) {
            await this.generalPartnerService.deleteGeneralPartner(tokens, ids.transactionId, ids.generalPartnerId);
          } else if (partner === PartnerType.limitedPartner) {
            await this.limitedPartnerService.deleteLimitedPartner(tokens, ids.transactionId, ids.limitedPartnerId);
          }
        }

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  // PATCH *******************************************************
  sendPageData(
    partner: PartnerType,
    urls?: {
      confirmPartnerUsualResidentialAddressUrl: string;
      confirmPartnerPrincipalOfficeAddressUrl: string;
    }
  ) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.generalPartnerService.setI18n(response.locals.i18n);
        this.limitedPartnerService.setI18n(response.locals.i18n);

        const routing = this.getJourneyPageRouting(request.url);
        const journeyPageType = this.getJourneyPageTypes(request.url);

        const { ids, tokens } = this.extractRequestData(request);
        const pageType = super.extractPageTypeOrThrowError(request, journeyPageType);
        const pageRouting = super.getRouting(routing, pageType, request);

        const result = await this.sendData(partner, tokens, ids, request);

        if (result?.errors) {
          this.resetFormerNamesIfPreviousNameIsFalse(request.body);

          const { limitedPartnership } = await this.getEntities(tokens, ids);

          await this.conditionalPreviousUrl(pageRouting, request);

          const partnerEntity = await this.getPartnerEntity(pageType, partner, tokens, ids);

          const { data: renderData, url } = this.buildPartnerErrorRenderData(
            pageType,
            pageRouting,
            limitedPartnership,
            partnerEntity,
            request.body,
            partner
          );

          if (result.errors.errors.errorList[0].href === "#date_of_update") {
            const errors = result.errors.errors;
            if (errors.errorList[0].href === "#date_of_update") {
              const errorMessage = response.locals.i18n.errorMessages.dateOfUpdate[pageRouting?.data?.titleKey];
              errors.errorList[0].text = errorMessage;
              errors.date_of_update.text = errorMessage;
            }

            return response.render(DATE_OF_UPDATE_TEMPLATE, super.makeProps(pageRouting, renderData, result.errors));
          }

          response.render(super.templateName(url), super.makeProps(pageRouting, renderData, result.errors));

          return;
        }

        await this.conditionalPatchPartner(pageRouting, request, urls);

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private async sendData(partner: PartnerType, tokens: Tokens, ids: Ids, request: Request) {
    let result;

    if (partner === PartnerType.generalPartner) {
      result = await this.generalPartnerService.sendPageData(
        tokens,
        ids.transactionId,
        ids.generalPartnerId,
        request.body
      );
    } else if (partner === PartnerType.limitedPartner) {
      result = await this.limitedPartnerService.sendPageData(
        tokens,
        ids.transactionId,
        ids.limitedPartnerId,
        request.body
      );
    }
    return result;
  }

  private async getPartnerEntity(pageType: any, partner: PartnerType, tokens: Tokens, ids: Ids) {
    let partnerEntity = {};

    if (isCeaseDatePage(pageType) || isWhenDidChangeUpdatePage(pageType)) {
      if (partner === PartnerType.generalPartner) {
        partnerEntity = await this.generalPartnerService.getGeneralPartner(
          tokens,
          ids.transactionId,
          ids.generalPartnerId
        );
      } else if (partner === PartnerType.limitedPartner) {
        partnerEntity = await this.limitedPartnerService.getLimitedPartner(
          tokens,
          ids.transactionId,
          ids.limitedPartnerId
        );
      }
    }

    return partnerEntity;
  }

  private async conditionalPatchPartner(
    pageRouting: PageRouting,
    request: Request,
    urls?: {
      confirmPartnerUsualResidentialAddressUrl: string;
      confirmPartnerPrincipalOfficeAddressUrl: string;
    }
  ) {
    if (urls) {
      const journeyPageType = this.getJourneyPageTypes(request.url);

      const isGeneralPartner =
        pageRouting.pageType === journeyPageType.addGeneralPartnerPerson ||
        pageRouting.pageType === journeyPageType.addGeneralPartnerLegalEntity;

      const isLimitedPartner =
        pageRouting.pageType === journeyPageType.addLimitedPartnerPerson ||
        pageRouting.pageType === journeyPageType.addLimitedPartnerLegalEntity;

      if (isGeneralPartner) {
        await this.setGeneralPartnerNextUrl(pageRouting, urls, request);
      } else if (isLimitedPartner) {
        await this.setLimitedPartnerNextUrl(pageRouting, urls, request);
      }
      return;
    }

    // handle post-transition yes/no pages (URA, correspondence address, etc.)
    const { ids } = super.extract(request);
    const { nextYesUrl, nextNoUrl, fieldName } = pageRouting.data ?? {};
    const isYesNoPage = nextYesUrl && nextNoUrl && fieldName;

    if (isYesNoPage) {
      const nextUrl = request.body[fieldName] === "false" ? nextNoUrl : nextYesUrl;
      pageRouting.nextUrl = this.insertIdsInUrl(nextUrl, ids, request.url);
    }
  }

  private async setGeneralPartnerNextUrl(
    pageRouting: PageRouting,
    urls: {
      confirmPartnerUsualResidentialAddressUrl: string;
      confirmPartnerPrincipalOfficeAddressUrl: string;
    },
    request: Request
  ) {
    const journeyPageType = this.getJourneyPageTypes(request.url);
    const { ids, tokens } = this.extractRequestData(request);

    const { generalPartner } = await this.getEntities(tokens, ids);

    if (
      pageRouting.pageType === journeyPageType.addGeneralPartnerPerson &&
      generalPartner?.data?.usual_residential_address?.address_line_1
    ) {
      pageRouting.nextUrl = super.insertIdsInUrl(urls.confirmPartnerUsualResidentialAddressUrl, ids, request.url);
    }

    if (
      pageRouting.pageType === journeyPageType.addGeneralPartnerLegalEntity &&
      generalPartner?.data?.principal_office_address?.address_line_1
    ) {
      pageRouting.nextUrl = super.insertIdsInUrl(urls.confirmPartnerPrincipalOfficeAddressUrl, ids, request.url);
    }
  }

  private async setLimitedPartnerNextUrl(
    pageRouting: PageRouting,
    urls: {
      confirmPartnerUsualResidentialAddressUrl: string;
      confirmPartnerPrincipalOfficeAddressUrl: string;
    },
    request: Request
  ) {
    const journeyPageType = this.getJourneyPageTypes(request.url);
    const { ids, tokens } = this.extractRequestData(request);

    const { limitedPartner } = await this.getEntities(tokens, ids);

    if (
      pageRouting.pageType === journeyPageType.addLimitedPartnerPerson &&
      limitedPartner?.data?.usual_residential_address?.address_line_1
    ) {
      pageRouting.nextUrl = super.insertIdsInUrl(urls.confirmPartnerUsualResidentialAddressUrl, ids, request.url);
    }

    if (
      pageRouting.pageType === journeyPageType.addLimitedPartnerLegalEntity &&
      limitedPartner?.data?.principal_office_address?.address_line_1
    ) {
      pageRouting.nextUrl = super.insertIdsInUrl(urls.confirmPartnerPrincipalOfficeAddressUrl, ids, request.url);
    }
  }

  private async conditionalPreviousUrl(pageRouting: PageRouting, request: Request) {
    const pageType = this.getJourneyPageTypes(request.url);
    const { ids, tokens } = this.extractRequestData(request);

    if (ids.submissionId) {
      if (
        pageRouting.pageType === pageType.addGeneralPartnerLegalEntity ||
        pageRouting.pageType === pageType.addGeneralPartnerPerson
      ) {
        const result = await this.generalPartnerService.getGeneralPartners(tokens, ids.transactionId);

        if (result.generalPartners.length > 0) {
          pageRouting.previousUrl = super.insertIdsInUrl(pageRouting.data?.customPreviousUrl, ids, request.url);
        }
      }

      if (
        (pageRouting.pageType === pageType.addLimitedPartnerLegalEntity ||
          pageRouting.pageType === pageType.addLimitedPartnerPerson) &&
        pageRouting.data?.customPreviousUrl
      ) {
        const result = await this.limitedPartnerService.getLimitedPartners(tokens, ids.transactionId);
        if (result.limitedPartners.length > 0) {
          pageRouting.previousUrl = super.insertIdsInUrl(pageRouting.data?.customPreviousUrl, ids, request.url);
        }
      }
    }
  }

  // GLOBAL PRIVATE *******************************************************
  private extractRequestData(request: Request) {
    const routing = this.getJourneyPageRouting(request.url);
    const { tokens, pageType, ids } = super.extract(request);
    const pageRouting = super.getRouting(routing, pageType, request);

    return { ids, pageRouting, pageType, tokens };
  }

  private async getEntities(
    tokens: Tokens,
    ids: Ids
  ): Promise<{
    limitedPartnership: LimitedPartnership;
    generalPartner: GeneralPartner;
    limitedPartner: LimitedPartner;
  }> {
    let generalPartner = {};
    let limitedPartner = {};

    const limitedPartnership = await this.getLimitedPartnership(ids, tokens);

    if (ids.generalPartnerId) {
      generalPartner = await this.generalPartnerService.getGeneralPartner(
        tokens,
        ids.transactionId,
        ids.generalPartnerId
      );
    }

    if (ids.limitedPartnerId) {
      limitedPartner = await this.limitedPartnerService.getLimitedPartner(
        tokens,
        ids.transactionId,
        ids.limitedPartnerId
      );
    }

    return {
      limitedPartnership,
      generalPartner,
      limitedPartner
    };
  }

  private async getLimitedPartnership(ids: Ids, tokens: Tokens) {
    let limitedPartnership = {};

    if (ids.transactionId && ids.submissionId) {
      limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
        tokens,
        ids.transactionId,
        ids.submissionId
      );
    } else if (this.companyService) {
      limitedPartnership = (await this.companyService.buildLimitedPartnershipFromCompanyProfile(tokens, ids.companyId))
        ?.limitedPartnership;
    }

    return limitedPartnership;
  }

  private getJourneyPageTypes(url: string) {
    const journeyTypes = getJourneyTypes(url);

    if (journeyTypes.isRegistration) {
      return RegistrationPageType;
    } else if (journeyTypes.isTransition) {
      return TransitionPageType;
    } else {
      return PostTransitionPageType;
    }
  }

  private getJourneyPageRouting(url: string) {
    const journeyTypes = getJourneyTypes(url);

    if (journeyTypes.isRegistration) {
      return registrationRouting;
    } else if (journeyTypes.isTransition) {
      return transitionRouting;
    } else {
      return postTransitionRouting;
    }
  }

  protected resetFormerNamesIfPreviousNameIsFalse(data: Record<string, any>) {
    if (data?.former_names && data?.previousName === "false") {
      data.former_names = "";
    }
  }

  protected buildPartnerErrorRenderData(
    pageType: string,
    pageRouting: PageRouting,
    limitedPartnership: Partial<LimitedPartnership & DataIncludingPartners> | undefined,
    partner: LimitedPartner | GeneralPartner,
    requestBody: any,
    partnerFieldName: "limitedPartner" | "generalPartner"
  ) {
    if (isCeaseDatePage(pageType)) {
      return {
        data: {
          limitedPartnership,
          partner,
          ...requestBody
        },
        url: CEASE_DATE_TEMPLATE
      };
    } else {
      return {
        data: {
          limitedPartnership,
          [partnerFieldName]: { data: { ...partner?.data, ...requestBody } }
        },
        url: pageRouting.currentUrl
      };
    }
  }
}

export default PartnerController;
