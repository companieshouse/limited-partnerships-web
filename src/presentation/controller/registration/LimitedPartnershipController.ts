import { NextFunction, Request, Response } from "express";
import escape from "escape-html";
import {
  GeneralPartner,
  LimitedPartner,
  LimitedPartnership,
  PartnershipType,
  PersonWithSignificantControl
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { PersonWithSignificantControlType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import PaymentService from "../../../application/service/PaymentService";
import registrationsRouting from "./Routing";
import { Ids, Tokens } from "../../../domain/types";
import RegistrationPageType from "./PageType";
import {
  APPLICATION_CACHE_KEY,
  APPLICATION_CACHE_KEY_PREFIX_REGISTRATION,
  CHS_URL,
  cookieOptions,
  JOURNEY_TYPE_PARAM,
  SIC_CODES_CACHE_KEY
} from "../../../config/constants";
import CacheService from "../../../application/service/CacheService";
import UIErrors from "../../../domain/entities/UIErrors";
import { PageRouting } from "../PageRouting";
import { getJourneyTypes } from "../../../utils";
import {
  CHECK_YOUR_ANSWERS_URL,
  GENERAL_PARTNERS_URL,
  NAME_WITH_IDS_URL,
  REVIEW_GENERAL_PARTNERS_URL,
  PARTNERSHIP_TYPE_WITH_IDS_URL,
  WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL,
  REVIEW_LIMITED_PARTNERS_URL,
  REVIEW_PERSONS_WITH_SIGNIFICANT_CONTROL_URL
} from "./url";
import { CONFIRM_REGISTERED_OFFICE_ADDRESS_URL } from "../addressLookUp/url/registration";
import { PAYMENT_RESPONSE_URL } from "../global/url";

import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import PersonWithSignificantControlService from "../../../application/service/PersonWithSignificantControlService";

import PartnershipController from "../common/PartnershipController";
import { SicCode } from "../../../domain/validator/SicCodes";

class LimitedPartnershipController extends PartnershipController {
  constructor(
    private readonly limitedPartnershipService: LimitedPartnershipService,
    private readonly generalPartnerService: GeneralPartnerService,
    private readonly limitedPartnerService: LimitedPartnerService,
    private readonly personWithSignificantControlService: PersonWithSignificantControlService,
    private readonly cacheService: CacheService,
    private readonly paymentService: PaymentService
  ) {
    super();
  }

  getPageRouting() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.generalPartnerService.setI18n(response.locals.i18n);
        this.limitedPartnerService.setI18n(response.locals.i18n);
        this.limitedPartnershipService.setI18n(response.locals.i18n);

        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        let limitedPartnership: LimitedPartnership = {};

        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );
        }

        this.conditionalPreviousUrl(ids, pageRouting, request, limitedPartnership);

        const { generalPartners, limitedPartners, personsWithSignificantControl } = await this.getCheckYourAnswersResources(
          pageRouting,
          tokens,
          ids.transactionId
        );

        const cache = this.cacheService.getDataFromCache(request.signedCookies);

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(
            pageRouting,
            {
              limitedPartnership,
              generalPartners,
              limitedPartners,
              personsWithSignificantControl,
              cache,
              ids
            },
            null
          )
        );
      } catch (error) {
        next(error);
      }
    };
  }

  private async getCheckYourAnswersResources(
    pageRouting: PageRouting,
    tokens: Tokens,
    transactionId: string
  ): Promise<{
    generalPartners: GeneralPartner[];
    limitedPartners: LimitedPartner[];
    personsWithSignificantControl: PersonWithSignificantControl[];
  }> {
    if (pageRouting.pageType !== RegistrationPageType.checkYourAnswers) {
      return { generalPartners: [], limitedPartners: [], personsWithSignificantControl: [] };
    }

    const { generalPartners } = await this.generalPartnerService.getGeneralPartners(tokens, transactionId);
    const { limitedPartners } = await this.limitedPartnerService.getLimitedPartners(tokens, transactionId);
    const { personsWithSignificantControl } = await this.personWithSignificantControlService.getPersonsWithSignificantControl(
      tokens,
      transactionId
    );

    const sortedPersonsWithSignificantControl =
      personsWithSignificantControl?.length ? this.sortPscByType(personsWithSignificantControl) : personsWithSignificantControl;

    return { generalPartners, limitedPartners, personsWithSignificantControl: sortedPersonsWithSignificantControl };
  }

  private sortPscByType(personsWithSignificantControl: PersonWithSignificantControl[]): PersonWithSignificantControl[] {
    // Group into three arrays (preserves original order within each group)
    const individuals = personsWithSignificantControl.filter(
      (p) => p?.data?.type === PersonWithSignificantControlType.INDIVIDUAL_PERSON
    );
    const legalEntities = personsWithSignificantControl.filter(
      (p) => p?.data?.type === PersonWithSignificantControlType.RELEVANT_LEGAL_ENTITY
    );
    const otherRegistrables = personsWithSignificantControl.filter(
      (p) => p?.data?.type === PersonWithSignificantControlType.OTHER_REGISTRABLE_PERSON
    );

    return [...individuals, ...legalEntities, ...otherRegistrables];
  }

  private async renderCheckYourAnswersWithLawfulPurposeError(request: Request, response: Response) {
    const { tokens, ids } = super.extract(request);
    const pageRouting = super.getRouting(registrationsRouting, RegistrationPageType.checkYourAnswers, request);

    const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
      tokens,
      ids.transactionId,
      ids.submissionId
    );

    this.conditionalPreviousUrl(ids, pageRouting, request, limitedPartnership);

    const { generalPartners, limitedPartners, personsWithSignificantControl } = await this.getCheckYourAnswersResources(
      pageRouting,
      tokens,
      ids.transactionId
    );

    const uiErrors = new UIErrors();
    uiErrors.setWebError(
      "lawful_purpose_statement_checked",
      response.locals.i18n.errorMessages.checkYourAnswers.lawfulPurposeRequired
    );

    response.render(
      super.templateName(pageRouting.currentUrl),
      super.makeProps(
        pageRouting,
        { limitedPartnership, generalPartners, limitedPartners, personsWithSignificantControl, ids },
        uiErrors
      )
    );
  }

  private conditionalPreviousUrl(ids: Ids, pageRouting: PageRouting, request: Request, limitedPartnership?: LimitedPartnership) {
    const previousPageType = super.pageType(request.get("Referrer") ?? "");

    if (previousPageType === RegistrationPageType.checkYourAnswers) {
      pageRouting.previousUrl = super.insertIdsInUrl(CHECK_YOUR_ANSWERS_URL, ids, request.url);
    } else if (pageRouting.pageType === RegistrationPageType.partnershipName) {
      // change back link if we have ids in url
      if (ids.transactionId && ids.submissionId) {
        pageRouting.previousUrl = super.insertIdsInUrl(PARTNERSHIP_TYPE_WITH_IDS_URL, ids, request.url);
      }
    }

    // Separate check: set the CYA page's own back link based on partnership type
    if (pageRouting.pageType === RegistrationPageType.checkYourAnswers && limitedPartnership) {
      const isScottishPartnership =
        limitedPartnership.data?.partnership_type === PartnershipType.SLP ||
        limitedPartnership.data?.partnership_type === PartnershipType.SPFLP;

      const hasPersonWithSignificantControl = limitedPartnership.data?.has_person_with_significant_control;

      if (isScottishPartnership && hasPersonWithSignificantControl) {
        pageRouting.previousUrl = super.insertIdsInUrl(REVIEW_PERSONS_WITH_SIGNIFICANT_CONTROL_URL, ids, request.url);
      } else if (isScottishPartnership && !hasPersonWithSignificantControl) {
        pageRouting.previousUrl = super.insertIdsInUrl(WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL, ids, request.url);
      } else {
        pageRouting.previousUrl = super.insertIdsInUrl(REVIEW_LIMITED_PARTNERS_URL, ids, request.url);
      }
    }
  }

  createTransactionAndFirstSubmission() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.limitedPartnershipService.setI18n(response.locals.i18n);
        const { tokens } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);
        const journeyTypes = getJourneyTypes(pageRouting.currentUrl);

        const errors: UIErrors = this.handleValidation(request, pageType);
        if (errors.hasErrors()) {
          const cache = this.cacheService.getDataFromCache(request.signedCookies);

          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { limitedPartnership: { data: request.body }, cache }, errors)
          );
          return;
        }

        const result = await this.limitedPartnershipService.createTransactionAndFirstSubmission(
          tokens,
          pageType,
          journeyTypes,
          request.body
        );

        if (result.errors) {
          const cache = this.cacheService.getDataFromCache(request.signedCookies);

          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { limitedPartnership: { data: request.body }, cache }, result.errors)
          );

          return;
        }
        const ids = { transactionId: result.transactionId, submissionId: result.submissionId } as Ids;
        const url = super.insertIdsInUrl(pageRouting.nextUrl, ids, request.url);

        const cacheUpdated = this.cacheService.removeDataFromCache(
          request.signedCookies,
          `${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.partnershipType}`
        );
        response.cookie(APPLICATION_CACHE_KEY, cacheUpdated, cookieOptions);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  postCheckYourAnswers() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);

        if (request.body.lawful_purpose_statement_checked !== "true") {
          return await this.renderCheckYourAnswersWithLawfulPurposeError(request, response);
        }

        await this.limitedPartnershipService.sendPageData(tokens, ids.transactionId, ids.submissionId, pageType, request.body);

        const closeTransactionResponse = await this.limitedPartnershipService.closeTransaction(tokens, ids.transactionId);
        const startPaymentSessionUrl: string = closeTransactionResponse.headers?.["x-payment-required"];

        if (!startPaymentSessionUrl) {
          throw new Error("No payment URL found in response header from closeTransaction");
        }

        const urlWithJourney = `${CHS_URL}${PAYMENT_RESPONSE_URL}`.replace(
          JOURNEY_TYPE_PARAM,
          getJourneyTypes(request.url).journey
        );

        const paymentReturnUri = super.insertIdsInUrl(urlWithJourney, ids, request.url);

        const paymentRedirect = await this.paymentService.startPaymentSession(
          tokens,
          startPaymentSessionUrl,
          paymentReturnUri,
          ids.transactionId
        );

        if (!paymentRedirect) {
          throw new Error("No payment redirect URL returned from start payment session");
        }

        response.redirect(paymentRedirect);
      } catch (error) {
        next(error);
      }
    };
  }

  redirectPartnershipTypeWithIds() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.limitedPartnerService.setI18n(response.locals.i18n);
        const { tokens, ids } = super.extract(request);

        const selectedPartnershipType = escape(request.body.partnership_type);

        const limitedPartnership: LimitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
          tokens,
          ids.transactionId,
          ids.submissionId
        );

        if (selectedPartnershipType !== limitedPartnership?.data?.partnership_type) {
          return this.redirectAndCacheSelection()(request, response, next);
        }

        const redirectUrl = this.insertIdsInUrl(NAME_WITH_IDS_URL, ids, request.url);
        response.redirect(redirectUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  redirectAndCacheSelection() {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        this.limitedPartnershipService.setI18n(response.locals.i18n);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const partnershipType = escape(request.body.partnership_type);

        const uiErrors = this.handleValidation(request, pageType);

        if (uiErrors.hasErrors()) {
          return response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { limitedPartnership: { data: request.body } }, uiErrors)
          );
        }

        const cache = this.cacheService.addDataToCache(request.signedCookies, {
          [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${pageType}`]: partnershipType
        });
        response.cookie(APPLICATION_CACHE_KEY, cache, cookieOptions);

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  sendPageData() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.limitedPartnershipService.setI18n(response.locals.i18n);
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const errors: UIErrors = this.handleValidation(request, pageType);

        if (errors.hasErrors()) {
          return this.handlePageRerenderWithPartnershipAndError(request, response, errors);
        }

        const result = await this.limitedPartnershipService.sendPageData(
          tokens,
          ids.transactionId,
          ids.submissionId,
          pageType,
          request.body
        );

        if (result?.errors) {
          const limitedPartnership: LimitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );

          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              {
                limitedPartnership: {
                  ...limitedPartnership,
                  data: {
                    ...limitedPartnership.data,
                    ...request.body
                  }
                }
              },
              result.errors
            )
          );
          return;
        }

        await this.conditionalNextUrl(tokens, ids, pageRouting, request);

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private handleValidation(request: Request, pageType: RegistrationPageType): UIErrors {
    const pageTypeValidatorMap = new Map<RegistrationPageType, () => UIErrors>([
      [RegistrationPageType.partnershipType, () => this.limitedPartnershipService.runPartnershipTypeValidation(request.body)],
      [RegistrationPageType.partnershipName, () => this.limitedPartnershipService.runNameValidation(request.body)],
      [RegistrationPageType.jurisdiction, () => this.limitedPartnershipService.runJurisdictionValidation(request.body)],
      [RegistrationPageType.term, () => this.limitedPartnershipService.runTermValidation(request.body)],
      [RegistrationPageType.email, () => this.limitedPartnershipService.runEmailValidation(request.body)]
    ]);

    const validator = pageTypeValidatorMap.get(pageType);

    if (validator) {
      return validator();
    }

    return new UIErrors();
  }

  private async handlePageRerenderWithPartnershipAndError(request: Request, response: Response, uiErrors: UIErrors) {
    const { tokens, pageType, ids } = super.extract(request);
    const pageRouting = super.getRouting(registrationsRouting, pageType, request);

    const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
      tokens,
      ids.transactionId,
      ids.submissionId
    );

    return response.render(
      super.templateName(pageRouting.currentUrl),
      super.makeProps(
        pageRouting,
        {
          limitedPartnership: {
            ...limitedPartnership,
            data: {
              ...limitedPartnership.data,
              ...request.body
            }
          }
        },
        uiErrors
      )
    );
  }

  private async conditionalNextUrl(tokens: Tokens, ids: Ids, pageRouting: PageRouting, request: Request) {
    if (pageRouting.pageType === RegistrationPageType.email) {
      const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
        tokens,
        ids.transactionId,
        ids.submissionId
      );

      if (limitedPartnership.data?.registered_office_address) {
        pageRouting.nextUrl = super.insertIdsInUrl(CONFIRM_REGISTERED_OFFICE_ADDRESS_URL, ids, request.url);
      }
    }
  }

  getPageRoutingTermSic() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.limitedPartnershipService.setI18n(response.locals.i18n);
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        this.conditionalPreviousUrl(ids, pageRouting, request);

        let limitedPartnership: LimitedPartnership = {};

        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );
        }

        if (
          (pageType === RegistrationPageType.term || pageType === RegistrationPageType.sic) &&
          (limitedPartnership?.data?.partnership_type === PartnershipType.PFLP ||
            limitedPartnership?.data?.partnership_type === PartnershipType.SPFLP)
        ) {
          const { ids } = super.extract(request);

          const url = super.insertIdsInUrl(GENERAL_PARTNERS_URL, ids, request.url);

          response.redirect(url);

          return;
        }

        let sicCodes: SicCode[] = [];
        if (pageType === RegistrationPageType.sic) {
          const { ids } = super.extract(request);
          const cache = this.cacheService.getDataFromCacheById(request.signedCookies, ids.transactionId);

          if (cache?.[SIC_CODES_CACHE_KEY]) {
            sicCodes = this.translateSicCodesDescription(response, request, cache);
          } else {
            sicCodes = this.addSicCodesFromDbToCache(sicCodes, limitedPartnership, request, response);
          }
        }

        const isShowingAddSection = this.isShowingAddSection(sicCodes);

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, ids, isShowingAddSection, sicCodes }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  private addSicCodesFromDbToCache(
    sicCodes: SicCode[],
    limitedPartnership: LimitedPartnership,
    request: Request,
    response: Response
  ) {
    const { ids } = super.extract(request);
    if (limitedPartnership?.data?.sic_codes) {
      limitedPartnership.data.sic_codes.forEach((sicCode: string) => {
        if (!sicCodes.some((sic: SicCode) => sic.code === sicCode)) {
          const sicDescription = response.locals.i18n.sicCodes.condensedSicCodes[sicCode]?.sicDescription ?? "";
          sicCodes.push({ code: sicCode, description: sicDescription });
        }
      });
    }

    sicCodes = sicCodes.sort((a, b) => a.code.localeCompare(b.code));

    const cacheUpdated = this.cacheService.addDataToCache(request.signedCookies, {
      [ids.transactionId]: {
        [SIC_CODES_CACHE_KEY]: sicCodes
      }
    });
    response.cookie(APPLICATION_CACHE_KEY, cacheUpdated, cookieOptions);

    return sicCodes;
  }

  private translateSicCodesDescription(response: Response, request: Request, cache: Record<string, any>) {
    const { ids } = super.extract(request);
    const { code, description } = cache[SIC_CODES_CACHE_KEY][0];
    const sicDescription = response.locals.i18n.sicCodes.condensedSicCodes[code]?.sicDescription ?? "";

    if (sicDescription !== description) {
      const translatedCache = cache[SIC_CODES_CACHE_KEY].map((sic: SicCode) => {
        sic.description = response.locals.i18n.sicCodes.condensedSicCodes[sic.code]?.sicDescription ?? "";
        return sic;
      });

      const cacheUpdated = this.cacheService.addDataToCache(request.signedCookies, {
        [ids.transactionId]: {
          ...cache,
          [SIC_CODES_CACHE_KEY]: translatedCache
        }
      });
      response.cookie(APPLICATION_CACHE_KEY, cacheUpdated, cookieOptions);
    }

    return cache?.[SIC_CODES_CACHE_KEY];
  }

  sendSicCodesPageData() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.generalPartnerService.setI18n(response.locals.i18n);
        this.limitedPartnerService.setI18n(response.locals.i18n);

        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const cache = this.cacheService.getDataFromCacheById(request.signedCookies, ids.transactionId);

        const sicCodes: SicCode[] = cache?.[SIC_CODES_CACHE_KEY] ?? [];
        const isShowingAddSection = sicCodes.length < 4;
        const sicCodesData = { isShowingAddSection, sicCodes };

        if (!sicCodes.length) {
          const uiErrors = new UIErrors();
          uiErrors.setWebError("sic_codes", response.locals.i18n.errorMessages.sicCodes.sicCodeRequired);

          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { ...cache, ...sicCodesData }, uiErrors)
          );
          return;
        }

        const result = await this.limitedPartnershipService.sendPageData(tokens, ids.transactionId, ids.submissionId, pageType, {
          sic_codes: sicCodes.map((sic) => sic.code)
        });

        if (result?.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { ...cache, ...sicCodesData }, result.errors)
          );
          return;
        }

        const cacheUpdated = this.cacheService.removeDataFromCache(request.signedCookies, ids.transactionId);
        response.cookie(APPLICATION_CACHE_KEY, cacheUpdated, cookieOptions);

        await this.conditionalSicCodeNextUrl(tokens, ids, pageRouting, request);

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  addSicCode() {
    return (request: Request, response: Response) => {
      const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
      const pageRouting = super.getRouting(registrationsRouting, pageType, request);
      const { ids } = super.extract(request);

      const cacheById = this.cacheService.getDataFromCacheById(request.signedCookies, ids.transactionId);

      let sicCodes: SicCode[] = cacheById?.[SIC_CODES_CACHE_KEY] ?? [];

      const [code, description] = request.body.codeToAdd.split(",");
      const desc = description?.trim() ?? response.locals.i18n.sicCodes.condensedSicCodes[code]?.sicDescription;
      const sicCode: SicCode = {
        code: code.trim(),
        description: desc
      };

      let isShowingAddSection = this.isShowingAddSection(sicCodes);

      const uiErrors = this.limitedPartnershipService.runAddSicCodeValidation(sicCodes, sicCode.code);

      if (uiErrors.hasErrors()) {
        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { isShowingAddSection, sicCodes: sicCodes }, uiErrors)
        );
        return;
      }

      sicCodes = this.addSicCodeToCache(request, response, sicCode, sicCodes, cacheById);
      isShowingAddSection = this.isShowingAddSection(sicCodes);

      response.render(
        super.templateName(pageRouting.currentUrl),
        super.makeProps(pageRouting, { isShowingAddSection, sicCodes }, null)
      );
    };
  }

  private addSicCodeToCache(
    request: Request,
    response: Response,
    sicCode: SicCode,
    sicCodes: SicCode[],
    cacheById: Record<string, any>
  ) {
    const { ids } = super.extract(request);

    sicCodes.push(sicCode);

    sicCodes = sicCodes.sort((a, b) => a.code.localeCompare(b.code));

    const cacheUpdated = this.cacheService.addDataToCache(request.signedCookies, {
      [ids.transactionId]: {
        ...cacheById,
        [SIC_CODES_CACHE_KEY]: sicCodes
      }
    });
    response.cookie(APPLICATION_CACHE_KEY, cacheUpdated, cookieOptions);

    return sicCodes;
  }

  removeSicCode() {
    return (request: Request, response: Response) => {
      const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
      const pageRouting = super.getRouting(registrationsRouting, pageType, request);
      const { ids } = super.extract(request);

      const cache = this.cacheService.getDataFromCacheById(request.signedCookies, ids.transactionId);

      const sicCodes: SicCode[] = cache?.[SIC_CODES_CACHE_KEY] ?? [];

      const updatedSicCodes = this.removeSicCodeFromCache(request, sicCodes, cache, response);

      const isShowingAddSection = this.isShowingAddSection(updatedSicCodes);

      response.render(
        super.templateName(pageRouting.currentUrl),
        super.makeProps(pageRouting, { isShowingAddSection, sicCodes: updatedSicCodes }, null)
      );
    };
  }

  private removeSicCodeFromCache(request: Request, sicCodes: SicCode[], cache: Record<string, any>, response: Response) {
    const { ids } = super.extract(request);

    const codeToRemove = escape(request.body.action_remove);

    const updatedSicCodes = sicCodes.filter((sic) => sic.code !== codeToRemove);

    const cacheUpdated = this.cacheService.addDataToCache(request.signedCookies, {
      [ids.transactionId]: {
        ...cache,
        [SIC_CODES_CACHE_KEY]: updatedSicCodes
      }
    });
    response.cookie(APPLICATION_CACHE_KEY, cacheUpdated, cookieOptions);

    return updatedSicCodes;
  }

  private async conditionalSicCodeNextUrl(tokens: Tokens, ids: Ids, pageRouting: PageRouting, request: Request) {
    const result = await this.generalPartnerService.getGeneralPartners(tokens, ids.transactionId);

    if (result.generalPartners.length > 0) {
      pageRouting.nextUrl = super.insertIdsInUrl(REVIEW_GENERAL_PARTNERS_URL, ids, request.url);
    }
  }

  private isShowingAddSection(updatedSicCodes: SicCode[]) {
    return updatedSicCodes.length < 4;
  }
}

export default LimitedPartnershipController;
