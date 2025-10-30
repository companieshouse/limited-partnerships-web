import { NextFunction, Request, Response } from "express";
import { GeneralPartner, LimitedPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import AbstractController from "../AbstractController";
import { Ids, Tokens } from "../../../domain/types";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import { PageRouting } from "../PageRouting";
import UIErrors from "../../../domain/entities/UIErrors";

import { getJourneyTypes } from "../../../utils/journey";
import RegistrationPageType from "../registration/PageType";
import TransitionPageType from "../transition/PageType";
import PostTransitionPageType, { isCeaseDatePage } from "../postTransition/pageType";

import registrationRouting from "../registration/Routing";
import transitionRouting from "../transition/Routing";
import postTransitionRouting from "../postTransition/routing";

import CompanyService from "../../../application/service/CompanyService";

import { formatDate } from "../../../utils/date-format";
import { CEASE_DATE_TEMPLATE } from "../../../config/constants";

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
  getPageRouting(partner: PartnerType) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.generalPartnerService.setI18n(response.locals.i18n);
        this.limitedPartnerService.setI18n(response.locals.i18n);

        const { ids, pageRouting, tokens } = this.extractRequestData(request);

        await this.conditionalPreviousUrl(ids, pageRouting, request, tokens);

        let limitedPartnership = {};
        let generalPartner = {};
        let limitedPartner = {};

        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );
        }

        if (this.companyService) {
          limitedPartnership = (
            await this.companyService.buildLimitedPartnershipFromCompanyProfile(tokens, ids.companyId)
          )?.limitedPartnership;
        }

        if (ids.transactionId && ids.generalPartnerId && partner === PartnerType.generalPartner) {
          generalPartner = await this.generalPartnerService.getGeneralPartner(
            tokens,
            ids.transactionId,
            ids.generalPartnerId
          );

          generalPartner = this.formatPartnerDatesAndSetPreviousUrl(
            generalPartner,
            pageRouting,
            request,
            response.locals.i18n
          );
        }

        if (ids.transactionId && ids.limitedPartnerId && partner === PartnerType.limitedPartner) {
          limitedPartner = await this.limitedPartnerService.getLimitedPartner(
            tokens,
            ids.transactionId,
            ids.limitedPartnerId
          );

          limitedPartner = this.formatPartnerDatesAndSetPreviousUrl(
            limitedPartner,
            pageRouting,
            request,
            response.locals.i18n
          );
        }

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

    if (isPostTransitionCheckYourAnswers) {
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

        let limitedPartnership = {};

        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );
        }

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  partnerChoice(urls: { addPersonUrl: string; addLegalEntityUrl: string }) {
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

        let limitedPartnership = {};
        let generalPartners: GeneralPartner[] = [];
        let limitedPartners: LimitedPartner[] = [];
        let errors: UIErrors | null = null;

        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );

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

        if (ids.generalPartnerId) {
          partner = await this.generalPartnerService.getGeneralPartner(tokens, ids.transactionId, ids.generalPartnerId);
        }

        response.render(CEASE_DATE_TEMPLATE, super.makeProps(pageRouting, { limitedPartnership, partner }, null));
      } catch (error) {
        next(error);
      }
    };
  }

  // POST *******************************************************
  createPartner(partner: PartnerType) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
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

          const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );

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
          const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );

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
    urls: {
      confirmPartnerUsualResidentialAddressUrl: string;
      confirmPartnerPrincipalOfficeAddressUrl: string;
    }
  ) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const routing = this.getJourneyPageRouting(request.url);
        const journeyPageType = this.getJourneyPageTypes(request.url);

        const { ids, tokens } = this.extractRequestData(request);
        const pageType = super.extractPageTypeOrThrowError(request, journeyPageType);
        const pageRouting = super.getRouting(routing, pageType, request);

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

        if (result?.errors) {
          this.resetFormerNamesIfPreviousNameIsFalse(request.body);

          let limitedPartnership = {};

          if (ids.transactionId && ids.submissionId) {
            limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
              tokens,
              ids.transactionId,
              ids.submissionId
            );
          }

          if (this.companyService) {
            limitedPartnership = (
              await this.companyService.buildLimitedPartnershipFromCompanyProfile(tokens, ids.companyId)
            )?.limitedPartnership;
          }

          await this.conditionalPreviousUrl(ids, pageRouting, request, tokens);

          let partnerEntity = {};
          if (isCeaseDatePage(pageType)) {
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

          const { data: renderData, url } = this.buildPartnerErrorRenderData(
            pageType,
            pageRouting,
            limitedPartnership,
            partnerEntity,
            request.body,
            partner
          );

          response.render(super.templateName(url), super.makeProps(pageRouting, renderData, result.errors));

          return;
        }

        await this.conditionalPatchPartner(ids, pageRouting, request, tokens, {
          confirmPartnerUsualResidentialAddressUrl: urls.confirmPartnerUsualResidentialAddressUrl,
          confirmPartnerPrincipalOfficeAddressUrl: urls.confirmPartnerPrincipalOfficeAddressUrl
        });

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private async conditionalPatchPartner(
    ids: Ids,
    pageRouting: PageRouting,
    request: Request,
    tokens: Tokens,
    urls: {
      confirmPartnerUsualResidentialAddressUrl: string;
      confirmPartnerPrincipalOfficeAddressUrl: string;
    }
  ) {
    const journeyPageType = this.getJourneyPageTypes(request.url);

    if (
      pageRouting.pageType === journeyPageType.addGeneralPartnerPerson ||
      pageRouting.pageType === journeyPageType.addGeneralPartnerLegalEntity
    ) {
      const generalPartner = await this.generalPartnerService.getGeneralPartner(
        tokens,
        ids.transactionId,
        ids.generalPartnerId
      );

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
    } else if (
      pageRouting.pageType === journeyPageType.addLimitedPartnerPerson ||
      pageRouting.pageType === journeyPageType.addLimitedPartnerLegalEntity
    ) {
      const limitedPartner = await this.limitedPartnerService.getLimitedPartner(
        tokens,
        ids.transactionId,
        ids.limitedPartnerId
      );

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
  }

  private async conditionalPreviousUrl(ids: Ids, pageRouting: PageRouting, request: Request, tokens: Tokens) {
    if (ids.submissionId) {
      const pageType = this.getJourneyPageTypes(request.url);

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
}

export default PartnerController;
